import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import topLevelAwait from 'vite-plugin-top-level-await';

export default defineConfig({
	optimizeDeps: {
		exclude: ['surrealdb.wasm']
	},
	plugins: [sveltekit(), topLevelAwait()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
