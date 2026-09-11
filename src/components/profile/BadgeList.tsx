import React, { useState } from 'react';
import { Badge } from '../../types/database.types';
import { Modal } from '../ui/Modal';
import { Award, Sparkles, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface BadgeListProps {
  badges: Badge[];
  compact?: boolean;
}

export const BadgeList: React.FC<BadgeListProps> = ({ badges, compact = false }) => {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  if (!badges || badges.length === 0) return null;

  const getTierGradient = (tier?: string) => {
    switch (tier) {
      case 'diamond':
        return 'from-cyan-500/20 via-blue-500/20 to-purple-500/20 border-cyan-500/40 text-cyan-500';
      case 'gold':
        return 'from-amber-500/20 via-yellow-500/20 to-orange-500/20 border-amber-500/40 text-amber-500';
      case 'silver':
        return 'from-slate-300/20 via-slate-400/20 to-zinc-400/20 border-slate-400/40 text-slate-300';
      default:
        return 'from-brand-500/15 to-purple-500/15 border-brand-500/30 text-brand-500';
    }
  };

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        {badges.map(b => (
          <button
            key={b.id}
            type="button"
            onClick={() => setSelectedBadge(b)}
            className={cn(
              'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r border transition-all hover:scale-105 select-none shadow-2xs',
              getTierGradient(b.tier)
            )}
            title={`${b.name}: ${b.description}`}
          >
            <span>{b.icon}</span>
            <span className="text-slate-900 dark:text-white text-[11px]">{b.name}</span>
          </button>
        ))}

        {/* Badge Details Modal */}
        {selectedBadge && (
          <Modal
            isOpen={!!selectedBadge}
            onClose={() => setSelectedBadge(null)}
            title="Creator Achievement"
            maxWidth="sm"
          >
            <div className="text-center space-y-4 py-2">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-brand-500/20 to-pink-500/20 border border-brand-500/30 flex items-center justify-center mx-auto text-3xl shadow-glow-brand">
                {selectedBadge.icon}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedBadge.name}
                </h3>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-brand-500">
                  {selectedBadge.tier ? `${selectedBadge.tier} Tier Achievement` : 'Creator Milestone'}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                {selectedBadge.description}
              </p>
            </div>
          </Modal>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
        <Award className="w-3.5 h-3.5 text-brand-500" />
        <span>Verified Achievements & Badges ({badges.length})</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
        {badges.map(b => (
          <div
            key={b.id}
            onClick={() => setSelectedBadge(b)}
            className={cn(
              'flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r border transition-all hover:scale-[1.02] cursor-pointer shadow-sm',
              getTierGradient(b.tier)
            )}
          >
            <div className="w-10 h-10 rounded-xl bg-white/80 dark:bg-slate-900/80 flex items-center justify-center text-xl shrink-0 shadow-2xs">
              {b.icon}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{b.name}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">{b.description}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedBadge && (
        <Modal
          isOpen={!!selectedBadge}
          onClose={() => setSelectedBadge(null)}
          title="Creator Achievement"
          maxWidth="sm"
        >
          <div className="text-center space-y-4 py-2">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-brand-500/20 to-pink-500/20 border border-brand-500/30 flex items-center justify-center mx-auto text-3xl shadow-glow-brand">
              {selectedBadge.icon}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {selectedBadge.name}
              </h3>
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-brand-500">
                {selectedBadge.tier ? `${selectedBadge.tier} Tier Achievement` : 'Creator Milestone'}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800">
              {selectedBadge.description}
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};

