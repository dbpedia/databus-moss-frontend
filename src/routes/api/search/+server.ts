import { json } from '@sveltejs/kit';
import { PUBLIC_LOOKUP_BASE_URL } from '$env/static/public';
let baseUrl = `${PUBLIC_LOOKUP_BASE_URL}/api/search`;
   
export async function GET({ url } : any) {
	let remoteUrl = `${baseUrl}${url.search}`
	const data = await fetch(remoteUrl);
	return json(await data.json() ?? []);
}
