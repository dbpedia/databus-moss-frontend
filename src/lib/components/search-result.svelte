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
    let browseLink = data.browseLink;

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
            <h1 class="result-header">{title}</h1>
            <div style="display: flex;">
                <div><a class="quick-button databus" href={resource} target="_blank">View on Databus</a></div>
                <div><a class="quick-button default" href={browseLink}>View in MOSS Browser</a></div>
                <div><a class="quick-button new" href="create-entry?databusResource={encodeURIComponent(resource)}">Create Entry</a></div>
            </div>
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
        <a href="{layer.browseLink}" style="margin-right: 0.2em;">
            <div class="layer">
                <h1>layer:{layer.name}</h1>
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

.quick-button {
  
    border-radius: 4px;
    padding: 0.2em .4em;
    display: flex;
    align-items: center;
    margin-right: .2em;
}

.quick-button.default {
    border: 1px solid #d4d4d4;
    color:#747474;
    background-color: #efefef;
}


.quick-button.databus {
    border: 1px solid #a3c9d3;
    color:#476871;
    background-color: #bce3ee;
}


.quick-button.new {
    border: 1px solid #b6d3a3;
    color:#47714e;
    background-color: #d1eebc;
}


.result-header {
    font-size: 20px;
    margin-bottom: 0.3em;
    font-weight: 600;
    margin-top: 0;
    padding: 0;
}

.result {
    border-bottom: 1px solid #c8c8c8;
    padding-top: 0;
    padding-bottom: 2em;
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
    overflow: hidden;
    border-radius: 8px;
}

.layer h1 {
    font-size: 0.8em;
    margin: 0;
    margin-bottom: 0.1em;
    background-color: #eeeeee;
    color: #7f7f7f;
    padding: 0.2em;
    padding-left: .4em;
    text-align: left;
    border-bottom: 1px solid #dbdbdb;
}

.layer div {
    margin: 0;
    padding: 0.4em;
    padding-right: 1em;
    display: flex;
    min-width: 150px;
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