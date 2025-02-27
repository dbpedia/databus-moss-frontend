<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from "$app/stores"
    import { writable } from "svelte/store";
	import LayerTable from '$lib/components/admin/layer-table.svelte';
	import type { Indexer, Layer } from '$lib/types';
	import { MossUtils } from '$lib/utils/moss-utils';
    import { env } from '$env/dynamic/public'
	import LayerForm from '$lib/components/admin/layer-form.svelte';
    import IndexerTable from '$lib/components/admin/indexer-table.svelte';
	import IndexerForm from '$lib/components/admin/indexer-form.svelte';


    // Store for active tab
    const activeTab = writable("layers");
   
    // Set active tab from URL hash
    onMount(() => {
        const hash = window.location.hash.slice(1); // Remove #
        if (hash) {
            activeTab.set(hash);
        }

        window.addEventListener("hashchange", () => {
            activeTab.set(window.location.hash.slice(1));
        });

    });
    

    let layers = writable($page.data.layers);
    let layerForm : Layer = { id: '', formatMimeType: '', indexers: [], resourceTypes: [] };
    let indexerForm : Indexer = { id: '' };

    let isEditing = false;
    let activeLayer : string|null = null;
    let activeIndexer : Indexer|null = null;
    let layerToDelete : string|null = null;

    function onCreateLayer() {
        isEditing = false;
        layerForm = { id: '', formatMimeType: '', indexers: [], resourceTypes: [] };
        window.location.hash = "layers-create";
    }

    function onEditLayer(event: CustomEvent<Layer>) {
        isEditing = true;
        layerForm = { ...event.detail };
        activeLayer = event.detail.id;
        window.location.hash = "layers-edit";
    }

    function onEditIndexer(event: CustomEvent<Indexer>) {
        activeIndexer = event.detail;
        indexerForm = { ...event.detail };
        window.location.hash = "indexers-edit";
    }

    async function sendDeleteRequest() {

        if(activeLayer == null || activeLayer !== layerToDelete) {
            cancelForm();
            return;
        }

        const response = await MossUtils.fetchAuthorized(env.PUBLIC_MOSS_BASE_URL + "/api/layers/" + activeLayer, 'DELETE');

        if (!response.ok) {
            const error = await response.json();
            console.error("Error:", error);
            cancelForm();
            return;
        }

        const layerListResponse = await fetch(`${env.PUBLIC_MOSS_BASE_URL}/api/layers`);
        let layerResponse = await layerListResponse.json();
        layers.set(layerResponse);

        cancelForm();
    }

    async function deleteLayer(event: CustomEvent<string>) {
        layerToDelete = "";
        window.location.hash = "layers-delete";
        activeLayer = event.detail;
    }

    async function createLayer(layer : Layer) {
        const response = await MossUtils.fetchAuthorized(env.PUBLIC_MOSS_BASE_URL + "/api/layers", 'POST', 
            JSON.stringify(layer), "application/json");

        if (!response.ok) {
            const error = await response.json();
            console.error("Error:", error);
            return;
        }

        return await response.json();
    }

    async function updateLayer(layer : Layer) {
        const response = await MossUtils.fetchAuthorized(env.PUBLIC_MOSS_BASE_URL + "/api/layers/" + activeLayer, 'PUT',
            JSON.stringify(layer), "application/json");

        if (!response.ok) {
            const error = await response.json();
            console.error("Error:", error);
            return;
        }

        return await response.json();
    }

    async function submitForm(event: CustomEvent<Layer>) {
        try {

            if(activeLayer == null) {
                await createLayer(event.detail);
            } else {
                await updateLayer(event.detail);
            }

            const layerListResponse = await fetch(`${env.PUBLIC_MOSS_BASE_URL}/api/layers`);
            let layerResponse = await layerListResponse.json();

            console.log(layerResponse);
            
            layers.set(layerResponse);

        } catch (error) {
            console.error("Request failed:", error);
        }

       

        cancelForm();
    }

    async function cancelForm() {

        const layerListResponse = await fetch(`${env.PUBLIC_MOSS_BASE_URL}/api/layers`);
        let layerResponse = await layerListResponse.json();
        layers.set(layerResponse);

        activeLayer = null;
        window.location.hash = "layers";
    }
    
</script>



<div class="section">
    <div class="container">

        {#if $page.data.isAdmin}
        <h1>MOSS Admin Settings</h1>

        <div class="columns">
            <div class="column small sidebar">
                <a class="sidebar-link" class:active={$activeTab.startsWith("layers")} href="#layers">
                    Layers
                </a>
                <a class="sidebar-link" class:active={$activeTab.startsWith("indexers")} href="#indexers">
                    Indexers
                </a>
                <a class="sidebar-link" class:active={$activeTab.startsWith("shapes")} href="#shapes">
                    Shapes
                </a>
            </div>
            <div class="column settings">
               
                {#if $activeTab === "layers"}
                    <h2>Layers</h2>
                    <LayerTable layerData={$layers} on:edit={onEditLayer} on:delete={deleteLayer} on:create={onCreateLayer} />
                {/if}
                
                {#if $activeTab === "layers-create"}
                    <LayerForm form={layerForm} {isEditing} on:cancel={cancelForm} />
                {/if}

                {#if $activeTab === "layers-delete"}
                    <form on:submit|preventDefault={sendDeleteRequest}>
                        <p>Delete {activeLayer} </p>
                        <input type="text" bind:value={layerToDelete} placeholder="Retype layer name..." required />
                        <button type="submit">Delete</button>
                        <button type="button" on:click={cancelForm}>Cancel</button>
                    </form>
                {/if}
                
                {#if $activeTab === "layers-edit"}
                    <LayerForm form={layerForm} {isEditing} on:submit={submitForm} on:cancel={cancelForm} />
                {/if}

                {#if $activeTab === "indexers"}
                    <h2>Indexers</h2>
                    <IndexerTable on:edit={onEditIndexer} />
                {/if}

                
                {#if $activeTab === "indexers-edit"}
                    <IndexerForm form={layerForm} {isEditing}  />
                {/if}
                <!--
                <div class="setting">
                    <h2>Current Username</h2>
                    <Input id="currentUser" disabled style="width: 450px; margin-right: .5em" bind:value={username} placeholder="Enter a username..." />
                </div>-->

            </div>

        </div>


        {/if}
    </div>
</div>

<style>
    .set-user-form {
        display: flex;
    }

    h2 {
        font-size: 1.3em;
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
        margin-right: 2px;
        cursor: pointer;
    }
</style>

