import { Card } from '@/components/ui/card';
import { WifiOff, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-6">
      <Card className="w-full max-w-sm rounded-3xl border-0 p-8 text-center shadow-lg">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50">
          <WifiOff className="h-8 w-8 text-amber-500" />
        </div>
        <h1 className="mt-6 text-xl font-bold text-neutral-900">You&apos;re offline</h1>
        <p className="mt-2 text-sm text-neutral-500">
          MyKiv AI is unavailable without an internet connection. Some cached data may still be viewable.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </Card>
    </div>
  );
}
