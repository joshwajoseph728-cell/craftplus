import React, { useState } from 'react';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import { Profile } from '../types/database.types';
import { ChatList } from '../components/messages/ChatList';
import { ChatWindow } from '../components/messages/ChatWindow';
import { NewChatModal } from '../components/messages/NewChatModal';
import { MessageSquare, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const { conversations, activeUser, setActiveUser } = useChat();
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);

  const handleSelectUser = (selected: Profile) => {
    setActiveUser(selected);
  };

  return (
    <div className="h-[calc(100dvh-8rem)] md:h-[calc(100vh-5.5rem)] w-full rounded-none md:rounded-3xl overflow-hidden border-0 md:border md:border-slate-200/80 md:dark:border-slate-800/80 bg-white dark:bg-surface-cardDark flex shadow-none md:shadow-sm">
      {/* Left Chat List (hidden on mobile if activeUser is open) */}
      <div className={`${activeUser ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 h-full shrink-0`}>
        <ChatList
          conversations={conversations}
          activeUserId={activeUser?.id}
          onSelectConversation={handleSelectUser}
          onOpenNewChat={() => setIsNewChatOpen(true)}
        />
      </div>

      {/* Right Chat Window or Empty State */}
      <div className={`${!activeUser ? 'hidden md:flex' : 'flex'} flex-1 h-full`}>
        {activeUser ? (
          <ChatWindow
            recipient={activeUser}
            onBack={() => setActiveUser(null)}
          />
        ) : (
          <div className="flex-1 hidden md:flex flex-col items-center justify-center text-center p-8 bg-slate-50/50 dark:bg-surface-dark/50">
            <div className="w-16 h-16 rounded-3xl bg-brand-500/10 text-brand-500 flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Your Direct Messages</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Send private photos, vibes, and real-time messages to creators and friends.
            </p>
            <Button
              variant="gradient"
              size="sm"
              onClick={() => setIsNewChatOpen(true)}
              className="mt-4"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              <span>Start New Conversation</span>
            </Button>
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      <NewChatModal
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
        onSelectUser={handleSelectUser}
      />
    </div>
  );
};

