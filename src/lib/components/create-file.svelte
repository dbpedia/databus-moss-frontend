<script lang="ts">

	import SaveButton from "./save-button.svelte";
    import { MossUtils } from "$lib/utils/moss-utils";

    let pathName: string;
    let fileName: string;
    const pathPlaceholder: string = "./path/";
    const filePlaceholder: string = "./resource.jsonld";

    function createFile() {
        const fileExtension = MossUtils.getFileExtension(fileName);
        if (fileExtension !== "") {
            console.log(`Creating file "${fileName}" at ${pathName}`);
            return;
        }
        fileName += ".jsonld";
        console.log(`Creating file: "${fileName}", adding the file extension "JSON-LD", at ${pathName}`);
    }

</script>

<div class="container">
    <SaveButton on:click={createFile} >+</SaveButton>
    <label for="pathName">Path: </label>
    <input bind:value={pathName} placeholder={pathPlaceholder}>
    <label for="fileName">Databus Resource: </label>
    <input bind:value={fileName} placeholder={filePlaceholder}>
</div>

<style>
    .container {
        display: flex;
        align-items: center;
        padding-bottom: 3px;
        padding-top: 3px;
        padding-left: 1em;
        background-color: aliceblue;
        gap: 10px;
        flex-wrap: nowrap;
        margin-top: 20px;
    }

    label {
        margin: 0 5px;
    }

    input {
        width: 220px;
        margin: 0 5px;
    }
</style>