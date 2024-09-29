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
        <P class="text-xl">Databus Resource: {usedLabel}</P>
        <A href={used} target="_blank" color={linkColor}><Secondary>{used}</Secondary></A>
    </div>
    <div class="list">
        <Heading tag=h6>Annotations:</Heading>
        <ul class="explanation-list">
            {#each explanations as explanation }
                <Card class="content items-start">
                    <Badge class="text-xl font-semibold" color="indigo" border>{explanation.label}</Badge>
                    <A href={explanation.id} target="_blank" color={linkColor}>
                        <P class="ms-2"><strong>Resource: </strong>{explanation.idName}</P>
                    </A>
                    <A href={data.path} target="_blank" color={linkColor}>
                        <P class="ms-2"><strong>Layer: </strong>{data.modName}</P>
                    </A>
                </Card>
            {/each}
        </ul>
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

.explanation-list {
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    list-style-type: none;
    margin-bottom: -.4em;
}

</style>