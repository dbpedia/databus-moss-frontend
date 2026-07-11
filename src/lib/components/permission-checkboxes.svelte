<script lang="ts">
	import { onMount } from 'svelte';

	export let selected: Set<string> = new Set();
	export let readonly = false;

	let allPermissions: string[] = [];

	onMount(async () => {
		const res = await fetch('/permissions');
		if (res.ok) {
			allPermissions = await res.json();
		}
	});

	function togglePermission(permission: string) {
		if (readonly) return;
		if (selected.has(permission)) {
			selected.delete(permission);
		} else {
			selected.add(permission);
		}
		selected = selected;
	}
</script>

<div class="permission-grid">
	{#each allPermissions as permission}
		<label class="permission-item">
			<input
				type="checkbox"
				checked={selected.has(permission)}
				disabled={readonly}
				on:change={() => togglePermission(permission)}
			/>
			{permission}
		</label>
	{:else}
		<p class="empty">No permissions available.</p>
	{/each}
</div>

<style>
	.permission-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: 0.5rem;
	}

	.permission-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		font-weight: 400;
	}

	.permission-item:has(input:disabled) {
		opacity: 0.7;
	}

	.empty {
		font-size: 0.875rem;
		color: #6b7280;
		margin: 0;
	}
</style>
