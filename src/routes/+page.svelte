
<script lang="ts">
    import SearchResult from "$lib/components/search-result.svelte";
    import AnnotationSearch from "$lib/components/annotation-search.svelte";
    import { MossUtils } from '$lib/utils/moss-utils';
    import {
        Input
     } from "flowbite-svelte";
     import { env } from '$env/dynamic/public'
     import jsonld from 'jsonld';
	import { JsonldUtils } from "$lib/utils/jsonld-utils";
	import { RdfUris } from "$lib/utils/rdf-uris";

    let baseUrl = `${env.PUBLIC_MOSS_BASE_URL}/api/search?query=`;
    let joinSuffix = `&join=`;
    let joinField = "annotation";

    let searchResults : { [key: string]: any };
    let annotationTags : any;

    annotationTags = [];
    searchResults = {};

    let searchInput : string;
    searchInput = "";

  

    function onAnnotationClicked(event : CustomEvent) {

        if(event.detail == undefined) {
            return;
        }

        // Get the annotation tag from the event
        let label = event.detail.label[0];
        label = label.replace("<B>", "").replace("</B>", "");

        var annotationTag = {
            id: event.detail.id[0],
            label: label
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
        
        // Remove the tag based on `id`
        annotationTags = annotationTags.filter((t: any) => t.id !== tag.id);

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


    function generateSearchExplanation(doc: any, searchTerm: string): any {
       
        let matchedFields: any = {};

        // Check each field in the document for the <B> tags indicating a match.
        for (const [field, value] of Object.entries(doc)) {
            if (!Array.isArray(value)) {
                continue;
            }
            
            for(let val of value) {
                if(!val.includes("<B>")) {
                    continue;
                }

                if(matchedFields[field] == undefined) {
                    matchedFields[field] = [];
                }
                
                matchedFields[field].push({ label: val });
            }
        }

        return matchedFields;
    }


    async function onSearchInputChanged() {

        let q = searchInput;

        if(annotationTags.length > 0) {

            q += "&annotation="
            for(let tag of annotationTags) {
                q += tag.id + " ";
            }
        }

        const results: { docs: any } = await query(q);
        const resultMap: Record<string, SearchResult> = {};

        for(var result of results.docs) {

            let id : string = result.id[0];

            if(!id.startsWith(env.PUBLIC_MOSS_BASE_URL)) {
                continue;
            }

            try {
                var response = await fetch(id, {
                    headers: {
                        'Accept': 'application/ld+json'
                    }
                });

                let layerGraphs = await jsonld.expand(await response.json());
                let layerGraph = JsonldUtils.getTypedGraph(layerGraphs, RdfUris.MOSS_LAYER);
                var databusResourceUri = JsonldUtils.getValue(layerGraph, RdfUris.MOSS_EXTENDS);

                if(resultMap[databusResourceUri] == undefined) {
                    try {
                        var response = await fetch(databusResourceUri, {
                            headers: {
                                'Accept': 'application/ld+json'
                            }
                        });

                        var resourceGraphs = await jsonld.expand(await response.json());
                        var resourceGraph = JsonldUtils.getGraphById(resourceGraphs, databusResourceUri)

                        var databusResourceData : any = {};
                        databusResourceData.uri = databusResourceUri;
                        databusResourceData.title = JsonldUtils.getValue(resourceGraph, RdfUris.DCT_TITLE);
                        databusResourceData.abstract = JsonldUtils.getValue(resourceGraph, RdfUris.DCT_ABSTRACT);
                        databusResourceData.description = JsonldUtils.getValue(resourceGraph, RdfUris.DCT_DESCRIPTION);
                        databusResourceData.layers = [];

                        resultMap[databusResourceUri] = databusResourceData;
                    } catch(e) {
                        console.log(e);
                    }
                }

                if(resultMap[databusResourceUri] == undefined) {
                    continue;
                }

                result.uri = result.id[0];
                result.name =  JsonldUtils.getValue(layerGraph, RdfUris.MOSS_LAYERNAME);
                result.explanations = generateSearchExplanation(result, searchInput);
                resultMap[databusResourceUri].layers.push(result);

            } catch(e) {
                console.log(e);
            }

            
            if(result.annotation != undefined) {
                
                for(var annotationUri of result.annotation) {
                    for(let tag of annotationTags) {
                        if(annotationUri == tag.id) {
                            if(result.explanations["annotation"] == undefined) {
                                result.explanations["annotation"] = [];
                            }

                            result.explanations["annotation"].push({ label: tag.label, uri: tag.id });
                        }
                    }
                }
            }

        }

        // Create hashes for each entry in resultMap
        for (const [uri, data] of Object.entries(resultMap) as [string, any][]) {
            // Concatenate the base uri with all layer uris
            const layerUris = data.layers.map((layer: any) => layer.uri).join(','); // Using 'any' for layer
            const hashInput = uri + layerUris + searchInput + annotationTags.length; // Create a string to hash
            data.hash = createHash(hashInput); // Assign the hash to a new property
        }
        
        searchResults = resultMap;
    }

    function createHash(input : string) {
        // In a real application, consider using a library like 'crypto-js' or the SubtleCrypto API
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
            hash = (hash << 5) - hash + input.charCodeAt(i);
            hash = hash | 0; // Convert to 32bit integer
        }
        return hash.toString();
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
                      {@html tag.label}
                      <button class="close-btn" on:click={() => removeTag(tag)}>x</button>
                    </div>
                  </li>
                {/each}
                </ul>
                <ul>
                    {#each Object.entries(searchResults) as [key, result] (result.hash)}
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

.column.medium {
    min-width: 256px;
    width: 256px;
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

