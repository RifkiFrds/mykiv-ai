import { QueryProvider } from '@/shared/providers/query-provider';
import { AuthProvider } from '@/shared/providers/auth-provider';
import { PwaProvider } from '@/shared/providers/pwa-provider';
import { TabBar } from '@/shared/components/layout/tab-bar';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <AuthProvider>
        <PwaProvider>
          <div className="flex-1 flex flex-col min-h-dvh bg-surface">
            <main className="flex-1">{children}</main>
            <TabBar />
          </div>
        </PwaProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
