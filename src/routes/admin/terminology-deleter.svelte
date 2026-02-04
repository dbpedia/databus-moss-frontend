<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { MossTerminology } from '$lib/types';

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
			<input
				id="delete-id"
				type="text"
				bind:value={inputId}
				placeholder="Enter terminology ID"
				required
			/>
		</div>

		<div class="form-actions">
			<button type="submit" class="btn-danger">Delete Terminology</button>
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

	.form-actions {
		margin-top: 1.5rem;
		display: flex;
		gap: 0.5rem;
	}

	.btn-danger {
		background-color: #dc2626;
		color: white;
		font-weight: 600;
		border-radius: 0.5rem;
		padding: 0.5rem 1rem;
		cursor: pointer;
		border: none;
		transition: background 0.3s;
	}

	.btn-danger:hover {
		background-color: #b91c1c;
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
