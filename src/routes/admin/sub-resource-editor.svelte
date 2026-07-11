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
			const res = await fetch(`/modules/${moduleId}/${resourceName}`);
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
				headers: { 'Content-Type': 'application/json' },
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
		<p style="margin-bottom: 0.5rem">No {resourceName} yet.</p>
		<Button variant="primary" type="button" on:click={startEdit}>Create {resourceName}</Button>
	{:else if editing}
		<CodeMirror bind:value={code} {lang} {extensions} />
		<div class="form-actions">
			<Button variant="primary" type="button" on:click={save}>Save</Button>
			<Button variant="secondary" type="button" on:click={cancel}>Cancel</Button>
		</div>
	{:else}
		<div class="editor-preview">
			<pre>{content}</pre>
		</div>
		<div class="form-actions">
			<Button variant="primary" type="button" on:click={startEdit}>Edit</Button>
			<Button variant="danger" type="button" on:click={del}>Delete</Button>
		</div>
	{/if}
</div>

<style>
	.editor-preview {
		border: 1px solid #d1d5db;
		background-color: #f9fafb;
		padding: 0.5rem;
		border-radius: 0.5rem;
	}

	pre {
		margin: 0;
		font-family: monospace;
		white-space: pre-wrap;
		word-wrap: break-word;
	}

	.form-actions {
		margin-top: 1rem;
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
	}
</style>
