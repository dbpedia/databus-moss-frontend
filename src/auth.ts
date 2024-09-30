import { SvelteKitAuth } from "@auth/sveltekit";
import { AUTH_OIDC_CLIENT_SECRET, AUTH_OIDC_CLIENT_ID, AUTH_OIDC_ISSUER } from "$env/static/private";
import type { Provider } from "@auth/sveltekit/providers";

let tokenEndpointUrl: string | null = null;

function getProvider() : Provider {
  let provider: any = {};
  provider.id = "oidc_provider";
  provider.name = "OIDC Provider";
  provider.type = "oidc";
  provider.clientId = AUTH_OIDC_CLIENT_ID;
  provider.clientSecret = AUTH_OIDC_CLIENT_SECRET;
  provider.issuer = AUTH_OIDC_ISSUER;
  return provider;
}

export const { handle, signIn, signOut  } = SvelteKitAuth({
  trustHost: true,
  providers: [ getProvider() ],
  secret: "EuLZ0ierX7kl53a90sF6fGU/fCdSp3TTpjKRmD8oVSY=",
  callbacks: {
    async jwt({ token, account }) {

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
      
      if(token == undefined) {
        return session;
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

  // console.log(refreshToken);
  
  if (refreshToken == null) {
    return null;
  }

  let provider = getProvider() as any;
  let tokenEndpointUrl = await fetchTokenEndpointUrl(provider.issuer);

  // console.log(tokenEndpointUrl);
  
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
  if (tokenEndpointUrl) {
    return tokenEndpointUrl;
  }

  const response = await fetch(`${issuer}/.well-known/openid-configuration`);
  if (!response.ok) {
    throw new Error('Failed to fetch OIDC discovery document');
  }
  const data = await response.json();
  tokenEndpointUrl = data.token_endpoint;
  return tokenEndpointUrl;
}

/**
 *   clientId: "moss-dev",
    clientSecret: "z7feqbX7lGyAFzPzGIaC4LT7vidPqrP5",
    issuer: "https://auth.dbpedia.org/realms/dbpedia"
 */
  