<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import jsonld from 'jsonld';
	import { onMount } from 'svelte';
	import { MossUtils } from '$lib/utils/moss-utils';
	import CodeMirror from '$lib/components/code-mirror.svelte';
	import LoginWall from '$lib/components/login-wall.svelte';
	import DatabusResourcePreview from '$lib/components/databus-resource-preview.svelte';
	import { env } from '$env/dynamic/public';
	import { RdfFormats } from '$lib/utils/rdf-formats';
	import type { MossModule } from '$lib/types';
	import { JsonldUtils } from '$lib/utils/jsonld-utils';
	import { RdfUris } from '$lib/utils/rdf-uris';
	import MossModuleWidget from '$lib/components/moss-module-widget.svelte';
	import MossModuleHeader from '$lib/components/moss-module-header.svelte';
	import { Button, GradientButton } from 'flowbite-svelte';
	import MossEntryHeader from '$lib/components/moss-entry-header.svelte';

	type TemplateFormat = 'json-ld' | 'turtle' | 'yaml' | null;
	interface TemplateMapping {
		name: string;
		format: TemplateFormat;
	}
	const templateMapping: Record<string, TemplateMapping> = {
		'application/ld+json': { name: 'template.jsonld', format: 'json-ld' },
		'application/json': { name: 'template.json', format: 'json-ld' },
		'text/turtle': { name: 'template.ttl', format: 'turtle' },
		'application/rdf+xml': { name: 'template.rdf', format: null },
		'application/n-triples': { name: 'template.nt', format: null },
		'application/n-quads': { name: 'template.nq', format: null },
		'application/trig': { name: 'template.trig', format: 'turtle' },
		yaml: { name: 'template.yml', format: 'yaml' },
		'application/x-yaml': { name: 'template.yml', format: 'yaml' }
	};
	function getTemplateFile(language: string) {
		return templateMapping[language] || { name: 'template.txt', format: null };
	}

	let moduleId = '';
	let databusResource = '';
	let errorMessage = '';
	let validationMessages: string[] = [];
	let validationSuccess = false;
	let activeModule: any | null = null;
	let moduleList: any[] = [];
	let entryUri: string | null;

	let entryExists: boolean | null = null;
	let entryCreated = false;
	let headerInfo: { key: string; value: string; type?: string }[] = [];

	$: params = new URLSearchParams($page.url.search);
	$: step2 = params.has('module') && params.has('resource');

	$: if (step2) {
		moduleId = params.get('module')!;
		databusResource = params.get('resource')!;
		entryUri = MossUtils.getMossEntryURI(env.PUBLIC_MOSS_BASE_URL, databusResource, moduleId);
		updateActiveModule();
		loadTemplate();
		checkEntryExists();
		createHeaderInfo();
		entryCreated = false;
	} else {
		headerInfo = [];
		entryUri = null;
		errorMessage = '';
		entryCreated = false;
		validationMessages = [];
		validationSuccess = false;
	}

	function createHeaderInfo() {

		let mimeType = RdfFormats.getFormatByMimeType(activeModule?.language ?? '');


		let info: any = {};
		info._links = { "self": { "href": entryUri } };
		info.module = MossUtils.getModuleUri(moduleId);
		info.extends = databusResource;
		info.contentGraph = MossUtils.getContentGraphUri(databusResource, moduleId, mimeType);
		info.isFake = true;

		/*
		let info: { key: string; value: string; type?: string }[] = [];

		info.push({
			key: 'id',
			value: entryUri ?? '',
			type: 'placeholder'
		});

		info.push({
			key: 'rdf:type',
			value: RdfUris.MOSS_ENTRY,
			type: 'uri'
		});

		info.push({
			key: 'moss:instanceOf',
			value: MossUtils.getModuleUri(moduleId),
			type: 'uri'
		});

		info.push({
			key: 'moss:extends',
			value: databusResource,
			type: 'uri'
		});

		let mimeType = RdfFormats.getFormatByMimeType(activeModule?.language ?? '');

		info.push({
			key: 'moss:content',
			value: MossUtils.getContentGraphUri(databusResource, moduleId, mimeType),
			type: 'placeholder'
		});
		*/

		headerInfo = info;
	}

	function goToEntry() {
		if (entryUri == null || activeModule == null) return;
		
		goto(MossUtils.getRelativeUri(entryUri));
	}

	async function checkEntryExists() {
		if (!databusResource || !moduleId || !entryUri) return;
		try {
			const response = await fetch(entryUri, {
				method: 'GET',
				headers: { Accept: 'application/ld+json' }
			});
			entryExists = response.status === 200;
		} catch (err) {
			console.error('Error checking entry existence:', err);
			entryExists = false;
		}
	}

	let templateContent = '';

	onMount(async () => {
		moduleList = $page.data.modules ?? [];
		if (step2) {
			moduleId = params.get('module')!;
			databusResource = params.get('resource')!;
			await updateActiveModule();
			await loadTemplate();
		}
	});

	$: if (moduleId) updateActiveModule();

	async function updateActiveModule() {
		if (!moduleId) {
			activeModule = null;
			return;
		}

		// Find the module in the list to get the self link
		const moduleEntry = moduleList.find((mod) => mod.id === moduleId);
		if (!moduleEntry?._links?.self) {
			activeModule = null;
			return;
		}

		try {
			const res = await fetch(moduleEntry._links.self.href, {
				headers: { Accept: 'application/hal+json' }
			});
			if (res.ok) {
				activeModule = await res.json();
				if (databusResource) {
					createHeaderInfo();
				}
			} else {
				console.error(`Failed to fetch module HAL: ${res.status}`);
				activeModule = null;
			}
		} catch (err) {
			console.error('Error fetching module HAL:', err);
			activeModule = null;
		}
	}

	function nextStep() {
		if (!moduleId || !databusResource) {
			errorMessage = 'Both module and Databus Resource are required.';
			return;
		}
		const params = new URLSearchParams();
		params.set('module', moduleId);
		params.set('resource', databusResource);
		goto(`?${params.toString()}`);
	}

	function goBack() {
		goto('/create-entry');
	}

	async function createEntry() {
		errorMessage = '';
		try {
			const saveURL = MossUtils.getSaveRequestURL(databusResource, moduleId);
			const headers: any = { Accept: 'application/json', 'Content-Type': activeModule?.language };
			const response = await fetch(saveURL, { method: 'POST', headers, body: templateContent });

			if (response.status === 200) {
				const data = await response.json();
				console.log('Entry created:', data);
				entryCreated = true;
			} else {
				const body = await response.json();
				errorMessage = body.message;
			}
		} catch (e: any) {
			errorMessage = e.message;
		}
	}

	async function validateEntry() {
		errorMessage = '';
		validationMessages = [];
		validationSuccess = false;
		try {
			const validationURL = MossUtils.getValidationRequestURL(databusResource, moduleId);
			const headers: any = {
				Accept: 'application/ld+json',
				'Content-Type': activeModule?.language
			};
			const response = await fetch(validationURL, {
				method: 'POST',
				headers,
				body: templateContent
			});

			const reportGraph = await jsonld.expand(await response.json());
			const report = JsonldUtils.getTypedGraph(reportGraph, RdfUris.SHACL_VALIDATION_REPORT);
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
		} catch (e: any) {
			errorMessage = e.message;
		}
	}

	async function loadTemplate() {
		if (!activeModule || !activeModule._links?.template) return;

		try {
			const response = await fetch(activeModule._links.template.href, {
				headers: { Accept: 'application/ld+json' }
			});

			if (response.ok) {
				templateContent = await response.text();
				templateContent = templateContent.replace(/\$DATABUS_RESOURCE/g, databusResource);
			} else {
				templateContent = `# Could not load template ${activeModule._links.template.href}`;
			}
		} catch (err: any) {
			templateContent = `# Error loading template: ${err.message}`;
		}
	}

