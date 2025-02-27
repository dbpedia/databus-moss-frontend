import { env } from '$env/dynamic/public'
import type { Layer } from '$lib/types';
import { MossUtils } from '$lib/utils/moss-utils';
import { RdfUris } from '$lib/utils/rdf-uris';
async function fetchUserData(session : any) {
    
    if (session == null || session.user == undefined) {
        return null;
    }

    const accessToken = session.accessToken;

    const headers: any = {
        Accept: 'application/json',
        Authorization: 'Bearer ' + accessToken
    };

    // Make the actual request with the authorization header
    let response = await fetch(`${env.PUBLIC_MOSS_BASE_URL}/api/users/get-user`, {
        method: "GET",
        headers: headers,
    });

    if(response.ok) {
        return await response.json();
    }

    return null;
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }: any) {	
    
    const session = await locals.auth() as any;

    let layers : Layer[] = [];
    let userData : any;

    try {

        const response = await fetch(`${env.PUBLIC_MOSS_BASE_URL}/api/layers`);
        const data = await response.json();
        
        let layerGraphs = data[RdfUris.JSONLD_GRAPH];

        for(var layerGraph of  layerGraphs) {

            layers.push({
                id: layerGraph[RdfUris.JSONLD_ID],
                formatMimeType: layerGraph.formatMimeType,
                indexers: layerGraph.indexers,
                resourceTypes: layerGraph.resourceTypes
            });
        }

    } catch(error) {
        console.error("Error fetching available layers:", error);
    }

    try {
        userData = await fetchUserData(session);
    } catch(error) {
        console.error("Error fetching user data:", error);
    }
    
    return { 
        props: {    
            layers,
            userData
        }
    }
}
