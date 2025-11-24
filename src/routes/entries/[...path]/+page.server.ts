import { MossUtils } from '$lib/utils/moss-utils';
import { RdfUris } from '$lib/utils/rdf-uris';
import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';
import type { DatabusResource, MossModule } from '$lib/types';

/** @type {import('./$types').PageServerLoad} */
export async function load({ url, locals, setHeaders }: any) {
    const resourceUrl = `${env.PUBLIC_MOSS_API_SERVER_URL}${url.pathname}`;

    // Fetch HAL description
    const response = await fetch(resourceUrl, {
        headers: { Accept: 'application/hal+json' }
    });

    if (!response.ok) {
        throw error(response.status, response.statusText);
    }

    // Forward ALL Link headers from Moss API → client
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

    // Folder listing
    if (!isEntry) {
        const items = responseData._embedded?.items ?? [];

        for (const item of items) {
            if (item.type === 'entry') entries.push(item);
            if (item.type === 'folder') folders.push(item);
        }
    } else {
        // Single entry
        try {
            moduleData = await MossUtils.fetchJSON(responseData.module, '');

            const contentResponse = await fetch(responseData.contentGraph);
            content = await contentResponse.text();
        } catch (e) {
            console.error('Failed to load entry module', e);
        }
    }

    const segments = MossUtils.getUriSegments(url.pathname);
    const session = await locals.auth();

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
