<script lang="ts">
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	import { Input } from 'flowbite-svelte';
	import TagList from '$lib/components/tag-list.svelte';
	import type { FacetConfig, SearchTag } from '$lib/types';
	import { MossUtils } from '$lib/utils/moss-utils';

	export let config: FacetConfig;
	export let sparqlSelector: string;

	const dispatch = createEventDispatcher<{ selectionChanged: { id: string; selection: SearchTag[] } }>();

	let searchInput: string = '';
	let searchResults: { literal: string; count?: number }[] = [];
	let selection: SearchTag[] = [];
	let countQuery: string = '';
	let prefetchedValues: Map<string, number> = new Map();
	let topPrefetched: { literal: string; count: number }[] = [];

	const countQueryTemplate = `
		SELECT ?literal (COUNT(?s) AS ?count) WHERE {
			?s <%PREDICATE%> ?literal .
			%SELECTOR%
		}
		GROUP BY ?literal
	`;

	function buildCountQuery(): string {
		return countQueryTemplate
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
				(data.results.bindings ?? []).map((d: any) => [d.literal.value, parseInt(d.count.value, 10)])
			);
			topPrefetched = Array.from(data.results.bindings ?? [])
				.map((d: any) => ({
					literal: d.literal.value,
					count: parseInt(d.count.value, 10)
				}))
				.filter((item) => !selection.some((t) => t.id === item.literal))
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
			const results: { docs: any[] } = await MossUtils.fetchJSON(config.lookupBaseUrl, searchInput);

			// Flatten all highlighted literals from all docs into a single suggestion list
			const suggestions: Set<string> = new Set();
			for (const doc of results.docs ?? []) {
				for (const label of doc.label ?? []) {
					const match = label.match(/<B>(.*?)<\/B>/);
					if (match) suggestions.add(match[1]);
				}
			}

			searchResults = Array.from(suggestions)
				.filter((lit) => !selection.some((t) => t.id === lit))
				.map((lit) => ({ literal: lit, count: prefetchedValues.get(lit) ?? 0 }));
		} catch {
			searchResults = [];
		}
	}

	function selectItem(item: { literal: string; count?: number }): void {
		if (selection.some((t) => t.id === item.literal)) return;
		const tag: SearchTag = { id: item.literal, label: item.literal };
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
	<h2>{ config.label }</h2>
	<Input bind:value={searchInput} on:keyup={fetchResults} placeholder="Search..." />

	{#if searchResults.length > 0 || topPrefetched.length > 0}
		<ul class="mt-4 max-h-80 w-full overflow-y-auto rounded border border-gray-300 bg-white">
			{#if searchInput && searchResults.length > 0}
				{#each searchResults as item (item.literal)}
					<li>
						<button
							type="button"
							class="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100"
							on:click={() => selectItem(item)}
						>
							<span>{item.literal}</span>
							<span class="ml-2 text-gray-500">{item.count ?? 0}</span>
						</button>
					</li>
				{/each}
			{:else}
				{#each topPrefetched as item (item.literal)}
					<li>
						<button
							type="button"
							class="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100"
							on:click={() => selectItem({ literal: item.literal, count: item.count })}
						>
							<span>{item.literal}</span>
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
</style>
