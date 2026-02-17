import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		paths: {
			base: '/dashboard'
		},
		adapter: adapter({
			pages: '../static/dashboard',
			assets: '../static/dashboard',
			fallback: 'index.html',
			precompress: true,
			strict: true
		}),
		prerender: {
			handleHttpError: ({ path, referrer, message }) => {
				// Ignore 404s for external assets (served from Hugo site root)
				if (path.startsWith('/images/') || path.startsWith('/site.webmanifest')) {
					return;
				}
				throw new Error(message);
			}
		}
	}
};

export default config;
