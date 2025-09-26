<script lang="ts">
	import jsonld from 'jsonld';
	import { JsonldUtils } from '$lib/utils/jsonld-utils';
	import { RdfUris } from '$lib/utils/rdf-uris';
	import { MossUtils } from '$lib/utils/moss-utils';
	import { env } from '$env/dynamic/public';

	export let resourceUrl: string = '';

	let loading = false;
	let error: string | null = null;
	let databusResourceData: any = null;

	$: if (resourceUrl) {
		loadResource(resourceUrl);
	} else {
		databusResourceData = null;
		error = null;
	}

	let requestIndex = 0;

	function isValidUrl(url: string): boolean {
		try {
			new URL(url);
			return true;
		} catch {
			return false;
		}
	}

	async function loadResource(databusResourceUri: string) {
		if (!isValidUrl(databusResourceUri)) {
			error = 'Invalid URL';
			databusResourceData = null;
			return;
		}

		const currentIndex = ++requestIndex;
		loading = true;
		error = null;
		databusResourceData = null;

		try {
			const response = await fetch(databusResourceUri, {
				headers: {
					Accept: 'application/ld+json'
				}
			});
			if (!response.ok) throw new Error(`HTTP ${response.status}`);

			const resourceGraphs = await jsonld.expand(await response.json());

			if (currentIndex !== requestIndex) return;

			const resourceGraph = JsonldUtils.getGraphById(resourceGraphs, databusResourceUri);

			console.log(resourceGraph);

			databusResourceData = {
				uri: databusResourceUri,
				type: MossUtils.uriToName(resourceGraph[RdfUris.JSONLD_TYPE][0]),
				title: JsonldUtils.getValue(resourceGraph, RdfUris.DCT_TITLE),
				abstract: JsonldUtils.getValue(resourceGraph, RdfUris.DCT_ABSTRACT)
			};

			console.log(databusResourceData);
		} catch (e: any) {
			error = e.message;
		} finally {
			loading = false;
		}
	}
</script>

{#if resourceUrl}
	<div class="card">
		{#if loading}
			<p>Loading resource...</p>
		{:else if error}
			<p class="error">Error: {error}</p>
		{:else if databusResourceData}
			<h3>{databusResourceData.title ?? 'Untitled Resource'}</h3>
			{#if databusResourceData.abstract}
				<p class="abstract">{databusResourceData.abstract}</p>
			{/if}
			{#if databusResourceData.type}
				<p class="meta">Entity type: {databusResourceData.type}</p>
			{/if}
		{/if}
	</div>
{/if}

<style>
	.card {
		background-color: #fafafa;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		padding: 1rem;
		margin-top: 1rem;
		text-align: left;
	}
	.card h3 {
		font-size: 1.2rem;
		font-weight: 600;
		color: #1f2937;
		margin-bottom: 0.5rem;
	}
	.abstract {
		font-size: 0.95rem;
		color: #4b5563;
		margin-bottom: 0.5rem;
	}
	.error {
		color: #b91c1c;
		font-weight: 600;
	}
	.meta {
		font-size: 0.85rem;
		color: #6b7280;
	}
</style>
