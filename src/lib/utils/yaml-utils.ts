import yaml from 'js-yaml';

export function toYaml(data: object): string {
	return yaml.dump(data, { lineWidth: -1, noRefs: true });
}

export const YAML_CONTENT_TYPE = 'text/yaml';
