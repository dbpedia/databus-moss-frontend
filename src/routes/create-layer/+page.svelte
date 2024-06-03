<script lang="ts">
    import { MossUtils } from "$lib/utils/moss-utils";
    import Dropdown from "$lib/components/dropdown.svelte";
    import { 
        Input,
        Label,
        Button,
        Select,
		type SelectOptionType,
		TabItem,
     } from "flowbite-svelte";
	import { onMount } from "svelte";

    const layerPlaceholder: string = "%LAYERNAME%";
    const databusResourcePlaceholder: string = "%DATABUSRESOURCE%";
    const buttonName: string = "Create Layer";

    export let data;
    let layerTestName = "simple";
    let resourceTestName = "https://databus.openenergyplatform.org/hu_wu/test_group/";
    let layerName: string = layerTestName;
    let databusResource: string = resourceTestName;
    let toggledDropdown: boolean = false;
    // let layerList: SelectOptionType<string>[] = [];
    let layerList: any[];
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

    let fetched: boolean = false;

    async function listLayers(): Promise<SelectOptionType<string>[]> {
        let list: SelectOptionType<string>[] = [];

        try {
            const data = await MossUtils.fetchLayers();
            list = data.layers.map((item: any) => {
                return {
                    value: item.name,
                    label: item.name,
                };
            })
            console.log("done", list);
        } catch(error) {
            console.error("Error fetching available layers:", error);
        } finally {
            isLoading = false;
        }

        return list;
    } 

    onMount(async () => {
        console.log("loading", isLoading);
        // layerList = await listLayers();
        // selected = layerList[0].value;
        // console.log(selected);
        layerList = data.props.layers;
        isLoading = data.props.isLoading;
        console.log(layerList);
        console.log("loading", isLoading);
    });

</script>

<div class="container">
    <div class="header"><a href="/g">Browse</a></div>
    <h1>Create Layer</h1>
    <div class="drop-down">
        <!-- <Dropdown layerList={layerList} ></Dropdown> -->
        {#if isLoading}
            <p>Loading...</p>
        {:else } 
            {#each layerList as layer }
                <Select items={layerList} bind:value={selected}>
                    <!-- {#each layerList as layer }
                        <option value={layer}>{layer.label}</option>
                    {/each} -->
                </Select>

                <p>{layer.value}</p>
            {/each}
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