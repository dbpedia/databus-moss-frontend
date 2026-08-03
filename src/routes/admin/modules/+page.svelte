<script lang="ts">
	import { onMount } from 'svelte';
	import { hashStore } from '$lib/stores/hash-navigation';
	import ModuleForm from '../module-form.svelte';
	import ModuleDeleter from '../module-deleter.svelte';
	import ModuleDetail from '../module-detail.svelte';
	import type { MossModule } from '$lib/types';
	import { toYaml, YAML_CONTENT_TYPE } from '$lib/utils/yaml-utils';
	import { writable, derived } from 'svelte/store';
	import { page } from '$app/stores';
	import Button from '$lib/components/button.svelte';

	const modules = writable<MossModule[]>([]);

	async function fetchModules() {
		try {
			const res = await fetch('/modules', {
				headers: { Accept: 'application/hal+json, application/json' }
			});
			if (!res.ok) {
				console.error('Failed to fetch modules:', res.status, await res.text());
				modules.set([]);
				return;
			}
			const data = await res.json();
			modules.set(data._embedded?.modules ?? []);
		} catch (err) {
			console.error('Failed to fetch modules:', err);
			modules.set([]);
		}
	}

	onMount(() => {
		fetchModules();
	});

	function showCreateForm() {
		hashStore.navigate('create-module');
	}

	function editModule(mod: MossModule) {
		hashStore.navigate(`edit-module?id=${encodeURIComponent(mod.id)}`);
	}

	function backToList() {
		hashStore.navigate('list');
	}

	const activeModule = derived([modules, hashStore], ([$modules, $hash]) =>
		$hash.params.id ? $modules.find((m) => m.id === $hash.params.id) || null : null
	);

	async function handleCreated(moduleData: MossModule) {
		try {
			const res = await fetch(`/modules`, {
				method: 'POST',
				headers: { 'Content-Type': YAML_CONTENT_TYPE },
				body: toYaml(moduleData)
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
</script>

{#if $page.data.canWriteModules}
	<div class="admin-page">
		{#if $hashStore.view === 'list'}
			<div class="box">
				<div class="top-bar">
					<h1>Modules</h1>
					<Button variant="primary" type="button" on:click={showCreateForm}>+ Create Module</Button>
				</div>
				<table class="table">
					<thead>
						<tr>
							<th>Id</th>
							<th>Label</th>
							<th class="ellipsis">Description</th>
							<th>Language</th>
							<th class="actions">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each $modules as module}
							<tr>
								<td>{module.id}</td>
								<td>{module.label}</td>
								<td class="ellipsis">{module.description}</td>
								<td>{module.language}</td>
								<td class="actions">
									<Button variant="table" type="button" on:click={() => editModule(module)}>Edit</Button>
									<Button
										variant="table"
										type="button"
										on:click={() =>
											hashStore.navigate(`delete-module?id=${encodeURIComponent(module.id)}`)}
										>Delete</Button
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
			<ModuleDetail activeModule={$activeModule} on:back={backToList} on:updated={fetchModules} />
		{/if}
	</div>
{:else}
	<p>MOSS settings access required.</p>
{/if}
