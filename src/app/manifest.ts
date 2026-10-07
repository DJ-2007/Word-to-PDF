import { MetadataRoute } from 'next';
import { APP_CONFIG } from '@/config';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${APP_CONFIG.name} — ${APP_CONFIG.tagline}`,
    short_name: APP_CONFIG.name,
    description: APP_CONFIG.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#020617',
    theme_color: '#4f46e5',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
