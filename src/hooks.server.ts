import { handle as authHandle } from "./auth";
import { env } from "$env/dynamic/private";
import { sequence } from '@sveltejs/kit/hooks';
import type { Handle, RequestEvent } from "@sveltejs/kit";

let proxyRoutes: string[] = [
    `/terminologies`,
    `/modules`,
    `/api`
];

async function fetchProxyResponse(event: RequestEvent<Partial<Record<string, string>>, string | null>, accessToken: string, requestURL: URL) {

    var text = await event.request.text();

    // API request: use session to append Bearer token
    const headers = new Headers(event.request.headers);
    if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);

    const backendUrl = `${env.MOSS_API_SERVER_URL}${requestURL.pathname}${requestURL.search}`;

    const proxyOptions: RequestInit = {
        method: event.request.method,
        headers,
        body: ['GET', 'HEAD'].includes(event.request.method) ? undefined : text
    };

    const res = await fetch(backendUrl, proxyOptions);

    const responseHeaders = new Headers(res.headers);
    if (!responseHeaders.has('content-type')) {
        responseHeaders.set('content-type', 'application/json');
    }

    responseHeaders.delete('content-encoding');


    const body = res.status !== 204 && res.status !== 304 ? await res.text() : undefined;

    return new Response(body, { status: res.status, headers: responseHeaders });
}

const apiProxy: Handle = async ({ event, resolve }) => {
    const accept = event.request.headers.get('accept') ?? '';
    const requestURL = new URL(event.request.url);

    const session = await event.locals.auth?.() as any;
    const accessToken = session?.accessToken ?? '';

    for (var route of proxyRoutes) {
        if (requestURL.pathname.startsWith(route)) {
            return await fetchProxyResponse(event, accessToken, requestURL);
        }
    }


    // HTML requests and /auth routes go through normal SvelteKit + auth flow
    if (accept.includes('text/html') || requestURL.pathname.startsWith('/auth') || requestURL.pathname.endsWith('__data.json')) {
        var response = await resolve(event);

        if (response.status !== 404) {
            return response;
        }
    }

    return await fetchProxyResponse(event, accessToken, requestURL);


};

export const handle = sequence(authHandle, apiProxy);