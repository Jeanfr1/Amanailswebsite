import { defineConfig } from 'vite';

export default defineConfig({
  build: { target: 'es2020', assetsInlineLimit: 0, cssCodeSplit: false },
  server: { port: 5317 },
  preview: { port: 4317 },
});
