import React, { useState } from 'react';
import { Conversation, Profile } from '../../types/database.types';
import { Avatar } from '../ui/Avatar';
import { SearchInput } from '../ui/Input';
import { formatShortRelativeTime, truncateText } from '../../lib/utils';
import { Edit3, MessageSquare } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ChatListProps {
  conversations: Conversation[];
  activeUserId?: string;
  onSelectConversation: (user: Profile) => void;
  onOpenNewChat: () => void;
}

export const ChatList: React.FC<ChatListProps> = ({
  conversations,
  activeUserId,
  onSelectConversation,
  onOpenNewChat
}) => {
  const [search, setSearch] = useState('');

  const filtered = conversations.filter(c =>
    c.otherUser.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.otherUser.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full md:w-80 lg:w-96 h-full flex flex-col border-r border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-surface-cardDark transition-colors">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white">Messages</h2>
        <button
          onClick={onOpenNewChat}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          title="New Message"
        >
          <Edit3 className="w-4 h-4" />
        </button>
      </div>

      {/* Search Filter */}
      <div className="p-3 border-b border-slate-100 dark:border-slate-800">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
          placeholder="Filter conversations..."
        />
      </div>

      {/* Conversations Scrollable List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800/50">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs font-semibold">No conversations found</p>
          </div>
        ) : (
          filtered.map(c => {
            const isActive = c.otherUser.id === activeUserId;

            return (
              <button
                key={c.otherUser.id}
                type="button"
                onClick={() => onSelectConversation(c.otherUser)}
                className={cn(
                  'w-full flex items-center gap-3 p-3.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50',
                  isActive && 'bg-brand-500/10 dark:bg-brand-500/15'
                )}
              >
                <Avatar
                  src={c.otherUser.avatar_url}
                  alt={c.otherUser.username}
                  size="md"
                  isVerified={c.otherUser.is_verified}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {c.otherUser.full_name}
                    </p>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {formatShortRelativeTime(c.lastMessage.created_at)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className={cn(
                      'text-xs truncate pr-2',
                      c.unreadCount > 0 ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'
                    )}>
                      {truncateText(c.lastMessage.content || 'Photo attached', 38)}
                    </p>

                    {c.unreadCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-accent-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
