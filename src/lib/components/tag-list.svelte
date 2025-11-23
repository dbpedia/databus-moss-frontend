<script lang="ts">
	import type { SearchTag } from "$lib/types";
	import { createEventDispatcher } from "svelte";

	export let items: SearchTag[] = [];
	const dispatch = createEventDispatcher<{ remove: SearchTag }>();

	function removeItem(index: number) {
		const removed = items[index];
		items = items.filter((_, i) => i !== index);
		dispatch("remove", removed);
	}
</script>

<div class="tags">
	{#each items as item, index}
		<span class="tag">
			{item.label}
			<button type="button" on:click={() => removeItem(index)}>×</button>
		</span>
	{/each}
</div>

<style>
	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.tag {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		background-color: #4f46e5;
		color: white;
		padding: 0.4rem 0.7rem;
		border-radius: 0.5rem;
		font-size: 0.9rem;
		font-weight: 500;
	}

	.tag button {
		background: none;
		border: none;
		color: white;
		cursor: pointer;
		font-size: 1rem;
		font-weight: bold;
		line-height: 1;
		padding: 0;
	}

	.tag button:hover {
		color: #e0e0e0;
	}
</style>
