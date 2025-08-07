import type { MetadataRoute } from 'next';
import { APP_CONFIG } from '@/lib/constants';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = APP_CONFIG.url;
  const now = new Date().toISOString();
  return [
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${base}/signin`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${base}/profile`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
  ];
}


