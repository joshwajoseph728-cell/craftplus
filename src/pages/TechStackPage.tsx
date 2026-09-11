import React from 'react';
import { Link } from 'react-router-dom';
import {
  Cpu,
  Database,
  ShieldCheck,
  Zap,
  HardDrive,
  Layers,
  ArrowRight,
  Code2,
  CheckCircle2,
  Lock,
  Sparkles
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export const TechStackPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-600 dark:text-brand-400 text-xs font-bold">
          <Cpu className="w-4 h-4 text-brand-500" />
          <span>College Capstone Project Architecture</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">
          CraftPlus System Architecture
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          An in-depth breakdown of the technology stack, database normalization, Row-Level Security, and real-time synchronization.
        </p>
      </div>

      {/* Visual Architectural Hierarchy Diagram */}
      <div className="bg-white dark:bg-surface-cardDark border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-brand-500" />
          <span>Full-Stack Engineering Data Flow</span>
        </h3>

        {/* ASCII / Visual Flow Diagram */}
        <div className="p-5 rounded-2xl bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto border border-white/10 leading-relaxed">
          <div className="text-brand-400 font-bold mb-2">â”€â”€ CLIENT APPLICATION LAYER (React 18 + TypeScript + Vite)</div>
          <div className="text-slate-300">
            {"  "}â”œâ”€â”€ UI System: Tailwind CSS + Neo-Glassmorphism Design System + Lucide Icons<br />
            {"  "}â”œâ”€â”€ State & Contexts: AuthContext, ThemeContext, NotificationContext, ChatContext<br />
            {"  "}â”œâ”€â”€ Form Validation: React Hook Form + Zod Schema Validation<br />
            {"  "}â””â”€â”€ Performance: Optimistic UI Updates + Canvas Confetti + Lazy Image Loading
          </div>

          <div className="text-pink-400 font-bold my-2">{"            "}â”‚<br />{"            "}â–¼ (Supabase JS Client SDK / JWT Bearer Tokens)</div>

          <div className="text-brand-400 font-bold mb-2">â”€â”€ SUPABASE CLOUD INFRASTRUCTURE (Backend-as-a-Service)</div>
          <div className="text-slate-300">
            {"  "}â”œâ”€â”€ ðŸ” Supabase Auth (JWT Sessions, Sign-up triggers, Profile provisioning)<br />
            {"  "}â”œâ”€â”€ ðŸ˜ PostgreSQL Database (Normalized 15 relational tables, Foreign Keys, Indexes)<br />
            {"  "}â”œâ”€â”€ ðŸ›¡ï¸ Row Level Security (Granular multi-tenant isolation, Private account gate)<br />
            {"  "}â”œâ”€â”€ âš¡ Realtime Engine (Postgres CDC replication for DM chat & activity alerts)<br />
            {"  "}â””â”€â”€ ðŸ“¦ Supabase Storage (Public avatar/post buckets + secured message storage)
          </div>

          <div className="text-emerald-400 font-bold my-2">{"            "}â”‚<br />{"            "}â–¼</div>

          <div className="text-brand-400 font-bold">â”€â”€ PRODUCTION DEPLOYMENT: Vercel Edge Network (Vercel-Ready SPA)</div>
        </div>
      </div>

      {/* 4 Core Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PostgreSQL Schema */}
        <div className="p-6 rounded-3xl bg-white dark:bg-surface-cardDark border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Relational PostgreSQL Schema</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            15 fully normalized tables with primary keys, foreign keys, cascading deletion rules, unique constraints, and B-tree performance indexes on <code className="text-brand-500">username</code>, <code className="text-brand-500">post_id</code>, <code className="text-brand-500">user_id</code>, and timestamps.
          </p>
          <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1 pt-1">
            <li>â€¢ <code className="font-bold">profiles</code>, <code className="font-bold">posts</code>, <code className="font-bold">post_media</code> (carousel)</li>
            <li>â€¢ <code className="font-bold">comments</code> (nested self-referential tree)</li>
            <li>â€¢ <code className="font-bold">stories</code> (24h expires_at interval)</li>
            <li>â€¢ <code className="font-bold">messages</code>, <code className="font-bold">notifications</code>, <code className="font-bold">reports</code></li>
          </ul>
        </div>

        {/* Row Level Security */}
        <div className="p-6 rounded-3xl bg-white dark:bg-surface-cardDark border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Row Level Security (RLS)</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Every database transaction is evaluated against cryptographically signed JWT auth tokens. Client queries cannot mutate other users' profiles, posts, comments, or direct messages.
          </p>
          <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1 pt-1">
            <li>â€¢ Private accounts require accepted follow status</li>
            <li>â€¢ Admins verified via <code className="text-brand-500">public.is_admin()</code> function</li>
            <li>â€¢ Storage bucket policies verify folder-level ownership</li>
          </ul>
        </div>

        {/* Realtime Engine */}
        <div className="p-6 rounded-3xl bg-white dark:bg-surface-cardDark border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-pink-500/10 text-pink-500 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Realtime Broadcast & Triggers</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Database triggers automatically update <code className="text-brand-500">likes_count</code> and <code className="text-brand-500">comments_count</code>, generate notifications, and broadcast messages over WebSocket subscriptions.
          </p>
          <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1 pt-1">
            <li>â€¢ Live incoming message delivery</li>
            <li>â€¢ Notification badge counter incrementation</li>
            <li>â€¢ Optimistic UI client state synchronization</li>
          </ul>
        </div>

        {/* Storage Architecture */}
        <div className="p-6 rounded-3xl bg-white dark:bg-surface-cardDark border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <HardDrive className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Supabase Storage Buckets</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Separate storage buckets for <code className="text-brand-500">avatars</code>, <code className="text-brand-500">posts</code>, <code className="text-brand-500">stories</code>, and <code className="text-brand-500">messages</code> with mime-type checking and 5MB payload limits.
          </p>
          <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1 pt-1">
            <li>â€¢ Image compression & validation</li>
            <li>â€¢ Dual-engine demo resilience mode</li>
            <li>â€¢ Public CDN delivery URLs</li>
          </ul>
        </div>
      </div>

      {/* Setup Guide Link Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-brand-950/40 via-purple-950/30 to-slate-900/40 border border-brand-500/30 text-center space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Ready for Supabase Production Deployment</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          All SQL migration scripts (<code className="text-brand-400">01_schema.sql</code>, <code className="text-brand-400">02_rls_policies.sql</code>, <code className="text-brand-400">03_triggers.sql</code>, <code className="text-brand-400">04_storage.sql</code>) and <code className="text-brand-400">SUPABASE_SETUP.md</code> are included in the root folder.
        </p>
        <Link to="/feed">
          <Button variant="gradient" size="sm">
            <span>Explore App Live</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

