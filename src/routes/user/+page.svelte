<script lang="ts">
	import UserData from "$lib/components/user-data.svelte";
    import { onMount } from 'svelte';
    import { page } from "$app/stores"
    import {
        Input,
        Button,
        Heading,
		Label,
     } from "flowbite-svelte";
    import { Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, Checkbox, TableSearch } from 'flowbite-svelte';

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



<div class="section">
    <div class="container">

        {#if $page.data.session}
        <h1>Welcome, {$page.data.session.user?.name ?? "User"}</h1>
            
        {:else}
            <!-- LOGIN BUTTON -->
        {/if}

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
                    <Input id="usernameInput" style="width: 450px; margin-right: .5em" bind:value={usernameInput} placeholder="Enter a username..." />
                    <div class="explanation">The username may appear around this MOSS instance where you contribute.</div>
                </div>

                <Button color="green" on:click={onChangeUsernameButtonClicked} >Save</Button>
                {/if}
               
            </div>

        </div>
  

    </div>
</div>

