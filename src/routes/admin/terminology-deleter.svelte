<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { MossTerminology } from '$lib/types';
	import Button from '$lib/components/button.svelte';
	import Input from '$lib/components/input.svelte';

	export let activeTerminology: MossTerminology;
	const dispatch = createEventDispatcher();

	let inputId = '';

	function submitDelete() {
		if (inputId === activeTerminology.id) {
			dispatch('delete', { id: inputId });
		} else {
			alert('Terminology ID does not match.');
		}
	}

	function cancel() {
		dispatch('cancel');
	}
</script>

<div class="form-card">
	<h2>Delete Terminology</h2>
	<p>Type the Terminology ID to confirm deletion: <strong>{activeTerminology.id}</strong></p>

	<form on:submit|preventDefault={submitDelete}>
		<div class="form-group">
			<label for="delete-id">Terminology ID</label>
			<Input
				id="delete-id"
				type="text"
				bind:value={inputId}
				placeholder="Enter terminology ID"
				required
			/>
		</div>

		<div class="form-actions">
			<Button variant="danger" type="submit">Delete Terminology</Button>
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
		max-width: 600px;
	}

	h2 {
		font-size: 1.5rem;
		margin-bottom: 0.5rem;
		color: #1f2937;
	}

	p {
		font-size: 0.9rem;
		color: #6b7280;
		margin-bottom: 1rem;
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
