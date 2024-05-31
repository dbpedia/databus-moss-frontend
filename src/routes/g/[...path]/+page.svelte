<script lang="ts">
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import jsonld from "jsonld";
    import CodeMirror from "$lib/components/code-mirror.svelte";
	import SaveButton from '$lib/components/save-button.svelte';
    import { PUBLIC_MOSS_BASE_URL } from '$env/static/public';
    import { JsonldUtils } from '$lib/utils/jsonld-utils';
    import { MossUris } from '$lib/utils/moss-uris';
    import { MossUtils } from '$lib/utils/moss-utils';

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
        try {
            absolutePath = `/g`;

            if(path != undefined && path.length > 0) {
                absolutePath += `/${path}`;
            }

            let response = await fetch(`${PUBLIC_MOSS_BASE_URL}/g/${path}`);
            data = await response.json();

            if (data.folders) {
                folders = data.folders;
            }

            if (data.files) {
                files = data.files;
            }

            let contentType = response.headers.get("Content-Type");

            if(contentType != "application/json") {
                isDocument = true;
                content = JSON.stringify(data, null, 3);
            } else {
                absolutePath = absolutePath.replaceAll("#", "%23");
            }

            baseURL = `${PUBLIC_MOSS_BASE_URL}/g/${path}`
            isLoading = false;

        } catch(err) {
            console.log(err);
            isLoading = false;
        }
    });

    function getEndpoint(): URL {
        const iri = $page.params.path;
        const [repo] = iri.split("/", 1);
        const path = iri.substring(iri.indexOf("/") + 1);
        const endpointURL = new URL(PUBLIC_MOSS_BASE_URL);

        endpointURL.pathname = "/api/save";
        endpointURL.searchParams.append("repo", repo);
        endpointURL.searchParams.append("path", path);

        return endpointURL;
    }

    export async function postDocument(): Promise<Response> {
        const url = getEndpoint();
        // const data: string = JSON.stringify(content);
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: content,
        })
        return response;
        // if (!response.ok) {
        //     throw new Error(`Error: ${response.statusText}`)
        // }
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

{#if !isLoading}
{#if !isDocument}
<h1>Folder</h1>
<ul>
    <li>
        <a href="{absolutePath}/.." target="_self">..</a>
    </li>
	{#each data.folders as folder }
		<li>
            <a href="{absolutePath}/{folder}" target="_self">{folder}</a>
		</li>
	{/each}
	{#each data.files as file }
		<li>
            <a href="{absolutePath}/{file}" target="_self">{file}</a>
            {absolutePath}
		</li>
	{/each}
</ul>
{/if}
    {#if isDocument}
        <h1>Document</h1>
        <div class="top">
            <div class="left-side">
                <a href="{absolutePath}/.." target="_self">Go Back</a>
            </div>
            <div class="side">
                <button on:click={() => validateLayerHeader(content)}>Validate!</button>
                <SaveButton bind:name={buttonName} on:click={onSaveButtonClicked}/>
                {#if validationErrorMsg}
                    <p class="error-msg">{validationErrorMsg}</p>
                {:else}
                    <p class="valid-msg">Valid Document</p>
                {/if}

            </div>
        </div>
        <div class="bottom">
            <CodeMirror bind:value={content}/>
        </div>
    {/if}
{/if}

<style>
.side {
    float: right;
    padding: 1em;
    width: 35%;
}

.left-side {
    display: flex;
    padding: 1em;
    gap: 40px;
}

.top, .bottom {
    flex: 1;
    display: flex;
    align-items: center;
}

.top {
    justify-content: space-between;
}

.bottom {
    margin-top: 20px;
    padding: 1em;
}

.error-msg {
    color: red;
}

.valid-msg {
    color: green;
}



</style>