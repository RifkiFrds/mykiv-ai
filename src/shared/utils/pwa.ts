export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

export function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return Promise.resolve(null);
  }

  return navigator.serviceWorker
    .register('/sw.js')
    .then((registration) => {
      console.log('SW registered:', registration.scope);

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              if (confirm('A new version of MyKiv is available. Reload to update?')) {
                window.location.reload();
              }
            }
          });
        }
      });

      return registration;
    })
    .catch((err) => {
      console.error('SW registration failed:', err);
      return null;
    });
}

export function listenForInstallPrompt(callback: (event: BeforeInstallPromptEvent) => void) {
  if (typeof window === 'undefined') return;

  const handler = (e: Event) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    callback(deferredPrompt);
  };

  window.addEventListener('beforeinstallprompt', handler);
  return () => window.removeEventListener('beforeinstallprompt', handler);
}

export async function promptInstall(): Promise<boolean> {
  if (!deferredPrompt) return false;
  await deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  return outcome === 'accepted';
}

export function isPWA(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as { standalone?: boolean }).standalone === true;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  if (Notification.permission === 'granted') return 'granted';
  return Notification.requestPermission();
}

export async function sendPushNotification(title: string, options?: NotificationOptions): Promise<void> {
  if (typeof window === 'undefined' || Notification.permission !== 'granted') return;

  const registration = await navigator.serviceWorker.ready;
  await registration.showNotification(title, options);
}

export function sync(tag: string): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('SyncManager' in window)) {
    return Promise.resolve();
  }
  return navigator.serviceWorker.ready.then((reg) => {
    return (reg as ServiceWorkerRegistration & { sync: { register(tag: string): Promise<void> } }).sync.register(tag);
  });
}
