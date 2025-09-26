import { env as ENV } from '$env/dynamic/public';  

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals, parent }) {
	const parentData = await parent();

	if (!parentData?.userData?.isAdmin) {
		return { userData: parentData?.userData ?? null, modules: [] };
	}

	const res = await fetch(ENV.PUBLIC_MOSS_BASE_URL + '/api/v1/modules');
	const modules = res.ok ? await res.json() : [];

    console.log(modules);
    

	return {
		...parentData,
		modules
	};
}