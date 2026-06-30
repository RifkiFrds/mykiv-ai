import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Welcome',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-dvh bg-surface p-4">
      {children}
    </div>
  );
}
