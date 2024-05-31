<script lang="ts">
	import SaveButton from "$lib/components/save-button.svelte";
    import { MossUtils } from "$lib/utils/moss-utils";
    import Dropdown from "$lib/components/dropdown.svelte";

    const layerPlaceholder: string = "%LAYERNAME%";
    const databusResourcePlaceholder: string = "%DATABUSRESOURCE%";
    const buttonName: string = "Create Layer";

    let layerTestName = "simple";
    let resourceTestName = "https://databus.openenergyplatform.org/hu_wu/test_group/";
    let layerName: string = layerTestName;
    let databusResource: string = resourceTestName;
    let toggledDropdown: boolean = false;
    let layerList: string[] = [];


    async function postDocument() {
        const content = `{
            "@context" : "https://raw.githubusercontent.com/dbpedia/databus-moss/dev/devenv/context2.jsonld",
            "@id" : "${databusResourcePlaceholder}",
            "isExtendedBy" :  {
                "@id" : "#layer",
                "@type" : "DatabusMetadataLayer",
                "layerName": "${layerPlaceholder}",
                "created" : "2024-03-01 14:37:32"
            }
        }`

        let documentUri = MossUtils.getDocumentUri(databusResource, layerName);
        const saveURL = MossUtils.getEndpoint(documentUri);

        let body = content
            .replace(layerPlaceholder, layerName)
            .replace(databusResourcePlaceholder, databusResource);
        
        const response = await fetch(saveURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: body,
        });
        return response;
    }
</script>

<div class="container">
    <div class="header"><a href="/g">Browse</a></div>
    <h1>Create Layer</h1>
    <div class="drop-down">
        <Dropdown layerList={layerList} ></Dropdown>
    </div>
    <div class="create-layer">
        <div class="create-layer-button">
            <SaveButton name={buttonName} on:click={postDocument}></SaveButton>
        </div>
        <label for="layerName">Path: </label>
        <input bind:value={layerName} class="input" placeholder={layerPlaceholder}>
        <br/>
        <label for="databusResource">Databus Resource: </label>
        <input bind:value={databusResource} class="input" placeholder={databusResourcePlaceholder}>
    </div>
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

    .drop-down {
        margin-bottom: 10px;
        margin: 0 5px;
        width: 400px;
    }

    .create-layer {
        margin-bottom: 10px;
        width: 400px;
    }

    .create-layer-button {
        margin-bottom: 10px;
        margin-top: 10px;
        margin: 0 5px;
    }

    .header {
        padding: 1em;
        background-color: #eee;
    }

    label {
        margin: 0 5px;
    }

    .input {
        display: flex;
        flex-direction: column;
        margin-top: 20px;
        padding: 2px;
        width: 400px;
        margin: 0 5px;
    }
</style>