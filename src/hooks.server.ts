export { handle } from "./auth"

/** @type {import('@sveltejs/kit').HandleFetch} */
export async function handleFetch({ request, fetch, event }) {
	
    console.log("");
    
    if (request.url.includes('/api/')) {
		// clone the original request, but change the URL
        const session = await event.locals.auth() as any;
        request.headers.set('Authorization', "Bearer " + session.accessToken);
	}

	return fetch(request);
}