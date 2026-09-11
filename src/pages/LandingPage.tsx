import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Globe,
  Camera,
  MessageSquare,
  Lock,
  ArrowRight,
  Layers,
  Heart,
  Eye,
  CheckCircle2,
  Cpu,
  Code2,
  Briefcase,
  Activity,
  Github,
  ExternalLink
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-brand-500 selection:text-white font-sans overflow-x-hidden">
      {/* Glow Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-brand-600/20 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-pink-600/15 rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] bg-accent-600/15 rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <header className="relative z-20 border-b border-white/10 backdrop-blur-lg bg-slate-950/70">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="CraftPlus Logo"
              className="w-10 h-10 rounded-2xl object-contain shadow-md shadow-brand-500/30"
            />
            <span className="font-display text-2xl font-extrabold tracking-tight text-white flex items-center">
              Craft<span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-pink-500 bg-clip-text text-transparent">Plus</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/tech-stack"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              <Cpu className="w-4 h-4 text-brand-400" />
              <span>Tech Stack</span>
            </Link>

            {user ? (
              <Link
                to="/feed"
                className="px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-brand-600 via-pink-600 to-accent-500 text-white shadow-lg hover:shadow-glow-brand transition-all hover:scale-105"
              >
                Go to Feed &rarr;
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/auth/login"
                  className="text-sm font-semibold text-slate-300 hover:text-white px-3 py-2"
                >
                  Log In
                </Link>
                <Link
                  to="/auth/signup"
                  className="px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-brand-600 via-pink-600 to-accent-500 text-white shadow-lg hover:shadow-glow-brand transition-all hover:scale-105"
                >
                  Join CraftPlus
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-24 px-6 text-center max-w-5xl mx-auto space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-bold shadow-sm">
          <Activity className="w-4 h-4 text-brand-400" />
          <span>The Social Network for Builders, Engineers & Designers</span>
        </div>

        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
          Showcase your works.{' '}
          <span className="bg-gradient-to-r from-brand-400 via-pink-500 to-accent-400 bg-clip-text text-transparent">
            Share building experiences.
          </span>
        </h1>

        <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-light">
          Post project case studies with tech stacks, live demos, and code repositories. Connect and direct message with fellow creators, engineers, and collaborators.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            to={user ? "/feed" : "/auth/signup"}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-base bg-gradient-to-r from-brand-600 via-pink-600 to-accent-500 text-white shadow-xl hover:shadow-glow-brand transition-all hover:scale-105 flex items-center justify-center gap-2 group"
          >
            <span>{user ? "Go to Feed" : "Create New Account"}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          {!user && (
            <Link
              to="/auth/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-base bg-white/10 hover:bg-white/15 text-white border border-white/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Log In with Existing Account</span>
            </Link>
          )}

          <Link
            to="/tech-stack"
            className="w-full sm:w-auto px-6 py-4 rounded-2xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/10 transition-colors flex items-center justify-center gap-2"
          >
            <Cpu className="w-4 h-4 text-brand-400" />
            <span>Tech Stack</span>
          </Link>
        </div>

        {/* Hero Interactive Showcase Card */}
        <div className="pt-12 relative">
          <div className="rounded-3xl border border-white/15 bg-slate-900/80 backdrop-blur-xl shadow-2xl p-4 md:p-6 text-left max-w-3xl mx-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-mono text-slate-400 ml-2">CraftPlus.app/feed</span>
              </div>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Project Feed
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="rounded-2xl overflow-hidden border border-white/10 bg-slate-950 aspect-video relative group">
                <img
                  src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80"
                  alt="WebGPU engine showcase"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-500 text-white w-max mb-1">WebGPU Engine</span>
                  <p className="text-xs font-bold text-white">@leo_cyber</p>
                  <p className="text-[11px] text-slate-300">120 FPS Procedural Shader Engine âš¡</p>
                </div>
              </div>

              <div className="space-y-3 flex flex-col justify-center">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                    <span>ðŸ’» Tech Stack Embedded</span>
                    <span className="text-brand-400">TypeScript + Rust</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Every post includes clickable tech tags, live demo buttons, and GitHub repositories.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                    <span>ðŸ’¡ Experience & Learnings</span>
                    <span className="text-pink-400">Case Study</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Expandable insights covering technical hurdles, architecture choices, and benchmarks.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Feature Pillars */}
      <section className="relative z-10 py-20 bg-slate-900/50 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white">
              Engineered for project collaboration & portfolios
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Explore how CraftPlus empowers engineers and creators to build in public.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-slate-950/80 border border-white/10 hover:border-brand-500/40 transition-colors space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Rich Project Case Studies</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Publish completed works with multi-slide media carousels, technology stack badges, live demo links, and GitHub repository access.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-950/80 border border-white/10 hover:border-pink-500/40 transition-colors space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-400 flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Code & Voice Direct Messaging</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Collaborate with builders via real-time direct messages with syntax-highlighted code snippets, voice memos, and project invitations.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-950/80 border border-white/10 hover:border-accent-500/40 transition-colors space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-accent-500/10 text-accent-400 flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">24h Progress Stories</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Share behind-the-scenes building milestones and sneak-peeks that automatically expire after 24 hours with interactive viewer tickers.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-950/80 border border-white/10 hover:border-emerald-500/40 transition-colors space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">PostgreSQL Row-Level Security</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every query is authenticated with JWT tokens and protected by 15 RLS policies guaranteeing strict data privacy and isolation.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-950/80 border border-white/10 hover:border-amber-500/40 transition-colors space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Category & Tech Exploration</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Filter works by Software & Web, UI/UX Design, AI & Machine Learning, Mobile Apps, or by specific technologies like React and Python.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-950/80 border border-white/10 hover:border-purple-500/40 transition-colors space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Moderation & Safety Center</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Role-secured admin portal to monitor platform metrics, review community reports, and ensure high quality project submissions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative z-10 py-20 px-6 text-center">
        <div className="max-w-4xl mx-auto p-10 md:p-16 rounded-3xl bg-gradient-to-r from-brand-950/90 via-purple-950/90 to-pink-950/90 border border-brand-500/30 shadow-2xl space-y-6">
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Start Showcasing on CraftPlus
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Join thousands of creators sharing their projects, case studies, and engineering breakthroughs.
          </p>
          <div className="pt-2">
            <Link
              to={user ? "/feed" : "/auth/signup"}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base bg-gradient-to-r from-brand-600 via-pink-600 to-accent-500 text-white shadow-xl hover:shadow-glow-brand transition-all hover:scale-105"
            >
              <span>{user ? 'Enter CraftPlus' : 'Create Free Builder Account'}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-10 px-6 text-center text-xs text-slate-500 space-y-3">
        <p>Â© 2026 CraftPlus â€” Full-Stack College Capstone Project. Built with React, TypeScript, Tailwind, and Supabase.</p>
        <div className="flex justify-center gap-4 text-slate-400">
          <Link to="/tech-stack" className="hover:text-white">Architecture</Link>
          <span>â€¢</span>
          <Link to="/explore" className="hover:text-white">Explore</Link>
          <span>â€¢</span>
          <a href="https://supabase.com" target="_blank" rel="noreferrer" className="hover:text-white">Supabase</a>
        </div>
      </footer>
    </div>
  );
};

