import { MossUtils } from '$lib/utils/moss-utils';

/** @type {import('./$types').PageServerLoad} */
export async function load({ fetch, parent }: any) {	
    
    const parentData = await parent();

    if(parentData == null) {
        return null;
    }

    const moduleListResponse = await MossUtils.fetchJSON('/modules', fetch);
    
    return { 
        ...parentData,
        modules: moduleListResponse._embedded.modules
    }
}
