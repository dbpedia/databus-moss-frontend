<script lang="ts">
    import { goto } from "$app/navigation";
	import UserData from "$lib/components/user-data.svelte";
    import { MossUtils } from "$lib/utils/moss-utils";
    import { onMount } from 'svelte';
    import { page } from "$app/stores"
    import {
        Input,
        Button,
		Select,
        Popover,
        Heading,
		Label,
     } from "flowbite-svelte";
    import { Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, Checkbox, TableSearch } from 'flowbite-svelte';
    import { ClipboardCheckOutline } from "flowbite-svelte-icons";

    let usernameInput: string = "";
    let apiKeyNameInput: string = "";
    let user: any;

    async function fetchUserData() {
        let response = await fetchAuthorized('/api/users/get-user', "GET");

        if (response.ok) {
            user = await response.json();
            usernameInput = user.username;
        } else {
            user = null;
        }
    }

    async function onCreateAPIKeyButtonClicked() {
        let uri = '/api/users/create-apikey?name=' + apiKeyNameInput;
        let response = await fetchAuthorized(uri, 'POST');

        if(response.ok) {
            let data = await response.json();
            console.log(data);

            await fetchUserData();
        }
    }

    async function onChangeUsernameButtonClicked() {
        let username = usernameInput;
        let uri = '/api/users/set-username?username=' + username;
        let response = await fetchAuthorized(uri, "POST");

        if (response.ok) {
            await fetchUserData();
        }
    }

    async function onRevokeAPIKeyButtonClicked(keyName: string) {
        let uri = '/api/users/revoke-apikey?name=' + keyName;
        let response = await fetchAuthorized(uri, 'POST');

        if(response.ok) {
            await fetchUserData();
        }
    }

    async function fetchAuthorized(uri: string, method: string) : Promise<Response> {
        let session = $page.data.session as any;

        if (!session || !session.accessToken) {
            return Response.error();
        }

        let headers: any= {
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + session.accessToken
        };

        return fetch(uri, {
            method: method,
            headers: headers
        });
    }


    onMount(() => {
        fetchUserData();
    });

    const rowNames  = [
        "API Keys",
    ];

</script>

<div class="container">

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
    <!-- LOGIN BUTTON -->
{/if}

</div>

<style>
    .container {
        margin-left: 10em;
        padding-bottom: 3px;
        padding-top: 3px;
        padding-left: 1em;
        padding-right: 1em;
        gap: 10px;
        height: 100vh;
        width: 100%;
        display: flex;
        flex-direction: column;
    }

    .body {
        flex-direction: row;
        justify-content: center;
    }

</style>