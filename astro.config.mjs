import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://my-podcast.com',
  output: 'static', // or 'hybrid' if you need server endpoints
  integrations: [tailwind()],
});
