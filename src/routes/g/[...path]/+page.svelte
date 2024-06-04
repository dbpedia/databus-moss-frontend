<script lang="ts">
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
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
	export let data;

    let isDocument = data.props.isDocument;
    let content = data.props.content;
    let isLoading = data.props.isLoading;

    let folders = data.props.folders;
    let files = data.props.files;

    let pending = false;
    let buttonName = "Save Document";
    let baseURL: string;
    let headerPresent: false;
    let validationErrorMsg = "";
    const path = $page.params.path;

    onMount(async () => {
    })

    const currentURI = $page.params.path;


    function getEndpoint(): URL {
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
        const body = content;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: body,
        });
        console.log(response);
        return response;
    }

    function toggleButton() {
        pending = !pending;
        buttonName = pending? "Save Document" : "Pending...";
    }

    async function onSaveButtonClicked() {
        toggleButton();
        const valid = await validateLayerHeader(content);

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
{#if !isLoading}
    {#if !isDocument}
        <div class="list-container">
            <ul>
                {#if folders?.length}
                    <FileList collection={folders} files={false}></FileList>
                {/if}
                {#if files?.length}
                    <FileList collection={files}></FileList>
                {/if}
            </ul>
        </div>
    {/if}

    {#if isDocument}
        <div class="editor-container">
            <h1 id="title">{MossUtils.getTitle(currentURI)}</h1>
                    <div class="buttons">
                        <A href="/g" target="_self">
                            <Button color="alternative">Go Back</Button>
                        </A>
                        <div class="button-group-right">
                            <div class="button-group-buttons">
                                <Button  on:click={() => validateLayerHeader(content)} color="alternative">Validate</Button>
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
                    <CodeMirror bind:value={content} />
                </div>
        </div>
    {/if}
{/if}
</div>


<style>
.container {
    display: flex;
    flex-direction: column;
    /* align-items: center; */
    padding-top: 70px;
    width: 90%;
    padding-left: 2em;
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