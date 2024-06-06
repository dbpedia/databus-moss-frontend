import { MossUtils } from "$lib/utils/moss-utils";


/** @type {import('./$types').PageServerLoad} */
export async function load({ url }) {	
    console.log(url);
    let layers = [];
    try {

        const response = await fetch(`${import.meta.env.VITE_MOSS_BASE_URL}/layer/`);
        const data = await response.json();
        
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
