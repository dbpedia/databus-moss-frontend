export interface Layer {
    id: string;
    formatMimeType: string;
    resourceTypes: string[];
}

export interface Indexer {
    id: string;
    layers: string[];
}

export interface RdfFormatInfo {
    extensions: string[];
    mimeType: string;
}

export interface MossModule {
    id: string;
    label: string;
    description: string;
    language: string;
}

export interface MossTerminology {
    id: string;
    label: string;
    language: string;
}


export interface DatabusResource {
    id: string;
    title: string;
    abstract: string;
    description: string;
}

export interface SearchTag {
    id: string;
    label: string;
}

export interface SearchConfig {
    lookupBaseUrl: string;
    module: string;
    predicate: string;
    selection: SearchTag[];
    countQuery: string;
}

export interface MossFacet {
    id: string;
    label: string;
	predicate: string;
    sortOrder: number;
}