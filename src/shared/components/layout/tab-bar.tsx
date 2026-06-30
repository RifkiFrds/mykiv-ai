'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Heart,
  Sparkles,
  Users,
  User,
  type LucideIcon,
} from 'lucide-react';
import { TAB_ITEMS } from '@/shared/constants/routes';

const ICON_MAP: Record<string, LucideIcon> = {
  home: Home,
  heart: Heart,
  sparkles: Sparkles,
  users: Users,
  user: User,
};

function TabBar() {
  const pathname = usePathname();

  return (
    <nav
      className={`
        fixed bottom-0 left-0 right-0 z-40
        glass
        border-t border-border
        safe-bottom
      `}
      role="tablist"
      aria-label="Main navigation"
    >
      <div className="max-w-lg mx-auto flex items-center justify-around h-16 px-2">
        {TAB_ITEMS.map((tab) => {
          const Icon = ICON_MAP[tab.icon];
          const isActive =
            tab.href === '/'
              ? pathname === '/'
              : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              role="tab"
              aria-selected={isActive}
              aria-label={tab.label}
              className={`
                flex flex-col items-center justify-center gap-0.5
                w-16 h-14
                rounded-[var(--radius-xl)]
                transition-all duration-200
                ${
                  isActive
                    ? 'text-primary-500'
                    : 'text-muted hover:text-foreground'
                }
              `}
            >
              <div
                className={`
                  relative p-1.5 rounded-[var(--radius-lg)]
                  transition-all duration-200
                  ${isActive ? 'bg-primary-50 dark:bg-primary-900/30 scale-110' : ''}
                `}
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 2}
                  className="transition-all duration-200"
                />
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-500" />
                )}
              </div>
              <span
                className={`text-[10px] font-medium transition-all duration-200 ${
                  isActive ? 'font-semibold' : ''
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export { TabBar };
