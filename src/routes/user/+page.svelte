<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from "$app/stores"
    import {
        Input,
        Button,
     } from "flowbite-svelte";

   

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
        }
    }

    async function onChangeUsernameButtonClicked() {
        let username = usernameInput;
        let uri = '/api/users/set-username?username=' + username;
        let response = await fetchAuthorized(uri, "POST");
        
        if (response.ok) {
            user = {};
            user.username = username;
        }
    }

    async function onRevokeAPIKeyButtonClicked(keyName: string) {
        let uri = '/api/users/revoke-apikey?name=' + keyName;
        let response = await fetchAuthorized(uri, 'POST');

        if(response.ok) {
            let data = await response.json();
            console.log(data);
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

</script>

<div class="container">

{#if $page.data.session}
    <h1>Welcome, {$page.data.session.user?.name ?? "User"}</h1>
    <div>
        <div style="display: flex">
            <Input bind:value={usernameInput} placeholder="Enter username..." />
            <Button on:click={onChangeUsernameButtonClicked} color="alternative">Apply</Button>
        </div>

        {#if user != undefined} 
            <div>USERNAME:</div>
            <div>{user.username}</div>
    

     

            <div style="display: flex">
                <Input bind:value={apiKeyNameInput} placeholder="Enter API Key name..." />
                <Button on:click={onCreateAPIKeyButtonClicked} color="alternative">Create API Key</Button>
            </div>
            <div>
                {#each user.apiKeys as keyName }
                    <div style="display: flex">
                        <div>Key Name: { keyName }</div>
                        
                        <Button on:click={() => onRevokeAPIKeyButtonClicked(keyName)} 
                            color="alternative">Revoke</Button>
                    </div>
                {/each}
            </div>
        {/if}

    </div>

{:else}
    <!-- LOGIN BUTTON -->
{/if}
   
</div>

<style>
    .container {
        margin-left: 10em;
        align-items: center;
        padding-bottom: 3px;
        padding-top: 3px;
        padding-left: 1em;
        gap: 10px;
        flex-wrap: nowrap;
        margin-top: 20px;
    }
    
</style>