<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import jsonld from 'jsonld';
	import { MossUtils } from '$lib/utils/moss-utils';
	import { JsonldUtils } from '$lib/utils/jsonld-utils';
	import { RdfUris } from '$lib/utils/rdf-uris';
	import { env } from '$env/dynamic/public';
	import ResourceUri from './resource-uri.svelte';
	import MossModuleHeader from './moss-module-header.svelte';
	import { GradientButton } from 'flowbite-svelte';

	export let moduleId: string;
	export let content: string;
	export let resourceUri: string;

	type Binding = { key: string; value: string | null };
	type FieldData = { bindings: Binding[] };
	type TestReport =
		| { success: true; message: string; details: Record<string, FieldData> }
		| { success: false; message: string; details: string[] };

	let moduleInfo: any = null;
	let shaclContent = '';
	let indexerContent = '';
	let errorMessage = '';
	let shaclExists = false;
	let indexerExists = false;

	let activeTab: 'shacl' | 'indexer' | null = 'shacl';
	let validationView = false;

	let validationMessages: string[] = [];
	let validationSuccess = false;


	let testReport: TestReport | null = null;
	let testView = false;

	function closeTestView() {
		testView = false;
	}

	const dispatch = createEventDispatcher();

	async function fetchModuleInfo() {
		errorMessage = '';
		try {
			const res = await fetch(`/api/v1/modules/${moduleId}`);
			if (!res.ok) throw new Error(`Failed to load module: ${res.status}`);
			moduleInfo = await res.json();
		} catch (e: any) {
			errorMessage = e.message;
		}
	}

	async function fetchOptionalResources() {
		try {
			const shaclRes = await fetch(`/api/v1/modules/${moduleId}/shapes.ttl`);
			if (shaclRes.ok) {
				shaclExists = true;
				shaclContent = await shaclRes.text();
			} else {
				activeTab = 'indexer';
			}

			const indexerRes = await fetch(`/api/v1/modules/${moduleId}/indexer.yml`);
			if (indexerRes.ok) {
				indexerExists = true;
				indexerContent = await indexerRes.text();
			}
		} catch (e: any) {
			console.error('Error loading optional resources:', e);
		}
	}

	async function validateEntry() {
		errorMessage = '';
		validationMessages = [];
		validationSuccess = false;
		try {
			const validationURL = MossUtils.getValidationRequestURL(resourceUri, moduleId);
			const headers: any = {
				Accept: 'application/ld+json',
				'Content-Type': moduleInfo?.language
			};
			const response = await fetch(validationURL, {
				method: 'POST',
				headers,
				body: content
			});

			var responseJson = await response.json();
			const reportGraph = await jsonld.expand(responseJson);
			const report = JsonldUtils.getTypedGraph(reportGraph, RdfUris.SHACL_VALIDATION_REPORT);

			if (report != null) {
				const conformsRaw = JsonldUtils.getValue(report, RdfUris.SHACL_CONFORMS);
				const conforms = conformsRaw === true || conformsRaw === 'true';

				if (conforms === true) {
					validationSuccess = true;
				} else {
					const results = report[RdfUris.SHACL_RESULT] ?? [];
					validationMessages = results.map((result: any) => {
						const resultGraph = JsonldUtils.getGraphById(reportGraph, result[RdfUris.JSONLD_ID]);
						return JsonldUtils.getValue(resultGraph, RdfUris.SHACL_RESULT_MESSAGE);
					});
				}
			} else {
				validationMessages = [responseJson.message];
			}
			validationView = true;
		} catch (e: any) {
			errorMessage = e.message;
		}
	}

	function closeValidationView() {
		validationView = false;
		testView = false;
	}

	// Dummy test function for indexer
	async function testIndexer() {
		testReport = null;
		testView = false;

		try {
			const url = MossUtils.getIndexerPreviewURL(resourceUri, moduleId);
			const headers: any = {
				Accept: 'application/json',
				'Content-Type': moduleInfo?.language
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
					message: 'MOSS will index the following fields when saving this entry:',
					details: data
				};
			}
		} catch (err: any) {
			testReport = {
				success: false,
				message: 'Indexer failed',
				details: [err.message]
			};
		}

		// alert(JSON.stringify(testReport));
		testView = true;
	}

	onMount(async () => {
		await fetchModuleInfo();
		await fetchOptionalResources();
	});
