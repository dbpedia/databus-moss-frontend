<script lang="ts">
	import { MossUtils } from "$lib/utils/moss-utils";
	import ResourceUri from "./resource-uri.svelte";
	export let data: any;

	let resource = data.uri;
	let title = data.name;
	let abstract = data.abstract ?? "";

    let entries: any[] = [];
    $: entries = Object.values(data.entries);

	// Convert explanations to string
	function getExplanationString(explanations: any[]) {
		return explanations.map(e => e.label).join(", ");
	}

	if (!title) title = MossUtils.getLastPathSegment(resource);
</script>

<div class="result">
	<div class="header">
		<h1 class="result-header">{title}</h1>
        <ResourceUri uri={resource} fontSize="0.8rem" />
		<div class="desc">{abstract || 'No description available'}</div>
	</div>

	<!-- Footer with entries -->
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

	.result-header {
		font-size: 1.2em;
		font-weight: 600;
		margin: 0 0 0.0em 0;
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
