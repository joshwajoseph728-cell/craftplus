# CraftPulse 🚀

> **The Social Platform for Builders, Engineers & Creators to Showcase Works, Case Studies & Key Learnings.**

CraftPulse is a full-stack, production-grade social media platform inspired by Instagram, tailored specifically for engineers, designers, developers, and makers. It enables users to publish comprehensive project case studies, tag tech stacks, share live demos and GitHub repositories, discover inspiring works, and collaborate via realtime direct messaging.

---

## ✨ Key Features

- 🛠️ **Project & Work Showcase**: Publish projects with title, category, tech stack tags, live demo links, GitHub repo links, status (Completed, In Progress, Case Study, Concept), and key learnings/takeaways.
- 💬 **Real-time Direct Messages (DM)**: Private messaging with rich code snippet syntax highlighting, audio/voice notes, and collaboration invites.
- 📱 **24-Hour Stories**: Share temporary updates, demo teasers, and daily progress logs with topic badges.
- ❤️ **Social Interactions**: Double-tap like animation, nested threaded comments, and project bookmarking.
- 🔍 **Discovery & Search**: Filter by tech stack, project category, trending hashtags, or search keywords.
- 🌓 **Theme Support**: Seamless dark mode and light mode switching.
- 🛡️ **Role-Based Security & Moderation**: Supabase Row-Level Security (RLS) policies and content reporting tools.

---

## 🏗️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, React Router v7
- **Backend & Database**: Supabase (PostgreSQL 15, PostgREST, Realtime, Auth, Storage)
- **Security**: Row Level Security (RLS) with automated trigger functions

---

## 🚀 Quick Start

### 1. Clone the repository
\\\ash
git clone https://github.com/joshwajoseph728-cell/craftplus.git
cd craftplus
\\\

### 2. Install dependencies
\\\ash
npm install
\\\

### 3. Setup Environment Variables
Create a \.env\ file based on \.env.example\:
\\\env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
\\\

### 4. Database Setup
Run the SQL script located in \supabase/full_setup.sql\ inside your Supabase Project **SQL Editor**.

### 5. Start Development Server
\\\ash
npm run dev
\\\
Visit \http://localhost:3000\ in your browser.
