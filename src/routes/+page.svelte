
<script lang="ts">
    import SearchResult from "$lib/components/search-result.svelte";
    import AnnotationSearch from "$lib/components/annotation-search.svelte";
    import { MossUtils } from '$lib/utils/moss-utils';
    import {
        Input
     } from "flowbite-svelte";

    let baseUrl = `/api/search?query=`;
    let joinSuffix = `&join=`;
    let joinField = "annotation";

    let searchResults : any;

    searchResults = [];

    let searchInput : string;

    function onAnnotationClicked(event : CustomEvent) {

        if(event.detail == undefined) {
            return;
        }

        searchInput = `&id=${event.detail.id[0]}`;
        onSearchInputChanged();
    }

    async function query(searchInput: string, join?: string) {
        let query = `${baseUrl}${searchInput}`
        if (join != null) {
            query += joinSuffix + join;
        }

        const data = await fetch(query);
        return await data.json() ?? [];
    }

    async function onSearchInputChanged() {
        var results = await query(searchInput, joinField);
        var explanations = await query(searchInput);

        for(var result of results.docs) {
            result.expanded = true;
            result.explanations = [];

            result.path = new URL(result.id[0]).pathname;
            result.usedName = MossUtils.uriToName(result.used[0]);
            result.modName = MossUtils.uriToName(result.path);

            for(var explanation of explanations.docs) {
                for(var annotationUri of result.annotation) {
                    if(annotationUri == explanation.id) {

                        explanation.idName = MossUtils.uriToName(explanation.id[0]);
                        result.explanations.push(explanation);
                    }
                }
            }
        }

        searchResults = results.docs;
    }

</script>

<div class="section">
    <div class="container">
        <div class=columns>
            <div class="column">
                <Input bind:value={searchInput} on:keyup={onSearchInputChanged} placeholder="Search files..." />
                <ul>
                    {#each searchResults as result (result.id) }
                        <li>
                            <SearchResult data={result} />
                        </li>
                    {/each}
                </ul>
            </div>
            <div class="column medium">
                <AnnotationSearch on:annotationClick={onAnnotationClicked}></AnnotationSearch>
            </div>
        </div>
    </div>
</div>

<style>

:global(body) {
    margin: 0;
}

ul {
    list-style-type: none;
    padding: 0;
}

.column {
    padding-right: 2em;
}

</style>

