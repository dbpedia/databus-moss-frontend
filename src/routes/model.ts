interface AnnotationTag {
    id: string;
    label: string;
}


    interface SearchResultLayer {
        uri: string,
        name: string,
        browseLink: string;
        contentUri: string;
        explanations: Record<string, any[]>;
    }

    interface SearchResult {
        uri: string;
        title: string | undefined;
        abstract: string | undefined;
        description: string | undefined;
        layers: SearchResultLayer[];
        hash?: string; // Optional as it is computed later
        browseLink?: string;
    }

    type Explanation = {
        id: string;
        score: number;
        matchedFields: string[];
    };
