<script lang="ts">
    import type { Indexer } from '$lib/types';
    import { createEventDispatcher } from 'svelte';
	import { JsonldUtils } from '$lib/utils/jsonld-utils';
    import jsonld from 'jsonld';
	import { RdfUris } from '$lib/utils/rdf-uris';
    import { writable } from 'svelte/store';
    import { page } from "$app/stores"

    
    let indexerList : Indexer[] = [];

    for(let item of $page.data.indexers[RdfUris.JSONLD_GRAPH]) {
        indexerList.push({
            id: item[RdfUris.JSONLD_ID]
        });
    }

    let indexers = writable<Indexer[]>(indexerList);

    const dispatch = createEventDispatcher();

    function editLayer(indexer: Indexer) {
        dispatch('edit', indexer);
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
        {#each $indexers as indexer}
            <tr>
                <td>{indexer.id}</td>
                <td>
                    <button on:click={() => editLayer(indexer)}>Edit</button>
                    <button on:click={() => deleteLayer(indexer.id)}>Delete</button>
                </td>
            </tr>
        {/each}
    </tbody>
</table>

<button on:click={() => dispatch('create')}>Create New Indexer</button>

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
