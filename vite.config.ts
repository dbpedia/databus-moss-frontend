import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({command, mode}: any) =>  {
	const env = loadEnv(mode, "./");
	console.log("VITE_MOSS_BASE_URL: " + env.VITE_MOSS_BASE_URL);
	return {
		plugins: [sveltekit()],
		server: {
			proxy: {
				'/api': {
					target: env.VITE_MOSS_BASE_URL,
					changeOrigin: false
				},
				'/g': env.VITE_MOSS_BASE_URL,
				'/layer': env.VITE_MOSS_BASE_URL,
			},
		}
	}
});

