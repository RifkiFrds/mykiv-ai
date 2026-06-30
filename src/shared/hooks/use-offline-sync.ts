'use client';

import { useEffect, useState, useTransition } from 'react';
import { createHealthLog } from '@/features/health/actions/health';
import type { HealthLogType } from '@/shared/types/database';

interface OfflineQueueItem {
  id: string;
  type: HealthLogType;
  value: any;
  unit: string | null;
  datetime: string;
  note?: string | null;
}

const STORAGE_KEY = 'mykiv_offline_health_queue';

/**
 * Custom hook to manage offline caching and automatic sync of health data logs.
 */
export function useOfflineSync(onSyncSuccess?: () => void) {
  const [isOnline, setIsOnline] = useState(true);
  const [queue, setQueue] = useState<OfflineQueueItem[]>([]);
  const [isSyncing, startSyncTransition] = useTransition();

  // Load initial queue and register online/offline listeners
  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);

    const savedQueue = localStorage.getItem(STORAGE_KEY);
    if (savedQueue) {
      setQueue(JSON.parse(savedQueue));
    }

    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Trigger auto sync when coming back online
  useEffect(() => {
    if (isOnline && queue.length > 0 && !isSyncing) {
      triggerSync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline, queue]);

  /** Add health log to either local storage queue (if offline) or execute sync */
  const addLog = async (
    type: HealthLogType,
    value: any,
    unit: string | null,
    datetime: string,
    note?: string | null,
  ) => {
    if (!navigator.onLine) {
      // Offline mode: cache locally
      const newItem: OfflineQueueItem = {
        id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        value,
        unit,
        datetime,
        note,
      };

      const updatedQueue = [...queue, newItem];
      setQueue(updatedQueue);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedQueue));

      return {
        success: true,
        offline: true,
        message: 'Saved locally. Will sync when you are online.',
      };
    }

    // Online mode: submit directly
    return await createHealthLog(type, value, unit, datetime, note);
  };

  /** Trigger background sync of all cached items */
  const triggerSync = () => {
    if (queue.length === 0) return;

    startSyncTransition(async () => {
      const itemsToSync = [...queue];
      const remainingItems: OfflineQueueItem[] = [];

      for (const item of itemsToSync) {
        const res = await createHealthLog(
          item.type,
          item.value,
          item.unit,
          item.datetime,
          item.note,
        );

        if (!res.success) {
          // If a log fails to sync, keep it in the queue to retry later
          remainingItems.push(item);
        }
      }

      setQueue(remainingItems);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(remainingItems));

      if (remainingItems.length === 0 && onSyncSuccess) {
        onSyncSuccess();
      }
    });
  };

  return {
    isOnline,
    isSyncing,
    addLog,
    queueLength: queue.length,
    triggerSync,
  };
}
