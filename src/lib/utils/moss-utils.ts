
export class MossUtils {
    static uriToName(uri : string) {
        if (uri == null) {
            return null;
        }

        if(typeof uri !== "string") {
            return null;
        }

        var result = uri.substring(uri.lastIndexOf('/') + 1);
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
        let query = `${baseUrl}${searchInput}`
        const data = await fetch(query);
        return await data.json() ?? [];
    }
}
