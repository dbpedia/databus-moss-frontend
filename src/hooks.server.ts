
import fetch from 'node-fetch';
import type { RequestInit, RequestInfo } from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';

/**
 * Modify fetch in case a HTTPS_PROXY environment variable is set
 */

const proxy = process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY || process.env.http_proxy;

if (proxy) {
    console.log(`Using proxy: ${proxy}`);
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