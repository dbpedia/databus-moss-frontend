import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export type HashNavigation = {
	view: string;
	params: Record<string, string>;
};

function parseHash(): HashNavigation {
	if (!browser) return { view: 'list', params: {} };

	const hash = window.location.hash.slice(1) || 'list';
	const [viewPart, query] = hash.split('?');
	const params: Record<string, string> = {};

	if (query) {
		query.split('&').forEach(pair => {
			const [k, v] = pair.split('=');
			if (k && v) params[k] = decodeURIComponent(v);
		});
	}

	return { view: viewPart, params };
}

function createHashStore() {
	const { subscribe, set } = writable<HashNavigation>(parseHash());

	function navigate(hash: string) {
		if (browser) window.location.hash = hash;
	}

	if (browser) {
		window.addEventListener('hashchange', () => set(parseHash()));
	}

	return { subscribe, navigate };
}

export const hashStore = createHashStore();
