<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { hashStore } from '$lib/stores/hash-navigation';
	import FeedbackMessage from '$lib/components/feedback-message.svelte';
	import RoleForm from './role-form.svelte';
	import RolePermissionsForm from './role-permissions-form.svelte';
	import UserRolesForm from './user-roles-form.svelte';
	import type { MossRole, UserInfo } from '$lib/types';
	import Button from '$lib/components/button.svelte';
	import Input from '$lib/components/input.svelte';
	import { compareRoles, isAdminRole, isNonDeletableRole } from '$lib/utils/auth-utils';

	let roles: MossRole[] = [];
	let users: UserInfo[] = [];
	let feedback: any;
	let userSearch = '';

	let selectedUserRoles: Set<string> = new Set();

	$: filteredUsers = users.filter((user) => {
		const query = userSearch.trim().toLowerCase();
		if (!query) return true;
		return (user.username ?? '').toLowerCase().includes(query);
	});

	$: sortedRoles = [...roles].sort((a, b) => compareRoles(a.name, b.name));

	$: activeRole = $hashStore.params.name
		? roles.find((r) => r.name === $hashStore.params.name) ?? null
		: null;

	$: activeUser = $hashStore.params.username
		? users.find((u) => u.username === $hashStore.params.username) ?? null
		: null;

	async function fetchRoles() {
		const res = await fetch('/roles');
		if (res.ok) {
			roles = await res.json();
		}
	}

	async function fetchUsers() {
		const res = await fetch('/users');
		if (res.ok) {
			users = await res.json();
		} else {
			users = [];
			feedback?.showMessage('Failed to load users.', false);
		}
	}

	function showCreateRole() {
		hashStore.navigate('create-role');
	}

	function editRole(role: MossRole) {
		hashStore.navigate(`edit-role?name=${encodeURIComponent(role.name)}`);
	}

	function editUser(user: UserInfo) {
		if (!user.username) return;
		hashStore.navigate(`edit-user?username=${encodeURIComponent(user.username)}`);
	}

	function backToList() {
		hashStore.navigate('list');
	}

	async function onCreateRole(data: { name: string; tokenRole?: string; permissions: string[] }) {
		const res = await fetch('/roles', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				name: data.name,
				tokenRole: data.tokenRole
			})
		});

		if (!res.ok) {
			feedback.showMessage('Failed to create role.', false);
			return;
		}

		if (data.permissions.length > 0) {
			const permRes = await fetch(`/roles/${encodeURIComponent(data.name)}/permissions`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ permissions: data.permissions })
			});

			if (!permRes.ok) {
				feedback.showMessage('Role created, but failed to set permissions.', false);
				await fetchRoles();
				backToList();
				return;
			}
		}

		await fetchRoles();
		backToList();
		feedback.showMessage('Role created.', true);
	}

	async function onDeleteRole(roleName: string) {
		if (isNonDeletableRole(roleName)) return;
		if (!confirm(`Delete role "${roleName}"?`)) return;

		const res = await fetch(`/roles/${encodeURIComponent(roleName)}`, { method: 'DELETE' });
		if (res.ok) {
			if ($hashStore.params.name === roleName) backToList();
			await fetchRoles();
			feedback.showMessage('Role deleted.', true);
		} else {
			feedback.showMessage('Failed to delete role.', false);
		}
	}

	async function onSaveRole(data: { tokenRole?: string; permissions: string[] }) {
		if (!activeRole) return;

		const roleRes = await fetch(`/roles/${encodeURIComponent(activeRole.name)}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ tokenRole: data.tokenRole })
		});

		if (!roleRes.ok) {
			feedback.showMessage('Failed to save role.', false);
			return;
		}

		if (isAdminRole(activeRole.name)) {
			await fetchRoles();
			backToList();
			feedback.showMessage('Role saved.', true);
			return;
		}

		const permRes = await fetch(`/roles/${encodeURIComponent(activeRole.name)}/permissions`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ permissions: data.permissions })
		});

		if (permRes.ok) {
			await fetchRoles();
			backToList();
			feedback.showMessage('Role saved.', true);
		} else {
			feedback.showMessage('Failed to save permissions.', false);
		}
	}

	async function onSaveUserRoles(data: { roles: string[] }) {
		if (!activeUser?.username) return;

		const res = await fetch(`/users/${encodeURIComponent(activeUser.username)}/roles`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ roles: data.roles })
		});

		if (res.ok) {
			await fetchUsers();
			backToList();
			feedback.showMessage('User roles saved.', true);
		} else if (res.status === 404) {
			feedback.showMessage('User not found.', false);
		} else {
			feedback.showMessage('Failed to save user roles.', false);
		}
	}

	onMount(() => {
		if ($page.data.canWriteRoles) {
			fetchRoles();
		}
		if ($page.data.canReadUsers) {
			fetchUsers();
		}
	});
</script>

{#if $page.data.canReadUsers || $page.data.canWriteRoles}
	<div class="admin-page">
		{#if $hashStore.view === 'list'}
			{#if $page.data.canWriteRoles}
				<div class="box">
					<div class="top-bar">
						<h1>Roles</h1>
						<div class="top-bar-end">
							<FeedbackMessage bind:feedback />
							{#if $page.data.canWriteRoles}
								<Button variant="primary" type="button" on:click={showCreateRole}>+ Create Role</Button>
							{/if}
						</div>
					</div>
					<table class="table">
						<thead>
							<tr>
								<th>Name</th>
								<th>Token Role</th>
								<th class="ellipsis">Permissions</th>
								{#if $page.data.canWriteRoles}
									<th class="actions">Actions</th>
								{/if}
							</tr>
						</thead>
						<tbody>
							{#each sortedRoles as role}
								<tr>
									<td class:protected-role-name={isNonDeletableRole(role.name)}>{role.name}</td>
									<td>{role.tokenRole ?? '—'}</td>
									<td class="ellipsis">{(role.permissions ?? []).join(', ') || '—'}</td>
									{#if $page.data.canWriteRoles}
										<td class="actions">
											<Button variant="table" type="button" on:click={() => editRole(role)}>Edit</Button>
											<Button
												variant="table"
												type="button"
												disabled={isNonDeletableRole(role.name)}
												on:click={() => onDeleteRole(role.name)}
											>
												Delete
											</Button>
										</td>
									{/if}
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}

			{#if $page.data.canReadUsers}
				<div class="box">
					<div class="top-bar">
						<h1>Users</h1>
						{#if !$page.data.canWriteRoles}
							<FeedbackMessage bind:feedback />
						{/if}
					</div>
					<div class="user-search">
						<Input bind:value={userSearch} placeholder="Filter by username..." />
					</div>
					<table class="table">
						<thead>
							<tr>
								<th>Username</th>
								<th class="ellipsis">Roles</th>
								{#if $page.data.canWriteRoles}
									<th class="actions">Actions</th>
								{/if}
							</tr>
						</thead>
						<tbody>
							{#each filteredUsers as user}
								<tr>
									<td>{user.username ?? '—'}</td>
									<td class="ellipsis">{(user.roles ?? []).join(', ') || '—'}</td>
									{#if $page.data.canWriteRoles}
										<td class="actions">
											<Button
												variant="table"
												type="button"
												disabled={!user.username}
												on:click={() => editUser(user)}
											>
												Edit
											</Button>
										</td>
									{/if}
								</tr>
							{:else}
								<tr>
									<td colspan={$page.data.canWriteRoles ? 3 : 2}>
										{users.length === 0 ? 'No users found.' : 'No users match your search.'}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		{/if}

		{#if $hashStore.view === 'create-role' && $page.data.canWriteRoles}
			<div class="form-feedback">
				<FeedbackMessage bind:feedback />
			</div>
			<RoleForm on:cancel={backToList} on:created={(e) => onCreateRole(e.detail)} />
		{/if}

		{#if $hashStore.view === 'edit-role' && activeRole && $page.data.canWriteRoles}
			<div class="form-feedback">
				<FeedbackMessage bind:feedback />
			</div>
			<RolePermissionsForm
				activeRole={activeRole}
				on:cancel={backToList}
				on:saved={(e) => onSaveRole(e.detail)}
			/>
		{/if}

		{#if $hashStore.view === 'edit-user' && activeUser?.username && $page.data.canWriteRoles}
			<div class="form-feedback">
				<FeedbackMessage bind:feedback />
			</div>
			<UserRolesForm
				activeUser={activeUser}
				{roles}
				bind:selectedRoles={selectedUserRoles}
				on:cancel={backToList}
				on:saved={(e) => onSaveUserRoles(e.detail)}
			/>
		{/if}
	</div>
{:else}
	<p>User management access required.</p>
{/if}

<style>
	.admin-page {
		padding-bottom: 1rem;
		font-family: 'Inter', sans-serif;
	}

	h1 {
		font-size: 1.1rem;
		font-weight: 700;
		margin: 0;
		color: #111827;
	}

	.box {
		margin-bottom: 2rem;
	}

	.top-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.form-feedback {
		max-width: 600px;
		margin: 1rem auto 0;
	}

	.box .top-bar {
		margin-bottom: 0.5rem;
	}

	.top-bar-end {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.user-search {
		margin-bottom: 0.75rem;
		max-width: 320px;
	}

	.protected-role-name {
		font-style: italic;
	}
</style>
