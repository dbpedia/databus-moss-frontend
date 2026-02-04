<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import type { MossTerminology } from '$lib/types';
	import CodeMirror from '$lib/components/code-mirror.svelte';
	export let activeTerminology: MossTerminology | null = null;

	const dispatch = createEventDispatcher<{
		saved: { terminology: MossTerminology; body: string };
		cancel: void;
	}>();

	let id = '';
	let label = '';
	let language = '';
	let body = '';
	let loadingBody = false;

	onMount(async () => {
		if (activeTerminology) {
			id = activeTerminology.id;
			label = activeTerminology.label;
			language = activeTerminology.language;

			loadingBody = true;
			const res = await fetch(`/terminologies/${id}/data`, {
				headers: {
					"Accept": `${language}; charset=UTF-8`
				}
			});

			if (res.ok) {
				body = await res.text();
			} else {
				body = '';
			}
			loadingBody = false;
		}
	});

	function submitForm() {
		dispatch('saved', { terminology: { id, label, language }, body });
	}

	function cancel() {
		dispatch('cancel');
	}
</script>

<div class="form-card">
	<h2>{activeTerminology ? 'Edit Terminology' : 'Create Terminology'}</h2>

	<form on:submit|preventDefault={submitForm}>
		<div class="form-group">
			<label for="id">ID</label>
			<input
				id="id"
				type="text"
				bind:value={id}
				required
				placeholder="Unique terminology ID"
				readonly={!!activeTerminology}
			/>
		</div>

		<div class="form-group">
			<label for="label">Label</label>
			<input id="label" type="text" bind:value={label} required />
		</div>

		<div class="form-group">
			<label for="language">Language</label>
			<select bind:value={language} required>
				<option value="" disabled selected>Select language</option>
				<option value="application/ld+json">JSON-LD</option>
				<option value="text/turtle">Turtle</option>
				<option value="application/rdf+xml">RDF/XML</option>
				<option value="application/n-triples">N-Triples</option>
				<option value="application/n-quads">N-Quads</option>
				<option value="application/trig">TriG</option>
			</select>
		</div>
		<div class="form-group">
			<label for="body">Body</label>
			{#if loadingBody}
				<p>Loading...</p>
			{:else}
				<div class="frame">
					<CodeMirror bind:value={body} format={language} />
				</div>
			{/if}
		</div>

		<div class="form-actions">
			<button type="submit" class="btn-primary"
				>{activeTerminology ? 'Save Changes' : 'Create Terminology'}</button
			>
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
	}

	.frame {
		border: 1px solid #dbdbdb;
		border-radius: 8px;
		overflow: hidden;
		max-height: 400px;
		overflow-y: scroll;
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

	select {
		padding: 0.5rem 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		font-size: 1rem;
		color: #111827;
		background-color: #fff;
		appearance: none;
	}

	select:focus {
		outline: none;
		border-color: #6366f1;
		box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
	}
</style>
