import React, { useState } from 'react';
import { CollabOpportunity, Profile, ProjectCategory } from '../types/database.types';
import { INITIAL_COLLAB_OPPORTUNITIES } from '../lib/mockData';
import { CollabRequestModal } from '../components/collaboration/CollabRequestModal';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { Avatar } from '../components/ui/Avatar';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import {
  Users,
  Briefcase,
  PlusCircle,
  Code2,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { formatRelativeTime, cn } from '../lib/utils';
import { Link } from 'react-router-dom';

const CATEGORIES: ProjectCategory[] = [
  'Software & Web',
  'UI/UX & Product Design',
  'AI & Machine Learning',
  'Creative & 3D Art',
  'Robotics & Embedded',
  'Hardware & IoT'
];

export const CollaborationPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [opportunities, setOpportunities] = useState<CollabOpportunity[]>(INITIAL_COLLAB_OPPORTUNITIES);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedOpportunity, setSelectedOpportunity] = useState<CollabOpportunity | null>(null);

  // New Post Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ProjectCategory>('Software & Web');
  const [newRole, setNewRole] = useState('');
  const [newSkills, setNewSkills] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleCreateListing = () => {
    if (!user) {
      showToast('Sign In Required', 'Please sign in to post a collaboration request', 'warning');
      return;
    }
    if (!newTitle.trim() || !newRole.trim()) {
      showToast('Missing Fields', 'Please specify project title and role needed', 'warning');
      return;
    }

    const newOpp: CollabOpportunity = {
      id: `collab-${Date.now()}`,
      creator: user,
      project_title: newTitle.trim(),
      category: newCategory,
      role_needed: newRole.trim(),
      skills_required: newSkills.split(',').map(s => s.trim()).filter(Boolean),
      description: newDesc.trim(),
      status: 'open',
      applicants_count: 0,
      created_at: new Date().toISOString()
    };

    setOpportunities(prev => [newOpp, ...prev]);
    setIsCreateOpen(false);
    setNewTitle('');
    setNewRole('');
    setNewSkills('');
    setNewDesc('');
    showToast('Collaboration Request Live! 🚀', 'Other creators can now discover your project and send proposals.', 'success');
  };

  const filtered = selectedCategory === 'All'
    ? opportunities
    : opportunities.filter(o => o.category === selectedCategory);

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-700 via-purple-700 to-pink-600 text-white p-8 md:p-10 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold">
              <Users className="w-3.5 h-3.5" />
              <span>Co-Builder & Teammate Network</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight font-display">
              Find Creators & Collaborate
            </h1>
            <p className="text-xs md:text-sm text-white/90 max-w-xl leading-relaxed">
              Looking for a UI designer, machine learning researcher, 3D artist, or backend engineer? Connect with talented peers and build together.
            </p>
          </div>

          <Button
            size="md"
            onClick={() => setIsCreateOpen(true)}
            className="bg-white text-slate-950 hover:bg-slate-100 font-extrabold px-6 shadow-lg shrink-0"
          >
            <PlusCircle className="w-4 h-4 mr-2 text-brand-600" />
            <span>Post Collaboration Need</span>
          </Button>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('All')}
          className={cn(
            'px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0',
            selectedCategory === 'All'
              ? 'bg-gradient-to-r from-brand-600 to-pink-600 text-white shadow-sm'
              : 'bg-white dark:bg-surface-cardDark text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:border-brand-500'
          )}
        >
          All Opportunities ({opportunities.length})
        </button>

        {CATEGORIES.map(cat => {
          const count = opportunities.filter(o => o.category === cat).length;
          const isSelected = selectedCategory === cat;

          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                'px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0',
                isSelected
                  ? 'bg-gradient-to-r from-brand-600 to-pink-600 text-white shadow-sm'
                  : 'bg-white dark:bg-surface-cardDark text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:border-brand-500'
              )}
            >
              {cat} {count > 0 && `(${count})`}
            </button>
          );
        })}
      </div>

      {/* Opportunities Grid */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-surface-cardDark border border-slate-200/80 dark:border-slate-800/80 space-y-3">
            <Users className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No open requests in this field</p>
            <p className="text-xs text-slate-400">Be the first to post a team inquiry for this category!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map(opp => (
              <div
                key={opp.id}
                className="p-6 rounded-3xl bg-white dark:bg-surface-cardDark border border-slate-200/80 dark:border-slate-800/80 space-y-4 shadow-sm hover:border-brand-500/50 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Link to={`/profile/${opp.creator.username}`} className="flex items-center gap-2.5 min-w-0">
                      <Avatar src={opp.creator.avatar_url} alt={opp.creator.full_name} size="sm" isVerified={opp.creator.is_verified} />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate hover:underline">{opp.creator.full_name}</p>
                        <p className="text-[10px] text-slate-400">@{opp.creator.username}</p>
                      </div>
                    </Link>

                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-500/10 text-brand-600 dark:text-brand-400">
                      {opp.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {opp.project_title}
                    </h3>
                    <div className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400 text-xs font-bold">
                      <Briefcase className="w-3 h-3" />
                      <span>Role: {opp.role_needed}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                    {opp.description}
                  </p>

                  {/* Skills Required */}
                  {opp.skills_required && opp.skills_required.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {opp.skills_required.map(s => (
                        <span
                          key={s}
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatRelativeTime(opp.created_at)}</span>
                  </span>

                  <Button
                    size="sm"
                    variant="gradient"
                    onClick={() => setSelectedOpportunity(opp)}
                    className="text-xs font-bold h-8 px-3.5"
                  >
                    <span>Apply / Collaborate</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Listing Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Post Collaboration Need"
        description="Let the builder community know what expertise or roles you need"
        maxWidth="md"
      >
        <div className="space-y-3.5">
          <Input
            label="Project Name *"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="e.g. PrismUI 2.0 WebGL Extension"
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Category
            </label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as ProjectCategory)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-100/80 dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 outline-none"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <Input
            label="Role Needed *"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            placeholder="e.g. Three.js Shader Developer or PyTorch Engineer"
            required
          />

          <Input
            label="Key Skills Required (comma separated)"
            value={newSkills}
            onChange={(e) => setNewSkills(e.target.value)}
            placeholder="e.g. Three.js, WebGL, GLSL, TypeScript"
          />

          <Textarea
            label="Description & What You Will Build Together"
            rows={3}
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Describe the scope, goals, and what the collaborator will contribute..."
          />

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" size="sm" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="gradient"
              size="sm"
              onClick={handleCreateListing}
              disabled={!newTitle.trim() || !newRole.trim()}
            >
              <span>Publish Request</span>
            </Button>
          </div>
        </div>
      </Modal>

      {/* Direct Collab Proposal Modal */}
      {selectedOpportunity && (
        <CollabRequestModal
          isOpen={!!selectedOpportunity}
          onClose={() => setSelectedOpportunity(null)}
          targetUser={selectedOpportunity.creator}
          project={{
            id: selectedOpportunity.project_id || 'custom',
            user_id: selectedOpportunity.creator.id,
            project_title: selectedOpportunity.project_title,
            caption: selectedOpportunity.description,
            likes_count: 0,
            comments_count: 0,
            created_at: selectedOpportunity.created_at,
            user: selectedOpportunity.creator,
            media: [],
            audience: 'public'
          }}
        />
      )}
    </div>
  );
};

