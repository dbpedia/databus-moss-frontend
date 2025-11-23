<script lang="ts">
	import SubResourceEditor from './sub-resource-editor.svelte';

	export let moduleId: string;
	export let language: string;

	let resourceName: string;
	let format: 'json-ld' | 'turtle' | 'yaml' | null = null;

	$: {
		const mapping: Record<string, { name: string; format: typeof format }> = {
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

		const config = mapping[language] || { name: 'template.txt', format: null };
		resourceName = 'template'; //config.name;
		format = config.format;
	}
</script>

<div class="detail-card">
	<SubResourceEditor {moduleId} {resourceName} {format} />
</div>

<style>
	
</style>
