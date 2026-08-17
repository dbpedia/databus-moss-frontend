import { SvelteKitAuth } from "@auth/sveltekit";
import { env } from "$env/dynamic/private";
import type { Provider } from "@auth/sveltekit/providers";

type OidcDiscoveryDoc = {
	token_endpoint: string;
	userinfo_endpoint: string;
};

let discoveryDoc: OidcDiscoveryDoc | null = null;

function createOidcProvider(): Provider {
	const scope = env.AUTH_OIDC_CLIENT_SCOPE ?? "openid profile email";

	return {
		id: "oidc_provider",
		name: "OIDC Provider",
		type: "oidc",
		clientId: env.AUTH_OIDC_CLIENT_ID!,
		clientSecret: env.AUTH_OIDC_CLIENT_SECRET!,
		issuer: env.AUTH_OIDC_ISSUER!,
		authorization: { params: { scope } },
		...(env.AUTH_OIDC_DISCOVERY_URL
			? { wellKnown: env.AUTH_OIDC_DISCOVERY_URL }
			: {})
	} as Provider;
}

export const { handle, signIn, signOut } = SvelteKitAuth({
	trustHost: env.AUTH_TRUST_HOST === "true",
	debug: env.AUTH_DEBUG === "true",
	providers: [createOidcProvider()],
	secret: env.AUTH_SECRET,
	callbacks: {
		async jwt({ token, account, profile }) {
			if (profile) {
				if (token.email == undefined) {
					token.email = profile.email;
				}

				if (token.name == undefined) {
					token.name = profile.name;
				}

				if (
					account?.access_token &&
					(token.email == undefined || token.name == undefined)
				) {
					const userinfo = await fetchUserInfo(account.access_token);
					if (userinfo) {
						if (token.email == undefined) {
							token.email = userinfo.email;
						}

						if (token.name == undefined) {
							token.name = userinfo.name;
						}
					}
				}

				if (token.name == undefined && profile.sub) {
					token.name = profile.sub;
				}
			}

			if (account?.provider === "oidc_provider") {
				return {
					...token,
					accessToken: account.access_token,
					refreshToken: account.refresh_token,
					expiresAt: account.expires_at
				};
			}

			return token;
		},
		async session({ session, token }) {
			if (token == undefined) {
				return session;
			}

			if (token.email) {
				session.user = {
					...session.user,
					email: token.email as string,
					name: token.name
				};
			}

			const expiresAtTime: number = token.expiresAt as number;

			if (Date.now() >= expiresAtTime * 1000) {
				try {
					const tokenData = await fetchNewAccessToken(token?.refreshToken as string);
					if (tokenData) {
						token.accessToken = tokenData.accessToken;
						token.expiresAt = tokenData.expiresAt;
						token.refreshToken = tokenData.refreshToken;
					}
				} catch {
					// Refresh failed; session continues with existing token state.
				}
			}

			return { ...session, accessToken: token.accessToken };
		}
	}
});

async function fetchUserInfo(
	accessToken: string
): Promise<{ email?: string; name?: string } | null> {
	const doc = await getDiscoveryDoc();
	if (!doc?.userinfo_endpoint) {
		return null;
	}

	const response = await fetch(doc.userinfo_endpoint, {
		headers: { Authorization: `Bearer ${accessToken}` }
	});

	if (!response.ok) {
		return null;
	}

	return response.json();
}

async function fetchNewAccessToken(refreshToken: string | null) {
	if (refreshToken == null) {
		return null;
	}

	const tokenEndpointUrl = await fetchTokenEndpointUrl();
	if (tokenEndpointUrl == null) {
		return null;
	}

	const response = await fetch(tokenEndpointUrl, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: new URLSearchParams({
			grant_type: "refresh_token",
			refresh_token: refreshToken,
			client_id: env.AUTH_OIDC_CLIENT_ID!,
			client_secret: env.AUTH_OIDC_CLIENT_SECRET!
		})
	});

	if (!response.ok) {
		throw new Error("Failed to refresh access token");
	}

	const data = await response.json();
	const decoded = decodeJWT(data.access_token);
	return {
		accessToken: data.access_token,
		expiresAt: decoded.exp,
		refreshToken: data.refresh_token
	};
}

function decodeJWT(token: string | undefined) {
	if (token == undefined) {
		return null;
	}

	const base64Url = token.split(".")[1];
	const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
	const jsonPayload = decodeURIComponent(
		atob(base64)
			.split("")
			.map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
			.join("")
	);
	return JSON.parse(jsonPayload);
}

async function getDiscoveryDoc(): Promise<OidcDiscoveryDoc | null> {
	if (discoveryDoc) {
		return discoveryDoc;
	}

	const issuer = env.AUTH_OIDC_ISSUER;
	if (!issuer) {
		return null;
	}

	const discoveryURL =
		env.AUTH_OIDC_DISCOVERY_URL ?? `${issuer}/.well-known/openid-configuration`;

	try {
		const response = await fetch(discoveryURL);
		if (!response.ok) {
			return null;
		}

		discoveryDoc = await response.json();
		return discoveryDoc;
	} catch {
		return null;
	}
}

async function fetchTokenEndpointUrl(): Promise<string | null> {
	const doc = await getDiscoveryDoc();
	return doc?.token_endpoint ?? null;
}
