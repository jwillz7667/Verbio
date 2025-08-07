import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Verbio',
    short_name: 'Verbio',
    description: 'Real-time voice translation platform',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1a4363',
    icons: [
      // Next.js app/icon.tsx and app/apple-icon.tsx emit at /icon and /apple-icon (no .png extension)
      { src: '/icon', sizes: '64x64', type: 'image/png' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
      { src: '/apple-icon-dark', sizes: '180x180', type: 'image/png', purpose: 'maskable' },
    ],
    categories: ['utilities', 'productivity'],
    lang: 'en',
    scope: '/',
    // Use relative id to avoid cross-origin warnings between apex and www subdomain
    id: '/',
  };
}


