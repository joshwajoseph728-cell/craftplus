# VibeSphere — Supabase Setup & Production Deployment Guide

This guide walks you through setting up the complete PostgreSQL database, authentication, storage buckets, and Realtime engine for **VibeSphere** in less than 5 minutes.

---

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in.
2. Click **"New Project"**.
3. Choose your organization, set a project name (e.g., `vibesphere-app`), choose a strong database password, and select the region nearest to you.
4. Click **"Create new project"** and wait ~1-2 minutes for provisioning.

---

## 2. Run Database Migrations

In your Supabase project dashboard, navigate to the **SQL Editor** tab on the left sidebar:

1. Click **"New query"**.
2. Open and copy the contents of `supabase/migrations/01_schema.sql` and click **"Run"**.
3. Open and copy the contents of `supabase/migrations/02_rls_policies.sql` and click **"Run"**.
4. Open and copy the contents of `supabase/migrations/03_triggers_and_functions.sql` and click **"Run"**.
5. Open and copy the contents of `supabase/migrations/04_storage_buckets.sql` and click **"Run"**.
6. *(Optional)* Run `supabase/seed.sql` to populate default hashtags and tags.

---

## 3. Configure Supabase Storage

The migration in step 2 creates the following storage buckets automatically:
- `avatars` (Public: Yes) — User profile pictures
- `posts` (Public: Yes) — Post photos and carousel media
- `stories` (Public: Yes) — 24-hour ephemeral stories media
- `messages` (Public: No) — Direct messaging attachments

To verify:
1. Go to **Storage** in the Supabase Dashboard sidebar.
2. Ensure `avatars`, `posts`, and `stories` are marked as **Public**.
3. Storage RLS policies configured in `04_storage_buckets.sql` will automatically govern upload permissions.

---

## 4. Enable Supabase Realtime

For instant direct messaging, live post likes, and real-time notifications:

1. Go to **Database** -> **Replication** (or **Publication**).
2. Ensure the `supabase_realtime` publication has the following tables enabled:
   - `messages`
   - `notifications`
   - `likes`
   - `comments`
   - `follows`

*(You can also run this SQL in SQL Editor)*:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE messages, notifications, likes, comments, follows;
```

---

## 5. Configure Authentication

1. In the Supabase dashboard, go to **Authentication** -> **Providers** -> **Email**.
2. Ensure **"Enable Email provider"** is switched ON.
3. For local development / testing convenience, you can toggle **"Confirm email"** OFF (or ON for full email verification flows).
4. Under **URL Configuration**, set Site URL to:
   - Local: `http://localhost:3000`
   - Production: `https://your-vibesphere.vercel.app`

---

## 6. Configure Environment Variables

1. Go to **Project Settings** -> **API** in the Supabase dashboard.
2. Copy the **Project URL** and the **`anon` `public` Key**.
3. Create a `.env` file in the root of your project:

```env
VITE_SUPABASE_URL=https://your-actual-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> [!NOTE]
> If these variables are not provided, VibeSphere automatically boots in **Resilient Live Demo Engine mode**, allowing seamless evaluation and demonstration with preloaded creators, stories, feeds, and simulated real-time messaging.

---

## 7. Run the Project Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 8. Deploy to Vercel (Production Ready)

1. Push this repository to GitHub/GitLab.
2. Go to [https://vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import the `vibesphere` repository.
4. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click **"Deploy"**.
6. The included `vercel.json` ensures all client-side routes (`/feed`, `/explore`, `/messages`, `/profile/:username`, etc.) are correctly routed without 404s.
