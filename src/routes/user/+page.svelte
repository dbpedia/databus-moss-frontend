<script lang="ts">
    import { goto } from "$app/navigation";
	import ButtonGroup from "$lib/components/button-group.svelte";
	import UserData from "$lib/components/user-data.svelte";
    import { MossUtils } from "$lib/utils/moss-utils";
    import {
        Input,
        Label,
        Button,
		Select,
     } from "flowbite-svelte";

    let errorMessage: string = "";

</script>

<div class="container">

    <div class="header">
        <h1>Create User</h1>
        <ButtonGroup/>
    </div>

    <div class="body">
        <UserData></UserData>
    </div>

    {#if errorMessage}
        {errorMessage}
    {/if}
</div>

<style>
    .container {
        align-items: center;
        padding-bottom: 3px;
        padding-top: 3px;
        padding-left: 1em;
        gap: 10px;
        flex-wrap: nowrap;
        margin-top: 20px;
    }

    .header {
        align-items: center;
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        margin-top: 1em;
        margin-bottom: 1em;
    }

    .body {
        display: flex;
        flex-direction: row;
        justify-content: center;
    }

</style>