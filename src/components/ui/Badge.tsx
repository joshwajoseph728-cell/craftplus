import React, { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps {
  children: ReactNode;
  variant?: 'brand' | 'accent' | 'slate' | 'success' | 'warning' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'brand',
  size = 'md',
  className
}) => {
  const variants = {
    brand: 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20',
    accent: 'bg-accent-500/10 text-accent-600 dark:text-accent-400 border border-accent-500/20',
    slate: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    outline: 'border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 font-medium rounded-full',
    md: 'text-xs px-2.5 py-1 font-semibold rounded-full'
  };

  return (
    <span className={cn('inline-flex items-center gap-1 leading-none select-none', variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
};
