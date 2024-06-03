import { MossUtils } from "$lib/utils/moss-utils";
import type { SelectOptionType } from "flowbite-svelte";

/** @type {import('./$types').PageServerLoad} */
export async function load({ url }) {	
    console.log(url);
    let isLoading: boolean = true;
    let items = await listLayers();
    const layers = items.map((item) => {
        return item.value;
    });
    console.log("iiiiii", layers);
    isLoading = false;

    return { 
        props: {
            layers,
            isLoading,
        }
    }
}



async function listLayers(): Promise<SelectOptionType<string>[]> {
    let list: SelectOptionType<string>[] = [];

    try {
        const data = await MossUtils.fetchLayers();
        list = data.layers.map((item: any) => {
            return {
                value: item.name,
                label: item.name,
            };
        })
        console.log("done", list);
    } catch(error) {
        console.error("Error fetching available layers:", error);
    } finally {
        // isLoading = false;
    }

    return list;
} 