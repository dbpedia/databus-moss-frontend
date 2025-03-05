import { env } from '$env/dynamic/public'
import type { Layer } from '$lib/types';
import { MossUtils } from '$lib/utils/moss-utils';
import { RdfUris } from '$lib/utils/rdf-uris';


/** @type {import('./$types').PageServerLoad} */
export async function load({ locals, parent }: any) {	
    
    const parentData = await parent();

    if(parentData == null) {
        return null;
    }

    const layerListResponse = await fetch(`${env.PUBLIC_MOSS_BASE_URL}/api/layers`);
    const layerData = await layerListResponse.json();
    
    return { 
        ...parentData,
        layers: layerData
    }
}
