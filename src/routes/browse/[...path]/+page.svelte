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
	import { env } from '$env/dynamic/public'
	import { RdfUris } from '$lib/utils/rdf-uris';


    /** @type {import('./$types').PageData} */
	export let data: any;

    let buttonName = writable("Save Document");
    let validationErrorMsg = "";
    let displayFeedback = writable(false);
    let displaySave = writable(false);
    let indicatorColor: "green" | "red" | "none" = "none"
    let indicatorVisible = writable(false);
    let feedback : any;
    let errors : any;

    errors = [];

    $: backLink = MossUtils.createListGroupNavigationItems([".."], $page.url.pathname);

    export async function saveDocument(): Promise<Response> {
        
        let layerData : any = $page.data.props.layerData;
        let layerId = layerData[RdfUris.JSONLD_ID];

        let extensionData: any = $page.data.props.extensionData;
        const requestURL = MossUtils.getSaveRequestURL(extensionData.databusResourceURI, layerId);

        // Prune the last newline if it exists
        let content = data.content;
        while (content.endsWith('\n') || content.endsWith('\r')) {
            content = content.slice(0, -1);  // Remove the last character (newline)
        }

        return await MossUtils.fetchAuthorized(env.PUBLIC_MOSS_BASE_URL + requestURL, 'POST', content, data.contentType);
    }
  

    async function onSaveButtonClicked() {

        errors = [];
        feedback.clearMessage();
        // const valid = await validateLayerHeader(data.content);
        indicatorColor = "none";

        /*
        if (!valid) {


            displayFeedback.set(false);
            setTimeout(() => {
                displayFeedback.set(true);
            }, 0);
            return;
        }*/

        displaySave.set(true);

        let response = await saveDocument();
        console.log(response)

        if(response.ok) {
            feedback.showMessage("Document Saved!", true);
        } else {
            let data = await response.json();
            feedback.showMessage("Failed to save document.", false);

            errors.push(data.message);
            errors = [...errors];
        }
        displaySave.set(false);
        /*setTimeout(() => {
            setIndicatorColor(response.ok);
            displaySave.set(false);
        }, 850);*/
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

            <div class="layer-header">
                <table class="table">
                    {#each data.props.headerInfo as info, index}
                    <tr>
                        <td>{info.key}</td>
                        {#if info.type == "uri"}
                            <td><a target="_blank" href="{info.value}">{RdfUris.compact(info.value)}</a></td>
                        {:else}
                            <td>{info.value}</td>
                        {/if}
                    </tr>
                    {/each}
                </table>
            </div>

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
            {#each errors as error}
                <div class="error-box">{error}</div>
            {/each}
            <div class="code-mirror-container">
                <CodeMirror format={null} bind:value={data.content} />
            </div>
        </div>
    {/if}
</div>


<style>

#title {
    align-items: center;
    text-align: center;
}

.error-box {
    padding: 1em 1.5em; 
    background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
      border-radius: 8px;
      margin-bottom: 1em;
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

.table {
    background-color: rgb(249 250 251);
    width: 100%;
}

.table tr:first-child {
    min-width: 200px;
}

.table td:first-child {
    font-weight: 600;
}

.table td {
    padding: 0.5em;
}

.table td a {
    text-decoration: underline;
}

.layer-header {
    margin-bottom: 1em;
}

.buttons {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1em;
}

.btn-size {
    display: flex;
    flex-direction: row;
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