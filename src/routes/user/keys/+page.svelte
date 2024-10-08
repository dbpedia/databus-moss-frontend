<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from "$app/stores"
    import {
        Input,
        Button,
     } from "flowbite-svelte";
	import { MossUtils } from "$lib/utils/moss-utils";
	import { env } from '$env/dynamic/public'
    
    let usernameInput: string = "";
    let apiKeyNameInput: string = "";
    let user: any;
    let currentKey: string;
    let currentKeyName: string;


    async function fetchUserData() {
        
        let response = await MossUtils.fetchAuthorized(`${env.PUBLIC_MOSS_BASE_URL}/api/users/get-user`, "GET", undefined);

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

        let uri = `${env.PUBLIC_MOSS_BASE_URL}/api/users/create-apikey?name=${apiKeyNameInput}`;
        let response = await MossUtils.fetchAuthorized(uri, 'POST');

        if(response.ok) {
            let data = await response.json();
            console.log(data);

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
        let uri = `${env.PUBLIC_MOSS_BASE_URL}/api/users/revoke-apikey?name=${keyName}`;
        let response = await MossUtils.fetchAuthorized(uri, 'POST');

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

        {:else}
            <!-- LOGIN BUTTON -->
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

<div>

    <!--

<Heading tag="h4" class="mb-2">Welcome</Heading>
{#if $page.data.session}
    <UserData userName={$page.data.session.user?.name ?? "User"}></UserData>
    <div class="body">
        <Heading tag="h6" class="mb-2">Create new API Key</Heading>
        <div style="mb-4">
            <Label for="usernameInput">
                Username:
                {#if user != undefined}
                    {user.username}
                {/if}
            </Label>
            <div style="items-center space-x-4">
                <Input id="usernameInput" bind:value={usernameInput} placeholder="Enter username..." />
                <Button on:click={onChangeUsernameButtonClicked} color="alternative">Apply</Button>
            </div>
        </div>
        {#if user != undefined}
        <div class="mb-4">
            <Label for="apiKeyNameInput">API Key Name:</Label>
            <div style="flex space-x-4">
                <Input id="apiKeyNameInput" bind:value={apiKeyNameInput} placeholder="Enter API Key name..." />
                <Button on:click={onCreateAPIKeyButtonClicked} color="alternative">Create API Key</Button>
            </div>
        </div>

        <div class=""></div>
        <Table class="table" shadow striped>
            <TableHead>
                {#each rowNames as name}
                    <TableHeadCell>{name}</TableHeadCell>
                {/each}
            </TableHead>
            <TableBody tableBodyClass="divide-y">
                    {#each user.apiKeys as keyName }
                        <TableBodyRow>
                            <TableBodyCell>{keyName}</TableBodyCell>
                            <TableBodyCell>
                                <Button on:click={() => onRevokeAPIKeyButtonClicked(keyName)}
                                    color="alternative">Revoke</Button>
                            </TableBodyCell>
                        </TableBodyRow>
                    {/each}
            </TableBody>
        </Table>
        {/if}
    </div>

{:else}
{/if}
-->

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

