import { env } from '$env/dynamic/private';
import { env as ENV } from '$env/dynamic/public';
import type { LayoutServerLoad } from './$types';
import jwt from 'jsonwebtoken';

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
    let response = await fetch(`${ENV.PUBLIC_MOSS_BASE_URL}/api/users/get-user`, {
        method: "GET",
        headers: headers,
    });

    console.log(JSON.stringify(response, null, 3));

    if(response.ok) {
        return await response.json();
    }

    console.log("nix user");
    return null;
}

async function hasAdminRole(userData : any, accessToken : any) {
    try {
        
        // Decode the JWT token
        const decodedToken = jwt.decode(accessToken) as any;

        console.log(JSON.stringify(decodedToken, null, 3));

        if(env.AUTH_ADMIN_USER != null && env.AUTH_ADMIN_USER === userData.username) {
            console.log(`ADMIN: ${userData.username} recognized as admin user.`);
            return true;
        }

        // Check the resource_access claim
        if (decodedToken && decodedToken.resource_access) {
           
            const clientName = env.AUTH_OIDC_CLIENT_ID; 
            const roles = decodedToken.resource_access[clientName]?.roles;

            if (roles && roles.includes(env.AUTH_ADMIN_ROLE)) {
                return true;
            }
            
        }
        
        return false;
    } catch (error) {
        console.error("Error decoding token:", error);
        return false;
    }
}


export const load: LayoutServerLoad = async (event) => {

    let userData = null;
    console.log(`Fetching user data....`);

    try {
        const session = await event.locals.auth() as any;
        
        console.log(JSON.stringify(session, null, 3));
        userData = await fetchUserData(session);

        if(userData != null) {
            userData.isAdmin = await hasAdminRole(userData, session.accessToken);
        }

    } catch(error) {
        console.error("Error fetching user data:", error);
    }

    console.log(JSON.stringify(userData, null, 3));
    
  return {
    userData: userData
  };
};