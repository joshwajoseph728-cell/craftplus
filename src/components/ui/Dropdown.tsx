import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: ReactNode;
  danger?: boolean;
  onClick: () => void;
}

export interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align = 'right',
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block" ref={menuRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={cn(
            'absolute top-full mt-2 w-48 bg-white dark:bg-surface-cardDark border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1.5 z-40 animate-scale-in text-slate-800 dark:text-slate-200',
            align === 'right' ? 'right-0' : 'left-0',
            className
          )}
        >
          {items.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
              className={cn(
                'w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-left transition-colors',
                item.danger
                  ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200'
              )}
            >
              {item.icon && <span className="w-4 h-4 shrink-0">{item.icon}</span>}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
