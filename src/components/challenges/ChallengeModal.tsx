import React, { useState } from 'react';
import { Challenge, Post } from '../../types/database.types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import {
  Trophy,
  Calendar,
  Users,
  CheckCircle2,
  Sparkles,
  Award,
  UploadCloud,
  Check
} from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ChallengeModalProps {
  challenge: Challenge | null;
  isOpen: boolean;
  onClose: () => void;
  userProjects?: Post[];
  onSubmitted?: (challengeId: string, projectId: string) => void;
}

export const ChallengeModal: React.FC<ChallengeModalProps> = ({
  challenge,
  isOpen,
  onClose,
  userProjects = [],
  onSubmitted
}) => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);

  if (!challenge) return null;

  const handleSubmitEntry = async () => {
    if (!user) {
      showToast('Sign In Required', 'Please sign in to enter creator challenges', 'warning');
      return;
    }
    if (!selectedProjectId) {
      showToast('Select a Project', 'Please choose which of your project showcases to submit', 'warning');
      return;
    }

    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 600));

    setHasEntered(true);
    setIsSubmitting(false);
    showToast(
      'Challenge Entry Submitted! 🏆',
      `Your project has been submitted to the ${challenge.title}. Badge will be evaluated during judging!`,
      'success'
    );

    if (onSubmitted) {
      onSubmitted(challenge.id, selectedProjectId);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={challenge.title}
      description={challenge.tagline}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Banner Hero */}
        <div className="relative aspect-[21/9] rounded-3xl overflow-hidden bg-black border border-slate-800 shadow-md">
          <img
            src={challenge.banner_url}
            alt={challenge.title}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex items-end p-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-600 text-white shadow">
                {challenge.category}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-md flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{challenge.days_left} Days Left</span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-md flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>{challenge.participants_count} Participants</span>
              </span>
            </div>
          </div>
        </div>

        {/* Overview & Reward Badge */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Challenge Overview
            </h4>
            <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {challenge.description}
            </p>

            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Judging Criteria
              </h4>
              <div className="space-y-1.5">
                {challenge.criteria.map((c, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reward Badge Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500/15 via-purple-500/10 to-brand-500/15 border border-amber-500/30 text-center space-y-2.5 flex flex-col items-center justify-center shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-500/40 flex items-center justify-center text-3xl shadow-glow-brand">
              {challenge.reward_badge.icon}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {challenge.reward_badge.name}
              </p>
              <p className="text-[10px] text-amber-600 dark:text-amber-400 font-extrabold uppercase tracking-wider">
                Winner Reward Badge
              </p>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Badge will be pinned to creator portfolio and featured across CraftPlus.
            </p>
          </div>
        </div>

        {/* Project Submission Area */}
        <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <UploadCloud className="w-4 h-4 text-brand-500" />
            <span>Submit Your Work</span>
          </h4>

          {hasEntered ? (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-500 shrink-0" />
              <span className="font-bold">Project entered successfully! Results announced upon challenge completion.</span>
            </div>
          ) : userProjects.length === 0 ? (
            <div className="text-xs text-slate-500 dark:text-slate-400 space-y-2">
              <p>You haven't published any project showcases yet.</p>
              <p className="text-[11px]">Publish a project first using the "Showcase Work" button to submit your entry.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 outline-none"
              >
                <option value="">-- Choose one of your project showcases --</option>
                {userProjects.map(p => (
                  <option key={p.id} value={p.id}>{p.project_title || p.caption.slice(0, 40)}</option>
                ))}
              </select>

              <Button
                variant="gradient"
                size="sm"
                onClick={handleSubmitEntry}
                isLoading={isSubmitting}
                disabled={!selectedProjectId}
                className="w-full py-2.5"
              >
                <Trophy className="w-4 h-4 mr-1.5" />
                <span>Confirm & Submit Challenge Entry</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

