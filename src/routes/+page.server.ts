import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	const res = await fetch('/facets', {
		headers: { Accept: 'application/hal+json' }
	});

	if (!res.ok) {
		return { facetConfigs: [], facetsStatus: res.status };
	}

	const data = await res.json();

	return {
		facetConfigs: data._embedded?.facets ?? []
	};
};
