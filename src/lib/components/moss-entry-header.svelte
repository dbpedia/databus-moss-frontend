<script lang="ts">
	import { onMount } from 'svelte';
	import ResourceUri from './resource-uri.svelte';
	import type { DatabusResource, MossModule } from '$lib/types';
	import { MossUtils } from '$lib/utils/moss-utils';

	export let module: MossModule;
	export let entryData: { key: string; value: string | null; type? : string }[] = [];

	const getEntry = (key: string) =>
		entryData.find(f => f.key === key);

	const idEntry = getEntry('id');
	const rdfTypeEntry = getEntry('rdf:type');
	const mossInstanceOfEntry = getEntry('moss:instanceOf');
	const mossContentEntry = getEntry('moss:content');
	const mossExtendsEntry = getEntry('moss:extends');
	const createdEntry = getEntry('dct:created');
	const modifiedEntry = getEntry('dct:modified');

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

	let extendsResourceTitle: string | null = '';
	let loadingExtends = true;

	onMount(async () => {
		if (mossExtendsEntry) {
			try {
				const resource = await MossUtils.fetchDatabusResource(mossExtendsEntry.value ?? '');
				extendsResourceTitle = resource.title || MossUtils.uriToName(mossExtendsEntry.value ?? '');
			} catch (e) {
				console.error('Failed to fetch mossExtends resource', e);
				extendsResourceTitle = MossUtils.uriToName(mossExtendsEntry.value ?? '');
			} finally {
				loadingExtends = false;
			}
		}
	});

</script>

<div class="entry-box">
	<div class="entry-header">ENTRY INFO</div>

	<div class="fields">
		{#if idEntry}
			<div class="id">
				<h1>
					{#if loadingExtends}
						Loading...
					{:else}
						{module?.label} for {extendsResourceTitle}
					{/if}
				</h1>
				{#if idEntry.type === 'uri'}
					<ResourceUri uri={idEntry.value} />
				{:else}
					<div class="value placeholder">{idEntry.value}</div>
				{/if}
			</div>
		{/if}

		<hr class="section-divider" />

		{#if rdfTypeEntry}
			<div class="field">
				<div class="label">{rdfTypeEntry.key}</div>
				{#if rdfTypeEntry.type === 'uri'}
					<ResourceUri uri={rdfTypeEntry.value} />
				{:else}
					<div class="value placeholder">{rdfTypeEntry.value}</div>
				{/if}
			</div>
		{/if}

		{#if mossInstanceOfEntry}
			<div class="field">
				<div class="label">{mossInstanceOfEntry.key}</div>
				{#if mossInstanceOfEntry.type === 'uri'}
					<ResourceUri uri={mossInstanceOfEntry.value} />
				{:else}
					<div class="value placeholder">{mossInstanceOfEntry.value}</div>
				{/if}
			</div>
		{/if}

		{#if mossContentEntry}
			<div class="field">
				<div class="label">{mossContentEntry.key}</div>
				{#if mossContentEntry.type === 'uri'}
					<ResourceUri uri={mossContentEntry.value} />
				{:else}
					<div class="value placeholder">{mossContentEntry.value}</div>
				{/if}
			</div>
		{/if}

		{#if mossExtendsEntry}
			<div class="field">
				<div class="label">{mossExtendsEntry.key}</div>
				{#if mossExtendsEntry.type === 'uri'}
					<ResourceUri uri={mossExtendsEntry.value} />
				{:else}
					<div class="value placeholder">{mossExtendsEntry.value}</div>
				{/if}
			</div>
		{/if}

		{#if createdEntry}
			<div class="field">
				<div class="label">{createdEntry.key}</div>
				<div class="value">{formatDate(createdEntry.value)}</div>
			</div>
		{/if}

		{#if modifiedEntry}
			<div class="field">
				<div class="label">{modifiedEntry.key}</div>
				<div class="value">{formatDate(modifiedEntry.value)}</div>
			</div>
		{/if}
	</div>
</div>

<style>
	h1 {
		padding: 0;
		margin: 0;
		font-weight: 600;
		color: #3b3f44;
		margin-bottom: -0.15rem;
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
		margin: 0;
	}

	.id {
		display: flex;
		flex-direction: column;
	}

	.field {
		display: flex;
		flex-direction: row;
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
		margin-left: 1rem;
	}

	.value.placeholder {
		color: #878b94;
		height: 32px;
		line-height: 32px;
	}

	.value {
		font-size: 0.85rem;
		color: #1f2937;
		font-family: monospace;
		flex-grow: 1;
		word-break: break-word;
	}
</style>
