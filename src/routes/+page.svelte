
<script lang="ts">
    import SearchResult from "$lib/components/search-result.svelte";
    import AnnotationSearch from "$lib/components/annotation-search.svelte";
    import { MossUtils } from '$lib/utils/moss-utils';
    import {
        Input
     } from "flowbite-svelte";
     import { env } from '$env/dynamic/public'

    let baseUrl = `${env.PUBLIC_MOSS_BASE_URL}/api/search?query=`;
    let joinSuffix = `&join=`;
    let joinField = "annotation";

    let searchResults : any;
    let annotationTags : any;

    annotationTags = [];
    searchResults = [];

    let searchInput : string;
    searchInput = "";

    function onAnnotationClicked(event : CustomEvent) {

        if(event.detail == undefined) {
            return;
        }

        // Get the annotation tag from the event
        var annotationTag = {
            id: event.detail.id[0],
            label: event.detail.label[0]
        };

        // Avoid duplicates based on `id`
        if (annotationTags.some((tag: { id: string; label: string }) => tag.id === annotationTag.id)) {
            return;
        }

        // Add and reassign for svelte
        annotationTags.push(annotationTag);
        annotationTags = [...annotationTags]

        onSearchInputChanged();
    }

    // Callback function when 'x' is clicked
    function removeTag(tag: { id: string; label: string }) {
        console.log(`Tag removed: ${tag.label}`);
        
        // Remove the tag based on `id`
        annotationTags = annotationTags.filter(t => t.id !== tag.id);

        // Trigger the search input change or any other logic
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

        let q = searchInput;

        if(annotationTags.length > 0) {

            q += "&annotation="
            for(let tag of annotationTags) {
                q += tag.id + " ";
            }
        }

        var results = await query(q);

        let r = [];

        var explanations = await query(searchInput);

        for(var result of results.docs) {

            let id : string = result.id[0];

            if(!id.startsWith(env.PUBLIC_MOSS_BASE_URL)) {
                continue;
            }


            result.expanded = true;
            result.explanations = [];

            result.used = MossUtils.getResourceURI(result.id[0]);
            result.path = new URL(result.id[0]).pathname;
            result.layer = result.id[0];
            
            if( result.annotation != undefined) {
                
                for(var annotationUri of result.annotation) {
                    for(let tag of annotationTags) {
                        if(annotationUri == tag.id) {

                            result.explanations.push(tag);
                        }
                    }
                }
            }

            r.push(result);
            // result.usedName = MossUtils.uriToName(result.used[0]);
            /*
            result.modName = MossUtils.uriToName(result.path);

            for(var explanation of explanations.docs) {
                for(var annotationUri of result.annotation) {
                    if(annotationUri == explanation.id) {

                        explanation.idName = MossUtils.uriToName(explanation.id[0]);
                        result.explanations.push(explanation);
                    }
                }
            }
                */
        }

        searchResults = r;
    }

</script>

<div class="section">
    <div class="container">
        <div class=columns>
            <div class="column">
                <Input bind:value={searchInput} on:keyup={onSearchInputChanged} placeholder="Search files..." />
                <ul class="tag-list">
                {#each annotationTags as tag }
                <li>
                    <div class="tag-box">
                      {tag.label}
                      <button class="close-btn" on:click={() => removeTag(tag)}>x</button>
                    </div>
                  </li>
                {/each}
                </ul>
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

.tag-list {
    display: flex;
    gap: .5em;
    margin-top: .5em;
    flex-wrap: wrap;
}

.tag-box {
    display: inline-block;
    background-color: #e0e0e0;
    padding: 8px 10px;
    border-radius: 12px;
    line-height: 1;
    font-size: 14px;
    position: relative;
    cursor: pointer;
  }

  .tag-box .close-btn {
    margin-left: 10px;
    font-weight: bold;
    cursor: pointer;
  }

</style>

