<script lang="ts">
    import { goto } from "$app/navigation";
    import { MossUtils } from "$lib/utils/moss-utils";
    import { 
        Input,
        Label,
        Button,
		type SelectOptionType,
		Select,
     } from "flowbite-svelte";

    const layerPlaceholder: string = "%LAYERNAME%";
    const databusResourcePlaceholder: string = "%DATABUSRESOURCE%";
    const buttonName: string = "Create Layer";

    export let data;
    let layerTestName = "simple";
    let resourceTestName = "https://databus.openenergyplatform.org/hu_wu/test_group/";
    let layerName: string = layerTestName;
    let databusResource: string = resourceTestName;
    let layerList: any = data.props.layers;
    let selected: string | null;
    let errorMessage: string = "";


    async function postDocument() {
        // Get the document and see if it exists
        let documentMossPath = MossUtils.getDocumentUri(databusResource, layerName);
        let documentUri = `/g/${documentMossPath}`;

        let getResponse = await fetch(documentUri);

        if(getResponse.status == 200) {
            errorMessage = `Layer already exists. (${documentUri})`;
            return;
        }

        errorMessage = "";
        const saveURL = MossUtils.getEndpoint(documentMossPath);

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

        goto(documentUri);
        return response;
    }

    layerList = layerList.map((layer: string) => {
        return {
            value: layer,
            name: layer,
        }
    })

</script>

<div class="container">
    <h1>Create Layer</h1>
    
    <div class="create-layer">
        <div class="drop-down">
            <Select items={layerList}/>
        </div>
        <Label for="databusResource">Databus Resource: </Label>
        <Input bind:value={databusResource} class="input" placeholder={databusResourcePlaceholder}/>
        <br/>
        <div class="create-layer-button">
            <Button name={buttonName} on:click={postDocument}>{buttonName}</Button>
        </div>
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

    .drop-down {
        margin-bottom: 10px;
        margin: 0 5px;
        width: 90%;
        padding-bottom: 1em;
    }

    .create-layer {
        margin-bottom: 10px;
        width: 90%;
    }

    .create-layer-button {
        margin-bottom: 10px;
        margin-top: 10px;
        margin: 0 5px;
    }

    .header {
        padding-top: 1em;
        padding-bottom: 1em;
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