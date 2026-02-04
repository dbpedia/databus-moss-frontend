import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/private'

export const load: PageServerLoad = async () => {


	const res = await fetch(`${env.MOSS_API_SERVER_URL}/facets`, {
		headers: { Accept: 'application/json' }
	});


	var data = await res.json();
	
	return {
		facetConfigs: data._embedded.facets
	};
};
