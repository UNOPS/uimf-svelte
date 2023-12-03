import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: vitePreprocess(),
    kit: {
        adapter: adapter()
    },
    onwarn: (warning, handler) => {
        const { code } = warning;
        if (code === "css-unused-selector") {
            return;
        }

        if (warning.filename.includes("node_modules")) {
            return;
        }

        handler(warning);
    },
    compilerOptions: {
        accessors: false,
        legacy: true
    },
};

export default config;