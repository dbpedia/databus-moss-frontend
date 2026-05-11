import { readFileSync } from 'node:fs';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';

const { version: appVersion } = JSON.parse(
	readFileSync(new URL('./package.json', import.meta.url), 'utf-8')
) as { version: string };

export default defineConfig(({command, mode}: any) =>  {
	const env = loadEnv(mode, "./");
	return {
		define: {
			'import.meta.env.VITE_APP_VERSION': JSON.stringify(appVersion)
		},
		plugins: [sveltekit()],
		/*
		server: {
			proxy: {
				'/api': {
					target: env.VITE_MOSS_BASE_URL,
					changeOrigin: false
				},
				'/g': env.VITE_MOSS_BASE_URL,
				'/layer': env.VITE_MOSS_BASE_URL,
				'/sparql': env.VITE_MOSS_BASE_URL
			},
		}*/
	}
});

