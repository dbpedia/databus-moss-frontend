
import { MossUtils } from '$lib/utils/moss-utils';
import { error } from '@sveltejs/kit';


/** @type {import('./$types').PageServerLoad} */
export async function load({ url, locals }: any) {	

    const parentDir = "..";
    const domain = url.toString();
    const segments = MossUtils.getUriSegments(url.pathname);

    
    let folders;
    let files;
    let isDocument = false;
    let content;
    let endpoint = `${import.meta.env.VITE_MOSS_BASE_URL}${url.pathname}`

    endpoint = endpoint.replace("/browse", "/g");

    //FIXME: possibly useful info -> https://github.com/sveltejs/kit/issues/3069
    //path here contains a "#" which gets filtered out -> resulting in a 404 from moss
    // which is then not properly return or so.
    let response = await fetch(endpoint);

    if (response.status === 404) {
        throw error(response.status, response.statusText);
    }

    const data = await response.json();
	
    folders = data.folders;
    if (!folders) {
        folders = [];
    }
    folders.unshift(parentDir);
    files = data.files;

    let contentType = response.headers.get("Content-Type");

    if(contentType != "application/json") {
        isDocument = true;
        content = JSON.stringify(data, null, 3)
    }

    const currentURI = url.pathname;
    folders = MossUtils.createListGroupNavigationItems(folders, currentURI);
    files = MossUtils.createListGroupNavigationItems(files, currentURI);

    const session = await locals.auth() as any;

    return {
        content: content,
        token: session.accessToken,
        props: {
            segments,
            domain,
            isDocument,
            folders,
            files
        }
    };
}
