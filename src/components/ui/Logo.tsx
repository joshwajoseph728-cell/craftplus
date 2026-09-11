import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

export interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showTagline?: boolean;
  clickable?: boolean;
  to?: string;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  showTagline = false,
  clickable = true,
  to = '/feed',
  className
}) => {
  const sizeMap = {
    sm: { img: 'w-7 h-7', text: 'text-lg', tagline: 'text-[9px]' },
    md: { img: 'w-9 h-9', text: 'text-xl', tagline: 'text-[10px]' },
    lg: { img: 'w-12 h-12', text: 'text-2xl sm:text-3xl', tagline: 'text-xs' },
    xl: { img: 'w-16 h-16 sm:w-20 sm:h-20', text: 'text-3xl sm:text-4xl', tagline: 'text-sm' },
  };

  const currentSize = sizeMap[size];

  const content = (
    <div className={cn("flex items-center gap-2.5 select-none group", className)}>
      {/* Official C+ Logo Icon */}
      <div className="relative shrink-0">
        <img
          src="/logo.png"
          alt="CraftPlus"
          className={cn(
            currentSize.img,
            "rounded-xl object-contain shadow-sm transition-transform duration-200 group-hover:scale-105"
          )}
        />
      </div>

      {/* Typography */}
      {showText && (
        <div className="flex flex-col justify-center">
          <span className={cn(
            "font-display font-extrabold tracking-tight leading-none text-slate-900 dark:text-white",
            currentSize.text
          )}>
            Craft<span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-pink-500 bg-clip-text text-transparent">Plus</span>
          </span>
          {showTagline && (
            <p className={cn(
              "font-medium tracking-wide text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1",
              currentSize.tagline
            )}>
              <span>Connect</span>
              <span className="text-sky-500 font-bold">•</span>
              <span>Create</span>
              <span className="text-pink-500 font-bold">•</span>
              <span>Share</span>
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (clickable) {
    return (
      <Link to={to} className="inline-flex items-center focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
};
