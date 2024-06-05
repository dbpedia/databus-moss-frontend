import { MossUtils } from "$lib/utils/moss-utils";
import type { SelectOptionType } from "flowbite-svelte";

/** @type {import('./$types').PageServerLoad} */
export async function load({ url }) {	
    console.log(url);
    let layers = [];
    try {
        const data = await MossUtils.fetchLayers();
        layers = data.layers.map((item: any) => {
            console.log("sever -item", item)
            return item.name;
        })
        console.log("done", layers);
    } catch(error) {
        console.error("Error fetching available layers:", error);
    }

    return { 
        props: {
            layers,
        }
    }
}
