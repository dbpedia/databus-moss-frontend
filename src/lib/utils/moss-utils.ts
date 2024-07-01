
export class MossUtils {
	

    static encodedHashTag = "%23";

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

    static splitPath(path: string): string[] {
        const segements = path.split("/");
        segements.shift();
        return segements
    }

    static getTitle(uri: string): string {
        const title = uri.split("/").pop()?.split(".").at(0);
        const capital = title?.charAt(0).toUpperCase();

        return title? capital + title.slice(1) : "";
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
        let result = databusResourceURL.hostname + databusResourceURL.pathname + databusResourceURL.hash + "/" + layerName;

        result = result
                    .replaceAll(reMultiSlash, "/")
                    .replaceAll("#", encodedHashTag);

        return result;
    }

    static getResourceURI(currentURI: string) : string {
        
        let result = currentURI;

        if (result.includes('/')) {
            result = result.substring(0, result.lastIndexOf('/'));
        }

        return "https://" + result;
	}

	static getLayerName(uri: string) {
        let result = uri.substring(uri.lastIndexOf('/') + 1);

        if (result.includes('.')) {
            result = result.substring(0, result.lastIndexOf('.'));
        }

        return result;
	}

    static getSavePath(resource: string, layerName: string): string {
        resource = resource.replaceAll("#", MossUtils.encodedHashTag);
        return `/api/save?layer=${layerName}&resource=${resource}`;
    }

    static getUriSegments(path: string) {
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

    static createListGroupNavigationItems(collection: string[], currentURI: string) {
        return collection?.map((item: any) => {
            if (item.startsWith("/")) {
                item = item.substring(1);
            }
            return {
                name: item,
                href: this.buildBrowseLink(currentURI, item),
            };
        });
    }

    static buildBrowseLink(linkURI: string, item: string): string {
        let url = "/browse/";
        if (!linkURI) {
            return url + item;
        }
        url = linkURI + "/" + item;
        return url.replace(/\/{2,}/g, '/');
    }
    
}
