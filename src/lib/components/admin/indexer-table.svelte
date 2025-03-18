<script lang="ts">
    import type { Indexer, Layer } from '$lib/types';
    import { createEventDispatcher, onMount } from 'svelte';
	import { RdfUris } from '$lib/utils/rdf-uris';
    import { writable } from 'svelte/store';
	import { env } from '$env/dynamic/public';

    let indexerStore = writable<Indexer[]>([]);

    onMount(async () => {
        let indexers : Indexer[] = [];
        const indexerListResponse = await fetch(`${env.PUBLIC_MOSS_BASE_URL}/api/indexers`);
        const indexerData = await indexerListResponse.json();
        
        for(let item of indexerData[RdfUris.JSONLD_GRAPH]) {
            indexers.push({
                id: item[RdfUris.JSONLD_ID],
                layers: item.layers ?? [],
            });
        }

        indexerStore.set(indexers);
    });

    const dispatch = createEventDispatcher();

    function editIndexer(indexer: Indexer) {
        dispatch('edit', indexer);
    }

    function createIndexer() {
        dispatch('create');
    }



    function deleteLayer(id: string) {
        
    } 
    

    
</script>

<table>
    <thead>
        <tr>
            <th>Name</th>
            <th>Actions</th>
        </tr>
    </thead>
    <tbody>
        {#each $indexerStore as indexer}
            <tr>
                <td>{indexer.id}</td>
                <td>
                    <button on:click={() => editIndexer(indexer)}>Edit</button>
                    <button on:click={() => deleteLayer(indexer.id)}>Delete</button>
                </td>
            </tr>
        {/each}
    </tbody>
</table>

<button on:click={createIndexer}>Create New Indexer</button>

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
