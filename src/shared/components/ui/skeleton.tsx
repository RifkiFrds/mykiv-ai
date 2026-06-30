import { type HTMLAttributes } from 'react';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string;
  height?: string;
}

function Skeleton({
  variant = 'text',
  width,
  height,
  className = '',
  ...props
}: SkeletonProps) {
  const variantClasses = {
    text: 'rounded-[var(--radius-md)] h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-[var(--radius-xl)]',
  };

  return (
    <div
      className={`
        bg-neutral-200 dark:bg-neutral-700
        animate-shimmer
        ${variantClasses[variant]}
        ${className}
      `}
      style={{
        width: width || (variant === 'circular' ? '40px' : '100%'),
        height:
          height ||
          (variant === 'circular' ? '40px' : variant === 'rectangular' ? '80px' : undefined),
      }}
      aria-hidden="true"
      {...props}
    />
  );
}

export { Skeleton, type SkeletonProps };
