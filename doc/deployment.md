# Deployment

This app is a [SvelteKit](https://kit.svelte.dev/) project using the **Node** adapter (`@sveltejs/adapter-node`). The production server listens on port **3000** by default (`node build`).

## Prerequisites

- **Node.js 20** (matches the Docker build images).
- A running **MOSS API** backend the frontend can reach (server-side proxy and server loads call this URL).
- An **OpenID Connect** provider and a registered confidential client (client ID + secret) compatible with [Auth.js](https://authjs.dev/) / `@auth/sveltekit`.

## Docker (recommended layout in this repo)

The repository includes a multi-stage `Dockerfile`:

1. **Build stage** (`node:20`): `npm install`, copy sources, `npm run build`.
2. **Runtime stage** (`node:20-alpine`): copies the full `/app` tree from the builder, runs `npm install --omit=dev`, starts with `node build`.

### Build the image

From the repository root:

```bash
docker build -t moss-frontend .
```

### Run the container

Expose port 3000 (or map host port → container 3000). Pass **all** required environment variables at runtime (see [Environment variables](#environment-variables)). Example:

```bash
docker run --rm -p 3000:3000 \
  -e PUBLIC_MOSS_BASE_URL="https://moss.example.com" \
  -e MOSS_API_SERVER_URL="https://moss-api.internal:8080" \
  -e AUTH_OIDC_CLIENT_ID="your-client-id" \
  -e AUTH_OIDC_CLIENT_SECRET="your-client-secret" \
  -e AUTH_OIDC_ISSUER="https://your-idp/realms/your-realm" \
  moss-frontend
```

### Docker Compose

`docker-compose.yml` defines `moss-frontend` (this app) and an optional **nginx** reverse proxy. Adjust `environment` for your deployment; map ports as needed (the sample maps host `5000` → app `3000`, and nginx on `1337`).

**Note:** Outbound proxy settings expected by the app use standard names such as `HTTP_PROXY`, `HTTPS_PROXY`, and `NO_PROXY` (see `src/lib/fetch-proxy.ts`). If you edit Compose, prefer those names for consistency.

### Reverse proxy / TLS

If the app sits behind nginx or another reverse proxy:

- Terminate TLS at the proxy and forward HTTP to the Node process.
- Set `AUTH_TRUST_HOST=true` when Auth.js must trust `X-Forwarded-Host` / `X-Forwarded-Proto` (typical behind a proxy).

## Non-Docker (Node on a host or VM)

1. Install dependencies: `npm ci` (or `npm install`).
2. Build: `npm run build`.
3. Run production server: `node build` (output directory is configured as `build` in `svelte.config.js`).
4. Set the same environment variables you would use in Docker.

Optional local preview after build: `npm run preview` (Vite preview; not identical to `node build` but useful for smoke tests).

## Deployment parameters (checklist)

| Parameter | Description |
|-----------|-------------|
| **Container / process port** | App listens on **3000** in the Dockerfile; map host ports in Compose or `docker run -p`. |
| **MOSS backend URL** | `MOSS_API_SERVER_URL` must be reachable **from the Node server** (server-side `fetch` and proxy in `hooks.server.ts`). |
| **Public MOSS URL** | `PUBLIC_MOSS_BASE_URL` is exposed to the browser; use the URL users and browsers should use (may differ from internal `MOSS_API_SERVER_URL` if you split public vs internal routing). |
| **OIDC** | `AUTH_OIDC_CLIENT_ID`, `AUTH_OIDC_CLIENT_SECRET`, and `AUTH_OIDC_ISSUER` are required at startup (`src/auth.ts`). Optional `AUTH_OIDC_DISCOVERY_URL` overrides the discovery document location. |
| **Auth session signing** | Use a strong, unique `AUTH_SECRET` in production. |
| **Corporate proxy** | If the server must reach the IdP or MOSS through an HTTP(S) proxy, set `HTTP_PROXY` / `HTTPS_PROXY` / `NO_PROXY`. |

---

## Environment variables

Values are typically loaded from `.env` in development and from the orchestrator (Docker, Kubernetes, systemd, etc.) in production. **Do not commit real secrets.**

> **Security note:** `.env` cannot represent “comments” inside a secret line in all tools; keep secrets only in secret stores or local files excluded from version control.

### MOSS / API

| Variable | Scope | Description |
|----------|--------|---------------|
| `PUBLIC_MOSS_BASE_URL` | Public (browser) | Base URL of the MOSS instance for links, client-side `fetch`, and embedded resources (e.g. widgets, SPARQL, layer API paths). Loaded via `$env/dynamic/public`. |
| `MOSS_API_SERVER_URL` | Private (server) | Backend base URL used when proxying API-like paths in `hooks.server.ts` and in several `+server.ts` / `+page.server.ts` loaders (append path + query from the incoming request). |


### App URL / origin

| Variable | Scope | Description |
|----------|--------|---------------|
| `ORIGIN` | Private | **TODO:** Intended canonical origin for the deployed app (e.g. `https://app.example.com`). Not referenced directly in `src/`; may be consumed by SvelteKit, Auth.js, or deployment docs — confirm in your hosting setup. |

OIDC redirect/callback URLs are configured in your identity provider to match the deployed app URL; Auth.js (`@auth/sveltekit`) uses server-side `AUTH_OIDC_*` variables only—this project does not use `VITE_*` OIDC env vars.

### Auth (server — Auth.js / `@auth/sveltekit`)

| Variable | Description |
|----------|-------------|
| `AUTH_OIDC_CLIENT_ID` | OIDC client ID (required). |
| `AUTH_OIDC_CLIENT_SECRET` | OIDC client secret (required). |
| `AUTH_OIDC_ISSUER` | Issuer URL (required). |
| `AUTH_OIDC_DISCOVERY_URL` | Optional full URL to `.well-known/openid-configuration`; when set, used instead of default `${issuer}/.well-known/openid-configuration`. |
| `AUTH_OIDC_CLIENT_SCOPE` | OAuth scopes for the provider (e.g. `openid profile email`). |
| `AUTH_TRUST_HOST` | When `true`, Auth.js trusts forwarded host/proto headers (typical behind reverse proxies). Also referenced in sample `docker-compose.yml`. |
| `AUTH_SECRET` | Secret for signing/encrypting session data and tokens (production must be a long random value). **TODO:** `src/auth.ts` currently passes a hardcoded `secret` to `SvelteKitAuth`; align implementation with `AUTH_SECRET` from the environment for deployments. |
| `AUTH_DEBUG` | Set to `"true"` to enable Auth.js debug logging (`src/auth.ts`). |

### Outbound HTTP proxy (server)

Used in `setupFetchProxy()` (`src/lib/fetch-proxy.ts`) for OIDC / discovery `fetch` calls. Both uppercase and lowercase names are supported.

| Variable | Description |
|----------|-------------|
| `HTTP_PROXY` / `http_proxy` | Proxy for `http://` outbound requests. |
| `HTTPS_PROXY` / `https_proxy` | Proxy for `https://` outbound requests (preferred when both are set for HTTPS). |
| `NO_PROXY` / `no_proxy` | Comma-separated host suffixes to bypass the proxy (e.g. `localhost,.internal`). |


---

## Related files

- `Dockerfile` — build and run instructions for production.
- `docker-compose.yml` — sample stack with nginx.
- `svelte.config.js` — `adapter-node`, output `build/`.
- `src/hooks.server.ts` — auth + MOSS API proxy.
- `src/auth.ts` — OIDC provider setup.
