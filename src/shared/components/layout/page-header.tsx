import { type ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
}

function PageHeader({ title, subtitle, leftAction, rightAction }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-30 glass safe-top">
      <div className="flex items-center justify-between h-14 px-5 max-w-lg mx-auto">
        <div className="w-10 flex justify-start">{leftAction}</div>
        <div className="flex-1 text-center">
          <h1 className="text-lg font-bold text-foreground leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-muted">{subtitle}</p>
          )}
        </div>
        <div className="w-10 flex justify-end">{rightAction}</div>
      </div>
    </header>
  );
}

export { PageHeader, type PageHeaderProps };
