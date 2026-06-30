import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ErrorBoundary } from '@/shared/components/layout/ErrorBoundary';
import { PWARegister } from '@/shared/components/layout/PWARegister';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MyKiv AI - Relationship & Health Companion',
  description: 'AI-powered relationship and health companion for couples',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MyKiv AI',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#0d9488" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className={`${inter.className} bg-neutral-100 antialiased`}>
        <ErrorBoundary>
          <PWARegister />
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
