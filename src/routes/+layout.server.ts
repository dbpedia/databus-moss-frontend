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

    if(response.ok) {
        return await response.json();
    }

    return null;
}

async function hasAdminRole(accessToken : any) {
    try {
        // Decode the JWT token
        const decodedToken = jwt.decode(accessToken) as any;

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

  const session = await event.locals.auth() as any;
  let userData = null;

  try {
      userData = await fetchUserData(session);
  } catch(error) {
      console.error("Error fetching user data:", error);
  }

  if(userData != null) {
    userData.isAdmin = await hasAdminRole(session.accessToken);
  }
  
  return {
    userData: userData
  };
};