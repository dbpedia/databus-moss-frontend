<script lang="ts">
    import { MossUtils } from "$lib/utils/moss-utils";
    import Dropdown from "$lib/components/dropdown.svelte";
	import { onMount } from "svelte";
    import { FolderDuplicateOutline } from "flowbite-svelte-icons";
    import MenuLink from "$lib/components/menu-link.svelte";
    import { 
        Input,
        Label,
        Button,
        Select,
		type SelectOptionType,
		TabItem,
     } from "flowbite-svelte";

    const layerPlaceholder: string = "%LAYERNAME%";
    const databusResourcePlaceholder: string = "%DATABUSRESOURCE%";
    const buttonName: string = "Create Layer";

    export let data;
    let layerTestName = "simple";
    let resourceTestName = "https://databus.openenergyplatform.org/hu_wu/test_group/";
    let layerName: string = layerTestName;
    let databusResource: string = resourceTestName;
    let toggledDropdown: boolean = false;
    let layerList: SelectOptionType<string>[] = [];
    // let layerList: Promise<SelectOptionType<string>[]>;
    let selected: string | null;
    let isLoading: boolean = true;


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

    onMount(async () => {
        console.log("loading", isLoading);
        layerList = data.props.layers;
        isLoading = data.props.isLoading;
        console.log("loading", isLoading);
    });

</script>

<div class="container">
    <div class="header">
        <MenuLink href="/g" icon={FolderDuplicateOutline}>Browse</MenuLink>
    </div>
    <h1>Create Layer</h1>
    <div class="drop-down">
        <!-- <Dropdown layerList={layerList} ></Dropdown> -->
        {#if isLoading}
            <p>Loading...</p>
        {:else } 
            <Select items={layerList} bind:value={selected}>
            </Select>
        {/if}
    </div>
    <div class="create-layer">
        <div class="create-layer-button">
            <Button name={buttonName} on:click={postDocument}>{buttonName}</Button>
        </div>
        <Label for="layerName">Path: </Label>
        <Input bind:value={layerName} class="input" placeholder={layerPlaceholder}/>
        <br/>
        <Label for="databusResource">Databus Resource: </Label>
        <Input bind:value={databusResource} class="input" placeholder={databusResourcePlaceholder}/>
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