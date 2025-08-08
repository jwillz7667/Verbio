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
      { src: '/favicon.ico', sizes: '32x32 48x48 64x64', type: 'image/x-icon' },
      { src: '/brand/verbio-logo-light-trans.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }
    ],
    categories: ['utilities', 'productivity'],
    lang: 'en',
    scope: '/',
    id: '/',
  };
}


