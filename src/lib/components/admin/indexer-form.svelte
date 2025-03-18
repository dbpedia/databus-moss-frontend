<script lang="ts">
    import { onMount } from 'svelte';
    import type { Indexer } from '$lib/types';
	import { MossUtils } from '$lib/utils/moss-utils';
	import { env } from '$env/dynamic/public';
	import CodeMirror from '../code-mirror.svelte';
    // @ts-ignore
    import  yaml from 'js-yaml';
	import { page } from '$app/stores';
    import { writable, type Writable } from 'svelte/store';
	import { RdfUris } from '$lib/utils/rdf-uris';
	import Index from '../../../routes/index.svelte';

    let form: Indexer = { 
        id: '', 
        layers: []
    };

    let isEditing : Writable<boolean> = writable<boolean>(false);
    let testResultStore = writable<any[]>([]);

    let configInput : string = '';
    let indexerNameInput : string = '';
    let testEntryURI : string = '';

    let availableLayers : string[] = [];
    let selectedLayer = '';

    for(let item of $page.data.layers[RdfUris.JSONLD_GRAPH]) {
        availableLayers.push(item[RdfUris.JSONLD_ID]);
    }

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

    onMount(async () => {
       

        const params = new URLSearchParams(window.location.hash.split('?')[1]);
        const indexerId : string | null = params.get("id");

        if (indexerId) {
            form.id = indexerId;
            isEditing.set(true);
        } else {
            isEditing.set(false);
        }

        if (indexerId) {
            let indexerName = MossUtils.getResourceNameFromId(indexerId);
            const indexerDataResponse = await fetch(`${env.PUBLIC_MOSS_BASE_URL}/api/indexers/${indexerName}`);
            const indexerData = await indexerDataResponse.json();

            form.layers = indexerData.layers;
            fetchConfiguration(form.id);
        }
    });


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

        if($isEditing) {
            await updateIndexer(form);
        } else {
            await createIndexer(form);
        }

        cancelForm();
    }

    function addLayer() {
        if(form.layers == null) {
            form.layers = [];
        }
        // Only add if the selected indexer is valid and not already in the list
        if (selectedLayer && !form.layers.includes(selectedLayer)) {
            form.layers = [...form.layers, selectedLayer]; // Create a new array to trigger reactivity
            selectedLayer = ''; // Reset selection
        }
    }

    function removeLayer(index: number) {
        form.layers = form.layers.filter((_, i) => i !== index); // Create a new array to trigger reactivity
    }

    function cancelForm() {
        window.location.hash = "indexers";
    }
   
</script>

<div>
    <h2>{$isEditing ? 'Edit Indexer' : 'Add Indexer'}</h2>
    <form on:submit|preventDefault={submitForm} style="margin-bottom: 3em;">
        
        {#if $isEditing}
        <h3>Id</h3>
        <input disabled type="text" bind:value={form.id} placeholder="Indexer Name" required />
        {/if}

        {#if !$isEditing}
        <h3>Name</h3>
        <input type="text" bind:value={indexerNameInput} placeholder="Indexer Name" required />
        {/if}

        <h3>Layers</h3>

        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {#each form.layers ?? [] as layer, i}
                    <tr>
                        <td>{layer}</td>
                        <td><button type="button" on:click={() => removeLayer(i)}>Remove</button></td>
                    </tr>
                {/each}
            </tbody>
        </table>

        <div class="indexer-input">
            <select bind:value={selectedLayer}>
                <option value="" disabled selected>Select a layer</option>
                {#each availableLayers as availableLayer}
                    <option value={availableLayer}>{availableLayer}</option>
                {/each}
            </select>
            <button type="button" on:click={addLayer}>Add Layer</button>
        </div>

        <h3>Configuration</h3>
        <CodeMirror format='yaml' bind:value={configInput} />

        <div style="margin-top: 1em">
            <button type="submit">{$isEditing ? 'Update' : 'Create'}</button>
            <button type="button" on:click={cancelForm}>Cancel</button>
        </div>
    </form>

    <div style="margin-bottom: 5em;">
        <form on:submit|preventDefault={runTest}>
            <h3>Test</h3>
            <input type="text" bind:value={testEntryURI} placeholder="Entry URI for testing" required />
            <button type="submit">Send Test Queries</button>
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
