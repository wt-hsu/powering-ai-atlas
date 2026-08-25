// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// Deployed to GitHub Pages at https://wt-hsu.github.io/powering-ai-atlas/
export default defineConfig({
  site: 'https://wt-hsu.github.io',
  base: '/powering-ai-atlas',
  integrations: [react()],
});
