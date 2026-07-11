<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import type { MossTerminology } from '$lib/types';
	import CodeMirror from '$lib/components/code-mirror.svelte';
	import Button from '$lib/components/button.svelte';
	import Input from '$lib/components/input.svelte';
	import Select from '$lib/components/select.svelte';

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
					Accept: `${language}; charset=UTF-8`
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
			<Input
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
			<Input id="label" type="text" bind:value={label} required />
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
			<Button variant="primary" type="submit">
				{activeTerminology ? 'Save Changes' : 'Create Terminology'}
			</Button>
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

	.form-actions {
		margin-top: 1.5rem;
		display: flex;
		gap: 0.5rem;
	}
</style>
