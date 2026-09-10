import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Message, Conversation, Profile } from '../types/database.types';
import { INITIAL_MESSAGES, INITIAL_PROFILES } from '../lib/mockData';

const LOCAL_STORAGE_MESSAGES = 'vibesphere_messages';

const getStoredMessages = (): Message[] => {
  const stored = localStorage.getItem(LOCAL_STORAGE_MESSAGES);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_MESSAGES;
    }
  }
  localStorage.setItem(LOCAL_STORAGE_MESSAGES, JSON.stringify(INITIAL_MESSAGES));
  return INITIAL_MESSAGES;
};

const setStoredMessages = (messages: Message[]) => {
  localStorage.setItem(LOCAL_STORAGE_MESSAGES, JSON.stringify(messages));
};

export const messageService = {
  async getConversations(currentUserId: string): Promise<Conversation[]> {
    if (!isSupabaseConfigured()) {
      const messages = getStoredMessages();
      const userConvosMap = new Map<string, { otherUser: Profile; lastMessage: Message; unreadCount: number }>();

      messages.forEach(msg => {
        const isSender = msg.sender_id === currentUserId;
        const otherId = isSender ? msg.receiver_id : msg.sender_id;
        const otherUser = INITIAL_PROFILES.find(p => p.id === otherId) || {
          id: otherId,
          username: otherId,
          full_name: 'VibeSphere User',
          avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          is_private: false,
          role: 'user',
          created_at: new Date().toISOString()
        };

        if (!userConvosMap.has(otherId)) {
          userConvosMap.set(otherId, {
            otherUser,
            lastMessage: msg,
            unreadCount: (!isSender && !msg.is_read) ? 1 : 0
          });
        } else {
          const entry = userConvosMap.get(otherId)!;
          if (new Date(msg.created_at).getTime() > new Date(entry.lastMessage.created_at).getTime()) {
            entry.lastMessage = msg;
          }
          if (!isSender && !msg.is_read) {
            entry.unreadCount += 1;
          }
        }
      });

      return Array.from(userConvosMap.values()).sort(
        (a, b) => new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
      );
    }

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_id(*),
          receiver:profiles!receiver_id(*)
        `)
        .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const map = new Map<string, Conversation>();
      (data || []).forEach((msg: any) => {
        const isSender = msg.sender_id === currentUserId;
        const otherUser = isSender ? msg.receiver : msg.sender;
        if (!otherUser) return;

        if (!map.has(otherUser.id)) {
          map.set(otherUser.id, {
            otherUser,
            lastMessage: msg,
            unreadCount: !isSender && !msg.is_read ? 1 : 0
          });
        } else {
          const entry = map.get(otherUser.id)!;
          if (!isSender && !msg.is_read) {
            entry.unreadCount += 1;
          }
        }
      });

      return Array.from(map.values());
    } catch (err) {
      console.error('Error fetching conversations from Supabase:', err);
      return [];
    }
  },

  async getMessagesWithUser(currentUserId: string, otherUserId: string): Promise<Message[]> {
    if (!isSupabaseConfigured()) {
      const all = getStoredMessages();
      return all
        .filter(m => (m.sender_id === currentUserId && m.receiver_id === otherUserId) || (m.sender_id === otherUserId && m.receiver_id === currentUserId))
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_id(*),
          receiver:profiles!receiver_id(*)
        `)
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Message[];
    } catch (err) {
      console.error('Error loading chat messages:', err);
      return [];
    }
  },

  async sendMessage(params: {
    sender: Profile;
    receiverId: string;
    content: string;
    mediaUrl?: string;
    audioUrl?: string;
    codeSnippet?: { language: string; code: string };
    projectReference?: { id: string; title: string; thumbnail: string };
  }): Promise<{ message: Message | null; error: string | null }> {
    const newMsg: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      sender_id: params.sender.id,
      receiver_id: params.receiverId,
      content: params.content.trim(),
      media_url: params.mediaUrl,
      audio_url: params.audioUrl,
      code_snippet: params.codeSnippet,
      project_reference: params.projectReference,
      is_read: false,
      created_at: new Date().toISOString(),
      sender: params.sender
    };

    if (!isSupabaseConfigured()) {
      const messages = getStoredMessages();
      setStoredMessages([...messages, newMsg]);
      return { message: newMsg, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: params.sender.id,
          receiver_id: params.receiverId,
          content: params.content.trim(),
          media_url: params.mediaUrl,
          audio_url: params.audioUrl,
          code_snippet: params.codeSnippet
        })
        .select(`*, sender:profiles!sender_id(*), receiver:profiles!receiver_id(*)`)
        .single();

      if (error) {
        // If schema doesn't have audio/code columns or has constraint, fallback to content insert
        const fallbackRes = await supabase
          .from('messages')
          .insert({
            sender_id: params.sender.id,
            receiver_id: params.receiverId,
            content: params.content.trim(),
            media_url: params.mediaUrl
          })
          .select(`*, sender:profiles!sender_id(*), receiver:profiles!receiver_id(*)`)
          .single();

        if (fallbackRes.error) throw fallbackRes.error;
        return { message: fallbackRes.data as Message, error: null };
      }

      return { message: data as Message, error: null };
    } catch (err: any) {
      console.warn('Supabase message insert failed, using optimistic message:', err);
      return { message: newMsg, error: null };
    }
  },

  async toggleReaction(messageId: string, emoji: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      const messages = getStoredMessages();
      const updated = messages.map(m => {
        if (m.id === messageId) {
          return { ...m, reaction: m.reaction === emoji ? undefined : emoji };
        }
        return m;
      });
      setStoredMessages(updated);
      return;
    }
    // Locally update stored messages for optimistic rendering
    const messages = getStoredMessages();
    const updated = messages.map(m => {
      if (m.id === messageId) {
        return { ...m, reaction: m.reaction === emoji ? undefined : emoji };
      }
      return m;
    });
    setStoredMessages(updated);
  },

  async markAsRead(currentUserId: string, senderId: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      const messages = getStoredMessages();
      const updated = messages.map(m => {
        if (m.receiver_id === currentUserId && m.sender_id === senderId) {
          return { ...m, is_read: true, read_at: new Date().toISOString() };
        }
        return m;
      });
      setStoredMessages(updated);
      return;
    }

    try {
      await supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('receiver_id', currentUserId)
        .eq('sender_id', senderId)
        .eq('is_read', false);
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  }
};
