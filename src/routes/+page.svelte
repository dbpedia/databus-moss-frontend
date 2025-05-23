
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

    let publicationDateStart: string = "";
    let publicationDateEnd: string = "";
    
    let referenceDateStart: string = "";
    let referenceDateEnd: string = "";

    let grantNo: string = "";
    let publisherEmail: string = "";

    let format: string = "";
    let licenseUri: string = "";

    let searchRequestIndexCounter = 0;
    let isSearching = false;

  

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
        searchRequestIndexCounter++;
        isSearching = true;

        let requestIndex = searchRequestIndexCounter;

        if(annotationTags.length > 0) {

            q += "&annotation="
            for(let tag of annotationTags) {
                q += tag.id + " ";
            }
        }
        
        if (publicationDateStart || publicationDateEnd) {
            const start = publicationDateStart ?? "";
            const end = publicationDateEnd ?? "";
            q += `&publicationDate=${encodeURIComponent(start)},${encodeURIComponent(end)}`;
        }

        if(grantNo) {
            q += `&grantNo=${grantNo}`;
        }

        if(licenseUri) {
            q += `&license=${licenseUri}`;
        }

        if(format) {
            q += `&format=${format}`;
        }


        if(publisherEmail) {
            q += `&publisher=${publisherEmail}`;
        }

        if (referenceDateStart || referenceDateEnd) {
            const start = referenceDateStart ?? "";
            const end = referenceDateEnd ?? "";
            q += `&referenceDate=${encodeURIComponent(start)},${encodeURIComponent(end)}`;
        }

        const results: { docs: any } = await query(q);
        const resultMap: Record<string, SearchResult> = {};

        
        searchResults = resultMap;

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

                if(response.status != 200) {
                    continue;
                }

                let layerGraphs = await jsonld.expand(await response.json());

                if(requestIndex != searchRequestIndexCounter) {
                    return;
                }

                let layerGraph = JsonldUtils.getTypedGraph(layerGraphs, RdfUris.MOSS_ENTRY);
                var databusResourceUri = JsonldUtils.getValue(layerGraph, RdfUris.MOSS_EXTENDS);

                if(resultMap[databusResourceUri] == undefined) {
                    try {
                        var response = await fetch(databusResourceUri, {
                            headers: {
                                'Accept': 'application/ld+json'
                            }
                        });

                        var resourceGraphs = await jsonld.expand(await response.json());

                        if(requestIndex != searchRequestIndexCounter) {
                            return;
                        }

                        var resourceGraph = JsonldUtils.getGraphById(resourceGraphs, databusResourceUri)

                        var databusResourceData : any = {};
                        databusResourceData.uri = databusResourceUri;
                        databusResourceData.title = JsonldUtils.getValue(resourceGraph, RdfUris.DCT_TITLE);
                        databusResourceData.abstract = JsonldUtils.getValue(resourceGraph, RdfUris.DCT_ABSTRACT);
                        databusResourceData.description = JsonldUtils.getValue(resourceGraph, RdfUris.DCT_DESCRIPTION);
                        databusResourceData.browseLink = MossUtils.getRelativeBrowseLink(
                            MossUtils.getLayerURI(env.PUBLIC_MOSS_BASE_URL, databusResourceUri, ""));
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
                result.name =  MossUtils.uriToName(result.uri);
                result.contentUri = JsonldUtils.getValue(layerGraph, RdfUris.MOSS_CONTENT);
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

            const layerUris = resultMap[databusResourceUri].layers.map((layer: any) => layer.uri).join(','); // Using 'any' for layer
            const hashInput = databusResourceUri + layerUris + searchInput + annotationTags.length; // Create a string to hash
            resultMap[databusResourceUri].hash = createHash(hashInput); // Assign the hash to a new property

            
            if(requestIndex != searchRequestIndexCounter) {
                return;
            }

            searchResults = resultMap;
        }

        
        searchResults = resultMap;
        isSearching = false;
        /*
         
        // Create hashes for each entry in resultMap
        for (const [uri, data] of Object.entries(resultMap) as [string, any][]) {
            // Concatenate the base uri with all layer uris
            const layerUris = data.layers.map((layer: any) => layer.uri).join(','); // Using 'any' for layer
            const hashInput = uri + layerUris + searchInput + annotationTags.length; // Create a string to hash
            data.hash = createHash(hashInput); // Assign the hash to a new property
        }
        
        */
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
                    {#if isSearching} 
                        <p>Searching...</p>
                    {/if}
                    {#each Object.entries(searchResults) as [key, result] (result.hash)}
                        <li>
                            <SearchResult data={result} />
                        </li>
                    {/each}
                </ul>
            </div>
            <div class="column medium">
                
                <h2>Publication Date</h2>
                <div class="facet-input">
                <Input type="datetime-local" bind:value={publicationDateStart} placeholder="Start time" on:change={onSearchInputChanged} />
                </div>
                <div class="facet-input">
                    <Input type="datetime-local" bind:value={publicationDateEnd} placeholder="End time" on:change={onSearchInputChanged} />
                </div>

                <h2>Grant No</h2>
                <div class="facet-input">
                <Input type="text" bind:value={grantNo} placeholder="Grant No" on:change={onSearchInputChanged} />
                </div>

                <h2>Publisher Contact</h2>
                <div class="facet-input">
                <Input type="text" bind:value={publisherEmail} placeholder="Publisher Contact Email" on:change={onSearchInputChanged} />
                </div>

                <h2>License URI</h2>
                <div class="facet-input">
                <Input type="text" bind:value={licenseUri} placeholder="License URI" on:change={onSearchInputChanged} />
                </div>

                <h2>Data Format</h2>
                <div class="facet-input">
                <Input type="text" bind:value={format} placeholder="Data Format" on:change={onSearchInputChanged} />
                </div>

                
                <h2>Reference Date</h2>
                <div class="facet-input">
                <Input type="datetime-local" bind:value={referenceDateStart} placeholder="Start time" on:change={onSearchInputChanged} />
                </div>
                <div class="facet-input">
                    <Input type="datetime-local" bind:value={referenceDateEnd} placeholder="End time" on:change={onSearchInputChanged} />
                </div>

               
                <h2>Ontology Annotations</h2>
                <AnnotationSearch on:annotationClick={onAnnotationClicked}></AnnotationSearch>
            </div>
        </div>
    </div>
</div>

<style>

:global(body) {
    margin: 0;
}

.facet-input {
    margin-bottom: 0.2em;
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

