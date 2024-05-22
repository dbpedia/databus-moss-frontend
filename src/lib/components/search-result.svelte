<script lang="ts">
	import { MossUtils } from "$lib/utils/moss-utils";

    export let data : any;

    let used = data.used;
    let usedLabel = MossUtils.getLastPathSegment(used[0]);
    let explanations = data.explanations;
</script>

<div class="result">
    <h1>{usedLabel}</h1>
    <div><a href={used} target="_blank">Download</a></div>
    <br/>
    <div><b>Annotations:</b></div>
    <ul class="explanation-list">
        {#each explanations as explanation }
        <li>
            <div>{@html explanation.label}</div>
            <div><b>Resource:</b> <a target="_blank" href="{explanation.id}">{explanation.idName}</a></div>
            <div><b>Layer:</b> <a target="_blank" href="{ data.path }">{ data.modName }</a></div>
        </li>
        {/each}
    </ul>
</div>
<style>

.result {
    border-bottom: 1px solid #c8c8c8;
    padding-top: 0;
    padding-bottom: 1em;
    margin-bottom: 1em;
}

h1 {
    font-size: 1.2em;
    margin: 0;
    margin-bottom: 0.1em;
}

.explanation-list {
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    list-style-type: none;
    margin-bottom: -.4em;
}

.explanation-list>li {
    border: 1px solid #dbdbdb;
    background-color: #fafafa;
    padding: .7em;
    border-radius: 8px;
    margin-right: .4em;
    margin-bottom: .4em;
    width: fit-content;
}
</style>