<script lang="ts">
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	import Input from '$lib/components/input.svelte';
	import TagList from '$lib/components/tag-list.svelte';
	import type { MossFacet, SearchTag } from '$lib/types';
	import { MossUtils } from '$lib/utils/moss-utils';
	import fuzzysort from 'fuzzysort';

	export let selected: SearchTag[] = [];

	interface SearchItem {
		id: string;
		label: string;
		count: number;
		_search: string;
	}

	interface SearchResultClick {
		id: string;
		selection: SearchTag[];
	}

	export let config: MossFacet;
	export let sparqlSelector: string;

	const dispatch = createEventDispatcher<{ selectionChanged: SearchResultClick }>();

	let searchInput = '';
	let items: SearchItem[] = []; // full dataset
	let filtered: SearchItem[] = []; // 5 displayed items
	let selection: SearchTag[] = [];
	let countQuery = '';

	//?entry <http://dataid.dbpedia.org/ns/moss#instanceOf> <%MODULE%> .

	const countQueryTemplate = `
		SELECT ?uri SAMPLE(?label) as ?label (COUNT(DISTINCT ?entry) as ?count) WHERE {
		?entry <http://dataid.dbpedia.org/ns/moss#content> ?g .
		?entry <http://dataid.dbpedia.org/ns/moss#extends> ?s .
		%SELECTOR%
		GRAPH ?g { 
			?s %PREDICATE% ?uri .
		}
		OPTIONAL { ?uri <http://www.w3.org/2000/01/rdf-schema#label> ?label . }
		}
		GROUP BY ?uri 
	`;

	function buildCountQuery(): string {
		return countQueryTemplate
			.replace('%PREDICATE%', config.predicate)
			.replace('%SELECTOR%', sparqlSelector);
	}

	function getItemLabel(d: any): string {
		return d.label?.value ?? MossUtils.uriToName(d.uri.value);
	}

	function getSearchString(d: any): string {
		return d.label?.value ?? MossUtils.uriToName(d.uri.value);
	}

	// -------------------------------------------------------
	// Load SPARQL counts → build unified SearchItem[] list
	// -------------------------------------------------------
	async function fetchItems(): Promise<void> {
		if (!countQuery) countQuery = buildCountQuery();
		try {
			const res = await fetch(`/sparql`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/sparql-query', Accept: 'application/json' },
				body: countQuery
			});
			if (!res.ok) {
				items = [];
				filtered = [];
				return;
			}
			const data = await res.json();

			items = (data.results.bindings ?? []).map(
				(d: any): SearchItem => ({
					id: d.uri.value,
					label: getItemLabel(d),
					count: parseInt(d.count.value, 10),
					_search: getSearchString(d)
				})
			);

			updateFiltered();
		} catch {
			items = [];
			filtered = [];
		}
	}

	// -------------------------------------------------------
	// Fuzzy search or top counts
	// -------------------------------------------------------
	function updateFiltered(): void {
		if (!searchInput.trim()) {
			// top 5 by count
			filtered = items
				.filter((i) => !selection.some((s) => s.id === i.id))
				.sort((a, b) => b.count - a.count)
				.slice(0, 5);
			return;
		}

		const term = searchInput.trim();
		const results = fuzzysort.go(term, items, {
			keys: ['_search'],
			limit: 5,
			threshold: -1000
		});

		filtered = results.map((r) => r.obj).filter((i) => !selection.some((s) => s.id === i.id));
	}

	// -------------------------------------------------------
	// Selection handling
	// -------------------------------------------------------
	function selectItem(item: SearchItem): void {
		if (selection.some((t) => t.id === item.id)) return;

		const tag: SearchTag = {
			id: item.id,
			label: item.label
		};

		selection = [...selection, tag];
		dispatch('selectionChanged', { id: config.id, selection });

		searchInput = '';
		updateFiltered();
	}

	function removeTag(tag: SearchTag): void {
		selection = selection.filter((t) => t.id !== tag.id);
		dispatch('selectionChanged', { id: config.id, selection });
		updateFiltered();
	}

	onMount(() => {
		if (selected.length > 0) {
			selection = [...selected];
			updateFiltered();
		}
		fetchItems();
	});

	// onMount(fetchItems);

	$: if (sparqlSelector !== undefined) {
		countQuery = buildCountQuery();
		fetchItems();
	}

	// Update list on search field change
	$: if (searchInput != undefined) {
		updateFiltered();
	}
</script>

<div class="facet">
	<h2>{config.label}</h2>

	<Input class="facet-input" bind:value={searchInput} placeholder="Search..." />

	{#if filtered.length > 0}
		<ul class="results">
			{#each filtered as item (item.id)}
				<li>
					<button type="button" class="result-button" on:click={() => selectItem(item)}>
						<span class="result-label">{item.label}</span>
						{#if item.id.startsWith('http')}
							<span class="result-uri"
								>(<a
									href={item.id}
									target="_blank"
									rel="noopener noreferrer"
									class="result-uri-link"
									>{item.id.split('/').pop()}
								</a>)</span
							>
						{/if}
						<span class="result-count">{item.count}</span>
					</button>
				</li>
			{/each}
		</ul>
	{/if}

	<div class="mt-2">
		<TagList bind:items={selection} on:remove={(e) => removeTag(e.detail)} />
	</div>
</div>

<style>
	.facet {
		width: 100%;
		margin-bottom: 1rem;
	}

	:global(.facet-input) {
		width: 100%;
		box-sizing: border-box;
	}

	.results {
		margin-top: 1rem;
		max-height: 20rem;
		width: 100%;
		overflow-y: auto;
		border: 1px solid #d1d5db;
		border-radius: 0.25rem;
		background: white;
		padding: 0;
		list-style: none;
	}

	.result-button {
		display: flex;
		align-items: center;
		width: 100%;
		padding: 0.5rem 0.75rem;
		text-align: left;
		border: none;
		background: none;
		cursor: pointer;
		box-sizing: border-box;
	}

	.result-button:hover,
	.result-button:focus {
		background: #f3f4f6;
		outline: none;
	}

	.result-label {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.result-uri {
		flex-shrink: 0;
		margin-left: 0.25rem;
	}

	.result-uri-link {
		color: #2563eb;
		text-decoration: underline;
	}

	.result-count {
		flex-shrink: 0;
		margin-left: 0.5rem;
		color: #6b7280;
	}
</style>
