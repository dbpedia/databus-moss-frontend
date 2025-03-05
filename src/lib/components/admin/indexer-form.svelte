<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';
    import type { Indexer, Layer } from '$lib/types';
	import { MossUtils } from '$lib/utils/moss-utils';
	import { env } from '$env/dynamic/public';
	import CodeMirror from '../code-mirror.svelte';
    import yaml from 'js-yaml';
    import { writable } from 'svelte/store';

    export let form: Indexer = { 
        id: '', 
    };

    
    let testResultStore = writable<any[]>([]);

    let configInput : string = '';
    let indexerNameInput : string = '';
    let testEntryURI : string = '';

    let isEditing = form.id !== '';

    async function fetchConfiguration(id : string) {
        if (!id) return;

        let uri = `${id.replace(`indexer:`, `${env.PUBLIC_MOSS_BASE_URL}/api/indexers/`)}/config.yml`;
        const response = await fetch(uri);

        if (!response.ok) {
            const error = await response.json();
            console.error("Error fetching configuration:", error);
            return;
        }

        configInput = await response.text();
    }

    onMount(() => {
        if (isEditing) {
            fetchConfiguration(form.id);
        }
    });


    const dispatch = createEventDispatcher();

    async function executeQuery(endpoint: string, field: any) : Promise<any[]> {

        let result : any[] = [];

        try {

            let query = field.query.trim();
            let modifiedQuery = query.replace('#VALUES#', `VALUES ?${field.documentVariable} { <${testEntryURI}> }`);

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/sparql-query',
                    'Accept': 'application/json'
                },
                body: modifiedQuery
            });
            
            if (!response.ok) {
                throw new Error(`SPARQL query failed: ${response.statusText}`);
            }
            
            const data = await response.json();

            for(var binding of data.results.bindings) {

                result.push({
                    document: binding[field.documentVariable].value,
                    value: binding[field.fieldName].value
                });
            }

        } catch (error) {
            console.error("Error executing SPARQL query:", error);
        }

        return result;
    }

    async function runTest() {

        let sparqlEndpointUrl = `${env.PUBLIC_MOSS_BASE_URL}/sparql/`;
        let results = [];

        try {
            const config = yaml.load(configInput) as any;

            if(config == null || config.indexFields == null) {
                return;
            }

            for(var field of config.indexFields) {
                if(field == null || field.query == null) {
                    continue;
                }

                let bindings = await executeQuery(sparqlEndpointUrl, field);

                for(let binding of bindings) {
                    results.push(binding);
                }
             
            }
        } catch (error) {
            console.error("Error parsing YAML:", error);
        }

        console.log(results);
        
        testResultStore.set(results);
    }

   
    async function createIndexer(indexer : Indexer) {

        if(indexerNameInput === '') {
            return;
        }

        let uri = `${env.PUBLIC_MOSS_BASE_URL}/api/indexers/${indexerNameInput}`
        let response = await MossUtils.fetchAuthorized(uri, 'PUT', JSON.stringify(indexer), "application/json");

        if (!response.ok) {
            const error = await response.json();
            console.error("Error:", error);
            return;
        }

        uri = `${env.PUBLIC_MOSS_BASE_URL}/api/indexers/${indexerNameInput}/config.yml`
        response = await MossUtils.fetchAuthorized(uri, 'PUT', configInput, "text/plain");

        if (!response.ok) {
            const error = await response.json();
            console.error("Error:", error);
            return;
        }
    }

    async function updateIndexer(indexer : Indexer) {
        let uri = indexer.id.replace(`indexer:`, `${env.PUBLIC_MOSS_BASE_URL}/api/indexers/`);
        let response = await MossUtils.fetchAuthorized(uri, 'PUT', JSON.stringify(indexer), "application/json");

        if (!response.ok) {
            const error = await response.json();
            console.error("Error:", error);
            return;
        }

        response = await MossUtils.fetchAuthorized(`${uri}/config.yml`, 'PUT', configInput, "text/plain");

        if (!response.ok) {
            const error = await response.json();
            console.error("Error:", error);
            return;
        }
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
        window.location.hash = "indexers";
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
        <h3>Configuration</h3>
        <CodeMirror format='yaml' bind:value={configInput} />

        <div style="margin-top: 1em">
            <button type="submit">{isEditing ? 'Update' : 'Create'}</button>
            <button type="button" on:click={cancelForm}>Cancel</button>
        </div>
    </form>

    <form on:submit|preventDefault={runTest}>
        <h3>Test</h3>
        <input type="text" bind:value={testEntryURI} placeholder="Entry URI for testing" required />
        <div style="margin-top: 1em">
            <button type="submit">Send Test Queries</button>
        </div>
    </form>

    <table style="margin-top: 1em">
        <thead>
            <tr>
                <th>Document</th>
                <th>Value</th>
            </tr>
        </thead>
        <tbody>
            {#each $testResultStore as pair}
                <tr>
                    <td>{pair.document}</td>
                    <td>{pair.value}</td>
                </tr>
            {/each}
        </tbody>
    </table>

        
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

    input {
        border: 1px solid #dbdbdb;
        border-radius: 6px;
        padding: .55em;
        background-color: #f6f8fa;
        min-width: 600px;
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
 
 
</style>
