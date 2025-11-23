import { env } from "$env/dynamic/public";
import type { DatabusResource, MossModule, RdfFormatInfo } from "$lib/types";
import { JsonldUtils } from "./jsonld-utils";
import { RdfUris } from "./rdf-uris";
import jsonld from 'jsonld';

export class MossUtils {


    static getModuleUri(id: string): string {
        return `${env.PUBLIC_MOSS_BASE_URL}/module/${id}`;
    }

    static getRelativeUri(uri: string): string {
        try {
            return new URL(uri).pathname;
        } catch {
            return uri;
        }
    }

    static async fetchDatabusResource(uri: string): Promise<DatabusResource> {
        const response = await fetch(uri, {
            headers: { Accept: 'application/ld+json' }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch resource: ${response.status} ${response.statusText}`);
        }

        let json = await response.json();
        json = await jsonld.expand(json);

        if (!json || !json[0]) {
            throw new Error('Invalid JSON-LD response');
        }

        const data = json[0];

        return {
            id: uri,
            title: JsonldUtils.getValue(data, RdfUris.DCT_TITLE) ?? '',
            abstract: JsonldUtils.getValue(data, RdfUris.DCT_ABSTRACT) ?? '',
            description: JsonldUtils.getValue(data, RdfUris.DCT_DESCRIPTION) ?? ''
        };
    }

    static formatModuleData(moduleData: any): MossModule {
        const id = moduleData['@id'] ?? '';
        const label = JsonldUtils.getValue(moduleData, 'http://purl.org/dc/terms/title') ?? '';
        const description = JsonldUtils.getValue(moduleData, 'http://purl.org/dc/terms/description') ?? '';
        const language = JsonldUtils.getValue(moduleData, 'http://dataid.dbpedia.org/ns/moss#mimeType') ?? '';

        return { id, label, description, language };
    }

    static encodedHashTag = "%23";

    static uriToName(uri: string): string | null {
        if (uri == null) {
            return null;
        }

        if (typeof uri !== "string") {
            return null;
        }

        let result = uri.substring(uri.lastIndexOf('/') + 1);
        result = result.substring(result.lastIndexOf('#') + 1);

        if (result.includes('.')) {
            result = result.substring(0, result.lastIndexOf('.'));
        }

        return result;
    }


    static getLastPathSegment(uri: string) {
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

        return title ? capital + title.slice(1) : "";
    }

    static async fetchJSON(baseUrl: string, searchInput: string) {
        const query = `${baseUrl}${searchInput}`;
        const data = await fetch(query, {
            headers: {
                'Accept': 'application/json'
            }
        });
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
        const prefix = '/entries/';

        if (!browsePath.startsWith(prefix)) {
            throw new Error("Invalid browse path");
        }

        // Extract the relevant part of the browse path
        const relevantPart = browsePath.substring(prefix.length); // Get the part after '/browse/'

        // Remove the file extension (if any)
        const formatExtensionIndex = relevantPart.lastIndexOf('.');
        const layerURI = formatExtensionIndex !== -1 ? relevantPart.substring(0, formatExtensionIndex) : relevantPart;
        return `${baseUrl}/entry/${layerURI}`;
    }

    static getResourceNameFromId(layerId: string): string {
        const parts = layerId.split(':');
        return parts.length > 1 ? parts[1] : layerId;
    }

    static getGraphList(data: any) {
        let items = data[RdfUris.JSONLD_GRAPH];

        if (items == null) {

            items = [];

            if (data[RdfUris.JSONLD_ID] != null) {
                items.push(data);
            }
        }

        return items;
    }

    static getContentGraphUri(resource: string, moduleId: string, formatInfo: RdfFormatInfo | null = null): string {

        const databusResourceURIFragments = MossUtils.getMossDocumentUriFragments(resource);
        return `${env.PUBLIC_MOSS_BASE_URL}/g/content/${databusResourceURIFragments}/${moduleId}.${formatInfo?.extensions[0]}`;
    }

    static getMossEntryURI(baseUrl: string, resource: string, layerId: string): string {
        const moduleId = MossUtils.getResourceNameFromId(layerId);
        const databusResourceURIFragments = MossUtils.getMossDocumentUriFragments(resource);
        return `${baseUrl}/entries/${databusResourceURIFragments}/${moduleId}`;
    }

    static getRelativeBrowseLink(entryUrl: string, formatInfo: RdfFormatInfo | null = null): string {
        let url = new URL(entryUrl);
        let result = url.pathname.replace("entry", "entries");

        if (formatInfo != null) {
            result += `.${formatInfo.extensions[0]}`;
        }

        return result;
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

    static getDocumentUri(databusResource: string, layerName: string, format: string): string {
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

    static getResourceURI(layerURI: string): string {

        let url = new URL(layerURI);
        let result = url.pathname;

        if (result.includes('/')) {
            result = result.substring(0, result.lastIndexOf('/'));
        }

        if (result.startsWith("/g/header/")) {
            result = result.substring(10);
        }

        return "https://" + result;
    }

    static getFormat(currentURI: string): string {
        return currentURI.substring(currentURI.lastIndexOf('.'));
    }

    static getSaveRequestURL(resourceUri: string, moduleId: string): string {
        resourceUri = resourceUri.replaceAll("#", MossUtils.encodedHashTag);
        return `/api/v1/save-entry?module=${moduleId}&resource=${resourceUri}`;
    }

    static getDeletionRequestURL(resourceUri: string, moduleId: string): string {
        resourceUri = resourceUri.replaceAll("#", MossUtils.encodedHashTag);
        return `/api/v1/delete-entry?module=${moduleId}&resource=${resourceUri}`;
    }

    static getValidationRequestURL(resourceUri: string, moduleId: string): string {
        resourceUri = resourceUri.replaceAll("#", MossUtils.encodedHashTag);
        return `/api/v1/validate-entry?module=${moduleId}&resource=${resourceUri}`;
    }

    static getIndexerPreviewURL(resourceUri: string, moduleId: string): string {
        resourceUri = resourceUri.replaceAll("#", MossUtils.encodedHashTag);
        return `/api/v1/get-indexer-preview?module=${moduleId}&resource=${resourceUri}`;
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
        let url = "/entries";
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
