import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '');
  const industry = env.DECACAN_INDUSTRY || 'default';
  
  console.log(`[Vite] Building for industry: ${industry}`);
  
  return {
    plugins: [react(), tailwindcss()],
    base: '/',
    
    define: {
      // Inject industry ID as global constant
      __INDUSTRY__: JSON.stringify(industry),
      'import.meta.env.VITE_INDUSTRY': JSON.stringify(industry),
    },
    
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@decacan/ui': fileURLToPath(new URL('../../packages/ui', import.meta.url)),
      },
    },
    
    server: {
      host: '127.0.0.1',
      port: 5173,
      strictPort: false,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
    
    build: {
      chunkSizeWarningLimit: 3000,
      rollupOptions: {
        output: {
          manualChunks: {
            // Separate industry configs into their own chunks
            'industry-default': ['./src/config/industries/default.ts'],
            'industry-short-drama': ['./src/config/industries/short-drama.ts'],
            'industry-short-video': ['./src/config/industries/short-video.ts'],
          },
        },
      },
    },
    
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: "./src/test/setup.ts"
    }
  };
});
