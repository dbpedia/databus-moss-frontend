<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { writable } from 'svelte/store';
	// @ts-ignore
	import jsonld from 'jsonld';
	import CodeMirror from '$lib/components/code-mirror.svelte';
	import { JsonldUtils } from '$lib/utils/jsonld-utils';
	import { MossUris } from '$lib/utils/moss-uris';
	import FileList from '$lib/components/file-list.svelte';
	import TopBar from '$lib/components/top-bar.svelte';
	import { Button, Toast, Spinner, Indicator, GradientButton } from 'flowbite-svelte';
	import { MossUtils } from '$lib/utils/moss-utils';
	import { A } from 'flowbite-svelte';
	import { CheckCircleOutline, ExclamationCircleOutline } from 'flowbite-svelte-icons';
	import FeedbackMessage from '$lib/components/feedback-message.svelte';
	import { env } from '$env/dynamic/public';
	import { RdfUris } from '$lib/utils/rdf-uris';
	import MossModuleWidget from '$lib/components/moss-module-widget.svelte';
	import ResourceUri from '$lib/components/resource-uri.svelte';
	import MossEntryHeader from '$lib/components/moss-entry-header.svelte';
	import type { MossModule } from '$lib/types';

	export let data: any;

	let buttonName = writable('Save Entry');
	let validationErrorMsg = '';
	let displayFeedback = writable(false);
	let displaySave = writable(false);
	let displayDelete = writable(false);
	let indicatorColor: 'green' | 'red' | 'none' = 'none';
	let indicatorVisible = writable(false);
	let feedback: any;
	let errors: any;

	const module: MossModule = data.module;
	errors = [];

	$: backLink = MossUtils.createListGroupNavigationItems(['..'], $page.url.pathname);

	export async function deleteEntry(): Promise<Response> {
		let moduleData: any = $page.data.props.moduleData;
		let moduleURI = moduleData[RdfUris.JSONLD_ID];
		let moduleId = MossUtils.uriToName(moduleURI);

		if (moduleId == null) {
			throw 'Nope';
		}

		let language = JsonldUtils.getValue(moduleData, RdfUris.MOSS_MIME_TYPE);
		let extensionData: any = $page.data.props.extensionData;
		const requestURL = MossUtils.getDeletionRequestURL(extensionData.databusResourceURI, moduleId);

		const headers: any = {
			Accept: 'application/json',
			'Content-Type': language
		};

		return await fetch(requestURL, {
			method: 'POST',
			headers: headers
		});
	}

	export async function saveEntry(): Promise<Response> {
		let moduleData: any = $page.data.props.moduleData;
		let moduleURI = moduleData[RdfUris.JSONLD_ID];
		let moduleId = MossUtils.uriToName(moduleURI);

		if (moduleId == null) {
			throw 'Nope';
		}

		let language = JsonldUtils.getValue(moduleData, RdfUris.MOSS_MIME_TYPE);
		let extensionData: any = $page.data.props.extensionData;
		const requestURL = MossUtils.getSaveRequestURL(extensionData.databusResourceURI, moduleId);

		let content = data.content;
		while (content.endsWith('\n') || content.endsWith('\r')) {
			content = content.slice(0, -1);
		}

		const headers: any = {
			Accept: 'application/json',
			'Content-Type': language
		};

		return await fetch(requestURL, {
			method: 'POST',
			headers: headers,
			body: content
		});
	}

	async function onSaveButtonClicked() {
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
			errors.push(data.message);
			errors = [...errors];
		}

		displaySave.set(false);
	}

	async function onDeleteButtonClicked() {
		const confirmed = confirm('Are you sure you want to delete this entry?');
		if (!confirmed) return;

		errors = [];
		feedback.clearMessage();
		indicatorColor = 'none';
		displayDelete.set(true);

		let response = await deleteEntry();

		if (response.ok) {
			await goto('/browse');
		} else {
			let data = await response.json();
			feedback.showMessage('Failed to delete document.', false);
			errors.push(data.message);
			errors = [...errors];
		}

		displayDelete.set(false);
	}
</script>

<div class="container">
	<div class="top-bar-container">
		<TopBar segments={data.props.segments} />
	</div>

	{#if !data.props.isDocument}
		<div class="list-container">
			<FileList collection={backLink} files={false}></FileList>
			{#if data.props.folders?.length}
				<FileList collection={data.props.folders} files={false}></FileList>
			{/if}
			{#if data.props.files?.length}
				<FileList collection={data.props.files}></FileList>
			{/if}
		</div>
	{/if}

	{#if data.props.isDocument}
		<MossEntryHeader module={data.module} entryData={data.props.headerInfo}></MossEntryHeader>

		<div style="display:flex; gap: 1rem">
			<div style="flex: 3">
				<div class="editor-container">
					<div class="buttons">
						<A href={'./'}>
							<Button color="alternative">Go Back</Button>
						</A>
						<div class="button-group-right">
							<div class="btn-size">
								<div class="valid-label-container">
									<div class="feedback">
										{#if $displayFeedback}
											<Toast
												class="validation"
												dismissable={true}
												divClass="w-full max-w-xs p-2 text-gray-500 bg-white shadow dark:text-gray-400 dark:bg-gray-800 gap-3"
												contentClass="flex space-x-4 divide-x divide-gray-200 dark:divide-gray-700"
											>
												{#if validationErrorMsg}
													<ExclamationCircleOutline
														class="h-5 w-5 text-primary-600 dark:text-primary-500"
													/>
												{:else}
													<CheckCircleOutline class="h-5 w-5 text-green-600 dark:text-green-500" />
												{/if}
												<div class="ps-2 text-sm font-normal">
													{#if validationErrorMsg}
														<p class="text-primary-600 dark:text-primary-500">
															{validationErrorMsg}
														</p>
													{:else}
														<p class="text-green-600 dark:text-green-500">Valid Document</p>
													{/if}
												</div>
											</Toast>
										{/if}
									</div>
								</div>
								<FeedbackMessage bind:feedback></FeedbackMessage>

								<GradientButton
									color="cyanToBlue"
									size="md"
									class="button-group-size relative"
									on:click={onSaveButtonClicked}
								>
									{#if $displaySave}
										<Spinner class="me-3" size="4" color="white" />
									{:else if $indicatorVisible}
										<Indicator color={indicatorColor} size="lg" placement="top-right" />
									{/if}
									{$buttonName}
								</GradientButton>

								<GradientButton
									color="red"
									size="md"
									class="button-group-size relative"
									on:click={onDeleteButtonClicked}
								>
									{#if $displayDelete}
										<Spinner class="me-3" size="4" color="white" />
									{:else if $indicatorVisible}
										<Indicator color={indicatorColor} size="lg" placement="top-right" />
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
						<CodeMirror format={data.module?.language} bind:value={data.content} />
					</div>
				</div>
			</div>

			<div style="width: 450px">
				<MossModuleWidget
					bind:moduleId={data.props.moduleId}
					content={data.content}
					resourceUri={data.props.extensionData.databusResourceURI}
					on:testIndexer={(e) => console.log('Test Indexer', e.detail)}
				/>
			</div>
		</div>
	{/if}
</div>

<style>
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

	.top-bar-container {
		width: 100%;
		padding-bottom: 0.5em;
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
