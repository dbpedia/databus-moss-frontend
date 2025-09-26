<script lang="ts">
	import { onMount } from 'svelte';
	import CodeMirror from 'svelte-codemirror-editor';
	import { json, jsonParseLinter } from '@codemirror/lang-json';
	import { yaml } from '@codemirror/lang-yaml';
	import { linter } from '@codemirror/lint';
	import type { LanguageSupport } from '@codemirror/language';
	import type { Extension } from '@codemirror/state';

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
			const res = await fetch(`/api/v1/modules/${moduleId}/${resourceName}`);
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
			const res = await fetch(`/api/v1/modules/${moduleId}/${resourceName}`, {
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
			const res = await fetch(`/api/v1/modules/${moduleId}/${resourceName}`, {
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
		<button class="btn-primary" on:click={startEdit}>Create {resourceName}</button>
	{:else if editing}
		<CodeMirror bind:value={code} {lang} {extensions} />
		<div class="form-actions">
			<button class="btn-primary" on:click={save}>Save</button>
			<button class="btn-secondary" on:click={cancel}>Cancel</button>
		</div>
	{:else}
		<div class="editor-preview">
			<pre>{content}</pre>
		</div>
		<div class="form-actions">
			<button class="btn-primary" on:click={startEdit}>Edit</button>
			<button class="btn-delete" on:click={del}>Delete</button>
		</div>
	{/if}
</div>

<style>


.editor-preview {
	border: 1px solid #d1d5db;
	background-color:#f9fafb;
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

.btn-primary {
	background-color: #4f46e5;
	color: white;
	font-weight: 600;
	border-radius: 0.5rem;
	padding: 0.4rem 0.8rem;
	border: none;
	cursor: pointer;
	transition: background 0.2s;
}

.btn-primary:hover {
	background-color: #6366f1;
}

.btn-secondary {
	background-color: #f3f4f6;
	color: #374151;
	border-radius: 0.5rem;
	padding: 0.4rem 0.8rem;
	border: 1px solid #d1d5db;
	cursor: pointer;
	transition: background 0.2s;
}

.btn-secondary:hover {
	background-color: #e5e7eb;
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
