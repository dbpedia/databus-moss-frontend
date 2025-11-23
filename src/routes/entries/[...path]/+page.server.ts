
import { MossUtils } from '$lib/utils/moss-utils';
import { RdfUris } from '$lib/utils/rdf-uris';
import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';
import jsonld from 'jsonld';
import type { DatabusResource, MossModule } from '$lib/types';


/** @type {import('./$types').PageServerLoad} */
export async function load({ url, locals }: any) {




    const domain = url.toString();
    const segments = MossUtils.getUriSegments(url.pathname);

    let folders;
    let entries;
    let isEntry = false;
    let content;
    let headerInfo;

    let resourceUrl = `${env.PUBLIC_MOSS_API_SERVER_URL}${url.pathname}`;

    const response = await fetch(resourceUrl, {
        headers: {
            'Accept': 'application/hal+json'
        }
    });

    if (response.status === 404 || response.status === 500) {
        throw error(response.status, response.statusText);
    }


    let entryData: any = {};
    let moduleData: any = {};
    let module: MossModule | null = null;
    let resource: DatabusResource | null = null;

    let responseData = await response.json();

    console.log(responseData);

    isEntry = responseData.module != undefined;

    folders = [];
    entries = [];

    if (!isEntry) {
        for (let item of responseData._embedded.items) {

            if (item.type == 'entry') {
                entries.push(item);
            }
            if (item.type == 'folder') {
                folders.push(item);
            }
        }
    } else {


        
        try {
            // console.log("====== MODULE LOADING ======");

            moduleData = await MossUtils.fetchJSON(responseData.module, ""); // await (await fetch(responseData.module)).json();
            
            var contentResponse = await fetch(responseData.contentGraph);
            content = await contentResponse.text();

    

        }
        catch (e) {
            // console.log("ERROR LOADING MODULE DATA");
        }


    }

    /*
    
        } else {
            content = await response.text();
    
            console.log(url.pathname);
            
    
            isDocument = true;
            entryData.uri = MossUtils.getEntryURIFromBrowsePath(env.PUBLIC_MOSS_BASE_URL, url.pathname);
    
    
            // Fetch module info
            // var graphURI = env.PUBLIC_MOSS_BASE_URL + url.pathname.replace("/browse", "/g/content");
    
            var query = `SELECT ?p ?o WHERE {
                <${entryData.uri}> ?p ?o .
            }`;
    
            var sparqlRequestURL = `${env.PUBLIC_MOSS_BASE_URL}/sparql?query=${encodeURIComponent(query)}`;
    
            let sparqlResponse = await fetch(sparqlRequestURL, {
                method: 'GET', // or 'POST', 'PUT', etc.
                headers: {
                    'Accept': 'application/json', // You can specify other formats as needed
                },
            });
    
            let result = await sparqlResponse.json();
            headerInfo = [];
    
            headerInfo.push({
                key: "id",
                type: "uri",
                value: entryData.uri,
            });
    
            for (const binding of result.results.bindings) {
    
                if (binding.p.value == RdfUris.MOSS_INSTANCE_OF) {
                    entryData.moduleURI = binding.o.value;
                }
    
                if (binding.p.value == RdfUris.MOSS_EXTENDS) {
                    entryData.databusResourceURI = binding.o.value;
    
                }
    
                headerInfo.push({
                    key: RdfUris.compact(binding.p.value),
                    value: binding.o.value,
                    type: binding.o.type
                });
            }
    
    
            try {
                // console.log("====== MODULE LOADING ======");
    
                moduleData = await (await fetch(entryData.moduleURI)).json();
                moduleData = await jsonld.expand(moduleData);
                moduleData = moduleData[0];
    
                // console.log(moduleData);
    
                module = MossUtils.formatModuleData(moduleData);
    
            }
            catch (e) {
                // console.log("ERROR LOADING MODULE DATA");
            }
    
    
    
        }
        */

    const currentURI = url.pathname;
    const session = await locals.auth() as any;

    return {
        content: content,
        token: session?.accessToken,
        module: moduleData,
        entry: responseData,
        resource: resource,
        props: {
            extensionData: entryData,
            moduleId: MossUtils.uriToName(moduleData[RdfUris.JSONLD_ID]),
            moduleData: moduleData,
            segments,
            domain,
            isDocument: isEntry,
            folders,
            files: entries,
            headerInfo
        },
    };
}
