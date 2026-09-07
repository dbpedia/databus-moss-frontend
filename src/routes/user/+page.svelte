<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import Button from '$lib/components/button.svelte';
	import Input from '$lib/components/input.svelte';
	import FeedbackMessage from '$lib/components/feedback-message.svelte';
	import Login from '$lib/components/login.svelte';
	import type { UserInfo } from '$lib/types';

	let usernameInput: string = '';
	let user: UserInfo | undefined;
	let sessionInvalid = false;
	let feedback: any;

	async function fetchUserData() {
		let response = await fetch(`/users/me`, {
			method: 'GET'
		});

		if (response.ok) {
			user = await response.json();
			sessionInvalid = !user?.sub;
			usernameInput = user?.username ?? '';
		} else {
			user = {};
			sessionInvalid = response.status === 401;
		}
	}

	async function onChangeUsernameButtonClicked() {
		if (!usernameInput) {
			return;
		}

		let response = await fetch(`/users/me`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username: usernameInput })
		});

		if (response.ok) {
			await fetchUserData();
			feedback.showMessage('Profile saved!', true);
		} else if (response.status === 401) {
			sessionInvalid = true;
			feedback.showMessage('Session expired or invalid. Please sign in again.', false);
		} else {
			feedback.showMessage('Failed to save profile.', false);
		}
	}

	onMount(() => {
		fetchUserData();
	});
</script>

{#if user != undefined && sessionInvalid && !$page.data.userData}
	<p class="setup-notice">
		Your sign-in session is not recognized by this MOSS instance. Sign out and sign in again.
	</p>
	<Login />
{:else if user != undefined}
	{#if !user.username?.trim()}
		<p class="setup-notice">
			Please choose a username to continue using MOSS.
		</p>
	{/if}
	<div class="setting">
		<h2>Username</h2>
		<div class="set-user-form">
			<Input
				id="usernameInput"
				style="width: 450px; margin-right: .5em"
				bind:value={usernameInput}
				placeholder="Enter a username..."
			/>
		</div>
		<div class="explanation">
			The username may appear around this MOSS instance where you contribute.
		</div>
	</div>
	<div class="setting">
		<h2>Roles</h2>
		<div class="set-user-form">
			<Input
				id="rolesInput"
				style="width: 450px"
				value={(user.roles ?? []).join(', ') || '—'}
				readonly
			/>
		</div>
		<div class="explanation">
			Roles can only be assigned by an administrator in the admin settings.
		</div>
	</div>
	<div style="display:flex">
		<Button variant="primary" on:click={onChangeUsernameButtonClicked}>Save Profile</Button>
		<div style="margin-left: 8px"><FeedbackMessage bind:feedback></FeedbackMessage></div>
	</div>
{/if}

<style>
	.set-user-form {
		display: flex;
	}

	.setup-notice {
		color: #92400e;
		background: #fef3c7;
		border: 1px solid #fcd34d;
		border-radius: 0.375rem;
		padding: 0.75rem 1rem;
		margin-bottom: 1rem;
		font-size: 0.875rem;
	}
</style>
