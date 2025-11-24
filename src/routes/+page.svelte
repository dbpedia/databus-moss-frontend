<script lang="ts">
	import SearchResult from '$lib/components/search-result.svelte';
	import { MossUtils } from '$lib/utils/moss-utils';

	import type { FacetConfig, SearchConfig, SearchTag } from '$lib/types';
	import LookupFacet from '$lib/components/lookup-facet.svelte';

	const INNER_SELECT_TEMPLATE = `
		SELECT DISTINCT ?s WHERE 
		{
			%SELECTOR%
		}
	`;

	const UNION_BLOCK_TEMPLATE = `
		{
			VALUES ?t { %VALUES% } ?s <%PREDICATE%> ?t .
		}
	`;

	const SELECT_QUERY_TEMPLATE = `
		SELECT DISTINCT ?s ?e ?g ?t WHERE 
		{
			{
				%INNER_SELECT%
			}

			?e <http://dataid.dbpedia.org/ns/moss#extends> ?s .
			?e <http://dataid.dbpedia.org/ns/moss#content> ?g .

			GRAPH ?g {
				%UNION_BLOCKS%
			}
		}
	`;

	let facetSelections: Record<string, SearchTag[]> = {};
	let sparqlSelector: string;

	const keywordFacet: FacetConfig = {
		id: 'keyword',
		label: 'Keywords',
		lookupBaseUrl: 'http://localhost:5173/api/v1/search?label=',
		module: 'http://localhost:8080/modules/keyword',
		predicate: 'https://schema.org/keywords',
		labelField: 'label',
		isLiteral: true
	};

	const locationFacet: FacetConfig = {
		id: 'location',
		label: 'Location',
		lookupBaseUrl: 'https://lookup.dbpedia.org/api/search?format=JSON&typeName=Location&query=',
		module: 'http://localhost:8080/modules/oem-spatial',
		predicate: 'http://purl.org/dc/terms/spatial',
		labelField: 'label',
		isLiteral: false
	};

	const fundingAgencyFacet: FacetConfig = {
		id: 'fundingAgency',
		label: 'Funding Agency',
		module: 'http://localhost:8080/modules/oem-project',
		lookupBaseUrl: 'http://localhost:5173/terminologies/reorg/search?query=',
		predicate: 'https://dbpedia.org/ns/oem/fundingAgency',
		labelField: 'label',
		isLiteral: false
	};

	const oeoAnnotationFacet: FacetConfig = {
		id: 'oeoAnnotation',
		label: 'Referenced Concepts',
		module: 'http://localhost:8080/modules/oemeta',
		lookupBaseUrl: 'http://localhost:5173/terminologies/oeo/search?query=',
		predicate: 'http://dataid.dbpedia.org/ns/moss#related',
		labelField: 'label',
		isLiteral: false
	};

	const facetMap: Record<string, FacetConfig> = {
		[locationFacet.id]: locationFacet,
		[fundingAgencyFacet.id]: fundingAgencyFacet,
		[oeoAnnotationFacet.id]: oeoAnnotationFacet,
		[keywordFacet.id]: keywordFacet
	};

	function formatValue(v: string, isLiteral: boolean) {
		if (isLiteral) return `"${v.replace(/"/g, '\\"')}"`;
		return `<${v}>`;
	}

	function crateInnerSelectClause(): string {
		let selectorString: string = '';

		for (const [module, selection] of Object.entries(facetSelections)) {
			if (!selection || selection.length === 0) continue;

			const predicate = facetMap[module]?.predicate;
			const isLiteral = facetMap[module]?.isLiteral;

			for (var s of selection) {
				selectorString += `?s <${predicate}> ${formatValue(s.id, isLiteral)} .\n`;
			}
		}

		return selectorString;
	}

	function createSelectQuery(): string {
		if (!sparqlSelector || Object.keys(facetSelections).length === 0) return '';

		const facets = Object.entries(facetSelections)
			.filter(([id, tags]) => tags.length > 0 && facetMap[id])
			.map(([id, tags]) => ({
				predicate: facetMap[id]!.predicate,
				values: tags.map((t) => `${formatValue(t.id, facetMap[id]!.isLiteral)}`)
			}));

		if (facets.length === 0) return '';

		const unionBlocks = facets
			.map((f) =>
				UNION_BLOCK_TEMPLATE.replace('%VALUES%', f.values.join(' ')).replace(
					'%PREDICATE%',
					f.predicate
				)
			)
			.join('\n    UNION\n    ');

		const innerSelect = INNER_SELECT_TEMPLATE.replace('%SELECTOR%', sparqlSelector.trim());

		return SELECT_QUERY_TEMPLATE.replace('%INNER_SELECT%', innerSelect)
			.replace('%UNION_BLOCKS%', unionBlocks)
			.trim();
	}

	async function updateSelection() {
		queryString = createSelectQuery();

		if(queryString == undefined || queryString.length == 0) {
			searchResults = {};
			return;
		}

		const response = await fetch('/sparql', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/sparql-query',
				Accept: 'application/json'
			},
			body: queryString
		});

		const data = await response.json();
		var results: any = {};

		for (const result of data.results.bindings) {
			// Databus resource
			const databusUri = result.s.value;

			if (results[databusUri] == undefined) {
				results[databusUri] = {
					uri: databusUri,
					name: MossUtils.uriToName(databusUri),
					entries: {},
					hash: databusUri
				};
			}

			const entryUri = result.e.value;

			if (results[databusUri].entries[entryUri] == undefined) {
				results[databusUri].entries[entryUri] = {
					uri: entryUri,
					name: MossUtils.uriToName(entryUri),
					contentUri: result.g.value,
					browseLink: MossUtils.getRelativeUri(result.e.value),
					explanations: []
				};
			}

			results[databusUri].entries[entryUri].explanations.push({
				uri: result.t.value,
				label: MossUtils.uriToName(result.t.value)
			});
		}

		// Trigger Svelte reactivity
		searchResults = results;
	}

	function onFacetChange(event: CustomEvent<{ id: string; selection: SearchTag[] }>) {
		facetSelections[event.detail.id] = event.detail.selection;
		// Create the selector here:
		sparqlSelector = crateInnerSelectClause();
		updateSelection();
	}

	sparqlSelector = crateInnerSelectClause();

	let queryString: string = '';

	let searchResults: { [key: string]: any };
	let annotationTags: any;

	annotationTags = [];
	searchResults = {};

	let searchInput: string;
	searchInput = '';

	let isSearching = false;

</script>

<div class="section">
	<div class="container">
		<div class="columns">
			<div class="column">
			
				<ul>
					{#if isSearching}
						<p>Searching...</p>
					{/if}
					{#each Object.entries(searchResults) as [key, result] (result.hash)}
						<li>
							<SearchResult data={result} />
						</li>
					{/each}
				</ul>
			</div>
			<div class="column medium">
				<LookupFacet config={keywordFacet} {sparqlSelector} on:selectionChanged={onFacetChange} />
				<LookupFacet config={locationFacet} {sparqlSelector} on:selectionChanged={onFacetChange} />

				<LookupFacet
					config={fundingAgencyFacet}
					{sparqlSelector}
					on:selectionChanged={onFacetChange}
				/>

				<LookupFacet
					config={oeoAnnotationFacet}
					{sparqlSelector}
					on:selectionChanged={onFacetChange}
				/>
			</div>
		</div>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
	}

	ul {
		list-style-type: none;
		padding: 0;
	}

	.column {
		padding-right: 2em;
	}

	.column.medium {
		min-width: 256px;
		width: 256px;
	}
</style>
