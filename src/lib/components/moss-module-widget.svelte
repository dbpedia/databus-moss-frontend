<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import jsonld from 'jsonld';
	import { MossUtils } from '$lib/utils/moss-utils';
	import { JsonldUtils } from '$lib/utils/jsonld-utils';
	import { RdfUris } from '$lib/utils/rdf-uris';
	import ResourceUri from './resource-uri.svelte';
	import MossModuleHeader from './moss-module-header.svelte';
	import { GradientButton } from 'flowbite-svelte';

	export let module: any;
	export let content: string;
	export let resourceUri: string;

	type Binding = { key: string; value: string | null };
	type FieldData = { bindings: Binding[] };
	type TestReport =
		| { success: true; message: string; details: Record<string, FieldData> }
		| { success: false; message: string; details: string[] };

	let shaclContent = '';
	let indexerContent = '';
	let contextContent = '';
	let contextUri = '';
	let shaclExists = false;
	let indexerExists = false;
	let contextExists = false;
	let activeTab: 'shacl' | 'indexer' | 'context' | null = 'shacl';
	let validationView = false;
	let validationMessages: string[] = [];
	let validationSuccess = false;
	let testReport: TestReport | null = null;
	let testView = false;
	let errorMessage = '';

	const dispatch = createEventDispatcher();

	async function fetchOptionalResources() {
		try {
			if (module._links.shapes) {
				const res = await fetch(module._links.shapes.href, {
					headers: { Accept: 'text/turtle' }
				});
				if (res.ok) {
					shaclExists = true;
					shaclContent = await res.text();
				} else activeTab = 'indexer';
			}

			if (module._links.indexer) {
				const res = await fetch(module._links.indexer.href);
				if (res.ok) {
					indexerExists = true;
					indexerContent = await res.text();
				} else activeTab = 'context';
			}

			if (module._links.context) {
				const res = await fetch(module._links.context.href);
				if (res.ok) {
					contextExists = true;
					contextUri = module._links.context.href;
					contextContent = await res.text();
				}
			}
		} catch (e) {
			console.error('Failed to fetch optional resources', e);
			errorMessage = 'Failed to load module resources';
		}
	}

	async function validateEntry() {
		validationMessages = [];
		validationSuccess = false;
		try {
			const validationURL = MossUtils.getValidationRequestURL(resourceUri, module.id);
			const headers: any = {
				Accept: 'application/ld+json',
				'Content-Type': module.language
			};
			const response = await fetch(validationURL, {
				method: 'POST',
				headers,
				body: content
			});

			const responseJson = await response.json();
			const reportGraph = await jsonld.expand(responseJson);
			const report = JsonldUtils.getTypedGraph(reportGraph, RdfUris.SHACL_VALIDATION_REPORT);

			if (report) {
				const conformsRaw = JsonldUtils.getValue(report, RdfUris.SHACL_CONFORMS);
				const conforms = conformsRaw === true || conformsRaw === 'true';
				if (conforms) validationSuccess = true;
				else {
					const results = report[RdfUris.SHACL_RESULT] ?? [];
					validationMessages = results.map((result: any) => {
						const resultGraph = JsonldUtils.getGraphById(reportGraph, result[RdfUris.JSONLD_ID]);
						return JsonldUtils.getValue(resultGraph, RdfUris.SHACL_RESULT_MESSAGE);
					});
				}
			} else validationMessages = [responseJson.message];
			validationView = true;
		} catch (e: any) {
			errorMessage = e.message;
		}
	}

	function closeValidationView() {
		validationView = false;
		testView = false;
	}

	async function testIndexer() {
		testReport = null;
		testView = false;

		if (!module._links.indexer) return;

		try {
			const url = module._links.indexer.href + '/preview';
			const headers: any = {
				Accept: 'application/json',
				'Content-Type': module.language
			};

			const response = await fetch(url, {
				method: 'POST',
				headers,
				body: content
			});

			if (!response.ok) {
				const errBody = await response.json();
				testReport = {
					success: false,
					message: 'Indexer failed',
					details: [errBody.message || 'Unknown error']
				};
			} else {
				const data = await response.json();
				testReport = {
					success: true,
					message: 'MOSS will index the following fields:',
					details: data
				};
			}
		} catch (err: any) {
			testReport = { success: false, message: 'Indexer failed', details: [err.message] };
		}
		testView = true;
	}

	function closeTestView() {
		testView = false;
	}

	onMount(async () => {
		if (!module) {
			errorMessage = 'No module HAL provided';
			return;
		}
		await fetchOptionalResources();
	});
</script>

