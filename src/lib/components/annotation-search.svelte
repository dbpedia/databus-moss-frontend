<script lang="ts">
	import { MossUtils } from '$lib/utils/moss-utils';
    import { onMount } from 'svelte';
    import { createEventDispatcher } from 'svelte';
    import {
        Input,
        Label,
        Checkbox,
		Badge,
		Listgroup,
		P,
     } from 'flowbite-svelte';


	const dispatch = createEventDispatcher();

    let searchInput = "";
    let baseUrl = `/api/search?type=class&query=`;
    let annotatedCountSuffix = "&annotatedCount=1,1000000";
    let searchResults : any;
    let hideUnused : boolean;
    $: searchResults = [];

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

<ul class="tag-list w-full">
    {#if searchResults.length > 0 }
    <Listgroup active class="lg" items={searchResults} let:item on:click={(e) => onAnnotationClicked(e, e.detail)}>
        <div class="entry">
            <span class="flex-1 mr-2"><P>{@html item?.label}</P></span>
            <Badge clas="flex-none" color={"dark"}>{item?.annotatedCount}</Badge>
        </div>
    </Listgroup>
    {/if}
</ul>

<style>
    .entry {
        display: flex;
        width: 100%;
        justify-content: space-between;
        margin-left: 0.5rem;
    }

    .flex-1 {
        flex: 1;
    }

    .flex-none {
        flex: none;
    }

    .mr-2 {
        margin-right: 0.5rem;
    }

    .w-full {
        width: 100%;
    }

</style>