import { env } from "$env/dynamic/private";
import fetch from 'node-fetch';
import type { RequestInit, RequestInfo } from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { HttpProxyAgent } from 'http-proxy-agent';

export function setupFetchProxy() {
    const httpsProxy = env.HTTPS_PROXY || env.https_proxy;
    const httpProxy = env.HTTP_PROXY || env.http_proxy;
    const noProxy = env.NO_PROXY || env.no_proxy;

    console.log(`HTTPS_PROXY: ${httpsProxy}`);
    console.log(`HTTP_PROXY: ${httpProxy}`);
    console.log(`NO_PROXY: ${noProxy}`);

    // If both HTTP and HTTPS proxies are set, prioritize HTTPS for HTTPS requests.
    const proxy = httpsProxy || httpProxy;

    if (proxy) {
        console.log(`Using Proxy: ${proxy}`);
    }
    else {
        console.log(`NO PROXY IN USE`);
        return;
    }

    // Check if the URL matches any of the domains in the NO_PROXY list
    function shouldBypassProxy(url: string): boolean {
        if (!noProxy) return false;

        const noProxyList = noProxy.split(',').map(domain => domain.trim().toLowerCase());
        const urlHost = new URL(url).hostname.toLowerCase();

        // Check if the hostname matches any of the domains in NO_PROXY list
        return noProxyList.some(domain => urlHost.endsWith(domain));
    }

    // Create the appropriate proxy agent based on the protocol (http or https)
    const getProxyAgent = (url: string) => {
        const isHttps = url.toLowerCase().startsWith('https://');
        if (isHttps && httpsProxy) {
            return new HttpsProxyAgent(httpsProxy);
        }
        if (!isHttps && httpProxy) {
            return new HttpProxyAgent(httpProxy);
        }
        return undefined;
    };

    // Define a global fetch function with proxy support
    const originalFetch = fetch;

    // Override fetch globally
    (global as any).fetch = async (url: RequestInfo, init?: RequestInit): Promise<Response> => {
        if (shouldBypassProxy(url as string)) {
            console.log(`Bypassing proxy for: ${url}`);
            return originalFetch(url, init) as any;
        }

        const proxyAgent = getProxyAgent(url as string);

        // Set the correct agent based on the request type
        const options = proxyAgent ? { ...init, agent: proxyAgent } : init;
        
        console.log(`Using proxy for: ${url}`);
        return originalFetch(url, options) as any;
    };
}