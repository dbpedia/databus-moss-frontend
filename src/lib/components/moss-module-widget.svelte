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

		{#if shaclExists}
			<hr class="section-divider" />
			<div class="section-header">
				<div class="section-label shacl-label">SHACL</div>
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
		{/if}

		{#if contextExists}
			<hr class="section-divider" />
			<div class="section-label">Context</div>
			<div style="margin-bottom: 0.5rem">
				<ResourceUri uri={contextUri} />
			</div>
			<pre class="code json">{contextContent}</pre>
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
	.section-divider {
		margin: 0;
		margin-top: 0.75rem;
		padding-top: 0.75rem;
		border: none;
		border-top: 1px solid #e5e7eb;
	}
	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 0.5rem;
	}
	.section-label {
		color: #878b94;
		font-size: 0.75rem;
		letter-spacing: 1px;
		text-transform: uppercase;
		margin: 0;
	}
	.shacl-label {
		font-size: 1rem;
		font-weight: 600;
		color: #3b3f44;
		letter-spacing: 0.5px;
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
