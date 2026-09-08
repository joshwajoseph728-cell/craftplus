import React from 'react';
import { cn } from '../../lib/utils';

export interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div
      className={cn(
        'animate-pulse bg-slate-200 dark:bg-slate-800 rounded-xl',
        className
      )}
    />
  );
};

export const PostSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-surface-cardDark border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 md:p-5 space-y-4 mb-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="w-28 h-3.5" />
          <Skeleton className="w-16 h-2.5" />
        </div>
      </div>

      {/* Media Image */}
      <Skeleton className="w-full aspect-[4/3] rounded-xl" />

      {/* Actions */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex space-x-4">
          <Skeleton className="w-6 h-6 rounded-md" />
          <Skeleton className="w-6 h-6 rounded-md" />
          <Skeleton className="w-6 h-6 rounded-md" />
        </div>
        <Skeleton className="w-6 h-6 rounded-md" />
      </div>

      {/* Caption lines */}
      <div className="space-y-2">
        <Skeleton className="w-32 h-3" />
        <Skeleton className="w-full h-3" />
        <Skeleton className="w-3/4 h-3" />
      </div>
    </div>
  );
};
