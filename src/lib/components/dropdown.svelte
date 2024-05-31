<script lang="ts">
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
                    return item.name;
                })

            } catch(error) {
                console.error("Error fetching available layers:", error);
                fetched = false;
            }
        }
    }

</script>

<div class="container">
    <button on:click={listLayers}>
        {fetched? "Hide " + menuName : "Show " + menuName}
    </button>
    {#if fetched}
        <br/>
        <select class="drop-down">
            {#each layerList as layer}
                <option>{layer}</option>
            {/each}
        </select>
    {/if}
</div>

<style>

.container {
    padding-bottom: 3px;
    padding-top: 3px;
}

.drop-down {
    margin-top: 1em;
    margin-bottom: 1em;
}

</style>