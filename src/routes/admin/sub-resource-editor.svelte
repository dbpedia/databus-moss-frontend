<script lang="ts">
	import { onMount } from 'svelte';
	import CodeMirror from 'svelte-codemirror-editor';
	import { json, jsonParseLinter } from '@codemirror/lang-json';
	import { yaml } from '@codemirror/lang-yaml';
	import { linter } from '@codemirror/lint';
	import type { LanguageSupport } from '@codemirror/language';
	import type { Extension } from '@codemirror/state';
	import Button from '$lib/components/button.svelte';

	export let moduleId: string;
	export let resourceName: string;
	export let format: 'json-ld' | 'turtle' | 'yaml' | null = null;
	export let contentType: string;

	let content: string | null = null;
	let editing = false;
	let code: string = '';
	let lang: LanguageSupport | null = null;
	let extensions: Extension[] = [];

	$: {
		const config = getLanguageAndExtensions(format);
		lang = config.lang;
		extensions = config.extensions;
	}

	onMount(async () => {
		await loadContent();
	});

	async function loadContent() {
		try {
			const res = await fetch(`/modules/${moduleId}/${resourceName}`, {
				headers: { Accept: contentType }
			});
			if (res.ok) {
				content = await res.text();
			} else if (res.status === 404) {
				content = null;
			} else {
				console.error(await res.text());
			}
		} catch (err) {
			console.error(err);
		}
	}

	function getLanguageAndExtensions(format: string | null) {
		switch (format) {
			case 'json-ld':
			case 'application/json':
				return { lang: json(), extensions: [linter(jsonParseLinter())] };
			case 'yaml':
				return { lang: yaml(), extensions: [] };
			case 'turtle':
				return { lang: null, extensions: [] };
			default:
				return { lang: null, extensions: [] };
		}
	}

	function startEdit() {
		editing = true;
		code = content || '';
	}

	function cancel() {
		editing = false;
	}

	async function save() {
		try {
			const res = await fetch(`/modules/${moduleId}/${resourceName}`, {
				method: 'PUT',
				headers: { 'Content-Type': contentType },
				body: code
			});
			if (!res.ok) console.error(await res.text());
			else content = code;
		} catch (err) {
			console.error(err);
		} finally {
			editing = false;
		}
	}

	async function del() {
		if (!confirm(`Are you sure you want to delete ${resourceName}? This cannot be undone.`)) return;

		try {
			const res = await fetch(`/modules/${moduleId}/${resourceName}`, {
				method: 'DELETE'
			});
			if (!res.ok) console.error(await res.text());
			else content = null;
		} catch (err) {
			console.error(err);
		}
	}
</script>

<div class="subresource-editor">
	{#if content === null && !editing}
		<p class="empty-message">No {resourceName} yet.</p>
		<div class="editor-container">
			<div class="editor-toolbar">
				<div class="button-group-right">
					<Button variant="primary" type="button" on:click={startEdit}>Create {resourceName}</Button>
				</div>
			</div>
			<div class="editor-preview empty">
				<p>No content</p>
			</div>
		</div>
	{:else}
		<div class="editor-container">
			<div class="editor-toolbar">
				<div class="button-group-right">
					{#if editing}
						<Button variant="primary" type="button" on:click={save}>Save</Button>
						<Button variant="secondary" type="button" on:click={cancel}>Cancel</Button>
					{:else}
						<Button variant="primary" type="button" on:click={startEdit}>Edit</Button>
						<Button variant="danger" type="button" on:click={del}>Delete</Button>
					{/if}
				</div>
			</div>

			{#if editing}
				<div class="editor-content">
					<CodeMirror bind:value={code} {lang} {extensions} />
				</div>
			{:else}
				<div class="editor-preview">
					<pre>{content}</pre>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.empty-message {
		margin-bottom: 0.5rem;
	}

	.editor-container {
		display: flex;
		flex-direction: column;
	}

	.editor-toolbar {
		display: flex;
		justify-content: flex-end;
		margin-bottom: 0.5rem;
	}

	.button-group-right {
		display: flex;
		gap: 0.5rem;
	}

	.editor-content {
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		overflow: hidden;
	}

	.editor-preview {
		border: 1px solid #d1d5db;
		background-color: #f9fafb;
		padding: 0.5rem;
		border-radius: 0.5rem;
	}

	.editor-preview.empty {
		color: #6b7280;
		font-size: 0.875rem;
	}

	.editor-preview.empty p {
		margin: 0;
	}

	pre {
		margin: 0;
		font-family: monospace;
		white-space: pre-wrap;
		word-wrap: break-word;
	}
</style>
