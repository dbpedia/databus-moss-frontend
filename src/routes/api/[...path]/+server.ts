// src/routes/api/[...path]/+server.ts
import type { RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private'

async function proxyHandler({ request, params, locals }: any) {
    const session = await locals.auth?.() as any;

    if (!session?.user || !session.accessToken) {
        return new Response('Unauthorized', { status: 401 });
    }

    const accessToken = session.accessToken;

    var requestURL = new URL(request.url);
    console.log(requestURL);

    const backendUrl = `${env.MOSS_API_SERVER_URL}${requestURL.pathname}${requestURL.search}`;

    const proxyOptions: RequestInit = {
        method: request.method,
        headers: {
            ...Object.fromEntries(request.headers),
            'Authorization': `Bearer ${accessToken}`
        },
        body: ['GET', 'HEAD'].includes(request.method) ? undefined : await request.text()
    };

    //console.log(proxyOptions);
    //console.log(backendUrl);


    const res = await fetch(backendUrl, proxyOptions);

    // console.log(res);

    const contentType = res.headers.get('content-type') || 'application/json';

    let body: string | undefined = undefined;
    if (res.status !== 204 && res.status !== 304) {
        body = await res.text();
    }

    return new Response(body, {
        status: res.status,
        headers: { 'Content-Type': contentType }
    });
}

export const GET: RequestHandler = proxyHandler;
export const POST: RequestHandler = proxyHandler;
export const PUT: RequestHandler = proxyHandler;
export const DELETE: RequestHandler = proxyHandler;
export const PATCH: RequestHandler = proxyHandler;
export const OPTIONS: RequestHandler = proxyHandler;
export const HEAD: RequestHandler = proxyHandler;
