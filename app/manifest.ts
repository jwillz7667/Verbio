import type { MetadataRoute } from 'next';
import { APP_CONFIG } from '@/lib/constants';

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
      { src: '/icon.png', sizes: '64x64', type: 'image/png' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
      { src: '/apple-icon-dark.png', sizes: '180x180', type: 'image/png', purpose: 'maskable' },
    ],
    categories: ['utilities', 'productivity'],
    lang: 'en',
    scope: '/',
    id: APP_CONFIG.url,
  };
}


