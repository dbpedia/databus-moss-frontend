<script lang="ts">
	import { MossUtils } from "$lib/utils/moss-utils";
    import {
        A,
        P,
        Card,
		Heading,
		Badge,
		Secondary,
		Alert
    } from "flowbite-svelte";

    const linkColor = "secondary";

    export let data : any;

    let used = data.used;
    let usedLabel = MossUtils.getLastPathSegment(used);
    let explanations = data.explanations;
</script>

<div class="result">
    <div class="header">
        <h2 class="text-xl">{usedLabel}</h2>
        <div><strong>Resource:</strong> <A href={used} target="_blank" color={linkColor}>{used}</A></div>
        <div><strong>Layer:</strong>  {data.layer}</div>

    </div>
    
    {#if explanations.length > 0 }
    <div class="list">
        <div>Annotations:</div>
        <ul class="explanation-list">
            {#each explanations as explanation }
            <Badge class="text-xl font-semibold" color="indigo" border>{explanation.label}</Badge>
            {/each}
        </ul>
    </div>
    {/if}
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

.explanation-list {
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    list-style-type: none;
    margin-bottom: -.4em;
}

</style>