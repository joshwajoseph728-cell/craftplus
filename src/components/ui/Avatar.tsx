import React from 'react';
import { cn } from '../../lib/utils';
import { CheckCircle2 } from 'lucide-react';

export interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  hasStory?: boolean;
  storyViewed?: boolean;
  isVerified?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  size = 'md',
  hasStory = false,
  storyViewed = false,
  isVerified = false,
  className,
  onClick
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
    '2xl': 'w-28 h-28 text-3xl'
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'VS';
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative inline-block shrink-0 select-none',
        onClick && 'cursor-pointer'
      )}
    >
      <div
        className={cn(
          'rounded-full flex items-center justify-center p-[2px] transition-all duration-300',
          hasStory && !storyViewed && 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-brand-600 p-[2.5px] hover:scale-105',
          hasStory && storyViewed && 'bg-slate-300 dark:bg-slate-700 p-[2px]',
          !hasStory && 'bg-transparent'
        )}
      >
        <div
          className={cn(
            'rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 flex items-center justify-center border-2 border-surface-light dark:border-surface-dark transition-all',
            sizeClasses[size],
            className
          )}
        >
          {src ? (
            <img
              src={src}
              alt={alt}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                // Fallback on broken image
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <span className="font-bold text-slate-600 dark:text-slate-300">
              {getInitials(alt)}
            </span>
          )}
        </div>
      </div>

      {isVerified && (
        <span
          className={cn(
            'absolute bottom-0 right-0 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center text-brand-500',
            size === 'xs' || size === 'sm' ? 'scale-75 translate-x-1 translate-y-1' : '',
            size === 'xl' || size === '2xl' ? 'scale-125' : ''
          )}
          title="Verified Account"
        >
          <CheckCircle2 className="w-3.5 h-3.5 fill-brand-500 text-white" />
        </span>
      )}
    </div>
  );
};
