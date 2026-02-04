<script lang="ts">
	import { onMount } from 'svelte';
	import { hashStore } from '$lib/stores/hash-navigation';
	import ModuleForm from './module-form.svelte';
	import ModuleDeleter from './module-deleter.svelte';
	import ModuleDetail from './module-detail.svelte';
	import type { MossFacet, MossModule, MossTerminology } from '$lib/types';
	import { env } from '$env/dynamic/public';
	import { writable, derived } from 'svelte/store';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { MossUtils } from '$lib/utils/moss-utils';
	import FacetForm from './facet-form.svelte';
	import FacetDeleter from './facet-deleter.svelte';
	import TerminologyDeleter from './terminology-deleter.svelte';
	import TerminologyForm from './terminology-form.svelte';

	const modules = writable<MossModule[]>([]);
	const terminologies = writable<MossTerminology[]>([]);
	const facets = writable<MossFacet[]>([]);

	async function fetchModules() {
		try {
			const data = await MossUtils.fetchJSON(env.PUBLIC_MOSS_BASE_URL, '/modules');
			modules.set(data._embedded.modules);
		} catch (err) {
			console.error('Failed to fetch modules:', err);
		}
	}

	async function fetchTerminologies() {
		try {
			const data = await MossUtils.fetchJSON(env.PUBLIC_MOSS_BASE_URL, '/terminologies');
			terminologies.set(data._embedded.terminologies);
		} catch (err) {
			console.error('Failed to fetch terminologies:', err);
		}
	}

	async function fetchFacets() {
		try {
			const data = await MossUtils.fetchJSON(env.PUBLIC_MOSS_BASE_URL, '/facets');
			facets.set(data._embedded.facets);
		} catch (err) {
			console.error('Failed to fetch facets:', err);
		}
	}

	onMount(() => {
		fetchModules();
		fetchTerminologies();
		fetchFacets();
	});

	function showCreateForm() {
		hashStore.navigate('create-module');
	}
	function editModule(mod: MossModule) {
		hashStore.navigate(`edit-module?id=${encodeURIComponent(mod.id)}`);
	}
	function createTerminology() {
		hashStore.navigate('create-terminology');
	}
	function editTerminology(terminology: MossTerminology) {
		hashStore.navigate(`edit-terminology?id=${encodeURIComponent(terminology.id)}`);
	}
	function createFacet() {
		hashStore.navigate('create-facet');
	}
	function editFacet(facet: MossFacet) {
		hashStore.navigate(`edit-facet?id=${encodeURIComponent(facet.id)}`);
	}
	function showTerminology(terminology: MossTerminology) {
		goto(`/terminologies/${terminology.id}`);
	}
	function backToList() {
		hashStore.navigate('list');
	}

	const activeModule = derived([modules, hashStore], ([$modules, $hash]) =>
		$hash.params.id ? $modules.find((m) => m.id === $hash.params.id) || null : null
	);

	const activeFacet = derived([facets, hashStore], ([$facets, $hash]) => {
		return $hash.params.id ? $facets.find((m) => m.id === $hash.params.id) || null : null;
	});

	const activeTerminology = derived([terminologies, hashStore], ([$terminologies, $hash]) =>
		$hash.params.id ? $terminologies.find((m) => m.id === $hash.params.id) || null : null
	);

	async function handleCreated(moduleData: MossModule) {
		try {
			const res = await fetch(`/modules`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(moduleData)
			});
			if (!res.ok) {
				console.error(await res.text());
				return;
			}
			await fetchModules();
			backToList();
		} catch (err) {
			console.error(err);
		}
	}

	async function onDeleteModule(id: string) {
		try {
			const res = await fetch(`/modules/${id}`, { method: 'DELETE' });
			if (res.ok) {
				await fetchModules();
				backToList();
			} else console.error(await res.text());
		} catch (err) {
			console.error(err);
		}
	}

	async function onCreateFacet(facetData: MossFacet) {
		try {
			const res = await fetch(`/facets`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(facetData)
			});
			if (!res.ok) {
				console.error(await res.text());
				return;
			}
			await fetchFacets();
			backToList();
		} catch (err) {
			console.error(err);
		}
	}

	async function onUpdateFacet(facetData: MossFacet) {
		try {
			const res = await fetch(`/facets/${facetData.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(facetData)
			});
			if (!res.ok) {
				console.error(await res.text());
				return;
			}
			await fetchFacets();
			backToList();
		} catch (err) {
			console.error(err);
		}
	}

	async function onDeleteFacet(id: string) {
		try {
			const res = await fetch(`/facets/${id}`, { method: 'DELETE' });
			if (res.ok) {
				await fetchFacets();
				backToList();
			} else console.error(await res.text());
		} catch (err) {
			console.error(err);
		}
	}

	async function onDeleteTerminology(id: string) {
		try {
			const res = await fetch(`/terminologies/${id}`, { method: 'DELETE' });
			if (res.ok) {
				await fetchTerminologies();
				backToList();
			} else console.error(await res.text());
		} catch (err) {
			console.error(err);
		}
	}

	async function onCreateTerminology(data: { terminology: MossTerminology; body: string }) {
		try {
			const res = await fetch(`/terminologies`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data.terminology)
			});
			if (!res.ok) {
				console.error(await res.text());
				return;
			}

			const dataRes = await fetch(`/data`, {
				method: 'PUT',
				headers: { 'Content-Type': `${data.terminology.language}; charset=UTF-8` },
				body: data.body
			});
			if (!dataRes.ok) {
				console.error(await dataRes.text());
			}

			await fetchTerminologies();
			backToList();
		} catch (err) {
			console.error(err);
		}
	}

	async function onUpdateTerminology(data: { terminology: MossTerminology; body: string }) {
		try {
			const res = await fetch(`/terminologies/${data.terminology.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data.terminology)
			});
			if (!res.ok) {
				console.error(await res.text());
				return;
			}

			const dataRes = await fetch(`/terminologies/${data.terminology.id}/data`, {
				method: 'PUT',
				headers: { 'Content-Type': `${data.terminology.language}; charset=UTF-8` },
				body: data.body
			});
			if (!dataRes.ok) {
				console.error(await dataRes.text());
				return;
			}

			await fetchTerminologies();
			backToList();
		} catch (err) {
			console.error(err);
		}
	}
