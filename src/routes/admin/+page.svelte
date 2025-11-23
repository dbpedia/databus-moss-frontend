<script lang="ts">
	import { onMount } from 'svelte';
	import { hashStore } from '$lib/stores/hash-navigation';
	import ModuleForm from './module-form.svelte';
	import ModuleDeleter from './module-deleter.svelte';
	import ModuleDetail from './module-detail.svelte';
	import type { MossModule, MossTerminology } from '$lib/types';
	import { env } from '$env/dynamic/public';
	import { writable, derived } from 'svelte/store';
	import { page } from '$app/stores';
	import LoginWall from '$lib/components/login-wall.svelte';
	import { goto } from '$app/navigation';

	import { MossUtils } from '$lib/utils/moss-utils';

	const modules = writable<MossModule[]>([]);
	const terminologies = writable<MossTerminology[]>([]);

	async function fetchModules() {
		try {
			const moduleListResource = await MossUtils.fetchJSON(env.PUBLIC_MOSS_BASE_URL, '/modules');
			modules.set(moduleListResource._embedded.modules);
		} catch (err) {
			console.error('Failed to fetch modules:', err);
		}
	}

	async function fetchTerminologies() {
		try {
			const terminologyListResource = await MossUtils.fetchJSON(env.PUBLIC_MOSS_BASE_URL, '/terminologies');
			terminologies.set(terminologyListResource._embedded.terminologies);
		} catch (err) {
			console.error('Failed to fetch terminologies:', err);
		}
	}

	onMount(() => {
		fetchModules();
		fetchTerminologies();
	});

	function showCreateForm() {
		hashStore.navigate('create-module');
	}

	function editModule(mod: MossModule) {
		hashStore.navigate(`edit-module?id=${encodeURIComponent(mod.id)}`);
	}

	function showTerminology(terminology: MossTerminology) {
		goto(`/terminologies/${terminology.id}`);
	}

	function backToList() {
		hashStore.navigate('list');
	}

	// Derived active module
	const activeModule = derived([modules, hashStore], ([$modules, $hash]) =>
		$hash.params.id ? $modules.find((m) => m.id === $hash.params.id) || null : null
	);

	async function handleCreated(moduleData: MossModule) {
		try {
			const res = await fetch(`/modules`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(moduleData)
			});

			if (!res.ok) {
				const text = await res.text();
				console.error('Failed to create module:', text);
				return;
			}

			await fetchModules();
			backToList();
		} catch (err) {
			console.error('Error creating module:', err);
		}
	}

	async function handleDelete(id: string) {
		try {
			const res = await fetch(`/modules/${id}`, { method: 'DELETE' });

			console.log(res);

			if (res.ok) {
				await fetchModules();
				backToList();
			} else {
				console.error(await res.text());
			}
		} catch (err) {
			console.error(err);
		}
	}
</script>

{#if $page.data.userData}
	<div class="section">
		<div class="container">
			<div class="admin-page">
				{#if $hashStore.view === 'list'}
					<div class="box">
						<div class="top-bar">
							<h1>Modules</h1>
							<button class="btn-create" on:click={showCreateForm}>+ Create Module</button>
						</div>

						<div class="grid">
							{#each $modules as module}
								<button class="card" on:click={() => editModule(module)}>
									<h2>{module.label}</h2>
									<p>{module.description}</p>
									<div class="meta"><strong>Language:</strong> {module.language}</div>
								</button>
							{/each}
						</div>
					</div>
					<div class="box">
						<div class="top-bar">
							<h1>Terminologies</h1>
							<!-- button class="btn-create" on:click={showCreateForm}>+ Create Module</button>-->
						</div>

						<div class="grid">
							{#each $terminologies as terminology}
								<button class="card" on:click={() => showTerminology(terminology)}>
									<h2>{terminology.label}</h2>
									<div class="meta"><strong>Language:</strong> {terminology.language}</div>
								</button>
							{/each}
						</div>
					</div>
				{/if}

				{#if $hashStore.view === 'delete-module' && $activeModule}
					<ModuleDeleter
						activeModule={$activeModule}
						on:delete={({ detail }) => handleDelete(detail.id)}
						on:cancel={backToList}
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
			</div>
		</div>
	</div>
{:else}
	<LoginWall />
{/if}

<style>
	.admin-page {
		padding: 2rem 0;
		font-family: 'Inter', sans-serif;
	}

	h1 {
		font-size: 1.75rem;
		font-weight: 700;
		margin: 0;
		padding: 0;
		color: #111827;
	}

	.box {
		margin-bottom: 3rem;
	}

	.top-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.btn-create {
		padding: 0.5em 1em;
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

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1rem;
	}

	.card {
		background: #fff;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		padding: 1rem;
		text-align: left;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		transition:
			box-shadow 0.2s,
			transform 0.2s;
		width: 100%;
	}

	.card:hover {
		box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
		transform: translateY(-1px);
	}

	.card h2 {
		font-size: 1.25rem;
		font-weight: 600;
		color: #1f2937;
		margin-bottom: 0.25rem;
	}

	.card p {
		font-size: 0.95rem;
		color: #4b5563;
		margin-bottom: 0.5rem;
	}

	.card .meta {
		font-size: 0.85rem;
		color: #6b7280;
	}
</style>
