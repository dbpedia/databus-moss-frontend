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
  providers: [ getProvider() ],
  secret: "isna",
  callbacks: {
    async jwt({ token, account }) {

      // Persist the OAuth refresh token to the token right after signin
      if (account?.provider === "oidc_provider") {

        console.log("JWT CALLBACK");
        console.log(account);

        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
        };
      }

      return token;
    },
    async session({ session, token }) {
      console.log("gib session");
      let accessToken = await fetchNewAccessToken(token?.refreshToken as string);

      console.log("got new access token for u.");
      
      return { ...session, accessToken: accessToken }
    } 
  }
});



async function fetchNewAccessToken(refreshToken: string|null): Promise<string|null> {

  if (refreshToken == null) {
    return null;
  }

  let provider = getProvider() as any;

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
    throw new Error('Failed to refresh access token');
  }

  const data = await response.json();
  return data.access_token;
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
  