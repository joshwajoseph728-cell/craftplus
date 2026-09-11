import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Notification } from '../types/database.types';
import { INITIAL_NOTIFICATIONS } from '../lib/mockData';

const LOCAL_STORAGE_NOTIFS = 'vibesphere_notifications';

const getStoredNotifs = (): Notification[] => {
  const stored = localStorage.getItem(LOCAL_STORAGE_NOTIFS);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  }
  localStorage.setItem(LOCAL_STORAGE_NOTIFS, JSON.stringify(INITIAL_NOTIFICATIONS));
  return INITIAL_NOTIFICATIONS;
};

const setStoredNotifs = (notifs: Notification[]) => {
  localStorage.setItem(LOCAL_STORAGE_NOTIFS, JSON.stringify(notifs));
};

export const notificationService = {
  async getNotifications(userId: string): Promise<Notification[]> {
    if (!isSupabaseConfigured()) {
      return getStoredNotifs();
    }

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          actor:profiles!actor_id(*),
          post:posts!post_id(*)
        `)
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Notification[];
    } catch (err) {
      console.error('Error fetching notifications:', err);
      return getStoredNotifs();
    }
  },

  async markAsRead(notificationId: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      const notifs = getStoredNotifs();
      setStoredNotifs(notifs.map(n => n.id === notificationId ? { ...n, is_read: true } : n));
      return;
    }

    try {
      await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);
    } catch (err) {
      console.error('Error updating notification read status:', err);
    }
  },

  async markAllAsRead(userId: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      const notifs = getStoredNotifs();
      setStoredNotifs(notifs.map(n => ({ ...n, is_read: true })));
      return;
    }

    try {
      await supabase.from('notifications').update({ is_read: true }).eq('recipient_id', userId);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }
};

