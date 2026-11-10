/**
 * Reads the request body into memory so it can be forwarded by the proxies.
 *
 * Forwarding `request.body` as a ReadableStream breaks when the global fetch is
 * replaced by node-fetch (see `$lib/fetch-proxy`), which stringifies the stream
 * to "[object ReadableStream]". Buffering keeps the payload byte-exact.
 */
export async function readProxyBody(request: Request): Promise<ArrayBuffer | undefined> {
	return ['GET', 'HEAD'].includes(request.method) ? undefined : await request.arrayBuffer();
}
