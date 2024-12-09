
import fetch from 'node-fetch';
import type { RequestInit, RequestInfo } from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { env } from "$env/dynamic/private";

/**
 * Modify fetch in case a HTTPS_PROXY environment variable is set
 */

const proxy = env.HTTPS_PROXY || env.https_proxy || env.HTTP_PROXY || env.http_proxy;

console.log(`HTTPS_PROXY: ${env.HTTPS_PROXY}`);
console.log(`HTTP_PROXY: ${env.HTTP_PROXY}`);
console.log(`https_proxy: ${env.https_proxy}`);
console.log(`http_proxy: ${env.http_proxy}`);

if (proxy) {
    console.log(`USING PROXY: ${proxy}`);
}

// Create a proxy agent if a proxy is defined
const agent = proxy ? new HttpsProxyAgent(proxy) : undefined;

// Define a global fetch function with proxy support
const originalFetch = fetch;

// Override fetch globally
(global as any).fetch = async (url: RequestInfo, init?: RequestInit): Promise<Response> => {
    const options = agent ? { ...init, agent } : init;
    return originalFetch(url, options) as any;
};

export { handle } from "./auth"