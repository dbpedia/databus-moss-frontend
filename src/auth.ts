import { SvelteKitAuth } from "@auth/sveltekit";
import { env } from "$env/dynamic/private";
import type { Provider } from "@auth/sveltekit/providers";
import { setupFetchProxy } from "$lib/fetch-proxy";


let tokenEndpointUrl: string | null = null;

let providers : any = {};

async function getProvider() : Promise<Provider> {

  setupFetchProxy();

  console.log(`AUTH_OIDC_CLIENT_ID: ${env.AUTH_OIDC_CLIENT_ID}`);
  console.log(`AUTH_OIDC_CLIENT_SECRET: ${env.AUTH_OIDC_CLIENT_SECRET != undefined ? "SECRET IS SET BUT SECRET!" : undefined}`);
  console.log(`AUTH_OIDC_ISSUER: ${env.AUTH_OIDC_ISSUER}`);

  if (!env.AUTH_OIDC_CLIENT_ID || !env.AUTH_OIDC_CLIENT_SECRET || !env.AUTH_OIDC_ISSUER) {
    console.error("OIDC configuration is missing environment variables.");
    throw new Error("Missing OIDC environment variables");
  }

  let provider: any = {};
  provider.id = "oidc_provider";
  provider.name = "OIDC Provider";
  provider.type = "oidc";
  provider.clientId = env.AUTH_OIDC_CLIENT_ID;
  provider.clientSecret = env.AUTH_OIDC_CLIENT_SECRET;
  provider.issuer = env.AUTH_OIDC_ISSUER;
  provider.scope = env.AUTH_OIDC_CLIENT_SCOPE;

  if(env.AUTH_OIDC_DISCOVERY_URL != null) {
    try {
      console.log("AUTH_OIDC_DISCOVERY_URL: " + env.AUTH_OIDC_DISCOVERY_URL);
      provider = await setupOidcProvider(provider, env.AUTH_OIDC_DISCOVERY_URL);
    } catch(e) {
      console.log("Failed to set up OIDC provider.");
      console.log(e);
    }
  }
  
  providers[provider.id] = provider;
  return provider;
}

export const { handle, signIn, signOut  } = SvelteKitAuth({
  trustHost: true,
  debug: env.AUTH_DEBUG == "true",
  providers: [ await getProvider() ],
  secret: "EuLZ0ierX7kl53a90sF6fGU/fCdSp3TTpjKRmD8oVSY=",
  callbacks: {
    async jwt({ token, user, account, profile }) {
      
      
      console.log("AUTH.JS JWT CALLBACK");
      
      console.log("========= TOKEN ============");
      console.log(token);
      
      console.log("========= ACCOUNT ============");
      console.log(account);

      console.log("========= USER ============");
      console.log(user);

      console.log("========= PROFILE ============");
      console.log(profile);

      if (profile) {

        if(token.email == undefined) {
          token.email = profile.email;
        }

        if(token.name == undefined) {
          token.name = profile.name;
        }
      
        if(account != null) {

          var provider = providers[account.provider];

          if(provider != null && provider.userinfo != null) {

            var context = { 
              tokens: {
                accessToken : account.access_token
              }
            };

            var userinfo = await provider.userinfo.request(context);

            console.log("========= USER INFO ============");
            console.log(userinfo);


            if(userinfo != null) {
              if(token.email == undefined) {
                token.email = userinfo.email;
              }
      
              if(token.name == undefined) {
                token.name = userinfo.name;
              }
            }
          }
        }

        if(token.name == undefined) {
          token.name = profile.sub;
        }
      }

  
      // Persist the OAuth refresh token to the token right after signin
      if (account?.provider === "oidc_provider") {
        
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          expiresAt: account.expires_at,
        };
      }

      return token;
    },
    async session({ session, token }) {
      
      //console.log("AUTH.JS SESSION CALLBACK");

/*      console.log("AUTH.JS SESSION CALLBACK");
      
      console.log("========= TOKEN ============");
      console.log(token);
      console.log("========= SESSION ============");
      console.log(session);
*/
      
      if(token == undefined) {
        return session;
      }

      if(token.email) {
        session.user = {
          ...session.user,
          email: token.email as string,
          name: token.name,
        };
      }

      let expiresAtTime: number = token.expiresAt as number;

      if(Date.now() >= expiresAtTime * 1000){
        
        let tokenData = await fetchNewAccessToken(token?.refreshToken as string);
        token.accessToken = tokenData.accessToken;
        token.expiresAt = tokenData.expiresAt;
        token.refreshToken = tokenData.refreshToken;
      }
    
      return { ...session, accessToken: token.accessToken }
    } 
  }
});

