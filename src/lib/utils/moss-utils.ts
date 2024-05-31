import { PUBLIC_MOSS_BASE_URL } from "$env/static/public";


export class MossUtils {
    static uriToName(uri : string) {
        if (uri == null) {
            return null;
        }

        if(typeof uri !== "string") {
            return null;
        }

        let result = uri.substring(uri.lastIndexOf('/') + 1);
        result = result.substring(result.lastIndexOf('#') + 1);

        if (result.includes('.')) {
            result = result.substring(0, result.lastIndexOf('.'));
        }

        return result;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static async fetchLayers(): Promise<any> {
        const layerRoute: string = "layer/";
        const response = await fetch(`${PUBLIC_MOSS_BASE_URL}/${layerRoute}`);
        const data = await response.json();

        return data;
    }


    static getLastPathSegment(uri : string) {
        const segments = uri.split('/');
        return segments.pop() || segments.pop();
    }

    static async fetchJSON(baseUrl : string, searchInput: string) {
        const query = `${baseUrl}${searchInput}`;
        const data = await fetch(query);
        return await data.json() ?? [];
    }

    static getFileExtension(file: string): string {
        const reFileExtension = /(?:\.([^.]+))?$/;
        const result = reFileExtension.exec(file);
        const extension = result?.pop();
        return extension ? extension : "";
    }

    static getDocumentUri(databusResource : string, layerName : string): string {
        const reMultiSlash: RegExp = /\/\/+/g;
        const reTrailingSlash: RegExp = /\/+$/g;
        const encodedHashTag = "%23";
        const databusResourceURL = new URL(databusResource);

        layerName = layerName.replace(reTrailingSlash, "");
        let result = databusResourceURL.hostname + databusResourceURL.pathname + databusResourceURL.hash + "/" + layerName + ".jsonld";

        result = result
                    .replaceAll(reMultiSlash, "/")
                    .replaceAll("#", encodedHashTag);

        return result;
    }

    static getEndpoint(iri: string): URL {
        const [repo] = iri.split("/", 1);
        const path = iri.substring(iri.indexOf("/") + 1);
        const endpointURL = new URL(PUBLIC_MOSS_BASE_URL);
        console.log(PUBLIC_MOSS_BASE_URL);

        endpointURL.pathname = "/api/save";
        console.log("repo", repo);
        console.log("path", path);
        endpointURL.searchParams.append("repo", repo);
        endpointURL.searchParams.append("path", path);

        console.log(endpointURL.toString());

        return endpointURL;
    }
}
