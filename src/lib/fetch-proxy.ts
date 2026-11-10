import { env } from "$env/dynamic/private";
import nodeFetch from "node-fetch";
import type { RequestInit, RequestInfo } from "node-fetch";
import { HttpsProxyAgent } from "https-proxy-agent";
import { HttpProxyAgent } from "http-proxy-agent";

export function setupFetchProxy() {
	const httpsProxy = env.HTTPS_PROXY || env.https_proxy;
	const httpProxy = env.HTTP_PROXY || env.http_proxy;
	const noProxy = env.NO_PROXY || env.no_proxy;

	const proxy = httpsProxy || httpProxy;

	if (!proxy) {
		return;
	}

	function shouldBypassProxy(url: string): boolean {
		if (!noProxy) return false;

		const noProxyList = noProxy.split(",").map((domain) => domain.trim().toLowerCase());
		const urlHost = new URL(url).hostname.toLowerCase();

		return noProxyList.some((domain) => urlHost.endsWith(domain));
	}

	const getProxyAgent = (url: string) => {
		const isHttps = url.toLowerCase().startsWith("https://");
		if (isHttps && httpsProxy) {
			return new HttpsProxyAgent(httpsProxy);
		}
		if (!isHttps && httpProxy) {
			return new HttpProxyAgent(httpProxy);
		}
		return undefined;
	};

	// Keep the native (undici) fetch for everything that is not proxied. node-fetch
	// does not support WHATWG ReadableStream bodies, so internal traffic (e.g. to
	// moss-server, usually listed in NO_PROXY) must not go through it.
	const nativeFetch = globalThis.fetch;

	(globalThis as any).fetch = async (input: any, init?: any): Promise<Response> => {
		const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;

		if (shouldBypassProxy(url)) {
			return nativeFetch(input, init);
		}

		const proxyAgent = getProxyAgent(url);
		if (!proxyAgent) {
			return nativeFetch(input, init);
		}

		return nodeFetch(url as RequestInfo, { ...(init as RequestInit), agent: proxyAgent }) as any;
	};
}
