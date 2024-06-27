<script lang="ts">
    import { page } from '$app/stores';
    import { writable } from 'svelte/store';

    // @ts-ignore
    import jsonld from "jsonld";
    import CodeMirror from "$lib/components/code-mirror.svelte";
    import { JsonldUtils } from '$lib/utils/jsonld-utils';
    import { MossUris } from '$lib/utils/moss-uris';
    import FileList from '$lib/components/file-list.svelte';
    import TopBar from '$lib/components/top-bar.svelte';
    import {
        Button,
        Toast,
        Spinner,
    } from 'flowbite-svelte';
	import { MossUtils } from '$lib/utils/moss-utils';
    import { A } from 'flowbite-svelte';
	import { 
        CheckCircleOutline,
        ExclamationCircleOutline,
    } from 'flowbite-svelte-icons';


    /** @type {import('./$types').PageData} */
	export let data: any;

    let buttonName = writable("Save Document");
    let baseURL: string;
    let validationErrorMsg = "";
    let displayFeedback = writable(false);
    let displaySave = writable(false);


export async function postDocument(): Promise<Response> {
        const currentURI = $page.params.path;

        const url = MossUtils.getSavePath(currentURI.replace("/browse/", "/g/"));
        const body = data.content;

        let headers: any= {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };

        if(data.token != undefined) {
            headers['Authorization'] = 'Bearer ' + data.token;
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: body,
        });

        return response;
    }

    async function loadGraphs(content: string) {
        const graph = JSON.parse(content);
        const exp = await jsonld.expand(graph, {base: baseURL});
        const flt = await jsonld.flatten(exp);
        return flt;
    }

    async function validateLayerHeader(content: string): Promise<boolean> {
        let graph;
        try {
            const loadedGraph = await loadGraphs(content);
            graph = loadedGraph;
        } catch (error) {
            validationErrorMsg = `${error}`
            return false;
        }

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

    async function onSaveButtonClicked() {
        const valid = await validateLayerHeader(data.content);

        if (!valid) {
            displayFeedback.set(false);
            setTimeout(() => {
                displayFeedback.set(true);
            }, 0);
            return;
        }

        displaySave.set(true);

        let response = await postDocument();
        console.log(response)

        if (response.ok) {
            buttonName.set("Success");
        }

        displaySave.set(false);


        setTimeout(() => {
            buttonName.set("Save Document");
        }, 350);
    }

    async function onValidButtonClicked(content: string) {
        displayFeedback.set(false);
        setTimeout(() => {
            displayFeedback.set(true);
        }, 0);
        validateLayerHeader(content);
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
                    <div class="valid-label-container">
                        <div class="feedback">
                            {#if $displayFeedback}
                                <Toast dismissable={true} contentClass="flex space-x-4 rtl:space-x-reverse divide-x rtl:divide-x-reverse divide-gray-200 dark:divide-gray-700">
                                    {#if validationErrorMsg}
                                        <ExclamationCircleOutline class="w-5 h-5 text-primary-600 dark:text-primary-500" />
                                    {:else}
                                        <CheckCircleOutline class="w-5 h-5 text-green-600 dark:text-green-500" />
                                    {/if}
                                    <div class="validation ps-4 text-sm font-normal">
                                        {#if validationErrorMsg}
                                            <p class="text-primary-600 dark:text-primary-500">{validationErrorMsg}</p>
                                        {:else}
                                            <p class="text-green-600 dark:text-green-500">Valid Document</p>
                                        {/if}
                                    </div>
                                </Toast>
                            {/if}
                        </div>
                    </div>
                    <div class="buttons">
                        <A href={"./"}>
                            <Button color="alternative">Go Back</Button>
                        </A>
                        <div class="button-group-right">
                            <div class="button-group-buttons">
                                <Button on:click={() => onValidButtonClicked(data.content)} color="alternative">Validate</Button>
                                <Button on:click={onSaveButtonClicked}>
                                    {#if $displaySave}
                                        <Spinner class="me-3" size="4" color="white" />Saving ...
                                    {:else}
                                        {$buttonName}
                                    {/if}
                                </Button>
                            </div>
                        </div>
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
    padding-left: 3em;
    /* padding-left: 2em; */
    /* background-color: blueviolet; */
    display: inline-block;
}

.valid-label-container {
    padding-right: 1em;
}

.feedback {
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