<script lang="ts">
	import { MossUtils } from '$lib/utils/moss-utils';
	import ResourceUri from './resource-uri.svelte';
	import MossModuleHeader from './moss-module-header.svelte';
	import { GradientButton } from 'flowbite-svelte';

	export let module: any;
	export let content: string;
	export let resourceUri: string;

	let shaclContent = '';
	let contextContent = '';
	let contextUri = '';
	let shaclExists = false;
	let contextExists = false;
	let activeTab: 'shacl' | 'context' | null = 'shacl';
	let validationView = false;
	let validationMessages: string[] = [];
	let validationSuccess = false;
	let validationError = '';

	async function fetchOptionalResources() {
		if (module._links == undefined) {
			return;
		}

		if (module._links.shapes) {
			try {
				const res = await fetch(module._links.shapes.href);

				if (res.ok) {
					shaclExists = true;
					shaclContent = await res.text();
				} else if (res.status === 404) {
					shaclExists = false;
				} else {
					activeTab = 'context';
				}
			} catch {
				shaclExists = false;
			}
		}

		if (module._links.context) {
			try {
				const res = await fetch(module._links.context.href);

				if (res.ok) {
					contextExists = true;
					contextUri = module._links.context.href;
					contextContent = await res.text();
				} else if (res.status === 404) {
					contextExists = false;
				}
			} catch {
				contextExists = false;
			}
		}
	}

	async function validateEntry() {
		validationMessages = [];
		validationSuccess = false;
		validationError = '';
		try {
			const { conforms, messages } = await MossUtils.submitValidation(
				resourceUri,
				module.id,
				content,
				module.language
			);

			if (conforms) validationSuccess = true;
			else validationMessages = messages;
			validationView = true;
		} catch (e: any) {
			validationError = e.message;
			validationView = true;
		}
	}

	function closeValidationView() {
		validationView = false;
	}

	$: if (module && module._links) {
		fetchOptionalResources();
	}
</script>

{#if module}
	<div class="module-box">
		<div class="module-box-header">
			<div class="module-label">MODULE INFO</div>
			<MossModuleHeader moduleInfo={module} />
		</div>

		{#if shaclExists || contextExists}
			<hr class="section-divider" />
			<div class="tabs">
				{#if shaclExists}
					<button class:active={activeTab === 'shacl'} on:click={() => (activeTab = 'shacl')}
						>RDF/SHACL</button
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
							{#if validationError}
								<div class="result fail-box">
									<button class="report-close" on:click={closeValidationView}>×</button>
									<p>{validationError}</p>
								</div>
							{:else if validationSuccess}
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
