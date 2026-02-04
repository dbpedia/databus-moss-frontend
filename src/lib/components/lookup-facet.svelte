<script lang="ts">
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	import { Input } from 'flowbite-svelte';
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

<div class="mb-4">
	<h2>{config.label}</h2>

	<Input bind:value={searchInput} placeholder="Search..." />

	{#if filtered.length > 0}
		<ul class="mt-4 max-h-80 w-full overflow-y-auto rounded border border-gray-300 bg-white">
			{#each filtered as item (item.id)}
				<li>
					<button
						type="button"
						style="display: flex;"
						class="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100"
						on:click={() => selectItem(item)}
					>
						<span class="truncate">{item.label}</span>
						{#if item.id.startsWith('http')}
							<span class="ml-1" style="display: flex;"
								>(<a
									href={item.id}
									target="_blank"
									rel="noopener noreferrer"
									class="truncate text-blue-600 underline"
									>{item.id.split('/').pop()}
								</a>)</span
							>
						{/if}
						<span class="ml-2 text-gray-500">{item.count}</span>
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
	button:focus {
		outline: none;
	}

	.truncate {
		display: inline-block;
		max-width: 320px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
