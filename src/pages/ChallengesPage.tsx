import React, { useState } from 'react';
import { Challenge, Post } from '../types/database.types';
import { INITIAL_CHALLENGES, INITIAL_POSTS } from '../lib/mockData';
import { ChallengeModal } from '../components/challenges/ChallengeModal';
import { useAuth } from '../contexts/AuthContext';
import {
  Trophy,
  Calendar,
  Users,
  Sparkles,
  Award,
  ArrowRight,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { formatCompactNumber, cn } from '../lib/utils';

export const ChallengesPage: React.FC = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>(INITIAL_CHALLENGES);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [userProjects] = useState<Post[]>(INITIAL_POSTS.filter(p => p.user_id === user?.id || p.user_id === 'current-user-me'));

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-pink-600 to-brand-600 text-white p-8 md:p-10 shadow-xl">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold">
            <Trophy className="w-3.5 h-3.5 text-amber-300" />
            <span>Community Builder Challenges</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight font-display">
            Build, Compete & Earn Creator Badges
          </h1>
          <p className="text-xs md:text-sm text-white/90 max-w-xl leading-relaxed">
            Participate in theme-based engineering, AI, design, and hardware sprints. Submit your project showcases and win verified badges for your creator portfolio.
          </p>
        </div>
      </div>

      {/* Active Challenges Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Active Creator Sprints</span>
          </h2>
          <span className="text-xs text-slate-400 font-semibold">{challenges.length} active competitions</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {challenges.map(chal => (
            <div
              key={chal.id}
              onClick={() => setSelectedChallenge(chal)}
              className="group bg-white dark:bg-surface-cardDark rounded-3xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm hover:shadow-md hover:border-brand-500/50 cursor-pointer transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Banner Thumbnail */}
                <div className="relative aspect-[16/9] overflow-hidden bg-black">
                  <img
                    src={chal.banner_url}
                    alt={chal.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/70 text-white backdrop-blur-md">
                      {chal.category}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 flex items-center gap-1 shadow">
                    <Trophy className="w-3 h-3" />
                    <span>{chal.reward_badge.name}</span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 space-y-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-500 transition-colors">
                    {chal.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {chal.tagline}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-brand-500" />
                      <span>{chal.days_left} days left</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-pink-500" />
                      <span>{chal.participants_count} joined</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-brand-600 dark:text-brand-400">
                <span>View Guidelines & Enter</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Challenge Modal Detail & Entry */}
      {selectedChallenge && (
        <ChallengeModal
          challenge={selectedChallenge}
          isOpen={!!selectedChallenge}
          onClose={() => setSelectedChallenge(null)}
          userProjects={userProjects}
          onSubmitted={(chalId, projId) => {
            setChallenges(prev => prev.map(c => c.id === chalId ? { ...c, submissions_count: c.submissions_count + 1 } : c));
          }}
        />
      )}
    </div>
  );
};

