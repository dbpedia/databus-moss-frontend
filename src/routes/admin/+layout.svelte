<script lang="ts">
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import { hashStore } from '$lib/stores/hash-navigation';

	onMount(() => {
		hashStore.sync();
	});

	afterNavigate(() => {
		hashStore.sync();
	});
</script>

<div class="section">
	<div class="container">
		<h1>Settings</h1>

		{#if $page.data.canWriteModules || $page.data.canWriteTerminologies || $page.data.canWriteFacets || $page.data.canReadUsers || $page.data.canWriteRoles}
			<div class="columns">
				<div class="column small sidebar">
					{#if $page.data.canWriteModules}
						<a
							class="sidebar-link"
							class:active={$page.url.pathname.startsWith('/admin/modules')}
							href="/admin/modules"
						>
							Modules
						</a>
					{/if}
					{#if $page.data.canWriteTerminologies}
						<a
							class="sidebar-link"
							class:active={$page.url.pathname.startsWith('/admin/terminologies')}
							href="/admin/terminologies"
						>
							Terminologies
						</a>
					{/if}
					{#if $page.data.canWriteFacets}
						<a
							class="sidebar-link"
							class:active={$page.url.pathname.startsWith('/admin/facets')}
							href="/admin/facets"
						>
							Facets
						</a>
					{/if}
					{#if $page.data.canReadUsers || $page.data.canWriteRoles}
						<a
							class="sidebar-link"
							class:active={$page.url.pathname.startsWith('/admin/users')}
							href="/admin/users"
						>
							Users
						</a>
					{/if}
				</div>
				<div class="column">
					<slot />
				</div>
			</div>
		{:else}
			<p>Settings access required.</p>
		{/if}
	</div>
</div>

<style>
	:global(.admin-page) {
		padding: 1rem 0;
		font-family: 'Inter', sans-serif;
	}

	:global(.admin-page h1) {
		font-size: 1.1rem;
		font-weight: 700;
		margin: 0;
		padding: 0;
		color: #111827;
	}

	:global(.admin-page .box) {
		margin-bottom: 2rem;
		overflow-x: auto;
	}

	:global(.admin-page .top-bar) {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	:global(.admin-page table.table) {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.875rem;
		table-layout: auto;
	}

	:global(.admin-page table.table th),
	:global(.admin-page table.table td) {
		padding: 0.5rem 0.75rem;
		border: 1px solid #e5e7eb;
		text-align: left;
		white-space: nowrap;
	}

	:global(.admin-page table.table th) {
		background: #f9fafb;
		font-weight: 600;
		color: #374151;
	}

	:global(.admin-page table.table .ellipsis) {
		width: 100%;
		max-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
