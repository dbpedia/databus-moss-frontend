<script lang="ts">
	import { MossUtils } from '$lib/utils/moss-utils';
    import { onMount } from 'svelte';
    import { createEventDispatcher } from 'svelte';
    import {
        Input,
        Label,
        Checkbox,
     } from 'flowbite-svelte';


	const dispatch = createEventDispatcher();

    let searchInput = "";
    let baseUrl = `/api/search?type=class&query=`;
    let annotatedCountSuffix = "&annotatedCount=1,1000000";
    let searchResults : any;
    let hideUnused : boolean;
    searchResults = [];

    hideUnused = true;

    async function onSearchInputChanged() {

        var suffix = "";

        if(hideUnused) {
            suffix += annotatedCountSuffix;
        }

        var results = await MossUtils.fetchJSON(baseUrl, searchInput + suffix);

        for(var result of results.docs) {
            if(result.annotatedCount == undefined || result.annotatedCount.length == 0) {
                result.annotatedCount = 0;
            }
        }

        searchResults = results.docs;
    }

    function onAnnotationClicked(event : Event, result : any) {
        dispatch("annotationClick", result);
    }

    onMount(async () => {
        onSearchInputChanged();
    });
</script>

<!-- <Label for="searchInput" class="block mb-2">Search Annotations</Label> -->
<Input id="searchInput" bind:value={searchInput} on:keyup={onSearchInputChanged} placeholder="Search Annotations..." class="block w-full p-2.5"/>

<Label for="hideUnusedCheckbox" class="inline-flex items-center mt-2">
    <Checkbox class="text-sky-400" id="hideUnusedCheckbox" bind:checked={hideUnused} />
    <span class="ml-2">Hide unused</span>
</Label>

<ul class="tag-list">
	{#each searchResults as result }
    <li>
        <button on:click={(e) => onAnnotationClicked(e, result)}>
            <span>{@html result.label}</span>
            <span> ({ result.annotatedCount })</span>
        </button>
    </li>
	{/each}
</ul>

<style>


    ul {
        list-style: none;
        padding: 0;
        display: flex;
        flex-wrap: wrap;
        max-width: 550px;
    }

    li {
        padding: .5em;
        background-color: #fafafa;
        border: 1px solid #dbdbdb;
        margin-bottom: .5em;
        border-radius: 8px;
        width: fit-content;
        cursor: pointer;
        margin-right: .5em;
    }

    button {
        background: none;
        color: inherit;
        border: none;
        padding: 0;
        font: inherit;
        cursor: pointer;
        outline: inherit;
    }

    li:hover {
        background-color: #f3f3f3;
    }


</style>