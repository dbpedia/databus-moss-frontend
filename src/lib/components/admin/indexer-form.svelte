<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { Indexer, Layer } from '$lib/types';
	import { RdfUris } from '$lib/utils/rdf-uris';
	import { page } from '$app/stores';
	import { MossUtils } from '$lib/utils/moss-utils';
	import { env } from '$env/dynamic/public';
	import CodeMirror from '../code-mirror.svelte';

    export let form: Indexer = { 
        id: '', 
    };

    let configInput : string = '';
    let indexerNameInput : string = '';

    export let isEditing = false;

    const dispatch = createEventDispatcher();

   
    
    const availableResourceTypes = ['Type1', 'Type2', 'Type3'];

    let selectedIndexer = '';
    let selectedResourceType = '';

    async function createIndexer(indexer : Indexer) {

        if(indexerNameInput === '') {
            return;
        }

        let uri = `${env.PUBLIC_MOSS_BASE_URL}/api/layers/${indexerNameInput}`

        const response = await MossUtils.fetchAuthorized(uri, 'PUT', 
            JSON.stringify(indexer), "application/json");

        if (!response.ok) {
            const error = await response.json();
            console.error("Error:", error);
            return;
        }

        return await response.json();
    }

    async function updateIndexer(indexer : Indexer) {
        let uri = indexer.id.replace(`layer:`, `${env.PUBLIC_MOSS_BASE_URL}/api/layers/`);
        const response = await MossUtils.fetchAuthorized(uri, 'PUT',
            JSON.stringify(indexer), "application/json");

        if (!response.ok) {
            const error = await response.json();
            console.error("Error:", error);
            return;
        }

        return await response.json();
    }

    async function submitForm() {

        if(isEditing) {
            await updateIndexer(form);
        } else {
            await createIndexer(form);
        }

        cancelForm();
    }

    function cancelForm() {
        dispatch('cancel');
    }
   
</script>

<div>
    <h2>{isEditing ? 'Edit Layer' : 'Add Layer'}</h2>
    <form on:submit|preventDefault={submitForm}>
        
        {#if isEditing}
        <h3>Id</h3>
        <input disabled type="text" bind:value={form.id} placeholder="Layer Name" required />
        {/if}

        {#if !isEditing}
        <h3>Name</h3>
        <input type="text" bind:value={indexerNameInput} placeholder="Layer Name" required />
        {/if}

        <CodeMirror format='yaml' bind:value={configInput} />
</div>

<style>

    input:disabled {
        background-color: #f0f0f0; /* Light gray background */
        color: #545454; /* Dimmed text color */
        cursor: not-allowed; /* Show a 'not-allowed' cursor */
        border: 1px solid #ccc; /* Slightly visible border */
        opacity: 0.6; /* Reduce opacity for a disabled effect */
    }

    h2 {
        font-size: 1.3em;
    }

    h3 {
        font-size: 1em;
        font-weight: 500;
        margin-top: 1em;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 1em;
    }

    th, td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
    }

    th {
        background-color: #f4f4f4;
    }

    button {
        padding: .5em 1em;
        background-color:#f4f4f4;
        border: 1px solid #ddd;
        border-radius: 4px;
        margin-right: 5px;
        cursor: pointer;
    }

 
    select {
        margin-right: 0.5em;
    }
</style>
