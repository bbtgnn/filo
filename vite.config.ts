// SPDX-FileCopyrightText: 2024 Giovanni Abbatepaolo <bbt.gnn@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	// FIX - https://github.com/surrealdb/surrealdb.wasm?tab=readme-ov-file#usage-with-vite
	optimizeDeps: {
		exclude: ['@surrealdb/wasm', 'surrealql.wasm'],
		esbuildOptions: {
			target: 'esnext'
		}
	},
	esbuild: {
		supported: {
			'top-level-await': true
		}
	}
});
