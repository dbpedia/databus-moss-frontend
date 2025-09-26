export type TemplateFormat = 'json-ld' | 'turtle' | 'yaml' | null;

export interface TemplateMapping {
	name: string;
	format: TemplateFormat;
}

export const templateMapping: Record<string, TemplateMapping> = {
	'application/ld+json': { name: 'template.jsonld', format: 'json-ld' },
	'application/json': { name: 'template.json', format: 'json-ld' },
	'text/turtle': { name: 'template.ttl', format: 'turtle' },
	'application/rdf+xml': { name: 'template.rdf', format: null },
	'application/n-triples': { name: 'template.nt', format: null },
	'application/n-quads': { name: 'template.nq', format: null },
	'application/trig': { name: 'template.trig', format: 'turtle' },
	'yaml': { name: 'template.yml', format: 'yaml' },
	'application/x-yaml': { name: 'template.yml', format: 'yaml' }
};

export function getTemplateFile(language: string) {
	return templateMapping[language] || { name: 'template.txt', format: null };
}