</script>

{#if $page.data.userData}
	<section class="section">
		<div class="container">
			{#if !step2}
				<div class="form-card thin">
					<h2>Create Metadata Entry</h2>
					<form on:submit|preventDefault={nextStep}>
						<div class="form-group">
							<label for="resource">Databus Resource</label>
							<input
								id="resource"
								type="text"
								bind:value={databusResource}
								required
								placeholder="Databus Resource URI"
							/>

							<DatabusResourcePreview resourceUrl={databusResource} />
						</div>

						<div class="form-group">
							<label for="module">Module</label>
							<select id="module" bind:value={moduleId} required>
								<option value="" disabled selected>Select a module</option>
								{#each moduleList as mod}
									<option value={mod.id}>{mod.label}</option>
								{/each}
							</select>
						</div>

						{#if activeModule}
							<div class="module-box">
								<MossModuleHeader moduleInfo={activeModule}></MossModuleHeader>
							</div>
						{/if}

						<div class="form-actions right">
							<GradientButton
								color="pinkToOrange"
								size="md"
								type="submit"
								class="button-group-size relative">Next</GradientButton
							>
						</div>
						{#if errorMessage}<div class="error-box">{errorMessage}</div>{/if}
					</form>
				</div>
			{:else if activeModule}
				<!--div class="card" style="margin-top: 0.5rem;">
						<h2>{activeModule.label}</h2>
						<p>{activeModule.description}</p>
						<p class="meta">Language: {activeModule.language}</p>
					</div>-->

				{#if entryCreated}
					<p class="resource-success">Entry was created successfully.</p>
					<div class="form-actions right">
						<button type="button" class="btn-secondary" on:click={goBack}>Back</button>
						<button class="btn-primary" on:click={goToEntry}>Go To Entry</button>
					</div>
				{:else if entryExists}
					<div class="form-card">
						<h2>Create Metadata Entry</h2>
						<DatabusResourcePreview resourceUrl={databusResource} />
						<p class="resource-warning">An entry for this resource and module already exists.</p>
						<div class="form-actions right">
							<button type="button" class="btn-secondary" on:click={goBack}>Back</button>
							<button class="btn-primary" on:click={goToEntry}>Go To Entry</button>
						</div>
					</div>
				{:else}
					<MossEntryHeader module={activeModule} entry={headerInfo}></MossEntryHeader>

					<div style="display:flex; gap: 1rem">
						<div style="flex: 3">
							<div class="form-actions" style="justify-content: space-between;">
								<Button
									color="alternative"
									size="md"
									class="button-group-size relative"
									on:click={goBack}>Back</Button
								>

								<GradientButton
									color="pinkToOrange"
									size="md"
									class="button-group-size relative"
									on:click={createEntry}>Create Entry</GradientButton
								>
							</div>
							<div class="code-area">
								<CodeMirror bind:value={templateContent} format={activeModule.language} />
							</div>
						</div>

						<div style="width: 500px">
							<MossModuleWidget
								bind:module={activeModule}
								content={templateContent}
								resourceUri={databusResource}
								on:testIndexer={(e) => console.log('Test Indexer', e.detail)}
							/>
						</div>
					</div>

					{#if validationMessages.length > 0}
						<ul class="error-box">
							{#each validationMessages as msg}
								<li>{msg}</li>
							{/each}
						</ul>
					{/if}

					{#if errorMessage && validationMessages.length === 0}<div class="error-box">
							{errorMessage}
						</div>{/if}
				{/if}
			{/if}
		</div>
	</section>
{:else}
	<LoginWall />
{/if}

<style>
	.section {
		padding: 2rem 0;
	}
	.container {
		margin: 0 auto;
	}
	.form-card {
		background: #fff;
		padding: 2rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		margin-bottom: 2rem;
		max-width: 800px;
		margin: auto;
	}

	h2 {
		font-size: 1.5rem;
		margin-bottom: 1rem;
	}

	.module-box {
		background-color: #fcfcfc;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		padding: 1rem;
		position: relative;
		margin-bottom: 1rem;
	}

	.code-area {
		border: 1px solid #e5e7eb;
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
	input,
	select {
		padding: 0.5rem 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		font-size: 1rem;
		color: #111827;
	}
	input:focus,
	select:focus {
		outline: none;
		border-color: #6366f1;
		box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
	}

	.form-actions {
		margin-bottom: 0.5rem;
		display: flex;
		gap: 0.5rem;
	}
	.form-actions.right {
		justify-content: flex-end;
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
	.error-box {
		padding: 1em;
		background-color: #f8d7da;
		color: #721c24;
		border-radius: 0.5rem;
		margin-top: 1em;
	}
	.resource-warning {
		position: relative;
		display: flex;
		align-items: flex-start;
		background-color: #fef3c7;
		border: 1px solid #f59e0b;
		color: #78350f;
		padding: 0.5rem 0.75rem 0.5rem 2rem;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		margin-bottom: 0.75rem;
	}

	.resource-warning::before {
		content: '!';
		position: absolute;
		left: 0.5rem;
		top: 50%;
		transform: translateY(-50%);
		display: inline-block;
		width: 1rem;
		height: 1rem;
		background-color: #f59e0b;
		color: white;
		border-radius: 50%;
		text-align: center;
		line-height: 1rem;
		font-weight: bold;
		font-size: 0.75rem;
	}

	.resource-success {
		position: relative;
		display: flex;
		align-items: flex-start;
		background-color: #dcfce7;
		border: 1px solid #22c55e;
		color: #166534;
		padding: 0.5rem 0.75rem 0.5rem 2rem;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		margin-bottom: 0.75rem;
	}

	.resource-success::before {
		content: '✓';
		position: absolute;
		left: 0.5rem;
		top: 50%;
		transform: translateY(-50%);
		display: inline-block;
		width: 1rem;
		height: 1rem;
		background-color: #22c55e;
		color: white;
		border-radius: 50%;
		text-align: center;
		line-height: 1rem;
		font-weight: bold;
		font-size: 0.75rem;
	}
</style>