</script>

{#if $page.data.isAdmin}
	<div class="section">
		<div class="container">
			<div class="admin-page">
				{#if $hashStore.view === 'list'}
					<!-- Modules Table -->
					<div class="box">
						<div class="top-bar">
							<h1>Modules</h1>
							<button class="btn-create" on:click={showCreateForm}>+ Create Module</button>
						</div>
						<table class="table">
							<thead>
								<tr>
									<th style="width:10%">Id</th>
									<th style="width:20%">Label</th>
									<th style="width:44%">Description</th>
									<th style="width:15%">Language</th>
									<th style="width:11%">Actions</th>
								</tr>
							</thead>
							<tbody>
								{#each $modules as module}
									<tr>
										<td>{module.id}</td>
										<td>{module.label}</td>
										<td class="ellipsis">{module.description}</td>
										<td>{module.language}</td>
										<td>
											<button on:click={() => editModule(module)}>Edit</button>
											<button
												on:click={() =>
													hashStore.navigate(`delete-module?id=${encodeURIComponent(module.id)}`)}
												>Delete</button
											>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>

					<!-- Terminologies Table -->
					<div class="box">
						<div class="top-bar">
							<h1>Terminologies</h1>
							<button class="btn-create" on:click={createTerminology}>+ Create Terminology</button>
						</div>
						<table class="table">
							<thead>
								<tr>
									<th style="width:10%">Id</th>
									<th style="width:64%">Label</th>
									<th style="width:15%">Language</th>
									<th style="width:11%">Actions</th>
								</tr>
							</thead>
							<tbody>
								{#each $terminologies as terminology}
									<tr>
										<td>{terminology.id}</td>
										<td>{terminology.label}</td>
										<td>{terminology.language}</td>
										<td>
											<button on:click={() => editTerminology(terminology)}>Edit</button>
											<button
												on:click={() =>
													hashStore.navigate(
														`delete-terminology?id=${encodeURIComponent(terminology.id)}`
													)}>Delete</button
											>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>

					<!-- Facets Table -->
					<div class="box">
						<div class="top-bar">
							<h1>Facets</h1>
							<button class="btn-create" on:click={createFacet}>+ Create Facet</button>
						</div>
						<table class="table">
							<thead>
								<tr>
									<th style="width:10%">Id</th>
									<th style="width:13%">Label</th>
									<th style="width:57%">Predicate</th>
									<th style="width:9%">Sort Order</th>
									<th style="width:11%">Actions</th>
								</tr>
							</thead>
							<tbody>
								{#each $facets as facet}
									<tr>
										<td>{facet.id}</td>
										<td>{facet.label}</td>
										<td>{facet.predicate}</td>
										<td>{facet.sortOrder}</td>
										<td>
											<button on:click={() => editFacet(facet)}>Edit</button>
											<button
												on:click={() =>
													hashStore.navigate(`delete-facet?id=${encodeURIComponent(facet.id)}`)}
												>Delete</button
											>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}

				{#if $hashStore.view === 'delete-module' && $activeModule}
					<ModuleDeleter
						on:cancel={backToList}
						activeModule={$activeModule}
						on:delete={({ detail }) => onDeleteModule(detail.id)}
					/>
				{/if}

				{#if $hashStore.view === 'create-module'}
					<ModuleForm on:cancel={backToList} on:created={(e) => handleCreated(e.detail)} />
				{/if}

				{#if $hashStore.view === 'edit-module' && $activeModule}
					<ModuleDetail
						activeModule={$activeModule}
						on:back={backToList}
						on:updated={fetchModules}
					/>
				{/if}

				{#if $hashStore.view === 'create-facet'}
					<FacetForm on:cancel={backToList} on:saved={(e) => onCreateFacet(e.detail)} />
				{/if}

				{#if $hashStore.view === 'edit-facet' && $activeFacet}
					<FacetForm
						on:cancel={backToList}
						activeFacet={$activeFacet}
						on:saved={(e) => onUpdateFacet(e.detail)}
					/>
				{/if}

				{#if $hashStore.view === 'delete-facet' && $activeFacet}
					<FacetDeleter
						on:cancel={backToList}
						activeFacet={$activeFacet}
						on:delete={({ detail }) => onDeleteFacet(detail.id)}
					/>
				{/if}

				{#if $hashStore.view === 'create-terminology'}
					<TerminologyForm on:cancel={backToList} on:saved={(e) => onCreateTerminology(e.detail)} />
				{/if}

				{#if $hashStore.view === 'edit-terminology' && $activeTerminology}
					<TerminologyForm
						on:cancel={backToList}
						activeTerminology={$activeTerminology}
						on:saved={(e) => onUpdateTerminology(e.detail)}
					/>
				{/if}

				{#if $hashStore.view === 'delete-terminology' && $activeTerminology}
					<TerminologyDeleter
						on:cancel={backToList}
						activeTerminology={$activeTerminology}
						on:delete={({ detail }) => onDeleteTerminology(detail.id)}
					/>
				{/if}
			</div>
		</div>
	</div>
{:else}
	<div class="section">
		<div class="container">
			<p>Admin access required.</p>
		</div>
	</div>
{/if}

<style>
	.admin-page {
		padding: 1rem 0;
		font-family: 'Inter', sans-serif;
	}

	h1 {
		font-size: 1.1rem;
		font-weight: 700;
		margin: 0;
		padding: 0;
		color: #111827;
	}

	.box {
		margin-bottom: 2rem;
	}

	.top-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.btn-create {
		padding: 0.3em 0.6em;
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

	table.table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.875rem;
		table-layout: fixed;
	}

	table.table th,
	table.table td {
		padding: 0.5rem 0.75rem;
		border: 1px solid #e5e7eb;
		text-align: left;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	table.table th {
		background: #f9fafb;
		font-weight: 600;
		color: #374151;
	}

	table.table td button {
		padding: 0.2em 0.5em;
		margin-right: 0.3em;
		border: 1px solid #d1d5db;
		background: #f3f4f6;
		border-radius: 0.25rem;
		cursor: pointer;
		font-size: 0.75rem;
	}

	table.table td button:hover {
		background: #e5e7eb;
	}
</style>
