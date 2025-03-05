<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { Indexer, Layer } from '$lib/types';
	import { RdfUris } from '$lib/utils/rdf-uris';
	import { page } from '$app/stores';
	import { MossUtils } from '$lib/utils/moss-utils';
	import { env } from '$env/dynamic/public';

    export let form: Layer = { 
        id: '', 
        formatMimeType: '', 
        indexers: [], 
        resourceTypes: [] 
    };

    export let isEditing = false;

    const dispatch = createEventDispatcher();

    // Fixed values for dropdowns
    let availableIndexers : string[] = [];


    for(let item of $page.data.indexers[RdfUris.JSONLD_GRAPH]) {
        availableIndexers.push(item[RdfUris.JSONLD_ID]);
    }
    
    const availableResourceTypes = ['Type1', 'Type2', 'Type3'];

    let selectedIndexer = '';
    let selectedResourceType = '';
    let layerNameInput : string = '';

    async function createLayer(layer : Layer) {

        if(layerNameInput === '') {
            return;
        }

        let uri = `${env.PUBLIC_MOSS_BASE_URL}/api/layers/${layerNameInput}`

        const response = await MossUtils.fetchAuthorized(uri, 'PUT', 
            JSON.stringify(layer), "application/json");

        if (!response.ok) {
            const error = await response.json();
            console.error("Error:", error);
            return;
        }

        return await response.json();
    }

    async function updateLayer(layer : Layer) {
        let uri = layer.id.replace(`layer:`, `${env.PUBLIC_MOSS_BASE_URL}/api/layers/`);
        const response = await MossUtils.fetchAuthorized(uri, 'PUT',
            JSON.stringify(layer), "application/json");

        if (!response.ok) {
            const error = await response.json();
            console.error("Error:", error);
            return;
        }

        return await response.json();
    }

    async function submitForm() {

        if(isEditing) {
            await updateLayer(form);
        } else {
            await createLayer(form);
        }

        cancelForm();
    }

    function cancelForm() {
        dispatch('cancel');
    }

    function addIndexer() {
        if(form.indexers == null) {
            form.indexers = [];
        }
        // Only add if the selected indexer is valid and not already in the list
        if (selectedIndexer && !form.indexers.includes(selectedIndexer)) {
            form.indexers = [...form.indexers, selectedIndexer]; // Create a new array to trigger reactivity
            selectedIndexer = ''; // Reset selection
        }
    }

    function removeIndexer(index: number) {
        form.indexers = form.indexers.filter((_, i) => i !== index); // Create a new array to trigger reactivity
    }

    function addResourceType() {
        if(form.resourceTypes == null) {
            form.resourceTypes = [];
        }
        // Only add if the selected resource type is valid and not already in the list
        if (selectedResourceType && !form.resourceTypes.includes(selectedResourceType)) {
            form.resourceTypes = [...form.resourceTypes, selectedResourceType]; // Create a new array to trigger reactivity
            selectedResourceType = ''; // Reset selection
        }
    }

    function removeResourceType(index: number) {
        form.resourceTypes = form.resourceTypes.filter((_, i) => i !== index); // Create a new array to trigger reactivity
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
        <input type="text" bind:value={layerNameInput} placeholder="Layer Name" required />
        {/if}

        <h3>Format Mime Type</h3>
        <input type="text" bind:value={form.formatMimeType} placeholder="Mime Type" required />
        
        <h3>Indexers</h3>

        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {#each form.indexers ?? [] as indexer, i}
                    <tr>
                        <td>{indexer}</td>
                        <td><button type="button" on:click={() => removeIndexer(i)}>Remove</button></td>
                    </tr>
                {/each}
            </tbody>
        </table>


      
        <div class="indexer-input">
            <select bind:value={selectedIndexer}>
                <option value="" disabled selected>Select an indexer</option>
                {#each availableIndexers as availableIndexer}
                    <option value={availableIndexer}>{availableIndexer}</option>
                {/each}
            </select>
            <button type="button" on:click={addIndexer}>Add Indexer</button>
        </div>

        
        <!--
     
        <h3>Resource Types</h3>

        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {#each form.resourceTypes ?? [] as resourceType, i}
                    <tr>
                        <td>{resourceType}</td>
                        <td><button type="button" on:click={() => removeResourceType(i)}>Remove</button></td>
                    </tr>
                {/each}
            </tbody>
        </table>


        <div class="resource-type-input">
            <select bind:value={selectedResourceType}>
                <option value="" disabled selected>Select a resource type</option>
                {#each availableResourceTypes as resourceType}
                    <option value={resourceType}>{resourceType}</option>
                {/each}
            </select>
            <button type="button" on:click={addResourceType}>Add Resource Type</button>
        </div>-->

        <div style="margin-top: 1em">
            <button type="submit">{isEditing ? 'Update' : 'Create'}</button>
            <button type="button" on:click={cancelForm}>Cancel</button>
        </div>
    </form>
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
