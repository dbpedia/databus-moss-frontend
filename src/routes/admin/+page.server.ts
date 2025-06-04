import { env } from '$env/dynamic/private';  
import { env as ENV } from '$env/dynamic/public';  
import { RdfUris } from '$lib/utils/rdf-uris';
import jwt from 'jsonwebtoken';

async function hasAdminRole(accessToken : any) {
    try {
        // Decode the JWT token
        const decodedToken = jwt.decode(accessToken) as any;

        // Check the resource_access claim
        if (decodedToken && decodedToken.resource_access) {
           
            const clientName = env.AUTH_OIDC_CLIENT_ID; 
            const roles = decodedToken.resource_access[clientName]?.roles;

            if (roles && roles.includes(env.AUTH_ADMIN_ROLE)) {
                console.log("User has the required role.");
                return true;
            }
        } else {
            console.log("No resource_access found in token.");
        }
        
        return false;
    } catch (error) {
        console.error("Error decoding token:", error);
        return false;
    }
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals, parent }: any) {	
    
    const parentData = await parent();

    
    console.log("=== ADMIN SERVER HANDLER ===");
    console.log(JSON.stringify(parentData, null, 3));
    

    if(parentData == null || parentData.userData == null || !parentData.userData.isAdmin) {
        return null;
    }
    
    const layerListResponse = await fetch(`${ENV.PUBLIC_MOSS_BASE_URL}/api/layers`);
    const layerData = await layerListResponse.json();

    const indexerListResponse = await fetch(`${ENV.PUBLIC_MOSS_BASE_URL}/api/indexers`);
    const indexerData = await indexerListResponse.json();

    
    return {  
        ...parentData,
        layers: layerData,
        indexers: indexerData
    }
}
