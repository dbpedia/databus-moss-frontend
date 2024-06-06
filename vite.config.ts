import routify from '@roxi/routify/vite-plugin';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({command, mode}: any) =>  {
	const env = loadEnv(mode, "./");
	console.log("VITE_MOSS_BASE_URL: " + env.VITE_MOSS_BASE_URL);
	return {	
		plugins: [sveltekit(), routify({})],
		server: {
			proxy: {
				'/api': env.VITE_MOSS_BASE_URL,
				'/g': env.VITE_MOSS_BASE_URL,
				'/layer': env.VITE_MOSS_BASE_URL,
			},
		}
	}
});

