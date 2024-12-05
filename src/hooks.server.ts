export { handle } from "./auth"
import fetch from 'node-fetch';
import type { RequestInit, RequestInfo } from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';

const proxy = process.env.HTTP_PROXY || process.env.HTTPS_PROXY;

if (proxy) {
    console.log(`Using proxy: ${proxy}`);
}

// Create a proxy agent if a proxy is defined
const agent = proxy ? new HttpsProxyAgent(proxy) : undefined;

// Define a global fetch function with proxy support
const originalFetch = fetch;

// Override fetch globally
(global as any).fetch = async (url: RequestInfo, init?: RequestInit): Promise<Response> => {
    console.log(url);
    const options = agent ? { ...init, agent } : init;
    return originalFetch(url, options) as any;
};

/** @type {import('@sveltejs/kit').HandleFetch} 
export async function handleFetch({ request, fetch, event }) {
	
  console.log("FETCHING");
    
  if (request.url.includes('/api/')) {
    // clone the original request, but change the URL
    const session = await event.locals.auth() as any;
    request.headers.set('Authorization', "Bearer " + session.accessToken);
	}

	return fetch(request);
}*/