<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import type { MossFacet } from '$lib/types';
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
			<input
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
			<input id="label" type="text" bind:value={label} required />
		</div>

		<div class="form-group">
			<label for="predicate">Predicate</label>
			<input
				id="predicate"
				type="text"
				bind:value={predicate}
				required
				placeholder="SPARQL predicate or path"
			/>
		</div>

        <div class="form-group">
			<label for="sortOrder">Sort Order</label>
			<input
				id="sortOrder"
				type="number"
				bind:value={sortOrder}
				required
				placeholder="Sort Order (Ascending)"
			/>
		</div>

		<div class="form-actions">
			<button type="submit" class="btn-primary">{activeFacet ? 'Save Changes' : 'Create Facet'}</button>
			<button type="button" class="btn-secondary" on:click={cancel}>Cancel</button>
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

	input {
		padding: 0.5rem 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		font-size: 1rem;
		color: #111827;
	}

	input:focus {
		outline: none;
		border-color: #6366f1;
		box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
	}

	input[readonly] {
		background-color: #f3f4f6;
		cursor: not-allowed;
	}

	.form-actions {
		margin-top: 1.5rem;
		display: flex;
		gap: 0.5rem;
	}

	.btn-primary {
		background-color: #4f46e5;
		color: white;
		font-weight: 600;
		border-radius: 0.5rem;
		padding: 0.5rem 1rem;
		cursor: pointer;
		border: none;
		transition: background 0.3s;
	}

	.btn-primary:hover {
		background-color: #6366f1;
	}

	.btn-secondary {
		background-color: #f3f4f6;
		color: #374151;
		border-radius: 0.5rem;
		padding: 0.5rem 1rem;
		cursor: pointer;
		border: 1px solid #d1d5db;
		transition: background 0.3s;
	}

	.btn-secondary:hover {
		background-color: #e5e7eb;
	}
</style>
