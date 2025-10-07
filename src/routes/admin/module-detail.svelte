<script lang="ts">
	import { hashStore } from '$lib/stores/hash-navigation';
	import type { MossModule } from '$lib/types';
	import { createEventDispatcher, onDestroy } from 'svelte';
	import { env } from '$env/dynamic/public';
	import SubResourceEditor from './sub-resource-editor.svelte';
	import TemplateEditor from './template-editor.svelte';
	import ResourceUri from '$lib/components/resource-uri.svelte';
	import { PUBLIC_MOSS_BASE_URL } from '$env/static/public';

	export let activeModule: MossModule;
	const dispatch = createEventDispatcher();

	let activeTab: 'general' | 'context' | 'shapes' | 'indexer' | 'template' = 'general';
	let label = activeModule.label;
	let description = activeModule.description;
	let language = activeModule.language;
	let saving = false;
	let successMessage = '';
	let errorMessage = '';

	const unsubscribe = hashStore.subscribe(({ params }) => {
		if (params.res === 'context') activeTab = 'context';
		else if (params.res === 'shapes') activeTab = 'shapes';
		else if (params.res === 'indexer') activeTab = 'indexer';
		else if (params.res === 'template') activeTab = 'template';
		else activeTab = 'general';
	});

	function switchTab(tab: typeof activeTab) {
		const hash =
			tab === 'general'
				? `edit-module?id=${activeModule.id}`
				: `edit-module?id=${activeModule.id}&res=${tab}`;
		hashStore.navigate(hash);
	}

	function back() {
		dispatch('back');
	}

	async function saveGeneral() {
		saving = true;
		successMessage = '';
		errorMessage = '';

		try {
			const res = await fetch(`/api/v1/modules/${activeModule.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ label, description, language })
			});

			if (!res.ok) {
				const text = await res.text();
				errorMessage = `Failed to save: ${text}`;
				console.error(errorMessage);
			} else {
				successMessage = 'Module saved successfully!';
				dispatch('updated', { label, description, language });
			}
		} catch (err) {
			errorMessage = `Error: ${err}`;
			console.error(err);
		} finally {
			saving = false;
		}
	}

	function onDelete() {
		hashStore.navigate(`delete-module?id=${activeModule.id}`);
	}

	onDestroy(() => unsubscribe());
</script>

<div class="top-bar">
	<h1 class="module-id">Module: {activeModule.id}</h1>
	<button class="btn-secondary" on:click={back}>Back to Module List</button>
</div>

<div class="detail-wrapper">
	<div class="tabs">
		<button class:selected={activeTab === 'general'} on:click={() => switchTab('general')}>
			General
		</button>

		<button class:selected={activeTab === 'indexer'} on:click={() => switchTab('indexer')}>
			Indexer
		</button>

		<button class:selected={activeTab === 'shapes'} on:click={() => switchTab('shapes')}>
			SHACL
		</button>

		{#if activeModule.language === 'application/ld+json'}
			<button class:selected={activeTab === 'context'} on:click={() => switchTab('context')}>
				JSON-LD Context
			</button>
		{/if}

		<button class:selected={activeTab === 'template'} on:click={() => switchTab('template')}>
			Template
		</button>
	</div>

	<div class="tab-content">
		{#if activeTab === 'general'}
			<div class="detail-card">
				<form on:submit|preventDefault={saveGeneral}>
					<div class="form-group">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label>Label</label>
						<input type="text" bind:value={label} required />
					</div>
					<div class="form-group">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label>Description</label>
						<textarea rows="3" bind:value={description} required></textarea>
					</div>
					<div class="form-group">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label>Language</label>
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

					{#if successMessage}
						<p class="success">{successMessage}</p>
					{/if}
					{#if errorMessage}
						<p class="error">{errorMessage}</p>
					{/if}

					<div class="form-actions">
						<button type="submit" class="btn-primary" disabled={saving}>
							{saving ? 'Saving...' : 'Save Changes'}
						</button>

						<button class="btn-delete" on:click={onDelete}>Delete</button>
					</div>
				</form>
			</div>
		{/if}

		{#if activeTab === 'context'}
			<div class="detail-card">
				<p class="resource-info">
					The JSON-LD context defines the vocabulary and mappings used for this module's data.
				</p>

				<div style="margin-bottom: 0.5rem">
					<ResourceUri uri={`${env.PUBLIC_MOSS_BASE_URL}/api/v1/${activeModule.id}/context.jsonld`}></ResourceUri>
				</div>
				<SubResourceEditor
					moduleId={activeModule.id}
					resourceName="context.jsonld"
					format="json-ld"
				/>
			</div>
		{/if}

		{#if activeTab === 'shapes'}
			<div class="detail-card">
				<p class="resource-info">
					The SHACL shapes define constraints and validation rules for your RDF data.
				</p>
				<SubResourceEditor moduleId={activeModule.id} resourceName="shapes.ttl" format="turtle" />
			</div>
		{/if}

		{#if activeTab === 'indexer'}
			<div class="detail-card">
				<p class="resource-info">
					The indexer YAML config controls how information in this module is selected and processed
					by the search index system.
				</p>
				<SubResourceEditor moduleId={activeModule.id} resourceName="indexer.yml" format="yaml" />
			</div>
		{/if}

		{#if activeTab === 'template'}
			<div class="detail-card">
				<p class="resource-info">
					The template describes the structure of resources for this module.
				</p>

				<TemplateEditor moduleId={activeModule.id} language={activeModule.language} />
			</div>
		{/if}
	</div>
</div>

<style>
	.detail-wrapper {
		display: flex;
		gap: 2rem;
	}

	h1 {
		font-size: 1.75rem;
		font-weight: 700;
		margin: 0;
		padding: 0;
		color: #111827;
	}

	.tabs {
		display: flex;
		flex-direction: column;
		min-width: 180px;
	}

	.tabs button {
		padding: 0.5rem 1rem;
		margin-bottom: 0.5rem;
		text-align: left;
		border: none;
		border-radius: 0.375rem;
		background: #f3f4f6;
		cursor: pointer;
		transition: background 0.2s;
	}

	.resource-info {
		position: relative;
		display: flex;
		align-items: flex-start;
		background-color: #eff6ff;
		border: 1px solid #3b82f6;
		color: #1e40af;
		padding: 0.5rem 0.75rem 0.5rem 2rem;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		margin-bottom: 0.75rem;
	}

	.resource-info::before {
		content: 'i';
		position: absolute;
		left: 0.5rem;
		top: 50%;
		transform: translateY(-50%);
		display: inline-block;
		width: 1rem;
		height: 1rem;
		background-color: #3b82f6;
		color: white;
		border-radius: 50%;
		text-align: center;
		line-height: 1rem;
		font-weight: bold;
		font-size: 0.75rem;
	}
	.tabs button:hover {
		background: #e5e7eb;
	}
	.tabs button.selected {
		background: #4f46e5;
		color: white;
		font-weight: 600;
	}

	.tab-content {
		width: 100%;
	}

	.top-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}
	.module-id {
		font-weight: 600;
		color: #374151;
	}

	.detail-card {
		background: #fff;
		padding: 1rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		margin-bottom: 1rem;
	}
	label {
		font-weight: 600;
		margin-bottom: 0.25rem;
		color: #374151;
	}
	input,
	textarea {
		padding: 0.5rem 0.75rem;
		border-radius: 0.5rem;
		border: 1px solid #d1d5db;
		font-size: 1rem;
		color: #111827;
	}
	input:focus,
	textarea:focus {
		outline: none;
		border-color: #6366f1;
		box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
	}

	.btn-primary {
		background-color: #4f46e5;
		color: white;
		font-weight: 600;
		border-radius: 0.5rem;
		padding: 0.5rem 1rem;
		border: none;
		cursor: pointer;
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
		border: 1px solid #d1d5db;
		cursor: pointer;
		transition: background 0.3s;
	}
	.btn-secondary:hover {
		background-color: #e5e7eb;
	}

	.success {
		color: green;
		margin-top: 0.5rem;
	}
	.error {
		color: red;
		margin-top: 0.5rem;
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

	.btn-delete {
		background-color: #ef4444;
		color: white;
		font-weight: 600;
		border-radius: 0.5rem;
		padding: 0.4rem 0.8rem;
		border: none;
		cursor: pointer;
		transition: background 0.2s;
	}

	.btn-delete:hover {
		background-color: #dc2626;
	}
</style>
