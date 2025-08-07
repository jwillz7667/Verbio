import type { MetadataRoute } from 'next';
import { APP_CONFIG } from '@/lib/constants';

export default function robots(): MetadataRoute.Robots {
  const base = APP_CONFIG.url;
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/signout'],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}


