import { MossUtils } from "$lib/utils/moss-utils";
import { env } from '$env/dynamic/public'

/** @type {import('./$types').PageServerLoad} */
export async function load() {	
    let layers = [];

    try {

        const response = await fetch(`${env.PUBLIC_MOSS_BASE_URL}/layer/`);
        const data = await response.json();
        layers = data.layers;
        

    } catch(error) {
        console.error("Error fetching available layers:", error);
    }

    return { 
        props: {    
            layers,
        }
    }
}
