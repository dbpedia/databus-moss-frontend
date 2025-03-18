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
    let indexerForm : Indexer = { id: '', layers: [] };

    let isEditing = false;
    let activeLayerId : string|null = null;
    let activeIndexer : Indexer|null = null;
    let layerToDelete : string|null = null;

    function onCreateLayer() {
        isEditing = false;
        window.location.hash = "layers-create";
    }

    function onEditLayer(event: CustomEvent<Layer>) {
        isEditing = true;
        activeLayerId = event.detail.id;
        window.location.hash = `layers-edit?id=${encodeURIComponent(event.detail.id)}`;
    }

    function onEditIndexer(event: CustomEvent<Indexer>) {
        activeIndexer = event.detail;
        indexerForm = { ...event.detail };
        window.location.hash = `indexers-edit?id=${encodeURIComponent(event.detail.id)}`;
    }

    function onCreateIndexer() {
        indexerForm = { id: '', layers: [] };;
        window.location.hash = "indexers-edit";
    }

    async function sendDeleteRequest() {

        if(activeLayerId == null || activeLayerId !== layerToDelete) {
            cancelLayerForm();
            return;
        }

        let layerName = MossUtils.getResourceNameFromId(activeLayerId);
            const response = await MossUtils.fetchAuthorized(env.PUBLIC_MOSS_BASE_URL + "/api/layers/" + layerName, 'DELETE');

        if (!response.ok) {
            const error = await response.json();
            console.error("Error:", error);
            cancelLayerForm();
            return;
        }

        const layerListResponse = await fetch(`${env.PUBLIC_MOSS_BASE_URL}/api/layers`);
        let layerResponse = await layerListResponse.json();
        layers.set(layerResponse);

        cancelLayerForm();
    }

    async function deleteLayer(event: CustomEvent<string>) {
        layerToDelete = "";
        window.location.hash = "layers-delete";
        activeLayerId = event.detail;
    }


    async function cancelLayerForm() {

        const layerListResponse = await fetch(`${env.PUBLIC_MOSS_BASE_URL}/api/layers`);
        let layerResponse = await layerListResponse.json();
        layers.set(layerResponse);

        activeLayerId = null;
        window.location.hash = "layers";
    }
    
</script>



<div class="section">
    <div class="container">

        {#if $page.data.userData.isAdmin}
        <h1>MOSS Admin Settings</h1>

        <div class="columns">
            <div class="column small sidebar">
                <a class="sidebar-link" class:active={$activeTab.startsWith("layers")} href="#layers">
                    Layers
                </a>
                <a class="sidebar-link" class:active={$activeTab.startsWith("indexers")} href="#indexers">
                    Indexers
                </a>
                <!--a class="sidebar-link" class:active={$activeTab.startsWith("shapes")} href="#shapes">
                    Shapes
                </a>-->
            </div>
            <div class="column settings">
               
                {#if $activeTab === "layers"}
                    <h2>Layers</h2>
                    <LayerTable layerData={$layers} on:edit={onEditLayer} on:delete={deleteLayer} on:create={onCreateLayer} />
                {/if}
                
                {#if $activeTab.startsWith("layers-create")}
                    <LayerForm on:cancel={cancelLayerForm} />
                {/if}

                {#if $activeTab.startsWith("layers-delete")}
                    <form on:submit|preventDefault={sendDeleteRequest}>
                        <p>Delete {activeLayerId} </p>
                        <input type="text" bind:value={layerToDelete} placeholder="Retype layer name..." required />
                        <button type="submit">Delete</button>
                        <button type="button" on:click={cancelLayerForm}>Cancel</button>
                    </form>
                {/if}
                
                {#if $activeTab.startsWith("layers-edit")}
                    <LayerForm on:cancel={cancelLayerForm} />
                {/if}

                {#if $activeTab.startsWith("indexers-edit")}
                    <IndexerForm   />
                {/if}

                {#if $activeTab === "indexers"}
                    <h2>Indexers</h2>
                    <IndexerTable on:edit={onEditIndexer} on:create={onCreateIndexer} />
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
   
    h2 {
        font-size: 1.3em;
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

