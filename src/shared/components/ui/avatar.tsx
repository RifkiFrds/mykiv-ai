import { type HTMLAttributes } from 'react';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  name: string;
  size?: AvatarSize;
}

const sizeStyles: Record<AvatarSize, string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
};

/** Get initials from a name (max 2 characters) */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/** Deterministic color based on name string */
function getAvatarColor(name: string): string {
  const colors = [
    'bg-primary-400',
    'bg-accent-400',
    'bg-success-400',
    'bg-warning-400',
    'bg-primary-600',
    'bg-accent-600',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function Avatar({ src, name, size = 'md', className = '', ...props }: AvatarProps) {
  const initials = getInitials(name);
  const bgColor = getAvatarColor(name);

  return (
    <div
      className={`
        relative inline-flex items-center justify-center
        rounded-full overflow-hidden
        ring-2 ring-white dark:ring-neutral-800
        shadow-[var(--shadow-neu-sm)]
        flex-shrink-0
        ${sizeStyles[size]}
        ${className}
      `}
      aria-label={name}
      {...props}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div
          className={`w-full h-full flex items-center justify-center text-white font-semibold ${bgColor}`}
        >
          {initials}
        </div>
      )}
    </div>
  );
}

export { Avatar, type AvatarProps, type AvatarSize };
