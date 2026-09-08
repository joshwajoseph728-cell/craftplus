import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Notification } from '../types/database.types';
import { notificationService } from '../services/notificationService';
import { useAuth } from './AuthContext';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

interface ToastAlert {
  id: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning';
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  toasts: ToastAlert[];
  showToast: (title: string, message: string, type?: 'info' | 'success' | 'warning') => void;
  removeToast: (id: string) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<ToastAlert[]>([]);

  const loadNotifications = async () => {
    if (!user) {
      setNotifications([]);
      return;
    }
    const data = await notificationService.getNotifications(user.id);
    setNotifications(data);
  };

  useEffect(() => {
    loadNotifications();

    if (isSupabaseConfigured() && user) {
      const channel = supabase
        .channel('public:notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `recipient_id=eq.${user.id}`
          },
          payload => {
            loadNotifications();
            showToast('New Activity', 'Someone interacted with your profile or post!', 'info');
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id]);

  const showToast = (title: string, message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, title, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const markAsRead = async (id: string) => {
    await notificationService.markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllAsRead = async () => {
    if (!user) return;
    await notificationService.markAllAsRead(user.id);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toasts,
        showToast,
        removeToast,
        markAsRead,
        markAllAsRead,
        refreshNotifications: loadNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
