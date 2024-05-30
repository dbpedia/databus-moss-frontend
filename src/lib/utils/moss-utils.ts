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

    static getLastPathSegment(uri : string) {
        const segments = uri.split('/');
        return segments.pop() || segments.pop();
    }

    static async fetchJSON(baseUrl : string, searchInput: string) {
        const query = `${baseUrl}${searchInput}`
        const data = await fetch(query);
        return await data.json() ?? [];
    }

    static getFileExtension(file: string): string {
        const reFileExtension = /(?:\.([^.]+))?$/;
        const result = reFileExtension.exec(file);
        const extension = result?.pop();
        return extension ? extension : "";
    }

    static getEndpoint(iri: string): URL {
        const [repo] = iri.split("/", 1);
        const path = iri.substring(iri.indexOf("/") + 1);
        const endpointURL = new URL(PUBLIC_MOSS_BASE_URL);

        endpointURL.pathname = "/api/save";
        console.log("repo", repo);
        console.log("path", path);
        endpointURL.searchParams.append("repo", repo);
        endpointURL.searchParams.append("path", path);

        return endpointURL;
    }
}
