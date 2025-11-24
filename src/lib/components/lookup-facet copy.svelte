<script lang="ts">
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	import { Input } from 'flowbite-svelte';
	import TagList from '$lib/components/tag-list.svelte';
	import type { FacetConfig, SearchTag } from '$lib/types';
	import { MossUtils } from '$lib/utils/moss-utils';

	interface SearchResult {
		id: string;
		[key: string]: any;
	}

	interface SelectionChangedDetail {
		id: string;
		selection: SearchTag[];
	}

	export let config: FacetConfig;
	export let sparqlSelector: string;

	const dispatch = createEventDispatcher<{ selectionChanged: SelectionChangedDetail }>();

	let searchInput: string = '';
	let searchResults: SearchResult[] = [];
	let selection: SearchTag[] = [];
	let countQuery: string = '';

	let prefetchedValues: Map<string, number> = new Map();
	let topPrefetched: { id: string; label: string; count: number }[] = [];

	const countQueryTemplate = `
		SELECT ?uri SAMPLE(?label) as ?label (COUNT(?uri) as ?count) WHERE {
			?module <http://dataid.dbpedia.org/ns/moss#instanceOf> <%MODULE%> .
			?module <http://dataid.dbpedia.org/ns/moss#content> ?g .
			%SELECTOR%
			GRAPH ?g { 
				?s <%PREDICATE%> ?uri .
			}
			OPTIONAL { ?uri <http://www.w3.org/2000/01/rdf-schema#label> ?label . }
		}
		GROUP BY ?uri 
	`;

	function buildCountQuery(): string {
		return countQueryTemplate
			.replace('%MODULE%', config.module)
			.replace('%PREDICATE%', config.predicate)
			.replace('%SELECTOR%', sparqlSelector);
	}

	async function fetchPrefetchedValues(): Promise<void> {
		if (!countQuery) countQuery = buildCountQuery();
		try {
			const res = await fetch(`/sparql`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/sparql-query', Accept: 'application/json' },
				body: countQuery
			});
			const data = await res.json();
			prefetchedValues = new Map(
				(data.results.bindings ?? []).map((d: any) => [d.uri.value, parseInt(d.count.value, 10)])
			);
			
			topPrefetched = Array.from(data.results.bindings ?? [])
				.map((d: any) => ({
					id: d.uri.value,
					label: d.label?.value ?? MossUtils.uriToName(d.uri.value),
					count: parseInt(d.count.value, 10)
				}))
				.filter((item) => !selection.some((t) => t.id === item.id))
				.sort((a, b) => b.count - a.count)
				.slice(0, 5);
		} catch {
			prefetchedValues = new Map();
			topPrefetched = [];
		}
	}

	async function fetchResults(): Promise<void> {
		if (!searchInput.trim()) {
			searchResults = [];
			return;
		}
		try {
			const results: { docs: SearchResult[] } = await MossUtils.fetchJSON(
				config.lookupBaseUrl,
				searchInput
			);
			for (let doc of results.docs) if (Array.isArray(doc.id)) doc.id = doc.id[0];
			searchResults = (results.docs ?? []).filter(
				(item) => prefetchedValues.has(item.id) && !selection.some((t) => t.id === item.id)
			);
		} catch {
			searchResults = [];
		}
	}

	function selectItem(item: SearchResult): void {
		const id = item.id;
		if (selection.some((t) => t.id === id)) return;
		const rawLabel = Array.isArray(item[config.labelField])
			? item[config.labelField][0]
			: item[config.labelField] ?? id;
		const label = rawLabel.replace(/<\/?[^>]+(>|$)/g, '');
		const tag: SearchTag = { id, label };
		selection = [...selection, tag];
		dispatch('selectionChanged', { id: config.id, selection });
		searchInput = '';
		searchResults = [];
	}

	function removeTag(tag: SearchTag): void {
		selection = selection.filter((t) => t.id !== tag.id);
		dispatch('selectionChanged', { id: config.id, selection });
	}

	onMount(fetchPrefetchedValues);

	$: if (sparqlSelector !== undefined) {
		countQuery = buildCountQuery();
		fetchPrefetchedValues();
	}
</script>

<div class="mb-4">
	<h2>{config.label}</h2>
	<Input bind:value={searchInput} on:keyup={fetchResults} placeholder="Search..." />
	<!---
	<pre style="font-size: 0.7em; max-width: 800px; overflow-x:scroll; background-color:#f8f8f8">
		{countQuery}
	</pre>-->

	{#if searchResults.length > 0 || topPrefetched.length > 0}
		<ul class="mt-4 max-h-80 w-full overflow-y-auto rounded border border-gray-300 bg-white">
			{#if searchInput && searchResults.length > 0}
				{#each searchResults as item (item.id)}
					<li>
						<button
							type="button"
							style="display: flex;"
							class="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100"
							on:click={() => selectItem(item)}
						>
							<span class="truncate">{@html item[config.labelField][0] ?? item.id}</span>
							<span class="ml-2 text-gray-500">{prefetchedValues.get(item.id) ?? 0}</span>
						</button>
					</li>
				{/each}
			{:else}
				{#each topPrefetched as item (item.id)}
					<li>
						<button
							style="display: flex;"
							type="button"
							class="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100"
							on:click={() => selectItem({ id: item.id, [config.labelField]: [item.label] })}
						>
							<span class="truncate">{item.label || item.id}</span>
							<span class="ml-2 text-gray-500">{item.count}</span>
						</button>
					</li>
				{/each}
			{/if}
		</ul>
	{/if}
	<div class="mt-2">
		<TagList bind:items={selection} on:remove={(e) => removeTag(e.detail)} />
	</div>
</div>

<style>
	button:focus {
		outline: none;
	}

	ul {
		margin-top: 0.5rem;
	}

	.truncate {
		display: inline-block;
		max-width: 320px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
