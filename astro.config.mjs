import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'url';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  site: 'https://my-podcast.com',
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@config': fileURLToPath(new URL('./podcast.config.js', import.meta.url))
      }
    }
  }
});
