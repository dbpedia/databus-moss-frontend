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
		Indicator,
    } from 'flowbite-svelte';
	import { MossUtils } from '$lib/utils/moss-utils';
    import { A } from 'flowbite-svelte';
	import {
        CheckCircleOutline,
        ExclamationCircleOutline,
    } from 'flowbite-svelte-icons';
	import FeedbackMessage from '$lib/components/feedback-message.svelte';


    /** @type {import('./$types').PageData} */
	export let data: any;

    let buttonName = writable("Save Document");
    let baseURL: string;
    let validationErrorMsg = "";
    let displayFeedback = writable(false);
    let displaySave = writable(false);
    let indicatorColor: "green" | "red" | "none" = "none"
    let indicatorVisible = writable(false);
    let feedback : any;

    $: backLink = MossUtils.createListGroupNavigationItems([".."], $page.url.pathname);

export async function postDocument(): Promise<Response> {
        const currentURI = $page.params.path;
        const layerName = MossUtils.getLayerName(currentURI);
        const resourceURI = MossUtils.getResourceURI(currentURI);
        const requestURL = MossUtils.getSaveRequestURL(resourceURI, layerName);
        return await MossUtils.fetchAuthorized(requestURL, 'POST', data.content);
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

    function setIndicatorColor(responeOk: boolean) {
        indicatorVisible.set(true);
        if (responeOk) {
            indicatorColor = "green";
            return;
        }
        indicatorColor = "red";
    }

    async function onSaveButtonClicked() {

        feedback.clearMessage();
        const valid = await validateLayerHeader(data.content);
        indicatorColor = "none";

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


        feedback.showMessage("Document Saved!", true);
        displaySave.set(false);
        /*setTimeout(() => {
            setIndicatorColor(response.ok);
            displaySave.set(false);
        }, 850);*/
    }

    async function onValidButtonClicked(content: string) {
        feedback.clearMessage();
        // setTimeout(() => {
        //    displayFeedback.set(true);
        //}, 0);
        let result = await validateLayerHeader(content);

        if(result) {
            feedback.showMessage("Valid MOSS Document!", true);
        }
        else {
            feedback.showMessage(validationErrorMsg, false);
        }
    }

</script>

<div class="container">
    <div class="top-bar-container">
        <TopBar segments={data.props.segments}/>
    </div>

    {#if !data.props.isDocument}
        <div class="list-container">
            <FileList collection={backLink} files={false}></FileList>
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
                    <div class="btn-size">
                        <div class="valid-label-container">
                            <div class="feedback">
                                {#if $displayFeedback}
                                    <Toast class="validation" dismissable={true} divClass="w-full max-w-xs p-2 text-gray-500 bg-white shadow dark:text-gray-400 dark:bg-gray-800 gap-3" contentClass="flex space-x-4 divide-x divide-gray-200 dark:divide-gray-700">
                                        {#if validationErrorMsg}
                                            <ExclamationCircleOutline class="w-5 h-5 text-primary-600 dark:text-primary-500" />
                                        {:else}
                                            <CheckCircleOutline class="w-5 h-5 text-green-600 dark:text-green-500" />
                                        {/if}
                                        <div class="ps-2 text-sm font-normal">
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
                        <FeedbackMessage bind:feedback={feedback}></FeedbackMessage>
                        <Button color="alternative" size="md" class="button-group-size" on:click={() => onValidButtonClicked(data.content)}>
                            Validate
                        </Button>
                        <Button color="alternative" size="md" class="button-group-size relative" on:click={onSaveButtonClicked} on:mouseenter={() => indicatorVisible.set(false)}>
                            {#if $displaySave}
                                <Spinner class="me-3" size="4" color="white" />
                            {:else}
                                {#if $indicatorVisible}
                                    <Indicator color={indicatorColor} size="lg" placement="top-right"/>
                                {/if}
                            {/if}
                            {$buttonName}
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

#title {
    align-items: center;
    text-align: center;
}

.list-container {
    display: flex;
    flex-direction: column;
    width: 100%;
}

.top-bar-container {
    width: 100%;
    padding-bottom: .5em;
}

.editor-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: right;
}

.buttons {
    display: flex;
    justify-content: space-between;
}

.btn-size {
    display: flex;
    flex-direction: row;
    padding: 1rem;
    gap: 5px;
    align-items: center;
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

</style>