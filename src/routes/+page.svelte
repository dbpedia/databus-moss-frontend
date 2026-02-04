<script lang="ts">
	/**
	 * <databus_resource> <resource> <resource1>
	 * <resource1> <published> <carsten>
	 *
	 * <predicate>/<published>
	 */
	import { page } from '$app/stores';
	import { get } from 'svelte/store';
	import { goto } from '$app/navigation';
	import SearchResult from '$lib/components/search-result.svelte';
	import { MossUtils } from '$lib/utils/moss-utils';	
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	import type { MossFacet, SearchTag } from '$lib/types';
	import LookupFacet from '$lib/components/lookup-facet.svelte';

	export let data;

	function loadFacetsFromUrl() {
		const params = get(page).url.searchParams;
		const selections: Record<string, SearchTag[]> = {};

		for (const [facetId] of Object.entries(facetMap)) {
			const values = params.getAll(facetId);
			if (values.length === 0) continue;

			selections[facetId] = values.map((v) => ({
				id: v,
				label: MossUtils.uriToName(v) ?? v
			}));
		}

		facetSelections = selections;
		sparqlSelector = createInnerSelectClause();
	}

	function updateUrlFromFacets() {
		const url = new URL(get(page).url);

		url.search = '';

		for (const [facetId, tags] of Object.entries(facetSelections)) {
			for (const tag of tags) {
				url.searchParams.append(facetId, tag.id);
			}
		}

		goto(url, {
			replaceState: true,
			keepFocus: true,
			noScroll: true
		});
	}

	const INNER_SELECT_TEMPLATE = `
		SELECT DISTINCT ?s WHERE 
		{
			%SELECTOR%
		}
	`;

	const UNION_BLOCK_TEMPLATE = `
		{
			VALUES ?t { %VALUES% } ?s %PREDICATE% ?t .
		}
	`;

	const SELECT_QUERY_TEMPLATE = `
		SELECT DISTINCT ?s ?e ?g ?t SAMPLE(?l) as ?l WHERE 
		{
			{
				%INNER_SELECT%
			}

			?e <http://dataid.dbpedia.org/ns/moss#extends> ?s .
			?e <http://dataid.dbpedia.org/ns/moss#content> ?g .

			GRAPH ?g {
				%UNION_BLOCKS%
			}

      		OPTIONAL { ?t <http://www.w3.org/2000/01/rdf-schema#label> ?l . }
		}
	`;

	let facetSelections: Record<string, SearchTag[]> = {};
	let sparqlSelector: string;
	let facetConfigs: any = data.facetConfigs;

	const facetMap: Record<string, MossFacet> = {};

	for (const config of facetConfigs) {
		facetMap[config.id] = config;
	}

	function formatValue(v: string, isLiteral: boolean) {
		if (isLiteral) return `"${v.replace(/"/g, '\\"')}"`;
		return `<${v}>`;
	}

	function createInnerSelectClause(): string {
		let selectorString: string = '';

		for (const [module, selection] of Object.entries(facetSelections)) {
			if (!selection || selection.length === 0) continue;

			const predicate = facetMap[module]?.predicate;

			for (var s of selection) {
				var isLiteral = !MossUtils.isIri(s.id);
				selectorString += `?s ${predicate} ${formatValue(s.id, isLiteral)} .\n`;
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
				values: tags.map((t) => `${formatValue(t.id, !MossUtils.isIri(t.id))}`)
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

		if (queryString == undefined || queryString.length == 0) {
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
				label: getItemLabel(result)
			});
		}

		// Trigger Svelte reactivity
		searchResults = results;
	}

	function getItemLabel(d: any): string {
		return d.l?.value ?? MossUtils.uriToName(d.t.value);
	}

	function onFacetChange(event: CustomEvent<{ id: string; selection: SearchTag[] }>) {
		facetSelections[event.detail.id] = event.detail.selection;

		sparqlSelector = createInnerSelectClause();

		updateUrlFromFacets();
		updateSelection();
	}

	sparqlSelector = createInnerSelectClause();

	let queryString: string = '';

	let searchResults: { [key: string]: any };
	let annotationTags: any;

	annotationTags = [];
	searchResults = {};

	let searchInput: string;
	searchInput = '';

	let isSearching = false;



	$: {
		$page.url;
		loadFacetsFromUrl();
	}

	onMount(() => {
		if (browser) {
			updateSelection();
		}
	});
</script>

<div class="section">
	<div class="container">
		<div class="columns">
			<div class="column" style="width: 70%;">
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
				{#each facetConfigs as config (config.id)}
					<LookupFacet selected={facetSelections[config.id] ?? []}  {config} {sparqlSelector} on:selectionChanged={onFacetChange} />
				{/each}
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
		min-width: 35%;
		max-width: 35%;
		width: 35%;
	}
</style>
