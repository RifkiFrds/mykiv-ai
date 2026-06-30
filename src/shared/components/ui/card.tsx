import { type HTMLAttributes } from 'react';

type CardVariant = 'elevated' | 'flat' | 'glass';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const variantStyles: Record<CardVariant, string> = {
  elevated: 'neu-card',
  flat: 'bg-surface-elevated rounded-[var(--radius-2xl)] border border-border',
  glass: 'glass rounded-[var(--radius-2xl)]',
};

const paddingStyles: Record<'none' | 'sm' | 'md' | 'lg', string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
};

function Card({
  variant = 'elevated',
  padding = 'md',
  className = '',
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export { Card, type CardProps, type CardVariant };
