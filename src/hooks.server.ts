import { handle as authHandle } from "./auth";
import { env } from "$env/dynamic/private";
import { sequence } from '@sveltejs/kit/hooks';
import type { Handle, RequestEvent } from "@sveltejs/kit";

let proxyRoutes: string[] = [
    `/terminologies`,
    `/modules`,
    `/facets`,
    `/entries`,
    `/users`,
    `/roles`,
    `/permissions`,
    `/data`,
    `/api`,
];

function isSparqlRoute(pathname: string): boolean {
    return pathname === '/sparql' || pathname.startsWith('/sparql/');
}

async function fetchProxyResponse(event: RequestEvent<Partial<Record<string, string>>, string | null>, accessToken: string, requestURL: URL) {

    // var text = await event.request.text();

    // API request: use session to append Bearer token
    const headers = new Headers(event.request.headers);
    if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);

    const backendUrl = `${env.MOSS_API_SERVER_URL}${requestURL.pathname}${requestURL.search}`;

    const proxyOptions: RequestInit = {
        method: event.request.method,
        headers,
        body: ['GET', 'HEAD'].includes(event.request.method)
            ? undefined
            : event.request.body,
        // @ts-expect-error duplex is required for streaming
        duplex: 'half'
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

function isProxyRoute(pathname: string): boolean {
    return proxyRoutes.some((route) => pathname.startsWith(route));
}

const apiProxy: Handle = async ({ event, resolve }) => {
    const accept = event.request.headers.get('accept') ?? '';
    const requestURL = new URL(event.request.url);
    const pathname = requestURL.pathname;

    const session = await event.locals.auth?.() as any;
    const accessToken = session?.accessToken ?? '';

    const useSvelteKit =
        accept.includes('text/html') ||
        pathname.startsWith('/auth') ||
        pathname.endsWith('__data.json');

    if (useSvelteKit) {
        return await resolve(event);
    }

    if (isSparqlRoute(pathname)) {
        return await resolve(event);
    }

    if (isProxyRoute(pathname)) {
        return await fetchProxyResponse(event, accessToken, requestURL);
    }

    return await fetchProxyResponse(event, accessToken, requestURL);
};

export const handle = sequence(authHandle, apiProxy);