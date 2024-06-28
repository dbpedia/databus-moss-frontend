<script lang="ts">
    import { goto } from "$app/navigation";
	import NewUser from "$lib/components/new-user.svelte";
	import UserData from "$lib/components/user-data.svelte";
    import { MossUtils } from "$lib/utils/moss-utils";
    import {
        Input,
        Label,
        Button,
		Select,
        Popover,
        Heading,
     } from "flowbite-svelte";
    import { Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, Checkbox, TableSearch } from 'flowbite-svelte';
    import { ClipboardCheckOutline } from "flowbite-svelte-icons";

    let errorMessage: string = "";

    const rowNames  = [
        "Keyname",
    ];

    let tabelItems = [
        { keyName: 12345},
        { keyName: 67890},
        { keyName: 54321},
        { keyName: 98765},
    ];

</script>

<div class="container">

    <div class="header">
        <Heading tag="h3" class="mb-2">User</Heading>
    </div>
    <UserData></UserData>
    <div class="body">
        <Heading tag="h3" class="mb-2">Create new API Key</Heading>
        <Table class="table" shadow striped>
            <TableHead>
                {#each rowNames as name}
                    <TableHeadCell>{name}</TableHeadCell>
                {/each}
            </TableHead>
            <TableBody tableBodyClass="divide-y">
                {#each tabelItems as item}
                    <TableBodyRow>
                        <TableBodyCell>{item.keyName}</TableBodyCell>
                        <TableBodyCell>
                                <Button>Revoke</Button>
                        </TableBodyCell>
                    </TableBodyRow>
                {/each}
            </TableBody>
            <NewUser></NewUser>
        </Table>
    </div>

    {#if errorMessage}
        {errorMessage}
    {/if}
</div>

<style>
    .container {
        padding-top: 3px;
        padding-left: 1em;
        padding-right: 1em;
        gap: 10px;
        height: 100vh;
        width: 100%;
        display: flex;
        flex-direction: column;
    }

    .header {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        margin-top: 1em;
        margin-bottom: 1em;
        padding-left: 1em;
        padding-right: 1em;
    }

    .body {
        flex-direction: row;
        justify-content: center;
    }

    .key-input {
        justify-content: center;
        display: flex;
        align-items: center;
    }

    .table {
        width: 100%;
        flex-grow: 1;
    }

</style>