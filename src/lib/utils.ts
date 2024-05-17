
export class MossUtils {
    static uriToName(uri : string) {
        if (uri == null) {
            return null;
        }

        var result = uri.substring(uri.lastIndexOf('/') + 1);
        result = result.substring(result.lastIndexOf('#') + 1);

        if (result.includes('.')) {
            result = result.substring(0, result.lastIndexOf('.'));
        }

        return result;
    }
}
