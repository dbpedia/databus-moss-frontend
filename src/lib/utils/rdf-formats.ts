

export class RdfFormats {

    static JSONLD: any = { 
        "extensions" : [ "jsonld" ],
        "contentType" : "application/ld+json"
    };

    static TURTLE: any = {
        "extensions" : [ "ttl" ],
        "contentType" : "text/turtle"
    }

    
	static getFormatByExtension(extension: string) {
        const formats = [ RdfFormats.JSONLD, RdfFormats.TURTLE ];
        return formats.find(format => format.extensions.includes(extension));
    }
}