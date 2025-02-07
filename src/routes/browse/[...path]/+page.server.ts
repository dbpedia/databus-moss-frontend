
import { MossUtils } from '$lib/utils/moss-utils';
import { RdfUris } from '$lib/utils/rdf-uris';
import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/public'
import { Agent as HttpAgent } from "http";
import { Agent as HttpsAgent } from "https";
import { noProxyFetch } from '$lib/no-proxy-fetch';

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
    let response = await noProxyFetch(endpoint);

    if (response.status === 404 || response.status === 500) {
        throw error(response.status, response.statusText);
    }

    let contentType = response.headers.get("Content-Type");
    let layerUri = undefined;

    if(contentType != "application/json") {
        isDocument = true;
        content = await response.text();

        // Fetch layer info
        var graphURI = env.PUBLIC_MOSS_BASE_URL + url.pathname.replace("/browse", "/g/content");
       
        var query = `SELECT ?s ?p ?o WHERE {
            ?s ?p ?o .
            ?s a <http://dataid.dbpedia.org/ns/moss#DatabusMetadataLayer> .
            ?s <http://dataid.dbpedia.org/ns/moss#content> <${graphURI}> . 
        }`;

        var sparqlRequestURL = `${env.PUBLIC_MOSS_BASE_URL}/sparql?query=${encodeURIComponent(query)}`;
        let sparqlResponse = await noProxyFetch(sparqlRequestURL, {
            method: 'GET', 
            headers: {
                'Accept': 'application/json',
            },
        });
        
        let result = await sparqlResponse.json();
        headerInfo = []; 

        for(const binding of result.results.bindings) {
            if(layerUri == undefined) {
                layerUri = binding.s.value;

                headerInfo.push({
                    key: "id",
                    value: layerUri,
                    type: "uri"
                });
            }

            headerInfo.push({
                key : RdfUris.compact(binding.p.value),
                value: binding.o.value,
                type: binding.o.type
            })
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
            layerUri: layerUri,
            segments,
            domain,
            isDocument,
            folders,
            files,
            headerInfo
        },
    };
}
