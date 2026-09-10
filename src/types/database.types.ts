export type UserRole = 'user' | 'moderator' | 'admin';

export type ProjectCategory = 
  | 'Software & Web'
  | 'UI/UX & Product Design'
  | 'AI & Machine Learning'
  | 'Mobile Applications'
  | 'Creative & 3D Art'
  | 'Hardware & IoT'
  | 'Research & Case Studies'
  | 'Other';

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  bio?: string;
  website?: string;
  github_url?: string;
  linkedin_url?: string;
  location?: string;
  skills?: string[];
  date_of_birth?: string;
  is_private: boolean;
  is_verified?: boolean;
  open_to_collab?: boolean;
  role: UserRole;
  created_at: string;
  updated_at?: string;
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
  projects_count?: number;
  is_following?: boolean;
  follow_status?: 'none' | 'active' | 'pending';
}

export interface PostMedia {
  id: string;
  post_id: string;
  media_url: string;
  media_type: 'image' | 'video';
  display_order: number;
  caption_note?: string;
  width?: number;
  height?: number;
}

export interface Post {
  id: string;
  user_id: string;
  project_title?: string;
  category?: ProjectCategory;
  caption: string;
  experience_learnings?: string;
  tech_stack?: string[];
  live_demo_url?: string;
  github_url?: string;
  location?: string;
  work_status?: 'Completed' | 'In Progress' | 'Case Study' | 'Concept';
  open_to_collab?: boolean;
  audience: 'public' | 'followers' | 'private';
  likes_count: number;
  comments_count: number;
  is_archived?: boolean;
  created_at: string;
  updated_at?: string;
  user: Profile;
  media: PostMedia[];
  is_liked?: boolean;
  is_saved?: boolean;
  hashtags?: string[];
}

export interface Comment {
  id: string;
  user_id: string;
  post_id: string;
  parent_comment_id?: string | null;
  content: string;
  likes_count: number;
  created_at: string;
  updated_at?: string;
  user: Profile;
  is_liked?: boolean;
  replies?: Comment[];
}

export interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: 'image' | 'video';
  caption?: string;
  tag_topic?: string;
  created_at: string;
  expires_at: string;
  user: Profile;
  views_count?: number;
  has_viewed?: boolean;
}

export interface StoryGroup {
  user: Profile;
  stories: Story[];
  hasUnviewed: boolean;
}

export interface Notification {
  id: string;
  recipient_id: string;
  actor_id: string;
  type: 'like' | 'comment' | 'reply' | 'follow' | 'follow_request' | 'follow_accepted' | 'mention' | 'collab_request';
  post_id?: string;
  comment_id?: string;
  is_read: boolean;
  created_at: string;
  actor: Profile;
  post?: Post;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  media_url?: string;
  audio_url?: string;
  code_snippet?: {
    language: string;
    code: string;
  };
  project_reference?: {
    id: string;
    title: string;
    thumbnail: string;
  };
  reaction?: string;
  tempStatus?: 'sending' | 'sent' | 'error';
  is_read: boolean;
  read_at?: string;
  created_at: string;
  sender?: Profile;
  receiver?: Profile;
}

export interface Conversation {
  otherUser: Profile;
  lastMessage: Message;
  unreadCount: number;
}

export interface Hashtag {
  id: string;
  name: string;
  post_count: number;
  category?: ProjectCategory;
}

export interface Report {
  id: string;
  reporter_id: string;
  post_id?: string;
  comment_id?: string;
  reported_user_id?: string;
  reason: 'spam' | 'harassment' | 'hate' | 'violence' | 'nudity' | 'scam' | 'other';
  details?: string;
  status: 'pending' | 'reviewed' | 'action_taken' | 'dismissed';
  created_at: string;
  reporter?: Profile;
  post?: Post;
  reported_user?: Profile;
}
