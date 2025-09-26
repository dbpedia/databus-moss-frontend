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

    const moduleListResponse = await fetch(`${env.PUBLIC_MOSS_BASE_URL}/api/v1/modules`);
    const moduleList = await moduleListResponse.json();
    
    return { 
        ...parentData,
        modules: moduleList
    }
}
