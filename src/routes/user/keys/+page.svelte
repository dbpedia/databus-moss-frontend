<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from "$app/stores"
    import {
        Input,
        Button,
     } from "flowbite-svelte";
	import { env } from '$env/dynamic/public'
    
    let usernameInput: string = "";
    let apiKeyNameInput: string = "";
    let user: any;
    let currentKey: string;
    let currentKeyName: string;

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

    async function onCreateAPIKeyButtonClicked() {
        if(apiKeyNameInput == undefined || apiKeyNameInput.length == 0) {
            return;
        }

        let uri = `/api/v1/users/create-apikey?name=${apiKeyNameInput}`;
        let response = await fetch(uri, {
            method: 'POST'
        });

        if(response.ok) {
            let data = await response.json();
            currentKey = data.key;
            currentKeyName = data.name;
            await fetchUserData();
        }
    }

    function copyToClipboard(text: string): void {
        navigator.clipboard.writeText(text).then(() => {
            console.log('Text copied to clipboard successfully!');
        }).catch((err) => {
            console.error('Failed to copy text to clipboard:', err);
        });
    }

    async function onRevokeAPIKeyButtonClicked(keyName: string) {
        let uri = `/api/v1/users/revoke-apikey?name=${keyName}`;
        let response = await fetch(uri, {
            method: 'POST',
            credentials: 'include'
        });

        if(response.ok) {
            await fetchUserData();
        }
    }

    onMount(() => {
        fetchUserData();
    });

    const rowNames  = [
        "API Keys",
    ];
</script>

<div class="section">
    <div class="container">

        {#if $page.data.session}
        <h1>Welcome, {$page.data.session.user?.name ?? "User"}</h1>
        {/if}

        <div class="columns">
            <div class="column small sidebar">
                <a class="sidebar-link" href="/user">
                    Profile
                </a>
                <a class="sidebar-link active" href="/user/keys">
                    Keys
                </a>
            </div>
            <div class="column">
                {#if user != undefined}

                <h2>New API Key</h2>
                <div style="display: flex; width: 100%; margin-bottom: 1em">
                    <Input id="usernameInput" style="width: 450px; margin-right: .5em" bind:value={apiKeyNameInput} placeholder="Enter API Key name..." />
                    <Button color="green" on:click={onCreateAPIKeyButtonClicked} >New API Key</Button>
                </div>

                {#if currentKey != undefined && currentKey.length > 0}
                <div style="border: 1px solid #ddd; max-width: 1000px;
                    border-radius: 8px; margin-bottom: .5em">
                    <div style="padding: 0.5em; background-color: #f3f3f3;border-bottom: 1px solid #ddd;">New API Key Created: <b>{ currentKeyName }</b></div>
                    <div style="display: flex; align-items: center; padding: .5em;">
                        <div style="flex: 1">{ currentKey }</div>
                        <Button color="green" on:click={() => copyToClipboard(currentKey)} >Copy to Clipboard</Button>
                    </div>
                </div>
                <div class="warn-box"><b>IMPORTANT:</b> This key will only be displayed once. Copy it now and store it somewhere safe.</div>
                {/if}

                <h2>Active API Keys</h2>

                {#if user.apiKeys }
                    {#if user.apiKeys.length == 0}
                        <div style="color: #999; font-style: italic">No active API keys.</div>
                    {/if}
                    {#each user?.apiKeys as keyName }
                    <div style="display: flex; align-items: center; border: 1px solid #ddd; width: 500px;
                        border-radius: 8px; padding-left: 1em; margin-bottom: .5em">
                        <div style="flex: 1">{keyName}</div>
                        <Button on:click={() => onRevokeAPIKeyButtonClicked(keyName)}
                            color="red">Revoke</Button>
                    </div>
                    {/each}
                {/if}
                {/if}
            </div>
        </div>
    </div>
</div>

<style>
    .warn-box {
        padding: .5em;
        border-radius: 8px;
        border: 1px solid rgb(201, 169, 72);
        color: rgb(113, 97, 9);
        background-color: rgb(246, 208, 93);
        max-width: 1000px
    }
</style>
