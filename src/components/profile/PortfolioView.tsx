import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Profile, Post } from '../../types/database.types';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { BadgeList } from './BadgeList';
import {
  Globe,
  Github,
  Linkedin,
  MapPin,
  ExternalLink,
  Code2,
  Sparkles,
  Lightbulb,
  MessageSquare,
  Award,
  Layers,
  Check,
  UserPlus,
  Send,
  Briefcase
} from 'lucide-react';
import { formatCompactNumber, cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';

export interface PortfolioViewProps {
  profile: Profile;
  posts: Post[];
  isMe: boolean;
  onToggleFollow: () => void;
  onOpenCollabModal?: (project?: Post) => void;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  profile,
  posts,
  isMe,
  onToggleFollow,
  onOpenCollabModal
}) => {
  const { user: currentUser } = useAuth();
  const { setActiveUser } = useChat();
  const navigate = useNavigate();

  const [expandedCaseStudyId, setExpandedCaseStudyId] = useState<string | null>(null);

  const handleStartChat = () => {
    if (!profile) return;
    setActiveUser(profile);
    navigate('/messages');
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Portfolio Hero Showcase */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-brand-950 border border-slate-800 text-white p-8 md:p-12 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-brand-500/15 to-pink-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          <Avatar
            src={profile.avatar_url}
            alt={profile.full_name}
            size="2xl"
            isVerified={profile.is_verified}
            className="ring-4 ring-white/10 shadow-2xl shrink-0"
          />

          <div className="flex-1 text-center md:text-left space-y-4 min-w-0">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold border border-brand-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Creator Portfolio & Engineering Showcase</span>
              </div>
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white font-display">
                {profile.full_name}
              </h1>
              <p className="text-sm md:text-base font-semibold text-slate-300">
                {profile.headline || 'Creative Builder & Technical Maker'}
              </p>
            </div>

            {profile.bio && (
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-2xl whitespace-pre-wrap">
                {profile.bio}
              </p>
            )}

            {/* Links & Meta */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-400 pt-1">
              {profile.location && (
                <div className="flex items-center gap-1.5 text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-brand-400" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.website && (
                <a
                  href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-brand-400 hover:text-brand-300 hover:underline"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{profile.website.replace(/^https?:\/\//, '')}</span>
                </a>
              )}
              {profile.github_url && (
                <a
                  href={profile.github_url.startsWith('http') ? profile.github_url : `https://${profile.github_url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-slate-300 hover:text-white hover:underline"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub</span>
                </a>
              )}
              {profile.linkedin_url && (
                <a
                  href={profile.linkedin_url.startsWith('http') ? profile.linkedin_url : `https://${profile.linkedin_url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-slate-300 hover:text-white hover:underline"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                  <span>LinkedIn</span>
                </a>
              )}
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-3">
              {!isMe ? (
                <>
                  <Button variant="gradient" size="sm" onClick={handleStartChat} className="px-5 shadow-glow-brand">
                    <MessageSquare className="w-4 h-4 mr-1.5" />
                    <span>Send Collaboration Proposal</span>
                  </Button>
                  <Button
                    variant={profile.is_following ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={onToggleFollow}
                    className="border-slate-700 bg-slate-800/80 text-white hover:bg-slate-700"
                  >
                    {profile.is_following ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                        <span>Connected</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5 mr-1" />
                        <span>Follow Work</span>
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <Link to="/settings">
                  <Button variant="outline" size="sm" className="border-slate-700 text-white hover:bg-slate-800">
                    <span>Customize Portfolio Settings</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Skills Matrix */}
      {profile.skills && profile.skills.length > 0 && (
        <div className="bg-white dark:bg-surface-cardDark rounded-3xl p-6 md:p-8 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-brand-500" />
              <span>Core Skills & Technologies</span>
            </h3>
            <span className="text-xs text-slate-400 font-semibold">{profile.skills.length} competencies</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill, idx) => (
              <span
                key={idx}
                className="px-4 py-2 rounded-2xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs hover:border-brand-500 hover:text-brand-500 transition-colors"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Badges & Accolades */}
      {profile.badges && profile.badges.length > 0 && (
        <div className="bg-white dark:bg-surface-cardDark rounded-3xl p-6 md:p-8 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <BadgeList badges={profile.badges} />
        </div>
      )}

      {/* Featured Projects & Case Studies */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-brand-500" />
              <span>Documented Projects & Case Studies</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Explore live builds, engineering challenges, architecture choices, and source code
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400">
            {posts.length} {posts.length === 1 ? 'Project' : 'Projects'}
          </span>
        </div>

        {posts.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-surface-cardDark border border-slate-200/80 dark:border-slate-800/80 space-y-2">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No projects showcased yet</p>
            <p className="text-xs text-slate-400">When projects are published, they will be presented in portfolio mode.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {posts.map(post => {
              const firstMedia = post.media?.[0]?.media_url;
              const isExpanded = expandedCaseStudyId === post.id;

              return (
                <div
                  key={post.id}
                  className="group bg-white dark:bg-surface-cardDark rounded-3xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                    {/* Media Thumbnail */}
                    <div className="lg:col-span-5 relative aspect-[16/10] lg:aspect-auto overflow-hidden bg-black">
                      <img
                        src={firstMedia || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800'}
                        alt={post.project_title || post.caption}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {post.category && (
                        <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-black/70 text-white backdrop-blur-md border border-white/10">
                          {post.category}
                        </span>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="lg:col-span-7 p-6 md:p-8 flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-lg md:text-xl font-bold font-display text-slate-900 dark:text-white group-hover:text-brand-500 transition-colors">
                            {post.project_title || 'Featured Project Showcase'}
                          </h3>
                          {post.work_status && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                              {post.work_status}
                            </span>
                          )}
                        </div>

                        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                          {post.caption}
                        </p>

                        {/* Tech Stack Pills */}
                        {post.tech_stack && post.tech_stack.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {post.tech_stack.map(tech => (
                              <span
                                key={tech}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Contributors Attribution */}
                        {post.contributors && post.contributors.length > 0 && (
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Co-Builders:</span>
                            <div className="flex items-center gap-2">
                              {post.contributors.map(c => (
                                <Link
                                  key={c.id}
                                  to={`/profile/${c.username}`}
                                  className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-brand-500/10 transition-colors"
                                >
                                  <Avatar src={c.avatar_url} alt={c.full_name} size="xs" />
                                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{c.full_name}</span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Expandable Case Study Breakdown */}
                        {post.experience_learnings && (
                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={() => setExpandedCaseStudyId(isExpanded ? null : post.id)}
                              className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                            >
                              <Lightbulb className="w-3.5 h-3.5" />
                              <span>{isExpanded ? 'Hide Engineering Case Study' : 'View Engineering Case Study & Learnings'}</span>
                            </button>

                            {isExpanded && (
                              <div className="mt-2.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                {post.experience_learnings}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Links & Action Bar */}
                      <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                        {post.live_demo_url && (
                          <a
                            href={post.live_demo_url.startsWith('http') ? post.live_demo_url : `https://${post.live_demo_url}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-sm transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Live Demo</span>
                          </a>
                        )}

                        {post.github_url && (
                          <a
                            href={post.github_url.startsWith('http') ? post.github_url : `https://${post.github_url}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
                          >
                            <Github className="w-3.5 h-3.5" />
                            <span>Source Code</span>
                          </a>
                        )}

                        {!isMe && post.open_to_collab && (
                          <button
                            type="button"
                            onClick={handleStartChat}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-brand-500/40 text-brand-600 dark:text-brand-400 hover:bg-brand-500/10 transition-colors ml-auto"
                          >
                            <Briefcase className="w-3.5 h-3.5 text-brand-500" />
                            <span>Collaborate on this Project</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Hire & Collaboration CTA Card */}
      {!isMe && (
        <div className="p-8 rounded-3xl bg-gradient-to-r from-brand-600 via-pink-600 to-accent-500 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <h3 className="text-xl font-extrabold font-display">
              Want to collaborate or hire {profile.full_name}?
            </h3>
            <p className="text-xs md:text-sm text-white/90 max-w-xl">
              Connect directly with {profile.full_name} for open-source initiatives, freelance projects, or team opportunities.
            </p>
          </div>
          <Button
            size="md"
            onClick={handleStartChat}
            className="bg-white text-slate-950 hover:bg-slate-100 font-extrabold px-6 shadow-lg shrink-0"
          >
            <Send className="w-4 h-4 mr-2 text-brand-600" />
            <span>Start Conversation</span>
          </Button>
        </div>
      )}
    </div>
  );
};

