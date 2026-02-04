<script lang="ts">
	import { onMount } from "svelte";
	import jsonld from "jsonld";
	import ResourceUri from "./resource-uri.svelte";
	import { JsonldUtils } from "$lib/utils/jsonld-utils";
	import { RdfUris } from "$lib/utils/rdf-uris";
	export let data: any;

	let resource = data.uri;
	let title: string | null = data.name ?? null;
	let abstract: string | null = data.abstract ?? null;

	let isLoading = true;

	let entries: any[] = [];
	$: entries = Object.values(data.entries ?? {});

	function getExplanationString(explanations: any[]) {
		return explanations?.map(e => e.label).join(", ") ?? "";
	}

	onMount(async () => {
		try {
			const response = await fetch(resource, {
				headers: {
					Accept: "application/ld+json"
				}
			});

			const databusResourceGraphs = await jsonld.expand(await response.json());
			let versionGraph = JsonldUtils.getGraphById(databusResourceGraphs, data.uri)

			title = JsonldUtils.getValue(versionGraph, RdfUris.DCT_TITLE);
			abstract = JsonldUtils.getValue(versionGraph, RdfUris.DCT_ABSTRACT);
		} catch (_) {
		} finally {
			isLoading = false;
		}
	});
</script>

<div class="result">
	<div class="header">
		{#if isLoading}
			<div class="skeleton title"></div>
		{:else}
			<h1 class="result-header">{title || "Untitled"}</h1>
		{/if}

		<ResourceUri uri={resource} fontSize="0.8rem" />

		{#if isLoading}
			<div class="skeleton abstract"></div>
			<div class="skeleton abstract short"></div>
		{:else}
			<div class="desc">{abstract || "No description available"}</div>
		{/if}
	</div>

	<div class="entry-tags">
		{#each entries as entry (entry.uri)}
			<a class="entry-tag" href={entry.browseLink} target="_blank">
				<div class="entry-header">{entry.name}</div>
				<div class="entry-content">{getExplanationString(entry.explanations)}</div>
			</a>
		{/each}
	</div>
</div>

<style>
	.result {
		border-bottom: 1px solid #c8c8c8;
		padding: 1em 0;
		margin: 1em 0;
	}

	.skeleton {
		background: linear-gradient(
			90deg,
			#e2e2e2 0%,
			#f3f3f3 50%,
			#e2e2e2 100%
		);
		background-size: 200% 100%;
		animation: shimmer 1.3s infinite;
		border-radius: 4px;
	}

	.title {
		width: 60%;
		height: 1.4em;
		margin-bottom: 0.4em;
	}

	.abstract {
		width: 100%;
		height: 0.9em;
		margin-bottom: 0.4em;
	}

	.abstract.short {
		width: 80%;
	}

	@keyframes shimmer {
		0% { background-position: 200% 0; }
		100% { background-position: -200% 0; }
	}

	.result-header {
		font-size: 1.2em;
		font-weight: 600;
		margin: 0 0 0.4em 0;
	}

	.desc {
		margin-bottom: 1em;
	}

	.entry-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5em;
	}

	.entry-tag {
		display: flex;
		flex-direction: column;
		border: 1px solid #dbdbdb;
		border-radius: 6px;
		background-color: #fafafa;
		padding: 0.5em 0.8em;
		text-decoration: none;
		color: inherit;
		cursor: pointer;
		transition: background-color 0.15s ease;
	}

	.entry-tag:hover {
		background-color: #f0f0f0;
	}

	.entry-header {
		font-weight: 600;
		font-size: 0.85em;
		margin-bottom: 0.2em;
	}

	.entry-content {
		font-size: 0.8em;
		color: #555;
	}
</style>
