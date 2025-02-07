import { MossUtils } from "$lib/utils/moss-utils";
import { env } from '$env/dynamic/public'

async function fetchUserData(session : any) {
    
    if (session == null || session.user == undefined) {
        return null;
    }

    const accessToken = session.accessToken;

    const headers: any = {
        Accept: 'application/json',
        Authorization: 'Bearer ' + accessToken
    };

    // Make the actual request with the authorization header
    let response = await fetch(`${env.PUBLIC_MOSS_BASE_URL}/api/users/get-user`, {
        method: "GET",
        headers: headers,
    });

    if(response.ok) {
        return await response.json();
    }

    return null;
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }: any) {	
    
    const session = await locals.auth() as any;

    let layers = [];
    let userData : any;

    try {

        const response = await fetch(`${env.PUBLIC_MOSS_BASE_URL}/api/layers`);
        const data = await response.json();
        layers = data.layers;
        

    } catch(error) {
        console.error("Error fetching available layers:", error);
    }

    try {
        userData = await fetchUserData(session);
    } catch(error) {
        console.error("Error fetching user data:", error);
    }

    return { 
        props: {    
            layers,
            userData
        }
    }
}
