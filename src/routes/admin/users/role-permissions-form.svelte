<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import type { MossRole } from '$lib/types';
	import Button from '$lib/components/button.svelte';
	import Input from '$lib/components/input.svelte';
	import PermissionCheckboxes from '$lib/components/permission-checkboxes.svelte';
	import { isAdminRole } from '$lib/utils/auth-utils';

	export let activeRole: MossRole;

	$: adminRole = isAdminRole(activeRole.name);

	const dispatch = createEventDispatcher<{
		saved: { tokenRole?: string; permissions: string[] };
		cancel: void;
	}>();

	let tokenRole = '';
	let permissions: Set<string> = new Set();

	onMount(() => {
		tokenRole = activeRole.tokenRole ?? '';
		permissions = new Set(activeRole.permissions ?? []);
	});

	function submitForm() {
		dispatch('saved', {
			tokenRole: tokenRole.trim() || undefined,
			permissions: [...permissions]
		});
	}

	function cancel() {
		dispatch('cancel');
	}
</script>

<div class="form-card">
	<h2>Edit Role "{activeRole.name}"</h2>

	<form on:submit|preventDefault={submitForm}>
		<div class="form-group">
			<label for="token-role">OIDC Token Role</label>
			<Input
				id="token-role"
				type="text"
				bind:value={tokenRole}
				placeholder="Optional token role mapping"
			/>
		</div>

		<div class="form-group">
			<label>Permissions</label>
			<PermissionCheckboxes bind:selected={permissions} readonly={adminRole} />
		</div>

		<div class="form-actions">
			<Button variant="primary" type="submit">Save Role</Button>
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

	.form-actions {
		margin-top: 1.5rem;
		display: flex;
		gap: 0.5rem;
	}
</style>
