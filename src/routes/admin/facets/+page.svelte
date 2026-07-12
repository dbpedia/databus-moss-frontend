<script lang="ts">
	import { onMount } from 'svelte';
	import { hashStore } from '$lib/stores/hash-navigation';
	import FacetForm from '../facet-form.svelte';
	import FacetDeleter from '../facet-deleter.svelte';
	import type { MossFacet } from '$lib/types';
	import { writable, derived } from 'svelte/store';
	import { page } from '$app/stores';
	import Button from '$lib/components/button.svelte';

	const facets = writable<MossFacet[]>([]);

	async function fetchFacets() {
		try {
			const res = await fetch('/facets', {
				headers: { Accept: 'application/hal+json, application/json' }
			});
			if (!res.ok) {
				console.error('Failed to fetch facets:', res.status, await res.text());
				facets.set([]);
				return;
			}
			const data = await res.json();
			facets.set(data._embedded?.facets ?? []);
		} catch (err) {
			console.error('Failed to fetch facets:', err);
			facets.set([]);
		}
	}

	onMount(() => {
		fetchFacets();
	});

	function createFacet() {
		hashStore.navigate('create-facet');
	}

	function editFacet(facet: MossFacet) {
		hashStore.navigate(`edit-facet?id=${encodeURIComponent(facet.id)}`);
	}

	function backToList() {
		hashStore.navigate('list');
	}

	const activeFacet = derived([facets, hashStore], ([$facets, $hash]) => {
		return $hash.params.id ? $facets.find((m) => m.id === $hash.params.id) || null : null;
	});

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
</script>

{#if $page.data.canWriteFacets}
	<div class="admin-page">
		{#if $hashStore.view === 'list'}
			<div class="box">
				<div class="top-bar">
					<h1>Facets</h1>
					<Button variant="primary" type="button" on:click={createFacet}>+ Create Facet</Button>
				</div>
				<table class="table">
					<thead>
						<tr>
							<th>Id</th>
							<th>Label</th>
							<th class="ellipsis">Predicate</th>
							<th>Sort Order</th>
							<th class="actions">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each $facets as facet}
							<tr>
								<td>{facet.id}</td>
								<td>{facet.label}</td>
								<td class="ellipsis">{facet.predicate}</td>
								<td>{facet.sortOrder}</td>
								<td class="actions">
									<Button variant="table" type="button" on:click={() => editFacet(facet)}>Edit</Button>
									<Button
										variant="table"
										type="button"
										on:click={() =>
											hashStore.navigate(`delete-facet?id=${encodeURIComponent(facet.id)}`)}
										>Delete</Button
									>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
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
	</div>
{:else}
	<p>MOSS settings access required.</p>
{/if}
