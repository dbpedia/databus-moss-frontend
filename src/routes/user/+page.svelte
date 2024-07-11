<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from "$app/stores"
    import {
        Input,
        Button,
     } from "flowbite-svelte";
	import { MossUtils } from "$lib/utils/moss-utils";

    let username: string = "";
    let usernameInput: string = "";
    let apiKeyNameInput: string = "";
    let user: any;
    let usernameError = false;
    let apiKeyNameError = false;

    async function fetchUserData() {
        let response = await MossUtils.fetchAuthorized('/api/users/get-user', "GET");

        if (response.ok) {
            user = await response.json();
            usernameInput = user.username;
        } else {
            user = {};
        }
    }

    async function onChangeUsernameButtonClicked() {

        if (!usernameInput) {
            console.log("user name error");
            return;
        }

        username = usernameInput;

        let uri = '/api/users/set-username?username=' + username;
        let response = await MossUtils.fetchAuthorized(uri, "POST");

        if (response.ok) {
            await fetchUserData();
        }
    }

    onMount(() => {
        fetchUserData();
    });


</script>



<div class="section">
    <div class="container">

        {#if $page.data.session}
        <h1>Welcome, {$page.data.session.user?.name ?? "User"}</h1>


        {/if}
            <!-- LOGIN BUTTON

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
            {#if !usernameError}
                <div style="flex space-x-4">
                    <Input id="usernameInput" on:input={() => usernameError = false} bind:value={usernameInput} placeholder="Enter username..." />
                </div>
            {:else}
                <div class="mb-6">
                    <Input id="usernameInput" on:input={() => usernameError = false} color="red" bind:value={usernameInput} placeholder="Faulty Username" />
                    <Helper class="mt-2" color="red">
                        <span class="font-medium">Username must not be empty!</span>
                    </Helper>
                </div>
            {/if}
            <div style="items-center space-x-4">
                <Button on:click={onChangeUsernameButtonClicked} color="alternative">Apply</Button>
            </div>
        </div>
        {#if user != undefined}
        <div class="mb-4">
            <Label for="apiKeyNameInput">API Key Name:</Label>
            {#if !apiKeyNameError}
                <div style="flex space-x-4">
                    <Input id="apiKeyNameInput" on:input={() => apiKeyNameError = false} bind:value={apiKeyNameInput} placeholder="Enter API Key name..." />
                </div>
            {:else}
                <div class="mb-6">
                    <Input id="apiKeyNameInput" on:input={() => apiKeyNameError = false} color="red" bind:value={apiKeyNameInput} placeholder="Faulty API Key Name" />
                    <Helper class="mt-2" color="red">
                        <span class="font-medium">API Key must not be empty!</span>
                    </Helper>
                </div>
            {/if}
            <Button on:click={onCreateAPIKeyButtonClicked} color="alternative">Create API Key</Button>
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
        {/if}-->

        <div class="columns">
            <div class="column small sidebar">
                <a class="sidebar-link active" href="/user">
                    Profile
                </a>
                <a class="sidebar-link" href="/user/keys">
                    Keys
                </a>
            </div>
            <div class="column settings">
                {#if user != undefined}
                <div class="setting">
                    <h2>Username</h2>
                    <div class="set-user-form">
                        <Input id="usernameInput" style="width: 450px; margin-right: .5em" bind:value={usernameInput} placeholder="Enter a username..." />
                       </div>
                    <div class="explanation">The username may appear around this MOSS instance where you contribute.</div>
                </div>

                <Button color="green" on:click={onChangeUsernameButtonClicked} >Save Profile</Button>

                {/if}
                <!--
                <div class="setting">
                    <h2>Current Username</h2>
                    <Input id="currentUser" disabled style="width: 450px; margin-right: .5em" bind:value={username} placeholder="Enter a username..." />
                </div>-->

            </div>

        </div>


    </div>
</div>

<style>
    .set-user-form {
        display: flex;
    }
</style>

