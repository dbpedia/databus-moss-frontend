<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import type { MossFacet } from '$lib/types';
	import Button from '$lib/components/button.svelte';
	import Input from '$lib/components/input.svelte';

	export let activeFacet: MossFacet | null = null;

	const dispatch = createEventDispatcher<{ saved: MossFacet; cancel: void }>();

	let id = '';
	let label = '';
	let predicate = '';
	let sortOrder = 0;

	onMount(() => {
		if (activeFacet) {
			id = activeFacet.id;
			label = activeFacet.label;
			predicate = activeFacet.predicate;
			sortOrder = activeFacet.sortOrder;
		}
	});

	function submitForm() {
		dispatch('saved', { id, label, predicate, sortOrder });
	}

	function cancel() {
		dispatch('cancel');
	}
</script>

<div class="form-card">
	<h2>{activeFacet ? 'Edit Facet' : 'Create Facet'}</h2>

	<form on:submit|preventDefault={submitForm}>
		<div class="form-group">
			<label for="id">ID</label>
			<Input
				id="id"
				type="text"
				bind:value={id}
				required
				placeholder="Unique facet ID"
				readonly={!!activeFacet}
			/>
		</div>

		<div class="form-group">
			<label for="label">Label</label>
			<Input id="label" type="text" bind:value={label} required />
		</div>

		<div class="form-group">
			<label for="predicate">Predicate</label>
			<Input
				id="predicate"
				type="text"
				bind:value={predicate}
				required
				placeholder="SPARQL predicate or path"
			/>
		</div>

		<div class="form-group">
			<label for="sortOrder">Sort Order</label>
			<Input
				id="sortOrder"
				type="number"
				bind:value={sortOrder}
				required
				placeholder="Sort Order (Ascending)"
			/>
		</div>

		<div class="form-actions">
			<Button variant="primary" type="submit">{activeFacet ? 'Save Changes' : 'Create Facet'}</Button>
			<Button variant="secondary" type="button" on:click={cancel}>Cancel</Button>
		</div>
	</form>
</div>

<style>
	.form-card {
		background: #fff;
		padding: 2rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		margin: 1rem auto;
		max-width: 1000px;
	}

	h2 {
		font-size: 1.5rem;
		margin-bottom: 1rem;
		color: #1f2937;
	}

	.form-group {
		margin-bottom: 1rem;
		display: flex;
		flex-direction: column;
	}

	label {
		margin-bottom: 0.25rem;
		font-weight: 600;
		color: #374151;
	}

	.form-actions {
		margin-top: 1.5rem;
		display: flex;
		gap: 0.5rem;
	}
</style>
