import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';
import { vitePreprocess } from '@sveltejs/kit/vite';
import path from 'path';

const debug = process.env.NODE_ENV === 'development';
export default defineConfig({
	plugins: [
		// Only enable sveltekit() in development mode
		debug && sveltekit({
		}),
		!debug && svelte({
			preprocess: vitePreprocess(),
			onwarn: (warning, handler) => {
				const { code } = warning;
				if (code === "css-unused-selector")
					return;
		
				handler(warning);
			}
		}),
		resolve(),
		!debug && babel({
			babelHelpers: 'runtime',
			exclude: ['node_modules/@babel/**', "node_modules/core-js/**"],
			presets: [
				[
					'@babel/preset-env',
					{
						targets: {
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
					'@babel/plugin-transform-runtime',
				]
			]
		})
	],
	build: {
		emptyOutDir: true,
		outDir: 'build',
		lib: {
			entry: path.resolve(__dirname, 'src/main.ts'),
			name: 'SvelteBundle',
			formats: ['iife'],
			fileName: () => 'bundle.js'
		},
		target: 'es2015',
		minify: !debug ? 'esbuild' : false,
		sourcemap: !debug,
	}
});