import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: process.env.PUBLIC_SITE_URL || 'https://example.com',
  base: process.env.PUBLIC_BASE_PATH || '/',
  trailingSlash: 'ignore',
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  vite: {
    optimizeDeps: {
      include: ['three', '@react-three/fiber', '@react-three/drei'],
    },
    build: {
      sourcemap: false,
    },
  },
});
