import { MetadataRoute } from 'next';
import { APP_CONFIG } from '@/config';
import { CONVERSION_TOOLS } from '@/lib/format-registry';
import { BLOG_POSTS } from '@/lib/blog-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = APP_CONFIG.url;

  const staticRoutes = [
    '',
    '/tools',
    '/pricing',
    '/security',
    '/status',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    '/blog',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  const toolRoutes = CONVERSION_TOOLS.map((tool) => ({
    url: `${baseUrl}/tools/${tool.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: tool.popular ? 0.9 : 0.7,
  }));

  const blogRoutes = BLOG_POSTS.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...toolRoutes, ...blogRoutes];
}
