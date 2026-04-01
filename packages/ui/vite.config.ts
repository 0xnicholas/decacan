import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      rollupTypes: true,
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: '@decacan/ui',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'tailwindcss',
        /^@radix-ui\/.*/,
        'lucide-react',
        'clsx',
        'tailwind-merge',
        'class-variance-authority',
        'cmdk',
        'embla-carousel-react',
        'input-otp',
        'next-themes',
        'react-day-picker',
        'react-hook-form',
        'react-resizable-panels',
        'recharts',
        'sonner',
        'vaul',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
    sourcemap: true,
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
