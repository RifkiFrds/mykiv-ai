import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MyKiv AI — Relationship & Health Companion',
    short_name: 'MyKiv AI',
    description: 'AI Relationship & Health Companion for couples. Track health, strengthen your relationship, and get personalized AI insights.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fafaf9',
    theme_color: '#5c7cfa',
    orientation: 'portrait',
    categories: ['health', 'lifestyle', 'personalization'],
    icons: [
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
