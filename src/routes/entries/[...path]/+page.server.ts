import { MossUtils } from '$lib/utils/moss-utils';
import { RdfUris } from '$lib/utils/rdf-uris';
import { env as publicEnv } from '$env/dynamic/public';
import type { DatabusResource } from '$lib/types';

function toProxyUrl(uri: string): string {
    const publicBase = publicEnv.PUBLIC_MOSS_BASE_URL;
    if (publicBase && uri.startsWith(publicBase)) {
        return uri.slice(publicBase.length);
    }

    try {
        const parsed = new URL(uri);
        return `${parsed.pathname}${parsed.search}`;
    } catch {
        return uri;
    }
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ fetch, url, locals, setHeaders }: any) {
    const session = await locals.auth();

    let response: Response;

    response = await fetch(url.pathname, {
        headers: { Accept: 'application/hal+json' }
    });

    if (!response.ok) {
        return {
            content: null,
            token: session?.accessToken,
            entriesStatus: response.status,
            props: {
                segments: [],
                isDocument: false
            }
        };
    }

    const linkHeader = response.headers.get('link');
    if (linkHeader) {
        setHeaders({ link: linkHeader });
    }

    const responseData = await response.json();
    const isEntry = !!responseData.module;

    let folders: any[] = [];
    let entries: any[] = [];
    let content: string | null = null;

    let moduleData: any = {};
    let entryData: any = {};
    let resource: DatabusResource | null = null;

    if (!isEntry) {
        const items = responseData._embedded?.items ?? [];

        for (const item of items) {
            if (item.type === 'entry') entries.push(item);
            if (item.type === 'folder') folders.push(item);
        }
    } else {
        // console.log("ENTRY!");

        try {
            moduleData = await MossUtils.fetchJSON(toProxyUrl(responseData.module), fetch);

            const contentResponse = await fetch(toProxyUrl(responseData.contentGraph));
            content = await contentResponse.text();
        } catch (e) {
            console.error('Failed to load entry module', e);
        }
    }

    const segments = MossUtils.getUriSegments(url.pathname);

    return {
        content,
        token: session?.accessToken,
        module: moduleData,
        entry: responseData,
        resource,

        props: {
            extensionData: entryData,
            moduleId: MossUtils.uriToName(moduleData[RdfUris.JSONLD_ID]),
            moduleData,
            segments,
            domain: url.toString(),
            isDocument: isEntry,
            folders,
            files: entries
        }
    };
}
