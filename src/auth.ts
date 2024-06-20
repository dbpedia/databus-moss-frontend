import { SvelteKitAuth } from "@auth/sveltekit";
 
export const { handle, signIn, signOut  } = SvelteKitAuth({
  providers: [{
    id: "my-provider", // signIn("my-provider") and will be part of the callback URL
    name: "My Provider", // optional, used on the default login page as the button text.
    type: "oidc", // or "oauth" for OAuth 2 providers
    issuer: "https://auth.dbpedia.org/realms/dbpedia", // to infer the .well-known/openid-configuration URL
    clientId: "moss-dev", // from the provider's dashboard
    clientSecret: "z7feqbX7lGyAFzPzGIaC4LT7vidPqrP5", // from the provider's dashboard
  }],
  secret: "isna",
  callbacks: {
    async jwt({ token, account }) {
      // Persist the OAuth access token to the token right after signin
      if (account?.provider === "my-provider") {
        
        return { ...token, accessToken: account.access_token }
      }

      return token;
    },
    async session({ session, token }) {
      return { ...session, accessToken: token.accessToken }
    }
  }
});
/**
 *   clientId: "moss-dev",
    clientSecret: "z7feqbX7lGyAFzPzGIaC4LT7vidPqrP5",
    issuer: "https://auth.dbpedia.org/realms/dbpedia"
 */
   
