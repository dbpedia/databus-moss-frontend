interface AnnotationTag {
    id: string;
    label: string;
}


    interface Layer {
        uri: string;
    }

    interface SearchResultLayer {
        uri: string,
        name: string,
        browseLink: string;
        explanations: Record<string, any[]>;
    }

    interface SearchResult {
        uri: string;
        title: string | undefined;
        abstract: string | undefined;
        description: string | undefined;
        layers: SearchResultLayer[];
        hash?: string; // Optional as it is computed later
    }

    type Explanation = {
        id: string;
        score: number;
        matchedFields: string[];
    };
