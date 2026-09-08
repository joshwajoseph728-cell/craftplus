import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Conversation, Profile } from '../types/database.types';
import { messageService } from '../services/messageService';
import { useAuth } from './AuthContext';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

interface ChatContextType {
  conversations: Conversation[];
  activeUser: Profile | null;
  unreadCount: number;
  setActiveUser: (user: Profile | null) => void;
  refreshConversations: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeUser, setActiveUser] = useState<Profile | null>(null);

  const loadConversations = async () => {
    if (!user) {
      setConversations([]);
      return;
    }
    const data = await messageService.getConversations(user.id);
    setConversations(data);
  };

  useEffect(() => {
    loadConversations();

    if (isSupabaseConfigured() && user) {
      const channel = supabase
        .channel('public:messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages'
          },
          () => {
            loadConversations();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id]);

  const unreadCount = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeUser,
        unreadCount,
        setActiveUser,
        refreshConversations: loadConversations
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
