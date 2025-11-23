import { env as ENV } from '$env/dynamic/public';  
import { MossUtils } from '$lib/utils/moss-utils.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals, parent }) {
	const parentData = await parent();

	if (!parentData?.userData?.isAdmin) {
		return { userData: parentData?.userData ?? null, modules: [] };
	}

	
    //console.log( moduleListResource._embedded.modules);
    

	return {
		...parentData,
		//modules: moduleListResource._embedded.modules
	};
}