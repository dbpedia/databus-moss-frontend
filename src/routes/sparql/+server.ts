import type { RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

async function proxyHandler({ request, locals }: Parameters<RequestHandler>[0]) {
	const session = await locals.auth?.();
	const accessToken = session?.accessToken ?? '';
	const requestURL = new URL(request.url);
	const backendUrl = `${env.MOSS_API_SERVER_URL}${requestURL.pathname}${requestURL.search}`;

	const headers = new Headers(request.headers);
	if (accessToken) {
		headers.set('Authorization', `Bearer ${accessToken}`);
	}
	headers.delete('accept-encoding');
	headers.delete('host');

	try {
		const proxyOptions: RequestInit = {
			method: request.method,
			headers,
			body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
			// @ts-expect-error duplex is required for streaming request bodies
			duplex: 'half'
		};

		const res = await fetch(backendUrl, proxyOptions);

		const responseHeaders = new Headers(res.headers);
		responseHeaders.delete('content-encoding');
		responseHeaders.delete('content-length');

		return new Response(res.body, {
			status: res.status,
			statusText: res.statusText,
			headers: responseHeaders
		});
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : 'Unknown proxy error';
		return new Response(JSON.stringify({ message: 'Proxy error', error: message }), {
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
