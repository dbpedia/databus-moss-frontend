<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { MossModule } from '$lib/types';
	import Button from '$lib/components/button.svelte';
	import Input from '$lib/components/input.svelte';
	import Textarea from '$lib/components/textarea.svelte';
	import Select from '$lib/components/select.svelte';

	const dispatch = createEventDispatcher<{ created: MossModule; cancel: void }>();

	let id = '';
	let label = '';
	let description = '';
	let language = '';

	function submitForm() {
		dispatch('created', { id, label, description, language });
	}

	function cancel() {
		dispatch('cancel');
	}
</script>

<div class="form-card">
	<h2>Create Module</h2>

	<form on:submit|preventDefault={submitForm}>
		<div class="form-group">
			<label for="id">ID</label>
			<Input id="id" type="text" bind:value={id} required placeholder="Unique module ID" />
		</div>

		<div class="form-group">
			<label for="label">Label</label>
			<Input id="label" type="text" bind:value={label} required />
		</div>

		<div class="form-group">
			<label for="description">Description</label>
			<Textarea id="description" bind:value={description} rows={3} required />
		</div>

		<div class="form-group">
			<label for="language">Language</label>
			<Select bind:value={language} required>
				<option value="" disabled selected>Select language</option>
				<option value="application/ld+json">JSON-LD</option>
				<option value="text/turtle">Turtle</option>
				<option value="application/rdf+xml">RDF/XML</option>
				<option value="application/n-triples">N-Triples</option>
				<option value="application/n-quads">N-Quads</option>
				<option value="application/trig">TriG</option>
			</Select>
		</div>

		<div class="form-actions">
			<Button variant="primary" type="submit">Create Module</Button>
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
