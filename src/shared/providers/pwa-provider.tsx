'use client';

import { useEffect, type ReactNode } from 'react';

interface PwaProviderProps {
  children: ReactNode;
}

/**
 * Registers PWA Service Worker on application mount.
 */
export function PwaProvider({ children }: PwaProviderProps) {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      (window as any).workbox === undefined
    ) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('Service Worker registered successfully with scope:', reg.scope);
        })
        .catch((err) => {
          console.error('Service Worker registration failed:', err);
        });
    }
  }, []);

  return <>{children}</>;
}
