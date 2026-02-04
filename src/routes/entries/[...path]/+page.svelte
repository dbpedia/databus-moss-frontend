<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { writable } from 'svelte/store';
	import CodeMirror from '$lib/components/code-mirror.svelte';
	import FileList from '$lib/components/file-list.svelte';
	import TopBar from '$lib/components/top-bar.svelte';
	import { Button, Toast, Spinner, Indicator, GradientButton } from 'flowbite-svelte';
	import { MossUtils } from '$lib/utils/moss-utils';
	import { A } from 'flowbite-svelte';
	import FeedbackMessage from '$lib/components/feedback-message.svelte';
	import MossModuleWidget from '$lib/components/moss-module-widget.svelte';
	import MossEntryHeader from '$lib/components/moss-entry-header.svelte';
	import type { MossModule } from '$lib/types';

	export let data: any;

	let buttonName = writable('Save Entry');
	let displaySave = writable(false);
	let displayDelete = writable(false);
	let indicatorColor: 'green' | 'red' | 'none' = 'none';
	let feedback: any;
	let errors: any[] = [];

	let module: MossModule | null = data?.module ?? null;

	$: if (data?.module) {
		module = data.module;
	}

	$: isDocument = data?.props?.isDocument && data?.content != null;
	$: backLink = MossUtils.createListGroupNavigationItems(['..'], $page.url.pathname);

	export async function deleteEntry(): Promise<Response> {
		return await fetch(MossUtils.getRelativeUri($page.data.entry.uri), {
			method: 'DELETE'
		});
	}

	export async function saveEntry(): Promise<Response> {
		let moduleData: any = $page.data.module;
		let moduleId = moduleData?.id;

		if (moduleId == null) {
			throw 'No module id';
		}

		let language = moduleData.language;
		const requestURL = MossUtils.getSaveRequestURL($page.data.entry.extends, moduleId);

		let content = data.content ?? '';
		while (content.endsWith('\n') || content.endsWith('\r')) {
			content = content.slice(0, -1);
		}

		const headers: any = {
			Accept: 'application/json',
			'Content-Type': language
		};

		return await fetch(requestURL, {
			method: 'POST',
			headers,
			body: content
		});
	}

	function showCreateForm() {
		goto('/create-entry');
	}

	async function onSaveButtonClicked() {
		if (!isDocument) return;

		errors = [];
		feedback.clearMessage();
		indicatorColor = 'none';
		displaySave.set(true);

		let response = await saveEntry();

		if (response.ok) {
			feedback.showMessage('Document Saved!', true);
		} else {
			let data = await response.json();
			feedback.showMessage('Failed to save document.', false);
			errors = [...errors, data.message];
		}

		displaySave.set(false);
	}

	async function onDeleteButtonClicked() {
		if (!isDocument) return;

		const confirmed = confirm('Are you sure you want to delete this entry?');
		if (!confirmed) return;

		errors = [];
		feedback.clearMessage();
		indicatorColor = 'none';
		displayDelete.set(true);

		try {
			const response = await deleteEntry();

			if (response.ok) {
				await goto('/entries');
			} else {
				throw { message: response.statusText };
			}
		} catch (e: any) {
			feedback.showMessage('Failed to delete document.', false);
			errors = [...errors, e.message];
		}

		displayDelete.set(false);
	}
</script>

<div class="container">
	<div class="top-bar-container">
		<TopBar segments={data.props.segments} />
		<button class="btn-create" on:click={showCreateForm}>+ Create Entry</button>
	</div>

	{#if !isDocument}
		<div class="list-container">
			<FileList collection={backLink} files={false} />
			{#if data.props.folders?.length}
				<FileList collection={data.props.folders} files={false} />
			{/if}
			{#if data.props.files?.length}
				<FileList collection={data.props.files} />
			{/if}
		</div>
	{/if}

	{#if isDocument && module}
		<MossEntryHeader {module} entry={data.entry} />

		<div style="display:flex; gap: 1rem">
			<div class="editing">
				<div class="editor-container">
					<div class="buttons">
						<A href={'./'}>
							<Button color="alternative">Go Back</Button>
						</A>
						<div class="button-group-right">
							<div class="btn-size">
								<FeedbackMessage bind:feedback />

								<GradientButton
									color="cyanToBlue"
									size="md"
									disabled={!isDocument}
									on:click={onSaveButtonClicked}
								>
									{#if $displaySave}
										<Spinner class="me-3" size="4" color="white" />
									{/if}
									{$buttonName}
								</GradientButton>

								<GradientButton
									color="red"
									size="md"
									disabled={!isDocument}
									on:click={onDeleteButtonClicked}
								>
									{#if $displayDelete}
										<Spinner class="me-3" size="4" color="white" />
									{/if}
									Delete
								</GradientButton>
							</div>
						</div>
					</div>

					{#each errors as error}
						<div class="error-box">{error}</div>
					{/each}

					<div class="code-area">
						<CodeMirror format={module?.language} bind:value={data.content} />
					</div>
				</div>
			</div>

			<div class="sidebar">
				<MossModuleWidget {module} content={data.content} resourceUri={data.entry?.extends} />
			</div>
		</div>
	{/if}
</div>

<style>
	.editing {
		min-width: 70%;
		max-width: 70%;
		width: 70%;
	}

	.sidebar {
		min-width: 30%;
		max-width: 30%;
		width: 30%;
		padding-right: 1rem;
	}
	.code-area {
		border: 1px solid #e5e7eb;
	}

	.error-box {
		padding: 1em 1.5em;
		background-color: #f8d7da;
		color: #721c24;
		border: 1px solid #f5c6cb;
		border-radius: 8px;
		margin-bottom: 1em;
	}

	.list-container {
		display: flex;
		flex-direction: column;
		width: 100%;
	}

	.btn-create {
		padding: 0.5em 1em;
		margin-top: 0.5rem;
		height: 40px;
		width: 160px;
		background-color: #4f46e5;
		color: white;
		border: none;
		border-radius: 0.375rem;
		cursor: pointer;
		font-weight: 600;
		transition: background 0.2s;
	}

	.btn-create:hover {
		background-color: #6366f1;
	}

	.top-bar-container {
		width: 100%;
		padding-bottom: 0.5em;
		display: flex;
		margin-top: 1em;
		margin-bottom: 0.5em;
	}

	.editor-container {
		width: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: right;
	}

	.buttons {
		display: flex;
		justify-content: space-between;
		margin-bottom: 0.5rem;
	}

	.btn-size {
		display: flex;
		flex-direction: row;
		gap: 5px;
		align-items: center;
	}

	.button-group-right {
		display: flex;
		gap: 5px;
	}
</style>
