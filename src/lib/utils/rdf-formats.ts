import type { RdfFormatInfo } from "$lib/types";


export class RdfFormats {

    static JSONLD: RdfFormatInfo = { 
        extensions : [ "jsonld" ],
        mimeType : "application/ld+json"
    };

    static TURTLE: RdfFormatInfo = {
        extensions : [ "ttl" ],
        mimeType : "text/turtle"
    }

	static getFormatByExtension(extension: string) : RdfFormatInfo | undefined {
        const formats = [ RdfFormats.JSONLD, RdfFormats.TURTLE ];
        return formats.find(format => format.extensions.includes(extension));
    }

    static getFormatByMimeType(mimeType: string) : RdfFormatInfo | undefined  {
        const formats = [ RdfFormats.JSONLD, RdfFormats.TURTLE ];
        return formats.find(format => format.mimeType === mimeType);
    }
}