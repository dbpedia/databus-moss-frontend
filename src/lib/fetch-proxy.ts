import { env } from "$env/dynamic/private";
import fetch from "node-fetch";
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

	const originalFetch = fetch;

	(global as any).fetch = async (url: RequestInfo, init?: RequestInit): Promise<Response> => {
		if (shouldBypassProxy(url as string)) {
			return originalFetch(url, init) as any;
		}

		const proxyAgent = getProxyAgent(url as string);
		const options = proxyAgent ? { ...init, agent: proxyAgent } : init;

		return originalFetch(url, options) as any;
	};
}