async function fetchNewAccessToken(refreshToken: string|null): Promise<any> {

  if (refreshToken == null) {
    return null;
  }

  let provider = await getProvider() as any;
  let tokenEndpointUrl = await fetchTokenEndpointUrl(provider.issuer);

  if(tokenEndpointUrl == null) {
    return null;
  }

  // Example function to fetch a new access token using a refresh token
  const response = await fetch(tokenEndpointUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: provider.clientId,
      client_secret: provider.clientSecret
    })
  });

  if (!response.ok) {
    console.log(response);
    throw new Error('Failed to refresh access token');
  }

  const data = await response.json();
  var token = decodeJWT(data.access_token);
  return { accessToken: data.access_token, expiresAt: token.exp, refreshToken: data.refresh_token };
}

function decodeJWT(token: string | undefined): any {

  if(token == undefined) {
    return null;
  }

  const base64Url = token.split('.')[1]; // Get the payload part
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); // Convert Base64Url to Base64
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`).join('')); // Decode Base64 to JSON
  return JSON.parse(jsonPayload); // Parse JSON payload
}


// Function to fetch the token endpoint URL from OIDC discovery document and cache it
async function fetchTokenEndpointUrl(issuer: string): Promise<string|null> {

  try {
    if (tokenEndpointUrl) {
      return tokenEndpointUrl;
    }

    let discoveryURL;

    if(env.AUTH_OIDC_DISCOVERY_URL != null) {
      discoveryURL = env.AUTH_OIDC_DISCOVERY_URL;
    } else {
      discoveryURL = `${issuer}/.well-known/openid-configuration`;
    }

    const response = await fetch(discoveryURL);
    if (!response.ok) {
      throw new Error('Failed to fetch OIDC discovery document');
    }
    const data = await response.json();
    tokenEndpointUrl = data.token_endpoint;
    return tokenEndpointUrl;
  } catch(e) {
    console.log(e);
    return null;
  }
}

/**
 *   clientId: "moss-dev",
    clientSecret: "z7feqbX7lGyAFzPzGIaC4LT7vidPqrP5",
    issuer: "https://auth.dbpedia.org/realms/dbpedia"
 */
  

/**
 * Fetches and sets up an OIDC provider dynamically from its discovery document.
 *
 * @param {string} providerId - The ID for the provider (e.g., "custom_oidc").
 * @param {string} discoveryUrl - The URL to the provider's discovery document.
 * @param {object} options - Additional options like clientId, clientSecret, scopes, etc.
 * @returns {object} - The dynamically created provider configuration.
 */
async function setupOidcProvider(provider: any, discoveryUrl : string) {

  // Fetch the discovery document
  const response = await fetch(discoveryUrl, { redirect: "follow" });

  if (!response.ok) {
    throw new Error(`Failed to fetch discovery document: ${response.statusText}`);
  }

  const discoveryDoc = await response.json();

  console.log(discoveryDoc);
  

  // Ensure required fields are present in the discovery document
  const requiredFields = ["authorization_endpoint", "token_endpoint", "userinfo_endpoint"];
  requiredFields.forEach((field) => {
    if (!discoveryDoc[field]) {
      throw new Error(`Missing ${field} in discovery document.`);
    }
  });

  // Build the provider configuration dynamically
  return {
    ...provider,
    authorization: {
      url: new URL(discoveryDoc.authorization_endpoint),
      params: {
        scope: provider.scope || "openid profile email",
      },
    },
    token: {
      url: new URL(discoveryDoc.token_endpoint),
      conform: (response: any): boolean => {
        // Basic validation for the token response
        return (
          response.access_token &&
          response.token_type &&
          response.token_type.toLowerCase() === "bearer"
        );
      },
    },
    userinfo: {
      url: new URL(discoveryDoc.userinfo_endpoint),
      request: async (context: any): Promise<any> => {
        // Fetch userinfo using the access token
        const userResponse = await fetch(discoveryDoc.userinfo_endpoint, {
          headers: {
            Authorization: `Bearer ${context.tokens.accessToken}`,
          },
        });
        if (!userResponse.ok) {
          throw new Error("Failed to fetch user info.");
        }
       
        var res = userResponse.json();
        return res;
      },
    },
    profile: (profile: any): Record<string, any> => {
      // Map the user profile fields
      return {
        id: profile.sub,
        name: profile.name,
        email: profile.email,
        image: profile.picture,
      };
    }
  }
}