
<script lang="ts">
    import SearchResult from "$lib/components/search-result.svelte";
    import { PUBLIC_LOOKUP_BASE_URL } from '$env/static/public';
    import { MossUtils } from '$lib/utils';

    let baseUrl = `${PUBLIC_LOOKUP_BASE_URL}/api/search?query=`;
    let joinSuffix = `&join=`;
    let joinField = "annotation";

    let searchResults : any;

    searchResults = [];

    let searchInput : string;

 

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

            if(result.modType != undefined) {
            result.modName = MossUtils.uriToName(result.modType[0]);
            }

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

<input bind:value={searchInput} on:keyup={onSearchInputChanged} placeholder="Search files..." />
<ul>
	{#each searchResults as result (result.id) }
		<li>
            <SearchResult data={result} />
		</li>
	{/each}
</ul>