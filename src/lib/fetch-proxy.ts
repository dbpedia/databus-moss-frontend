import { env } from "$env/dynamic/private"; // Assuming environment variables are here
import { fetch as undiciFetch } from 'undici'; // Importing fetch from undici
import { URL } from 'url';

// Function to handle fetch requests with proxy support
export function setupFetchProxy() {
    const httpsProxy = env.HTTPS_PROXY || env.https_proxy;
    const httpProxy = env.HTTP_PROXY || env.http_proxy;
    const noProxy = env.NO_PROXY || env.no_proxy;
    const noProxyList = noProxy ? noProxy.split(',').map(domain => domain.trim().toLowerCase()) : undefined;
    console.log(`HTTPS_PROXY: ${httpsProxy}`);
    console.log(`HTTP_PROXY: ${httpProxy}`);
    console.log(`NO_PROXY: ${noProxyList}`);

    if(!httpsProxy && !httpProxy) {
        console.log(`No Proxy Specified.`);
        return;
    }

    // Check if we should bypass the proxy for certain domains
    const shouldBypassProxy = (url: string): boolean => {
        if (!noProxyList) return false;
        const urlHost = new URL(url).hostname.toLowerCase();
        return noProxyList.some(domain => urlHost.endsWith(domain));
    };

    // Function to create the proxy agent
    const getProxyAgent = (url: string) => {
        const isHttps = url.toLowerCase().startsWith('https://');
        const proxy = isHttps ? httpsProxy : httpProxy;

        if (proxy) {
            // Configure proxy using undici options
            return {
                agent: {
                    proxy: proxy
                }
            };
        }

        return undefined;
    };

    // Override global fetch
    (global as any).fetch = async (url: string, init?: any) => {
        if (shouldBypassProxy(url)) {
            console.log(`Bypassing proxy for: ${url}`);
            return undiciFetch(url, init);
        }

        const proxyAgent = getProxyAgent(url);
        const options = proxyAgent ? { ...init, ...proxyAgent } : init;

        console.log(`Fetching with proxy for: ${url}`);
        return undiciFetch(url, options);
    };

    console.log('Global fetch has been overridden with undici fetch and proxy support.');
}
