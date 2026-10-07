import { MetadataRoute } from 'next';
import { APP_CONFIG } from '@/config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/jobs/', '/.temp_storage/'],
    },
    sitemap: `${APP_CONFIG.url}/sitemap.xml`,
  };
}
