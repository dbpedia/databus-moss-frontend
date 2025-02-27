

export class RdfUris {

    static JSONLD_VALUE: string = "@value";
    static JSONLD_GRAPH: string = "@graph";
    static JSONLD_CONTEXT: string = "@context";
    static JSONLD_TYPE: string = "@type";
    static JSONLD_ID: string = "@id";
    static NS_MOSS : string = "http://dataid.dbpedia.org/ns/moss#";
    static NS_DCT : string = "http://purl.org/dc/terms/";
    static NS_RDF : string = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";

    // MOSS
    static MOSS_EXTENDS : string = "http://dataid.dbpedia.org/ns/moss#extends";
    static MOSS_LAYER : string = "http://dataid.dbpedia.org/ns/moss#DatabusMetadataLayer";
    static MOSS_LAYER_TYPE : string = "http://dataid.dbpedia.org/ns/moss#DatabusMetadataLayerType";
    static MOSS_LAYER_NAME : string = "http://dataid.dbpedia.org/ns/moss#layerName";
    static MOSS_MIME_TYPE : string = "http://dataid.dbpedia.org/ns/moss#mimeType";

    // DCT
    static DCT_PUBLISHER : string = 'http://purl.org/dc/terms/publisher';
    static DCT_HAS_VERSION : string = 'http://purl.org/dc/terms/hasVersion';
    static DCT_ISSUED : string = 'http://purl.org/dc/terms/issued';
    static DCT_CREATED : string = 'http://purl.org/dc/terms/created';
    static DCT_MODIFIED : string = 'http://purl.org/dc/terms/modified';
    static DCT_DISTRIBUTION : string = 'http://purl.org/dc/terms/distribution';
    static DCT_SUBJECT : string = 'http://purl.org/dc/terms/subject';
    static DCT_CREATOR : string = 'http://purl.org/dc/terms/creator'
    static DCT_TITLE : string = 'http://purl.org/dc/terms/title'
    static DCT_ABSTRACT : string = 'http://purl.org/dc/terms/abstract'
    static DCT_DESCRIPTION : string = 'http://purl.org/dc/terms/description'
    static DCT_LICENSE : string = 'http://purl.org/dc/terms/license';

    // DCAT
    static DCAT_DOWNLOAD_URL : string = 'http://www.w3.org/ns/dcat#downloadURL';
    static DCAT_BYTESIZE : string = 'http://www.w3.org/ns/dcat#byteSize';
    static DCAT_DISTRIBUTION : string = 'http://www.w3.org/ns/dcat#distribution';

    static compact(uri : string) : string {
        uri = uri.replace(this.NS_MOSS, "moss:");
        uri = uri.replace(this.NS_DCT, "dct:");
        uri = uri.replace(this.NS_RDF, "rdf:");
        return uri;
    }
}