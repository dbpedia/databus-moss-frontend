
<script lang="ts">
    import SearchResult from "$lib/components/search-result.svelte";
    import AnnotationSearch from "$lib/components/annotation-search.svelte";
    import { PUBLIC_LOOKUP_BASE_URL } from '$env/static/public';
    import { MossUtils } from '$lib/utils/moss-utils';

    let baseUrl = `${PUBLIC_LOOKUP_BASE_URL}/api/search?query=`;
    // let baseUrl = `/api/search?query=`;
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

<div class="header">
    <a href="/g">Browse</a>
    <a href="/create-layer">Create Layer</a>
</div>

<div class="page">
    <div class="main">
        <input bind:value={searchInput} on:keyup={onSearchInputChanged} placeholder="Search files..." />
        <ul>
            {#each searchResults as result (result.id) }
                <li>
                    <SearchResult data={result} />
                </li>
            {/each}
        </ul>
    </div>
    <div class="side">
        <AnnotationSearch on:annotationClick={onAnnotationClicked}></AnnotationSearch>
    </div>
</div>

<style>

:global(body) {
    margin: 0;
}

.header {
    padding: 1em;
    background-color: #eee;
}
.page {
    width: 100%;
}

.main {
    float:left; 
    padding: 1em;
    width: 60%;
}

.side {
    float: right;
    padding: 1em;
    width: 35%;
}

ul {
    list-style-type: none;
    padding: 0;
}
</style>