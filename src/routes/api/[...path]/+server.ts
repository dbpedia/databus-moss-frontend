// src/routes/api/[...path]/+server.ts
import type { RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

async function proxyHandler({ request, locals }: any) {
    const session = await locals.auth?.();
    const accessToken = session?.accessToken ?? '';
    const requestURL = new URL(request.url);
    const backendUrl = `${env.MOSS_API_SERVER_URL}${requestURL.pathname}${requestURL.search}`;

    const headers = new Headers(request.headers);
    if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
    }



    try {

        const proxyOptions: RequestInit = {
            method: request.method,
            headers,
            body: ['GET', 'HEAD'].includes(request.method) ? undefined : await request.text()
        };

        const res = await fetch(backendUrl, proxyOptions);

        const responseHeaders = new Headers(res.headers);
        if (!responseHeaders.has('content-type')) {
            responseHeaders.set('content-type', 'application/json');
        }

        let body: string | undefined = undefined;
        if (res.status !== 204 && res.status !== 304) {
            body = await res.text();
        }

        return new Response(body, {
            status: res.status,
            headers: responseHeaders
        });
    } catch (err: any) {
        return new Response(JSON.stringify({ message: 'Proxy error', error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export const GET: RequestHandler = proxyHandler;
export const POST: RequestHandler = proxyHandler;
export const PUT: RequestHandler = proxyHandler;
export const DELETE: RequestHandler = proxyHandler;
export const PATCH: RequestHandler = proxyHandler;
export const OPTIONS: RequestHandler = proxyHandler;
export const HEAD: RequestHandler = proxyHandler;

