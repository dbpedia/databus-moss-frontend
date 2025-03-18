
import { MossUtils } from '$lib/utils/moss-utils';
import { RdfUris } from '$lib/utils/rdf-uris';
import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/public'


/** @type {import('./$types').PageServerLoad} */
export async function load({ url, locals }: any) {

    
    
    
    const domain = url.toString();
    const segments = MossUtils.getUriSegments(url.pathname);
    
    let folders;
    let files;
    let isDocument = false;
    let content;
    let headerInfo;
    let endpoint = `${env.PUBLIC_MOSS_BASE_URL}${url.pathname.replace("/browse", "/file")}`

    let response = await fetch(endpoint);


    if (response.status === 404 || response.status === 500) {
        throw error(response.status, response.statusText);
    }

    let contentType = response.headers.get("Content-Type");
    let extensionURI = null;

    let entryData : any = {};
    let layerData: any = {};

    if(contentType != "application/json") {

        content = await response.text();

        isDocument = true;
        entryData.uri = MossUtils.getEntryURIFromBrowsePath(env.PUBLIC_MOSS_BASE_URL, url.pathname);

        console.log(entryData.uri);
        
        // Fetch layer info
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
            key : "id",
            type: "uri",
            value: entryData.uri,
        });
        
        for(const binding of result.results.bindings) {

            if(binding.p.value == RdfUris.MOSS_INSTANCE_OF) {
                entryData.layerURI = binding.o.value;
            }

            if(binding.p.value == RdfUris.MOSS_EXTENDS) {
                entryData.databusResourceURI = binding.o.value;
            }

            headerInfo.push({
                key : RdfUris.compact(binding.p.value),
                value: binding.o.value,
                type: binding.o.type
            });
        }

       

        console.log(entryData.layerURI);
        

        try {
            layerData = await(await fetch(entryData.layerURI)).json();
        }
        catch(e) {
            console.log("ERROR LOADING LAYER DATA");
            
        }
        


    } else {
        const data = await response.json();

        folders = data.folders;

        if (!folders) {
            folders = [];
        }
        
        files = data.files;
    }

    const currentURI = url.pathname;
    folders = MossUtils.createListGroupNavigationItems(folders, currentURI);
    files = MossUtils.createListGroupNavigationItems(files, currentURI);

    const session = await locals.auth() as any;

    return {
        content: content,
        contentType: contentType,
        token: session?.accessToken,
        props: {
            extensionData: entryData,
            layerData: layerData,
            segments,
            domain,
            isDocument,
            folders,
            files,
            headerInfo
        },
    };
}