</script>

{#if errorMessage}
	<div class="error-box">{errorMessage}</div>
{:else if moduleInfo}
	<div class="module-box">
		<div class="module-box-header">
			<div class="module-label">MODULE INFO</div>
			<MossModuleHeader {moduleInfo}></MossModuleHeader>
		</div>

		{#if shaclExists || indexerExists}
			<hr class="section-divider" />
			<div class="tabs">
				{#if shaclExists}
					<button class:active={activeTab === 'shacl'} on:click={() => (activeTab = 'shacl')}>
						RDF/SHACL
					</button>
				{/if}
				{#if indexerExists}
					<button class:active={activeTab === 'indexer'} on:click={() => (activeTab = 'indexer')}>
						Indexer
					</button>
				{/if}
			</div>

			{#if activeTab === 'shacl'}
				<div class="tab-content">
					<div class="tab-actions">
						<GradientButton
							color="green"
							size="md"
							class="button-group-size relative"
							on:click={validateEntry}>Validate</GradientButton
						>
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
											<li>
												<span class="violation-icon"></span>
												<span class="violation-text">{msg}</span>
											</li>
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
						<GradientButton
							color="green"
							size="md"
							class="button-group-size relative"
							on:click={testIndexer}>Test</GradientButton
						>
					</div>
					{#if testView && testReport}
						<div class="validation-content">
							<div class="result {testReport.success ? 'success-box' : 'error-box'}">
								<button class="report-close" on:click={closeTestView}>×</button>
								<p>{testReport.message}</p>

								{#if testReport.success}
									{#each Object.entries(testReport.details) as [fieldName, fieldData]}
										<div class="field-report">
											<h4>{fieldName}</h4>
											{#if fieldData.bindings.length > 0}
												<ul class="bindings">
													{#each fieldData.bindings as binding}
														<li>{binding.value ?? 'null'}</li>
													{/each}
												</ul>
											{:else}
												<p>No results</p>
											{/if}
										</div>
									{/each}
								{:else}
									<p>{testReport.details[0]}</p>
								{/if}
							</div>
						</div>
					{/if}

					<pre class="code yaml">{indexerContent}</pre>
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
		position: relative;
	}

	.field-report h4 {
		font-weight: 600;
	}

	.field-report ul {
		list-style-type: disc;
	}

	.field-report li {
		margin-left: 1.5rem;
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


	.section-divider {
		border: none;
		border-top: 1px solid #e5e7eb;
		margin: 1rem 0;
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
		position: absolute;
		top: -3rem;
		right: 0;
	}

	pre.code {
		background-color: #f3f4f6;
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
		margin-top: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.report-close {
		position: absolute;
		top: -0.05rem;
		right: 0.65rem;
		background: transparent;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		color: inherit;
	}

	.report-close:hover {
		opacity: 0.7;
	}
	.success-box {
		background-color: #ecfdf5;
		color: #065f46;
		border: 1px solid #34d399;
	}
	.fail-box {
		background-color: #fef2f2;
		color: #991b1b;
		border: 1px solid #f87171;
	}

	.violations {
		list-style: none;
		padding: 0;
		margin: 0.5rem 0 0;
	}
	.violations li {
		display: flex;
		align-items: center;
		padding: 0.25rem 0;
	}
	.violation-icon {
		margin-right: 0.5rem;
	}
	.violation-text {
		flex: 1;
	}

	.error-box {
		padding: 1rem;
		background-color: #f8d7da;
		color: #721c24;
		border-radius: 0.5rem;
		margin-bottom: 1rem;
	}
	.result {
		position: relative;
		padding: 0.5rem 0.65rem;
		border-radius: 0.5rem;
		margin-top: 0.5rem;
		margin-bottom: 0.5rem;
	}
	.report-close {
		position: absolute;
		top: -0.05rem;
		right: 0.65rem;
		background: transparent;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		color: inherit;
	}
	.report-close:hover {
		opacity: 0.7;
	}
	.success-box {
		background-color: #ecfdf5;
		color: #065f46;
		border: 1px solid #34d399;
	}
	.fail-box {
		background-color: #fef2f2;
		color: #991b1b;
		border: 1px solid #f87171;
	}
</style>
