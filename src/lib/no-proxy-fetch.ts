import { env } from '$env/dynamic/public'
/**
 * Custom fetch function that bypasses global proxy settings.
 */
export async function noProxyFetch(
    path: string,
    options: RequestInit = {}
): Promise<Response> {

    var baseUrl = env.PUBLIC_MOSS_API_SERVER_URL != undefined ? env.PUBLIC_MOSS_API_SERVER_URL : env.PUBLIC_MOSS_BASE_URL; 
    return fetch(`${baseUrl}${path}`, { ...options, noProxy: true } as RequestInit & { noProxy?: boolean });
}