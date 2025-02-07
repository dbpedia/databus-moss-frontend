
/**
 * Custom fetch function that bypasses global proxy settings.
 */
export async function noProxyFetch(
    url: string | URL,
    options: RequestInit = {}
): Promise<Response> {
    return fetch(url, { ...options, noProxy: true } as RequestInit & { noProxy?: boolean });
}