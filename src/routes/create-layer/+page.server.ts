import { MossUtils } from "$lib/utils/moss-utils";
import type { SelectOptionType } from "flowbite-svelte";

/** @type {import('./$types').PageServerLoad} */
export async function load({ url }) {	
    console.log(url);
    let isLoading: boolean = true;
    let layers = await listLayers();
    // console.log("mmmeeee", items);
    // const layers = items.map((item) => {
    //     console.log("aaaaaa", item);
    //     return item.value;
    // });
    // console.log("iiiiii", layers);
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
            console.log("sever -item", item)
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