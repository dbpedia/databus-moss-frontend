import { page } from '$app/stores';
import { PUBLIC_MOSS_BASE_URL } from '$env/static/public';
import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ url }) {	

    const parentDir = "..";
    const domain = url.toString();
    const segments = await getSegments(url.pathname);
    let folders;
    let files;
    let isDocument = false;
    let content;
    let endpoint = `${PUBLIC_MOSS_BASE_URL}${url.pathname}`


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
    folders = createItems(folders, currentURI);
    files = createItems(files, currentURI);

    return {
        props: {
            segments,
            domain,
            isDocument,
            folders,
            files,
            content
        }
    };
}

function createItems(collection: string[], currentURI: string) {
    return collection?.map((item: any) => {
        if (item.startsWith("/")) {
            item = item.substring(1);
        }
        return {
            name: item,
            href: buildLink(currentURI, item),
            attrs: {
                target: '_self'
            }
        };
    });
}


function buildLink(linkURI: string, item: string): string {
    console.log("linkURI", linkURI);
    let url = "/g/";
    if (!linkURI) {
        return url + item;
    }
    url = linkURI + "/" + item;
    return url.replace(/\/{2,}/g, '/');
}


async function getSegments(path: string) {
    let links: string[] = [];
    if (!path) {
        return links;
    }
    let segments = path.split("/");
    let previous = "";

    segments.forEach((segment) => {
        if (segment === '') {
            return;
        }
        previous += "/" + segment;
        links.push(previous);
    });
    return links;
}