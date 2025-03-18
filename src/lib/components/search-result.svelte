<script lang="ts">
	import { MossUtils } from "$lib/utils/moss-utils";
    import {
        A,
        P,
        Card,
		Heading,
		Badge,
        Button,
		Secondary,
		Alert
    } from "flowbite-svelte";

    const linkColor = "secondary";

    export let data : SearchResult;

    let resource = data.uri;
    let title = data.title;
    let abstract = data.abstract;
    let layers = data.layers;

    for(let layer of layers) {
        let url = new URL(layer.contentUri);
        layer.browseLink = url.pathname.replace("/g/content/", "/browse/");
    }

    if(title == undefined) {
        title = MossUtils.getLastPathSegment(resource);
    }

    function getExplanationValue(result : any) {
        let exp = "";
        for(var r of result) {
            exp += r.value;
        }

        return exp;
    }
    
</script>

<div class="result">
    <div class="header">
        <div style="display: flex">
        <div class="title">
            <h1>{title}</h1>
            <h2><a href={resource} target="_blank">{resource}</a></h2>
        </div>
        <!--<Button style="max-height: 45px" href={browseLink} target="_blank" color="light">
            View Layer
        </Button>-->
        </div>


        <div class="desc">{abstract ? abstract : "No description available" }</div>
    </div>
    
    <div class="list">
        <div class="explanation-list">
        {#each layers as layer }
        <a href="{layer.browseLink}">
            <div class="layer">
                <h1>{layer.name}</h1>
                {#each Object.entries(layer.explanations) as [key, entries] (key)}
                <div><span style="padding-right: .3em;">{key}:</span>
                    {#each entries as entry, index}
                        {#if entry.uri}
                            <span><a style="text-decoration: underline;" href={entry.uri} target="_blank">{entry.label}</a></span>
                        {:else}
                            <span>{@html entry.label}</span>
                        {/if}
                        {#if index < entries.length - 1}<span style="padding-right: .3em;">, </span>{/if}
                    {/each}
                </div>
                {/each}
            </div>
        </a>
        {/each}
        
        </div>
    </div>
</div>

<style lang>



.result {
    border-bottom: 1px solid #c8c8c8;
    padding-top: 0;
    padding-bottom: 1em;
    margin-bottom: 1em;
    margin-top: 1em;
    padding-left: 0.5em;
}

.header {
    margin-bottom: 1em;
    margin-top: 1.5em;
}

.layer {
    border: 1px solid #dbdbdb;
    background-color: #fafafa;
    cursor: pointer;
    border-radius: 8px;
}

.layer h1 {
    font-size: 1em;
    margin: 0;
    margin-bottom: 0.1em;
    background-color: #eeeeee;
    padding: 0.4em;
    text-align: left;
    border-bottom: 1px solid #dbdbdb;
}

.layer div {
    margin: 0;
    padding: 0.4em;
    display: flex;
    min-width: 300px;
}

.title h1 {
    font-size:  1.5em;
    font-weight: 500;
    margin: 0;
    padding: 0;
}

.title h2 {
    margin: 0;
    font-weight: 400;
}

.title {
    flex: 1;
    margin-bottom: 1em;
}
.explanation-list {
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    list-style-type: none;
    margin-bottom: -.4em;
}

</style>