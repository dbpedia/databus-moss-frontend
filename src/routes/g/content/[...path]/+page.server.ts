import { error } from '@sveltejs/kit';
import { MossUtils } from '$lib/utils/moss-utils';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, url }) => {
	const res = await fetch(url.pathname, {
		headers: { Accept: MossUtils.getGraphContentAccept(url.pathname) }
	});

	if (res.status === 404) {
		error(404, 'Not found');
	}

	if (!res.ok) {
		return {
			content: null,
			status: res.status
		};
	}

	return {
		content: await res.text()
	};
};
