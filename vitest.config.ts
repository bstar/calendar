import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './test/setup.ts',
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'test/**',
        '**/*.d.ts',
        '**/*.types.ts',
        '**/*.types.tsx',
        '**/types.ts',
        '**/types.tsx',
        '**/*.config.*',
        '**/mockData/**',
        'src/main.tsx',
        'src/App.tsx',
        'src/stories/**',
        '.storybook/**',
        '**/*.stories.*',
        'storybook-static/**',
        'src/examples/**',
        'src/components/utils/storybook-*',
        'src/components/DebugPopup.tsx',
        '**/dist/**',
        '**/.vite/**',
        '**/index.ts'  // Often just re-exports
      ],
      include: ['src/**/*.{ts,tsx,js,jsx}']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});