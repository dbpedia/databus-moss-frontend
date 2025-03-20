import { env } from "$env/dynamic/public";
import { RdfUris } from "./rdf-uris";

export class MossUtils {


    static encodedHashTag = "%23";

    static uriToName(uri : string) : string|null {
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

    static getEntryURIFromBrowsePath(baseUrl: string, browsePath: string) {
        // Remove the static part of the browse path
        const prefix = '/browse/';

        if (!browsePath.startsWith(prefix)) {
            throw new Error("Invalid browse path");
        }

        // Extract the relevant part of the browse path
        const relevantPart = browsePath.substring(prefix.length); // Get the part after '/browse/'
        
        // Remove the file extension (if any)
        const formatExtensionIndex = relevantPart.lastIndexOf('.');
        const layerURI = formatExtensionIndex !== -1 ? relevantPart.substring(0, formatExtensionIndex) : relevantPart;
        return `${baseUrl}/res/${layerURI}`;
    }

    static getResourceNameFromId(layerId : string) : string {
        const parts = layerId.split(':');
        return parts.length > 1 ? parts[1] : layerId;
    }

    static getGraphList(data : any) {
        let items = data[RdfUris.JSONLD_GRAPH];

        if(items == null) {
            
            items = [];
            
            if(data[RdfUris.JSONLD_ID] != null) {
                items.push(data);
            }
        }

        return items;
    }

    static getLayerURI(baseUrl: string, resource: string, layerId: string): string {
        const layerName = MossUtils.getResourceNameFromId(layerId);
        const databusResourceURIFragments = MossUtils.getMossDocumentUriFragments(resource);
        return `${baseUrl}/res/${databusResourceURIFragments}/${layerName}`;
      }

    static getRelativeBrowseLink(entryUrl: string) {
        let url = new URL(entryUrl);


        return url.pathname.replace("res", "browse");
    }
    
      static getMossDocumentUriFragments(resourceURI: string): string {
        // Replace # with its encoded equivalent
        resourceURI = resourceURI.replace("#", "/");
    
        try {
          const resourceURL = new URL(resourceURI);
          const host = resourceURL.host;
          const path = resourceURL.pathname;
          return `${host}${path}`;
        } catch (error) {
          throw new Error(`Invalid URL: ${resourceURI}`);
        }
      }

    static getDocumentUri(databusResource : string, layerName : string, format : string): string {
        const reMultiSlash: RegExp = /\/\/+/g;
        const reTrailingSlash: RegExp = /\/+$/g;
        const encodedHashTag = "%23";
        const databusResourceURL = new URL(databusResource);

        layerName = layerName.replace(reTrailingSlash, "");
        let result = databusResourceURL.hostname 
            + databusResourceURL.pathname 
            + databusResourceURL.hash + "/" 
            + layerName 
            + "." + format;

        result = result
                    .replaceAll(reMultiSlash, "/")
                    .replaceAll("#", encodedHashTag);

        return result;
    }

    static getResourceURI(layerURI: string) : string {

        let url = new URL(layerURI);
        let result = url.pathname;
        
        if (result.includes('/')) {
            result = result.substring(0, result.lastIndexOf('/'));
        }

        if(result.startsWith("/g/header/")) {
            result = result.substring(10);
        }

        return "https://" + result;
	}

    static getFormat(currentURI: string) : string {
        return currentURI.substring(currentURI.lastIndexOf('.'));
	}



    static getSaveRequestURL(resource: string, layerName: string): string {
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


    static async fetchAuthorized(uri: string, method: string, body: any = undefined, 
        contentType: string = "application/ld+json"): Promise<Response> {

        try {
            // Fetch the access token
            const tokenResponse = await fetch('/user/token');
            if (!tokenResponse.ok) {
                return Response.error();
            }
            
            const tokenData = await tokenResponse.json();
            const accessToken = tokenData.accessToken;

            // Prepare headers with the fetched access token
            const headers: any = {
                Accept: 'application/json',
                'Content-Type': contentType,
                Authorization: 'Bearer ' + accessToken
            };

            // Make the actual request with the authorization header
            return await fetch(uri, {
                method: method,
                headers: headers,
                body: body
            });

        } catch (error) {
            console.error('Error in fetchAuthorized:', error);
            return Response.error();
        }
    }

}
