import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
	plugins: [
		sveltekit()
	],
	resolve: {
		alias: {
			'@Infrastructure': resolve(__dirname, './src/lib/Infrastructure'),
			'@Inputs': resolve(__dirname, './src/lib/Inputs'),
			'$lib': resolve(__dirname, './src/lib')
		}
	}
});