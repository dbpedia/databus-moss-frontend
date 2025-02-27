export interface Layer {
    id: string;
    formatMimeType: string;
    indexers : string[];
    resourceTypes : string[];
}

export interface Indexer {
    id: string;
}