<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { Input, Button } from 'flowbite-svelte';
	import { env } from '$env/dynamic/public';
	import FeedbackMessage from '$lib/components/feedback-message.svelte';

	let username: string = '';
	let usernameInput: string = '';
	let user: any;
	let feedback: any;

	async function fetchUserData() {
		let response = await fetch(`/api/v1/users/get-user`, {
			method: 'GET'
		});

		if (response.ok) {
			user = await response.json();
			usernameInput = user.username;
		} else {
			user = {};
		}
	}

	async function onChangeUsernameButtonClicked() {
		if (!usernameInput) {
			console.log('user name error');
			return;
		}

		username = usernameInput;

		let uri = `/api/v1/users/set-username?username=${username}`;
		let response = await fetch(uri, {
			method: 'POST'
		});

		if (response.ok) {
			await fetchUserData();
			feedback.showMessage('Profile saved!', true);
		} else {
			feedback.showMessage('Failed to save profile.', false);
		}
	}

	onMount(() => {
		fetchUserData();
	});
</script>

<div class="section">
	<div class="container">
		{#if $page.data.session}
			<h1>Welcome, {$page.data.session.user?.name ?? 'User'}</h1>
		{/if}

		<div class="columns">
			<div class="column small sidebar">
				<a class="sidebar-link active" href="/user"> Profile </a>
				<a class="sidebar-link" href="/user/keys"> Keys </a>
			</div>
			<div class="column settings">
				{#if user != undefined}
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
					<div style="display:flex">
						<Button color="green" on:click={onChangeUsernameButtonClicked}>Save Profile</Button>
						<div style="margin-left: 8px"><FeedbackMessage bind:feedback></FeedbackMessage></div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	.set-user-form {
		display: flex;
	}
</style>
