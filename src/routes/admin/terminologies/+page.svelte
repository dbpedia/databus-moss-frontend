<script lang="ts">
	import { onMount } from 'svelte';
	import { hashStore } from '$lib/stores/hash-navigation';
	import TerminologyDeleter from '../terminology-deleter.svelte';
	import TerminologyForm from '../terminology-form.svelte';
	import type { MossTerminology } from '$lib/types';
	import { writable, derived } from 'svelte/store';
	import { page } from '$app/stores';
	import Button from '$lib/components/button.svelte';

	const terminologies = writable<MossTerminology[]>([]);

	async function fetchTerminologies() {
		try {
			const res = await fetch('/terminologies', {
				headers: { Accept: 'application/hal+json, application/json' }
			});
			if (!res.ok) {
				console.error('Failed to fetch terminologies:', res.status, await res.text());
				terminologies.set([]);
				return;
			}
			const data = await res.json();
			terminologies.set(data._embedded?.terminologies ?? []);
		} catch (err) {
			console.error('Failed to fetch terminologies:', err);
			terminologies.set([]);
		}
	}

	onMount(() => {
		fetchTerminologies();
	});

	function createTerminology() {
		hashStore.navigate('create-terminology');
	}

	function editTerminology(terminology: MossTerminology) {
		hashStore.navigate(`edit-terminology?id=${encodeURIComponent(terminology.id)}`);
	}

	function backToList() {
		hashStore.navigate('list');
	}

	const activeTerminology = derived([terminologies, hashStore], ([$terminologies, $hash]) =>
		$hash.params.id ? $terminologies.find((m) => m.id === $hash.params.id) || null : null
	);

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

{#if $page.data.canWriteTerminologies}
	<div class="admin-page">
		{#if $hashStore.view === 'list'}
			<div class="box">
				<div class="top-bar">
					<h1>Terminologies</h1>
					<Button variant="primary" type="button" on:click={createTerminology}>+ Create Terminology</Button>
				</div>
				<table class="table">
					<thead>
						<tr>
							<th>Id</th>
							<th class="ellipsis">Label</th>
							<th>Language</th>
							<th class="actions">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each $terminologies as terminology}
							<tr>
								<td>{terminology.id}</td>
								<td class="ellipsis">{terminology.label}</td>
								<td>{terminology.language}</td>
								<td class="actions">
									<Button variant="table" type="button" on:click={() => editTerminology(terminology)}
										>Edit</Button
									>
									<Button
										variant="table"
										type="button"
										on:click={() =>
											hashStore.navigate(
												`delete-terminology?id=${encodeURIComponent(terminology.id)}`
											)}>Delete</Button
									>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
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
{:else}
	<p>MOSS settings access required.</p>
{/if}
