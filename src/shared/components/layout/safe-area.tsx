import { type ReactNode } from 'react';

interface SafeAreaProps {
  children: ReactNode;
  className?: string;
  /** Add bottom padding for tab bar */
  withTabBar?: boolean;
}

/**
 * Wrapper that provides iOS safe-area inset padding
 * and optional tab bar clearance.
 */
function SafeArea({ children, className = '', withTabBar = false }: SafeAreaProps) {
  return (
    <div
      className={`
        w-full max-w-lg mx-auto
        ${withTabBar ? 'pb-[var(--spacing-tab-bar)]' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export { SafeArea, type SafeAreaProps };
