<script lang="ts">
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import jsonld from "jsonld";
    import CodeMirror from "$lib/components/code-mirror.svelte";
	import SaveButton from '$lib/components/save-button.svelte';
    import { PUBLIC_MOSS_BASE_URL } from '$env/static/public';
    import { JsonldUtils } from '$lib/utils/jsonld-utils';
    import { MossUris } from '$lib/utils/moss-uris';
	import CreateFile from '$lib/components/create-file.svelte';
    import FileList from '$lib/components/file-list.svelte';
    import TopBar from '$lib/components/top-bar.svelte';
    import {
            Button,
        } 
            from 'flowbite-svelte';
	import { MossUtils } from '$lib/utils/moss-utils';
    import { A } from 'flowbite-svelte';

    let data : any;
    let content: string;
    let absolutePath : string;
    let pending = false;
    let isLoading = true;
    let isDocument = false;
    let buttonName = "Save Document";
    let baseURL: string;
    let headerPresent: false;
    let validationErrorMsg = "";
    let files: string[] = [];
    let folders: string[] = [];
    const path = $page.params.path;

    onMount(async () => {
    })

    const currentURI = $page.params.path;
    const parentDir = "..";

    onMount(async () => {
        // console.log(data.props);
        // try {
        //     let path = currentURI;

        //     absolutePath = `/g`;

        //     if(path != undefined && path.length > 0) {
        //         absolutePath += `/${path}`;
        //     }

            // let endpoint = `${PUBLIC_MOSS_BASE_URL}/g/${path}`;
            // let response = await fetch(endpoint);
            // data2 = await response.json();
            // folders = data2.folders;
            // if (!folders) {
            //     folders = [];
            // }
            // folders.unshift(parentDir);
            // files = data2.files;

        //     let contentType = response.headers.get("Content-Type");

        //     if(contentType != "application/json") {
        //         isDocument = true;
        //         content = JSON.stringify(data2, null, 3)
        //     }

        //     isLoading = false;

        // } catch(err) {
        //     console.log(err);
        //     isLoading = false;
        // }
    });

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
        const data2: string = JSON.stringify(content);
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: data2,
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

        let response: Promise<Response> = postDocument();
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

                <CreateFile/>
            </ul>
        </div>
    {/if}
{/if}

{#if isDocument}
    <div class="editor-container">
        <h1 id="title">{MossUtils.getTitle(currentURI)}</h1>
                <div class="buttons">
                    <A href="/g" target="_self">
                        <Button color="alternative">Go Back</Button>
                    </A>
                    <div class="button-group-right">
                        <Button on:click={() => alert('Handle "success"')}>I accept</Button>
                        <Button color="alternative">Decline</Button>
                    </div>
                </div>
            <div class="code-mirror-container">
                <CodeMirror bind:value={content} />
            </div>
    </div>
{/if}
</div>


<style>
.container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 70px;
    width: 100%;
}

.top-bar-container {
    position: fixed;
    top: 0;
    width: 100%;
    background-color: blueviolet;
}

#title {
    align-items: center;
    text-align: center;
}

.list-container {
    display: flex;
    align-items: center;
    margin: 50px;
}

.editor-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: right;
    min-height: 100vh;
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
    width: 80%;
}

.error-msg {
    color: red;
}

.valid-msg {
    color: green;
}

</style>