{#if errorMessage}
	<div class="error-box">{errorMessage}</div>
{:else if module}
	<div class="module-box">
		<div class="module-box-header">
			<div class="module-label">MODULE INFO</div>
			<MossModuleHeader moduleInfo={module} />
		</div>

		{#if shaclExists || indexerExists || contextExists}
			<hr class="section-divider" />
			<div class="tabs">
				{#if shaclExists}
					<button class:active={activeTab === 'shacl'} on:click={() => (activeTab = 'shacl')}
						>RDF/SHACL</button
					>
				{/if}
				{#if indexerExists}
					<button class:active={activeTab === 'indexer'} on:click={() => (activeTab = 'indexer')}
						>Indexer</button
					>
				{/if}
				{#if contextExists}
					<button class:active={activeTab === 'context'} on:click={() => (activeTab = 'context')}
						>Context</button
					>
				{/if}
			</div>

			{#if activeTab === 'shacl'}
				<div class="tab-content">
					<div class="tab-actions">
						<GradientButton on:click={validateEntry}>Validate</GradientButton>
					</div>
					{#if validationView}
						<div class="validation-content">
							{#if validationSuccess}
								<div class="result success-box">
									<button class="report-close" on:click={closeValidationView}>×</button>
									<p>RDF is valid and conforms to SHACL shapes</p>
								</div>
							{:else if validationMessages.length > 0}
								<div class="result fail-box">
									<button class="report-close" on:click={closeValidationView}>×</button>
									<p>Content failed validation</p>
									<ul class="violations">
										{#each validationMessages as msg}
											<li>{msg}</li>
										{/each}
									</ul>
								</div>
							{:else}
								<p>No validation results available.</p>
							{/if}
						</div>
					{/if}
					<pre class="code turtle">{shaclContent}</pre>
				</div>
			{:else if activeTab === 'indexer'}
				<div class="tab-content">
					<div class="tab-actions">
						<GradientButton on:click={testIndexer}>Test</GradientButton>
					</div>
					{#if testView && testReport}
						<div class="validation-content">
							<div class="result {testReport.success ? 'success-box' : 'fail-box'}">
								<button class="report-close" on:click={closeTestView}>×</button>
								<p>{testReport.message}</p>
								{#if testReport.success}
									{#each Object.entries(testReport.details) as [fieldName, fieldData]}
										<div class="field-report">
											<h4>{fieldName}</h4>
											<ul>
												{#each fieldData.bindings as binding}
													<li>{binding.value ?? 'null'}</li>
												{/each}
											</ul>
										</div>
									{/each}
								{/if}
							</div>
						</div>
					{/if}
					<pre class="code yaml">{indexerContent}</pre>
				</div>
			{:else if activeTab === 'context'}
				<div class="tab-content">
					<div style="margin-bottom: 0.5rem">
						<ResourceUri uri={contextUri} />
					</div>
					<pre class="code json">{contextContent}</pre>
				</div>
			{/if}
		{/if}
	</div>
{/if}

<style>
	.module-box {
		background-color: #fcfcfc;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		padding: 1rem;
	}
	.module-box-header {
		margin-bottom: 0.5rem;
	}
	.module-label {
		color: #878b94;
		font-size: 0.75rem;
		letter-spacing: 1px;
		text-transform: uppercase;
		margin: 0;
	}
	.tabs {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}
	.tabs button {
		flex: none;
		padding: 0.5rem 1rem;
		background: #f3f4f6;
		border-radius: 0.5rem;
		cursor: pointer;
		font-weight: 500;
	}
	.tabs button.active {
		background: #4f46e5;
		color: white;
		border-color: #4f46e5;
	}
	.tab-content {
		position: relative;
	}
	.tab-actions {
		margin-bottom: 0.5rem;
		display: flex;
		justify-content: flex-end;
	}
	pre.code {
		background: #f3f4f6;
		padding: 0.75rem;
		font-size: 0.8rem;
		border-radius: 0.5rem;
		overflow-x: auto;
		box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
	}
	.result {
		position: relative;
		padding: 0.5rem 0.65rem;
		border-radius: 0.5rem;
		margin: 0.5rem 0;
	}
	.report-close {
		position: absolute;
		top: -0.05rem;
		right: 0.65rem;
		background: transparent;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
	}
	.report-close:hover {
		opacity: 0.7;
	}
	.success-box {
		background: #ecfdf5;
		color: #065f46;
		border: 1px solid #34d399;
	}
	.fail-box {
		background: #fef2f2;
		color: #991b1b;
		border: 1px solid #f87171;
	}
</style>
