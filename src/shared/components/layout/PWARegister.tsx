'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from '@/shared/utils/pwa';

export function PWARegister() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return null;
}
