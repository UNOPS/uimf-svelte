import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import injectProcessEnv from 'rollup-plugin-inject-process-env';

export default defineConfig({
	plugins: [
		svelte({
			configFile: './svelte.config.js'
		})
	],
	build:
	{
		emptyOutDir: true,
		outDir: 'build',
		lib: {
			entry: 'src/lib/index.ts',
			name: 'SvelteBundle',
			formats: ['iife'],
			fileName: () => 'bundle.js'
		},
		target: 'es2015',
		minify: 'esbuild',
		sourcemap: true,
		rollupOptions: {
			plugins: [
				resolve(),
				babel({
					babelHelpers: 'runtime',
					exclude:
						[
							'node_modules/@babel/**',
							"node_modules/core-js/**"
						],
					presets:
						[
							[
								'@babel/preset-env',
								{
									targets:
									{
										"ie": "9"
									},
									useBuiltIns: "usage",
									corejs: 3,
									forceAllTransforms: true
								}
							]
						],
					plugins: [
						[
							'@babel/plugin-transform-runtime'
						]
					]
				}),
				injectProcessEnv({
					NODE_ENV: process.env.NODE_ENV,
				}),
			]
		}
	}
});