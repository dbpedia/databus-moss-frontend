<script lang="ts">
    import { page } from '$app/stores';
    import jsonld from "jsonld";
    import CodeMirror from "$lib/components/code-mirror.svelte";
    import { PUBLIC_MOSS_BASE_URL } from '$env/static/public';
    import { JsonldUtils } from '$lib/utils/jsonld-utils';
    import { MossUris } from '$lib/utils/moss-uris';
    import FileList from '$lib/components/file-list.svelte';
    import TopBar from '$lib/components/top-bar.svelte';
    import {
            Button,
        } 
            from 'flowbite-svelte';
	import { MossUtils } from '$lib/utils/moss-utils';
    import { A } from 'flowbite-svelte';


    /** @type {import('./$types').PageData} */
	export let data: any;

    let pending = false;
    let buttonName = "Save Document";
    let baseURL: string;
    let validationErrorMsg = "";


    function getEndpoint(): URL {
        
        const currentURI = $page.params.path;
        const [repo] = currentURI.split("/", 1);
        const path = currentURI.substring(currentURI.indexOf("/") + 1);
        const endpointURL = new URL(PUBLIC_MOSS_BASE_URL);

        endpointURL.pathname = "/api/save";
        endpointURL.searchParams.append("repo", repo);
        endpointURL.searchParams.append("path", path);

        return endpointURL;
    }

    export async function postDocument(): Promise<Response> {
        const url = getEndpoint();
        const body = data.content;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: body,
        });

        return response;
    }

    function toggleButton() {
        pending = !pending;
        buttonName = pending? "Save Document" : "Pending...";
    }

    async function onSaveButtonClicked() {
        toggleButton();
        const valid = await validateLayerHeader(data.content);

        if (!valid) {
            return;
        }

        let response = await postDocument();
        console.log(response)
        // if (!response.ok) {
        // }
    }

    async function loadGraphs(content: string) {
        const graph = JSON.parse(content);
        const exp = await jsonld.expand(graph, {base: baseURL});
        const flt = await jsonld.flatten(exp);
        return flt;
    }

    async function validateLayerHeader(content: string): Promise<boolean> {
        const graph = await loadGraphs(content);
        const headerGraph = JsonldUtils.getTypedGraph(graph, MossUris.MOSS_DATABUS_METADATA_LAYER);
        if (!headerGraph) {
            validationErrorMsg = "No layer header!";
            return false;
        }

        const layerName = JsonldUtils.getValue(headerGraph, MossUris.MOSS_LAYER_NAME);
        if (layerName === null) {
            validationErrorMsg = "Layer name not defined!";
            return false;
        }

        const path = $page.params.path;
        const expectedLayerName = MossUtils.uriToName(path);

        if (Array.isArray(layerName)) {
            validationErrorMsg = `Multiple Layers not allowed!`;
            return false;
        } else {
            if (expectedLayerName !==  layerName) {
                validationErrorMsg = `Layer ${expectedLayerName} not found!`;
                return false;
            }
        }
        validationErrorMsg = "";

        return true;
    }

</script>

<div class="container">
    <div class="top-bar-container">
        <TopBar segments={data.props.segments}/>
    </div>
    {#if !data.props.isDocument}
        <div class="list-container">
            {#if data.props.folders?.length}
                <FileList collection={data.props.folders} files={false}></FileList>
            {/if}
            {#if data.props.files?.length}
                <FileList collection={data.props.files}></FileList>
            {/if}
        </div>
    {/if}

    {#if data.props.isDocument}
        <div class="editor-container">
            <h1 id="title">{MossUtils.getTitle($page.params.path)}</h1>
                    <div class="buttons">
                        <A href={"./"}>
                            <Button color="alternative">Go Back</Button>
                        </A>
                        <div class="button-group-right">
                            <div class="button-group-buttons">
                                <Button  on:click={() => validateLayerHeader(data.content)} color="alternative">Validate</Button>
                                <Button on:click={onSaveButtonClicked}>Save Document</Button>
                            </div>
                        </div>
                    </div>
                    <div class="valid-label-container">
                        {#if validationErrorMsg}
                            <p class="error-msg">{validationErrorMsg}</p>
                        {:else}
                            <p class="valid-msg">Valid Document</p>
                        {/if}
                    </div>
                <div class="code-mirror-container">
                    <CodeMirror bind:value={data.content} />
                </div>
        </div>
    {/if}
</div>


<style>

.container {
    /* display: flex; */
    /* flex-direction: column; */
    /* align-items: center; */
    padding-top: 70px;
    width: 100%;
    /* padding-left: 2em; */
    /* background-color: blueviolet; */
    display: inline-block;
}

.top-bar-container {
    /* position: fixed; */
    /* top: 0; */
    /* width: 100%; */
    /* background-color: blueviolet; */
}

.valid-label-container {
    padding-right: 1em;
}

.valid-label-container > p {
    float: right;
}

#title {
    align-items: center;
    text-align: center;
}

.list-container {
    display: flex;
    margin: 50px;
    width: 80%;
    display: flex;
    flex-direction: column;
    margin: 1em 0;

}

.editor-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: right;
    margin: 1em 0;
}


.buttons {
    display: flex;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 0.25em;
    margin-top: 0.25em;
    padding-left: 0.25em;
    padding-right: 0.25em;
}

.button-group-right {
    display: flex;
    gap: 5px;
}

.code-mirror-container {
    background-color: aliceblue;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
}

.error-msg {
    color: red;
}

.valid-msg {
    color: green;
}

</style>