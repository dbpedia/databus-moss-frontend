<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';
    import type { Indexer, Layer } from '$lib/types';
	import { MossUtils } from '$lib/utils/moss-utils';
	import { env } from '$env/dynamic/public';
	import { writable, type Writable } from 'svelte/store';
	import CodeMirror from '../code-mirror.svelte';

    let isEditing : Writable<boolean> = writable<boolean>(false);
    const dispatch = createEventDispatcher();

    let form: Layer = { 
        id: '', 
        formatMimeType: '', 
        resourceTypes: [],
    };

    let templatePath : string = '';
    let templateInput : string = '';
    
    const availableResourceTypes = ['Type1', 'Type2', 'Type3'];

    
    let selectedResourceType = '';
    let layerNameInput : string = '';

    async function fetchTemplate(templateId : string) {
        
        let uri = `${templateId.replace(`layer:`, `${env.PUBLIC_MOSS_BASE_URL}/api/layers/`)}`;

        const response = await fetch(uri);

        if (!response.ok) {
            const error = await response.json();
            console.error("Error fetching configuration:", error);
            return;
        }

        templateInput = await response.text();
        console.log(templateInput);
        
    }

    async function updateLayer(layer : Layer) {

        if(layer.id == '') {
            layer.id = `layer:${layerNameInput}`;
        }

        let uri = layer.id.replace(`layer:`, `${env.PUBLIC_MOSS_BASE_URL}/api/layers/`);
        let response = await MossUtils.fetchAuthorized(uri, 'PUT', JSON.stringify(layer), "application/json");

        if (!response.ok) {
            const error = await response.json();
            console.error("Error:", error);
            return;
        }

        let templateUri = `${templatePath.replace(`layer:`, `${env.PUBLIC_MOSS_BASE_URL}/api/layers/`)}`;
        response = await MossUtils.fetchAuthorized(templateUri, 'PUT', templateInput, "text/plain");

        if (!response.ok) {
            const error = await response.json();
            console.error("Error:", error);
            return;
        }
    }

    async function submitForm() {
        await updateLayer(form);

        cancelForm();
    }

    function cancelForm() {
        dispatch('cancel');
    }

    onMount(async () => {

        const params = new URLSearchParams(window.location.hash.split('?')[1]);
        const layerId = params.get("id");

        if (layerId) {
            form.id = layerId;
            isEditing.set(true);
        }

        if (layerId) {
            let layerName = MossUtils.getResourceNameFromId(layerId);
            const indexerDataResponse = await fetch(`${env.PUBLIC_MOSS_BASE_URL}/api/layers/${layerName}`);
            const indexerData = await indexerDataResponse.json();

            form.formatMimeType = indexerData.formatMimeType;
            templatePath = indexerData.template;

            fetchTemplate(templatePath);
        }
    });
    

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
    <h2>{$isEditing ? 'Edit Layer' : 'Add Layer'}</h2>
    <form on:submit|preventDefault={submitForm}>
        
        {#if $isEditing}
        <h3>Id</h3>
        <input disabled type="text" bind:value={form.id} placeholder="Layer Name" required />
        {/if}

        {#if !$isEditing}
        <h3>Name</h3>
        <input type="text" bind:value={layerNameInput} placeholder="Layer Name" required />
        {/if}

        <h3>Format Mime Type</h3>
        <input type="text" bind:value={form.formatMimeType} placeholder="Mime Type" required />
        
        
        <h3>Template</h3>
        <CodeMirror format={form.formatMimeType} bind:value={templateInput} />
        
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
            <button type="submit">{$isEditing ? 'Update' : 'Create'}</button>
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


    button {
        padding: .5em 1em;
        background-color:#f4f4f4;
        border: 1px solid #ddd;
        border-radius: 4px;
        margin-right: 5px;
        cursor: pointer;
    }

 
</style>
