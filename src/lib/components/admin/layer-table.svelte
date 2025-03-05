<script lang="ts">
    import type { Layer } from '$lib/types';
    import { createEventDispatcher } from 'svelte';
	import { JsonldUtils } from '$lib/utils/jsonld-utils';
    import jsonld from 'jsonld';
	import { RdfUris } from '$lib/utils/rdf-uris';
    import { writable } from 'svelte/store';

    export let layerData: any;
    let layers = writable<Layer[]>([]);

    $: if (layerData) {
        parseLayers(layerData); // Call the async function to update layers
    }

    const dispatch = createEventDispatcher();

    function editLayer(layer: Layer) {
        dispatch('edit', layer);
    }

    function deleteLayer(id: string) {
        dispatch('delete', id);
    }

    async function parseLayers(layerData : any) {
        try {

            let items = layerData[RdfUris.JSONLD_GRAPH];
            var layerList : Layer[] = [];

            for(let item of items) {
                layerList.push({
                    id: item[RdfUris.JSONLD_ID],
                    formatMimeType: item.formatMimeType,
                    indexers: item.indexers ?? [],
                    resourceTypes: item.resourceTypes ?? []
                });
            }

            layers.set(layerList);
        } catch (error) {
            console.error("Error loading layers:", error);
        }
    }
    
</script>

<table>
    <thead>
        <tr>
            <th>Name</th>
            <th>Mime Type</th>
            <th>Actions</th>
        </tr>
    </thead>
    <tbody>
        {#each $layers as layer}
            <tr>
                <td>{layer.id}</td>
                <td>{layer.formatMimeType}</td>
                <td>
                    <button on:click={() => editLayer(layer)}>Edit</button>
                    <button on:click={() => deleteLayer(layer.id)}>Delete</button>
                </td>
            </tr>
        {/each}
    </tbody>
</table>

<button on:click={() => dispatch('create')}>Create New Layer</button>

<style>
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
