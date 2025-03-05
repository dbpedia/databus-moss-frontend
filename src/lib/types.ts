export interface Layer {
    id: string;
    formatMimeType: string;
    indexers : string[];
    resourceTypes : string[];
}

export interface Indexer {
    id: string;
}

export interface RdfFormatInfo {
    extensions: string[];
    mimeType: string;
}