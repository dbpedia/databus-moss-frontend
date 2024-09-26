

export class RdfUris {

    static JSONLD_VALUE: string = "@value";
    static JSONLD_TYPE: string = "@type";
    static JSONLD_ID: string = "@id";
    static NS_MOSS : string = "http://dataid.dbpedia.org/ns/moss#";
    static NS_DCT : string = "http://purl.org/dc/terms/";
    static NS_RDF : string = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";

    static compact(uri : string) : string {
        uri = uri.replace(this.NS_MOSS, "moss:");
        uri = uri.replace(this.NS_DCT, "dct:");
        uri = uri.replace(this.NS_RDF, "rdf:");
        return uri;
    }
}