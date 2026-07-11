import { error } from '@sveltejs/kit';
import { MossUtils } from '$lib/utils/moss-utils';
import type { PageServerLoad } from '@sveltejs/kit';

export type HalBrowseItem = {
	name: string;
	_links: { self: { href: string } };
};

const SKIP_LINK_RELS = new Set(['self', 'curies', 'collection']);

function toBrowseItem(name: string, href: string): HalBrowseItem {
	return { name, _links: { self: { href } } };
}

function extractBrowseItems(
	data: Record<string, unknown>,
	pathname: string
): {
	folders: HalBrowseItem[];
	files: HalBrowseItem[];
} {
	const folders: HalBrowseItem[] = [];
	const files: HalBrowseItem[] = [];
	const embedded = data._embedded as Record<string, Record<string, unknown>[]> | undefined;

	if (embedded?.modules) {
		for (const item of embedded.modules) {
			const id = String(item.id ?? '');
			const href = (item._links as { self?: { href: string } })?.self?.href ?? `/modules/${id}`;
			folders.push(toBrowseItem(id || String(item.label ?? ''), href));
		}
		return { folders, files };
	}

	if (embedded?.terminologies) {
		for (const item of embedded.terminologies) {
			const id = String(item.id ?? '');
			const href =
				(item._links as { self?: { href: string } })?.self?.href ?? `/terminologies/${id}`;
			folders.push(toBrowseItem(id || String(item.label ?? ''), href));
		}
		return { folders, files };
	}

	if (embedded?.items) {
		for (const item of embedded.items) {
			const browseItem = toBrowseItem(
				String(item.name ?? ''),
				(item._links as { self?: { href: string } })?.self?.href ?? '.'
			);
			if (item.type === 'folder') folders.push(browseItem);
			else files.push(browseItem);
		}
		return { folders, files };
	}

	const links = data._links as Record<string, { href?: string }> | undefined;
	if (
		links &&
		!pathname.startsWith('/modules/') &&
		!pathname.startsWith('/terminologies/')
	) {
		for (const [rel, link] of Object.entries(links)) {
			if (SKIP_LINK_RELS.has(rel) || !link?.href) continue;
			folders.push(toBrowseItem(rel, link.href));
		}
	}

	return { folders, files };
}

function formatContent(text: string): string {
	try {
		return JSON.stringify(JSON.parse(text), null, 2);
	} catch {
		return text;
	}
}

function getPathParts(pathname: string): string[] {
	return pathname.split('/').filter(Boolean);
}

async function getAcceptHeader(
	pathname: string,
	fetch: typeof globalThis.fetch
): Promise<string> {
	const parts = getPathParts(pathname);
	const root = parts[0];

	if (parts.length > 2 && (root === 'modules' || root === 'terminologies')) {
		if (root === 'terminologies' && parts[2] === 'data') {
			const parentRes = await fetch(`/${root}/${parts[1]}`, {
				headers: { Accept: 'application/hal+json, application/json, */*' }
			});
			if (parentRes.ok) {
				const parent = (await parentRes.json()) as { language?: string };
				if (parent.language) {
					return `${parent.language}; charset=UTF-8`;
				}
			}
		}
		return '*/*';
	}

	return 'application/hal+json, application/json, */*';
}

export const loadHalResource: PageServerLoad = async ({ fetch, url }) => {
	const segments = MossUtils.getUriSegments(url.pathname);
	const accept = await getAcceptHeader(url.pathname, fetch);

	const res = await fetch(url.pathname, {
		headers: { Accept: accept }
	});

	if (res.status === 404) {
		error(404, 'Not found');
	}

	if (!res.ok) {
		return {
			mode: 'content' as const,
			content: null,
			status: res.status,
			segments,
			folders: [],
			files: []
		};
	}

	const text = await res.text();

	try {
		const data = JSON.parse(text) as Record<string, unknown>;
		const { folders, files } = extractBrowseItems(data, url.pathname);

		if (folders.length > 0 || files.length > 0) {
			return {
				mode: 'browse' as const,
				segments,
				folders,
				files
			};
		}
	} catch {
		// non-JSON leaf resource
	}

	return {
		mode: 'content' as const,
		content: formatContent(text),
		segments,
		folders: [],
		files: []
	};
};
