const MODULE_CONTEXT_JSONLD = /^\/modules\/([^/]+)\/context\.jsonld\/?$/;

export function normalizeProxyPath(pathname: string): string {
	const match = pathname.match(MODULE_CONTEXT_JSONLD);
	if (match) {
		return `/modules/${match[1]}/context`;
	}

	return pathname;
}

export function isModuleContextJsonLdPath(pathname: string): boolean {
	return MODULE_CONTEXT_JSONLD.test(pathname);
}

export function getModuleSubResource(pathname: string): string | null {
	const parts = pathname.split('/').filter(Boolean);
	if (parts.length < 3 || parts[0] !== 'modules') {
		return null;
	}

	const sub = parts[2];
	if (sub === 'context' || sub === 'context.jsonld') {
		return 'context';
	}

	return sub;
}
