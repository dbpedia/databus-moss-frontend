<script lang="ts">
    import { MossUtils } from "$lib/utils/moss-utils";
    import { Button, Input, Label, A } from "flowbite-svelte";

    let layerName: string;
    let databusResource: string;
    const pathPlaceholder: string = "./path/";
    const filePlaceholder: string = "./resource.jsonld";

    function createFile() {
        const fileExtension = MossUtils.getFileExtension(databusResource);
        if (fileExtension !== "") {
            console.log(`Creating file "${databusResource}" at ${databusResource}`);
            return;
        }
        databusResource += ".jsonld";
        console.log(`Creating file: "${databusResource}", adding the file extension "JSON-LD", at ${layerName}`);
    }

</script>

<div class="container">
    <form>
        <div class="grid gap-6 mb-6 md:grid-cols-2">
            <div class="path-container">
                <Label for="layer-name" class="mb-2">Path:</Label>
                <Input type="text" id="layer-name" placeholder={pathPlaceholder}/>
            </div>
            <div class="databus-resource-container">
                <Label for="databus-resource" class="mb-2">Databus Resource: </Label>
                <Input bind:value={databusResource} id="databus-resource" placeholder={filePlaceholder}/>
                <Button 
                    color="light"
                    class="submit"
                    type="submit"
                    on:click={createFile}>
                {"Annotate!"}
                </Button>
            </div>
        </div>
    </form>
</div>

<style>
    .container {
        display: flex;
        align-items: center;
        padding-left: 1em;
        gap: 10px;
        flex-wrap: nowrap;
        margin-top: 20px;
    }

    .path-container {
        display: flex;
        align-items: center;
        padding-bottom: 3px;
        padding-top: 3px;
        padding-left: 1em;
        gap: 10px;
    }

    .databus-resource-container {
        display: flex;
        align-items: center;
        padding-bottom: 3px;
        padding-top: 3px;
        padding-left: 1em;
        gap: 10px;
    }

</style>