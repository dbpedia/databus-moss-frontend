export interface Layer {
    id: string;
    formatMimeType: string;
    resourceTypes : string[];
}

export interface Indexer {
    id: string;
    layers : string[];
}

export interface RdfFormatInfo {
    extensions: string[];
    mimeType: string;
}