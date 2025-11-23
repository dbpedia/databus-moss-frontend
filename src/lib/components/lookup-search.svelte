<script lang="ts">
	import { MossUtils } from '$lib/utils/moss-utils';
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	import { Input } from 'flowbite-svelte';
	import type { SearchTag } from '$lib/types';

	interface SearchResult {
		id: string;
		[key: string]: unknown;
	}

	const dispatch = createEventDispatcher<{ select: SearchTag }>();

	export let lookupBaseUrl: string;
	export let sparqlDistinctQuery: string;
	export let labelField: string = 'id';

	let searchInput = '';
	let searchResults: SearchResult[] = [];
	let prefetchedValues: Map<string, number> = new Map();
	let topPrefetched: { id: string; count: number }[] = [];

	async function fetchPrefetchedValues(): Promise<void> {
		if (!sparqlDistinctQuery) return;

		try {
			const res = await fetch(`/sparql`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/sparql-query',
					Accept: 'application/json'
				},
				body: sparqlDistinctQuery
			});
			const data = await res.json();

			prefetchedValues = new Map(
				(data.results.bindings ?? []).map((d: any) => [d.uri.value, parseInt(d.count.value, 10)])
			);

			topPrefetched = Array.from(prefetchedValues.entries())
				.sort((a, b) => b[1] - a[1])
				.slice(0, 5)
				.map(([id, count]) => ({ id, count }));
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
			const results: any = await MossUtils.fetchJSON(lookupBaseUrl, searchInput);

			for (let doc of results.docs) {
				if (Array.isArray(doc.id)) {
					doc.id = doc.id[0];
				}
			}

			searchResults = (results.docs ?? []).filter((item: any) => prefetchedValues.has(item.id));
		} catch {
			searchResults = [];
		}
	}

	function selectItem(item: SearchResult): void {
		const id = item.id;
		const lblArr = item[labelField];
		let rawLabel = Array.isArray(lblArr) && lblArr.length > 0 ? lblArr[0] : id;
		const label = rawLabel.replace(/<\/?[^>]+(>|$)/g, '');

		const tag: SearchTag = { id, label };
		dispatch('select', tag);

		searchInput = '';
		searchResults = [];
	}

	function getLabel(item: any): string {
		const value = item[labelField];
		if (Array.isArray(value) && value.length > 0) return value[0];
		return item.id;
	}

	onMount(fetchPrefetchedValues);

	// Reactively update counts whenever sparqlDistinctQuery changes
	$: sparqlDistinctQuery, fetchPrefetchedValues();
</script>

<div class="w-full">
	<Input
		id="lookupSearchInput"
		bind:value={searchInput}
		on:keyup={fetchResults}
		placeholder="Search..."
		class="block w-full p-2.5"
	/>

	<pre style="font-size: 0.7em; max-width: 800px; overflow-x:scroll; background-color:#f8f8f8">
		{sparqlDistinctQuery}
	</pre>

	<ul class="mt-2 w-full rounded border border-gray-300 bg-white shadow max-h-80 overflow-y-auto">
		{#if searchInput && searchResults.length > 0}
			{#each searchResults as item (item.id)}
				<li>
					<button
						type="button"
						class="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100"
						on:click={() => selectItem(item)}
					>
						<span>{@html getLabel(item)}</span>
						<span class="ml-2 text-gray-500">{prefetchedValues.get(item.id) ?? 0}</span>
					</button>
				</li>
			{/each}
		{:else}
			{#each topPrefetched as item (item.id)}
				<li>
					<button
						type="button"
						class="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100"
						on:click={() => selectItem({ id: item.id, [labelField]: [item.id] })}
					>
						<span>{item.id}</span>
						<span class="ml-2 text-gray-500">{item.count}</span>
					</button>
				</li>
			{/each}
		{/if}
	</ul>
</div>

<style>
	button:focus {
		outline: none;
	}
</style>
