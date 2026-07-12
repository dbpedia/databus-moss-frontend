<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '$lib/components/button.svelte';
	import Input from '$lib/components/input.svelte';
	import type { ApiKeyInfo, UserInfo } from '$lib/types';

	let apiKeyNameInput: string = '';
	let user: UserInfo | undefined;
	let currentKey: string;
	let currentKeyName: string;

	async function fetchUserData() {
		let response = await fetch(`/users/me`, {
			method: 'GET'
		});

		if (response.ok) {
			user = await response.json();
		} else {
			user = {};
		}
	}

	async function onCreateAPIKeyButtonClicked() {
		if (apiKeyNameInput == undefined || apiKeyNameInput.length == 0) {
			return;
		}

		let response = await fetch(`/users/me/api-keys`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name: apiKeyNameInput })
		});

		if (response.ok) {
			let data: ApiKeyInfo = await response.json();
			currentKey = data.key;
			currentKeyName = data.name;
			apiKeyNameInput = '';
			await fetchUserData();
		}
	}

	function copyToClipboard(text: string): void {
		navigator.clipboard
			.writeText(text)
			.then(() => {
				console.log('Text copied to clipboard successfully!');
			})
			.catch((err) => {
				console.error('Failed to copy text to clipboard:', err);
			});
	}

	async function onRevokeAPIKeyButtonClicked(keyName: string) {
		let response = await fetch(`/users/me/api-keys/${encodeURIComponent(keyName)}`, {
			method: 'DELETE',
			credentials: 'include'
		});

		if (response.ok) {
			await fetchUserData();
		}
	}

	onMount(() => {
		fetchUserData();
	});
</script>

{#if user != undefined}
	<h2>New API Key</h2>
	<div style="display: flex; width: 100%; margin-bottom: 1em">
		<Input
			id="apiKeyNameInput"
			style="width: 450px; margin-right: .5em"
			bind:value={apiKeyNameInput}
			placeholder="Enter API Key name..."
		/>
		<Button variant="primary" on:click={onCreateAPIKeyButtonClicked}>New API Key</Button>
	</div>

	{#if currentKey != undefined && currentKey.length > 0}
		<div
			style="border: 1px solid #ddd; max-width: 1000px;
                    border-radius: 8px; margin-bottom: .5em"
		>
			<div
				style="padding: 0.5em; background-color: #f3f3f3;border-bottom: 1px solid #ddd;"
			>
				New API Key Created: <b>{currentKeyName}</b>
			</div>
			<div style="display: flex; align-items: center; padding: .5em;">
				<div style="flex: 1">{currentKey}</div>
				<Button variant="primary" on:click={() => copyToClipboard(currentKey)}
					>Copy to Clipboard</Button
				>
			</div>
		</div>
		<div class="warn-box">
			<b>IMPORTANT:</b> This key will only be displayed once. Copy it now and store it somewhere safe.
		</div>
	{/if}

	<h2>Active API Keys</h2>

	{#if user.apiKeys}
		{#if user.apiKeys.length == 0}
			<div style="color: #999; font-style: italic">No active API keys.</div>
		{/if}
		{#each user?.apiKeys as keyName}
			<div
				style="display: flex; align-items: center; border: 1px solid #ddd; width: 500px;
                        border-radius: 8px; padding-left: 1em; margin-bottom: .5em"
			>
				<div style="flex: 1">{keyName}</div>
				<Button variant="danger" on:click={() => onRevokeAPIKeyButtonClicked(keyName)}
					>Revoke</Button
				>
			</div>
		{/each}
	{/if}
{/if}

<style>
	.warn-box {
		padding: 0.5em;
		border-radius: 8px;
		border: 1px solid rgb(201, 169, 72);
		color: rgb(113, 97, 9);
		background-color: rgb(246, 208, 93);
		max-width: 1000px;
	}
</style>
