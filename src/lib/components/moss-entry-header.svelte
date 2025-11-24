<script lang="ts">
	import { onMount } from 'svelte';
	import ResourceUri from './resource-uri.svelte';
	import type { MossModule } from '$lib/types';
	import { MossUtils } from '$lib/utils/moss-utils';

	export let module: MossModule;
	export let entry: any;

	let extendsResourceTitle: string | null = '';
	let loadingExtends = true;

	onMount(async () => {
		if (entry?.extends) {
			try {
				const resource = await MossUtils.fetchDatabusResource(entry.extends);
				extendsResourceTitle = resource.title || MossUtils.uriToName(entry.extends);
			} catch {
				extendsResourceTitle = MossUtils.uriToName(entry.extends);
			} finally {
				loadingExtends = false;
			}
		}
	});

	const formatDate = (iso?: string | null) => {
		if (!iso) return '';
		const date = new Date(iso);
		return new Intl.DateTimeFormat('en-GB', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		}).format(date);
	};
</script>

<div class="entry-box">
	<div class="entry-header">ENTRY INFO</div>

	<div class="fields">
		<div>
			<h1>
				{#if loadingExtends}
					Loading...
				{:else}
					{module?.label} for {extendsResourceTitle}
				{/if}
			</h1>
			{#if entry.isFake}
				<p class="fake-uri">{entry._links?.self?.href}</p>
			{:else}
				<ResourceUri uri={entry._links?.self?.href} fontSize="0.8em" />
			{/if}
		</div>

		<hr class="section-divider" />

		{#if entry.module}
			<div class="field">
				<div class="label">module</div>
				<ResourceUri uri={entry.module} isRelative={true} />
			</div>
		{/if}

		{#if entry.extends}
			<div class="field">
				<div class="label">extends</div>
				<ResourceUri uri={entry.extends} />
			</div>
		{/if}

		{#if entry.contentGraph}
			<div class="field">
				<div class="label">contentGraph</div>

				{#if entry.isFake}
					<p class="fake-uri" style="font-size: 0.65rem">{entry.contentGraph}</p>
				{:else}
					<ResourceUri uri={entry.contentGraph} isRelative={true} />
				{/if}
			</div>
		{/if}

		{#if entry.created}
			<div class="field">
				<div class="label">created</div>
				<div class="value">{formatDate(entry.created)}</div>
			</div>
		{/if}

		{#if entry.modified}
			<div class="field">
				<div class="label">modified</div>
				<div class="value">{formatDate(entry.modified)}</div>
			</div>
		{/if}
	</div>
</div>

<style>
	h1 {
		font-weight: 600;
		color: #3b3f44;
		margin: 0;
		padding: 0;
	}

	.fake-uri {
		font-family: 'monospatial';
		font-size: 0.8em;
		color: grey;
	}

	.entry-box {
		background-color: #fcfcfc;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		padding: 1rem;
		margin-bottom: 1rem;
		display: flex;
		flex-direction: column;
	}

	.entry-header {
		color: #878b94;
		font-size: 0.75rem;
		letter-spacing: 1px;
		text-transform: uppercase;
		margin-bottom: 0;
	}

	.fields {
		display: flex;
		flex-direction: column;
	}

	.field
	{
		display: flex;
		align-items: center;
		min-height: 32px;
	}

	.section-divider {
		border: none;
		border-top: 1px solid #e5e7eb;
		margin: 1rem 0;
	}

	.label {
		font-size: 0.85rem;
		color: #6b7280;
		font-family: monospace;
		width: 160px;
		flex-shrink: 0;
		margin-right: 1rem;
	}

	.value {
		font-size: 0.85rem;
		color: #1f2937;
		font-family: monospace;
		word-break: break-word;
	}
</style>
