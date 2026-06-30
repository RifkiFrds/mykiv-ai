export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-screen max-w-md bg-neutral-50 px-6 py-12">
      {children}
    </div>
  );
}
