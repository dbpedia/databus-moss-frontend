<script lang="ts">
    import { PUBLIC_LOOKUP_BASE_URL } from '$env/static/public';
	import { MossUtils } from '$lib/utils/moss-utils';
    import { onMount } from 'svelte';
    import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

    let searchInput = "";
    let baseUrl = `${PUBLIC_LOOKUP_BASE_URL}/api/search?type=tag&query=`;
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

<input bind:value={searchInput} on:keyup={onSearchInputChanged} placeholder="Search annotations..." />

<label>
    <input type="checkbox" bind:checked={hideUnused} />
	Hide unused
</label>

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