import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()]
});

const config = {
    //...
    optimizeDeps: {
        exclude: ["codemirror", "@codemirror/language-javascript" /* ... */],
    },
    //...
}