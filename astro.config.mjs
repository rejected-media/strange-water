import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import { fileURLToPath } from 'url';

// https://astro.build/config
export default defineConfig({
  site: 'https://my-podcast.com',
  output: 'static',
  integrations: [tailwind()],
  vite: {
    resolve: {
      alias: {
        '@config': fileURLToPath(new URL('./podcast.config.js', import.meta.url))
      }
    }
  }
});
