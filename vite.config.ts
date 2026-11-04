import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.svg'],
        manifest: {
          id: '/',
          name: 'ระบบบันทึกสารสนเทศนักศึกษา มสธ. ลำปาง STOU Lampang Student Information Management System',
          short_name: 'มสธ. ลำปาง',
          description: 'ระบบบันทึกสารสนเทศนักศึกษา มสธ. ลำปาง ศูนย์วิทยบริการและชุมชนสัมพันธ์ มสธ. ลำปาง',
          theme_color: '#064e3b',
          background_color: '#064e3b',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/icon.svg',
              sizes: '192x192 512x512',
              type: 'image/svg+xml',
              purpose: 'any maskable',
            },
          ],
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 6 * 1024 * 1024, // 6MB limit to support bundled barcode scanner & xlsx
        },
        devOptions: {
          enabled: true,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname || '.', '.'),
      },
    },
    server: {
      hmr: false,
      watch: null,
    },
  };
});
