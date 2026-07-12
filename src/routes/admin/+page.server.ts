import { redirect } from '@sveltejs/kit';
import { getDefaultAdminPath } from '$lib/utils/auth-utils';

/** @type {import('./$types').PageServerLoad} */
export async function load({ parent }) {
	const parentData = await parent();
	const defaultPath = getDefaultAdminPath(parentData?.caller);

	if (defaultPath) {
		throw redirect(302, defaultPath);
	}
}
