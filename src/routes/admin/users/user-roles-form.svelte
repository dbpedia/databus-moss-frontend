<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import type { MossRole, UserInfo } from '$lib/types';
	import Button from '$lib/components/button.svelte';
	import Input from '$lib/components/input.svelte';
	import {
		ALWAYS_ASSIGNED_USER_ROLES,
		isAlwaysAssignedUserRole
	} from '$lib/utils/auth-utils';

	export let activeUser: UserInfo;
	export let roles: MossRole[] = [];
	export let selectedRoles: Set<string> = new Set();

	const dispatch = createEventDispatcher<{
		saved: { roles: string[] };
		cancel: void;
	}>();

	function ensureAlwaysAssignedRoles() {
		for (const roleName of ALWAYS_ASSIGNED_USER_ROLES) {
			selectedRoles.add(roleName);
		}
		selectedRoles = selectedRoles;
	}

	onMount(async () => {
		if (!activeUser.username) return;

		const res = await fetch(`/users/${encodeURIComponent(activeUser.username)}/roles`);
		if (res.ok) {
			const data = await res.json();
			selectedRoles = new Set(data.roles ?? []);
		} else {
			selectedRoles = new Set(activeUser.roles ?? []);
		}

		ensureAlwaysAssignedRoles();
	});

	function toggleRole(roleName: string) {
		if (isAlwaysAssignedUserRole(roleName)) return;
		if (selectedRoles.has(roleName)) {
			selectedRoles.delete(roleName);
		} else {
			selectedRoles.add(roleName);
		}
		selectedRoles = selectedRoles;
	}

	function submitForm() {
		ensureAlwaysAssignedRoles();
		dispatch('saved', { roles: [...selectedRoles] });
	}

	function cancel() {
		dispatch('cancel');
	}
</script>

<div class="form-card">
	<h2>Edit User "{activeUser.username}"</h2>

	<form on:submit|preventDefault={submitForm}>
		<div class="form-group">
			<label for="username">Username</label>
			<Input id="username" type="text" value={activeUser.username ?? ''} readonly />
		</div>

		<div class="form-group">
			<label>Roles</label>
			<div class="permission-grid">
				{#each roles as role}
					<label class="permission-item">
						<input
							type="checkbox"
							checked={selectedRoles.has(role.name)}
							disabled={isAlwaysAssignedUserRole(role.name)}
							on:change={() => toggleRole(role.name)}
						/>
						<span>
							{role.name}
							{#if role.tokenRole}
								<span class="role-hint">({role.tokenRole})</span>
							{/if}
						</span>
					</label>
				{/each}
			</div>
		</div>

		<div class="form-actions">
			<Button variant="primary" type="submit">Save User</Button>
			<Button variant="secondary" type="button" on:click={cancel}>Cancel</Button>
		</div>
	</form>
</div>

<style>
	.form-card {
		background: #fff;
		padding: 2rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		margin: 1rem auto;
		max-width: 600px;
	}

	h2 {
		font-size: 1.5rem;
		margin-bottom: 1rem;
		color: #1f2937;
	}

	.form-group {
		margin-bottom: 1rem;
		display: flex;
		flex-direction: column;
	}

	label {
		margin-bottom: 0.25rem;
		font-weight: 600;
		color: #374151;
	}

	.permission-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: 0.5rem;
	}

	.permission-item {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		font-size: 0.875rem;
		font-weight: 400;
	}

	.permission-item:has(input:disabled) {
		opacity: 0.7;
	}

	.role-hint {
		color: #6b7280;
	}

	.form-actions {
		margin-top: 1.5rem;
		display: flex;
		gap: 0.5rem;
	}
</style>
