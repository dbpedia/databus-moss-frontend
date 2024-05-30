<script lang="ts">

	import SaveButton from "./save-button.svelte";
    import { MossUtils } from "$lib/utils/moss-utils";
    import { page } from '$app/stores';

    let pathName: string = "custom.repo.org/my/dynamically/added/path/dynamic-layer.jsonld";
    let fileName: string = "/databusResource";
    const pathPlaceholder: string = "./path/";
    const filePlaceholder: string = "./resource.jsonld";

    function createFile() {
        console.log("creating")
        const fileExtension = MossUtils.getFileExtension(fileName);
        if (fileExtension !== "") {
            console.log(`Creating file "${fileName}" at ${pathName}`);
            return;
        }
        fileName += ".jsonld";
        console.log(`Creating file: "${fileName}", adding the file extension "JSON-LD", at ${pathName}`);
        postDocument();

    }

    export async function postDocument(): Promise<Response> {
        const content = `{
            "@context" : "https://raw.githubusercontent.com/dbpedia/databus-moss/dev/devenv/context2.jsonld",
            "@id" : "https://databus.dbpedia.org/lrec2024/linguistics/wordnet/2023#wordnet_lang=en.ttl.gz",
            "isExtendedBy" :  {
                "@id" : "#layer",
                "@type" : "DatabusMetadataLayer",
                "name": "simple",
                "created" : "2024-03-01 14:37:32"
            },
            "subject" : [ "oeo:OEO_00020033" ]
        }`
        // const path = $page.params.path;
        const url = MossUtils.getEndpoint(pathName);
        console.log(url.toString());

        const data: string = JSON.stringify(content);
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: content,
        });
        return response;
    }

</script>

<div class="container">
    <SaveButton on:click={createFile}>+</SaveButton>
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