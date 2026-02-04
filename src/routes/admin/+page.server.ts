import { env as ENV } from '$env/dynamic/public';  
import { MossUtils } from '$lib/utils/moss-utils.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals, parent }) {
	const parentData = await parent();

	if (!parentData?.userData?.isAdmin) {

		return {
			isAdmin: false
		}
	}

	
    //console.log( moduleListResource._embedded.modules);
    

	return {
		...parentData,
		isAdmin: true
		//modules: moduleListResource._embedded.modules
	};
}