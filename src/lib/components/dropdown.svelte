<script lang="ts">
	import { onMount } from "svelte";
    import SaveButton from "./save-button.svelte";
    import { MossUtils } from "$lib/utils/moss-utils";
    let menuName: string = "Available Layers";
    export let layerList: string[];
    let fetched: boolean = false;


    async function listLayers() {
        fetched = !fetched;
        if (layerList.length < 1) {
            try {
                const data = await MossUtils.fetchLayers();
                layerList = data.layers.map((item: any) => {
                    console.log(item.name);
                    return item.name;
                })

            } catch(error) {
                console.error("Error fetching available layers:", error);
                fetched = false;
            }
        }
        console.log(layerList);
        console.log(fetched);
    }

</script>

<div class="container">
    <button on:click={listLayers}>
        {fetched? "Hide " + menuName : "Show " + menuName}
    </button>
    {#if fetched}
        <div class="drop-down">
            {#each layerList as layer}
                <p>{layer}</p>
            {/each}
        </div>
    {/if}
</div>

<style>

.container {

}

</style>