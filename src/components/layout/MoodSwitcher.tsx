import React from 'react';
import { useMood } from '../../contexts/MoodContext';
import { Briefcase, Sparkles, Film, Code2, Coffee } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface MoodSwitcherProps {
  compact?: boolean;
}

export const MoodSwitcher: React.FC<MoodSwitcherProps> = ({ compact = false }) => {
  const { mood, setMood } = useMood();

  if (compact) {
    return (
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setMood('work')}
          className={cn(
            'flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all',
            mood === 'work'
              ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          )}
          title="Work Mood: Projects, Code, Case Studies & Architecture"
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Work</span>
        </button>

        <button
          type="button"
          onClick={() => setMood('normal')}
          className={cn(
            'flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all',
            mood === 'normal'
              ? 'bg-gradient-to-r from-pink-600 to-amber-500 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          )}
          title="Normal Mood: Creative Reels, BTS, Jams & Chill Posts"
        >
          <Coffee className="w-3.5 h-3.5" />
          <span>Normal</span>
        </button>
      </div>
    );
  }

  return (
    <div className="p-1.5 bg-slate-100 dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center shadow-inner">
      <button
        type="button"
        onClick={() => setMood('work')}
        className={cn(
          'flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-extrabold transition-all duration-200 select-none',
          mood === 'work'
            ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm border border-slate-200/60 dark:border-slate-700/60'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        )}
      >
        <Briefcase className="w-4 h-4 text-brand-500" />
        <span>Work Mood</span>
      </button>

      <button
        type="button"
        onClick={() => setMood('normal')}
        className={cn(
          'flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-extrabold transition-all duration-200 select-none',
          mood === 'normal'
            ? 'bg-white dark:bg-slate-800 text-pink-600 dark:text-pink-400 shadow-sm border border-slate-200/60 dark:border-slate-700/60'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        )}
      >
        <Film className="w-4 h-4 text-pink-500" />
        <span>Normal Mood</span>
      </button>
    </div>
  );
};
