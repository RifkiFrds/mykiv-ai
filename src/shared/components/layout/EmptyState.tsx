import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon className="h-12 w-12 text-neutral-300" />
      <p className="mt-4 text-neutral-500">{title}</p>
      <p className="text-sm text-neutral-400">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
