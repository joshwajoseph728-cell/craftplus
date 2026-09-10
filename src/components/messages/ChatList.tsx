import React, { useState, useEffect } from 'react';
import { Conversation, Profile } from '../../types/database.types';
import { Avatar } from '../ui/Avatar';
import { SearchInput } from '../ui/Input';
import { formatShortRelativeTime, truncateText } from '../../lib/utils';
import { Edit3, MessageSquare, Sparkles, UserPlus, Search } from 'lucide-react';
import { profileService } from '../../services/profileService';
import { useAuth } from '../../contexts/AuthContext';
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
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [globalSearchResults, setGlobalSearchResults] = useState<Profile[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<Profile[]>([]);
  const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);

  useEffect(() => {
    const loadSuggested = async () => {
      const suggested = await profileService.getSuggestedUsers(user?.id);
      setSuggestedUsers(suggested);
    };
    loadSuggested();
  }, [user?.id]);

  useEffect(() => {
    if (!search.trim()) {
      setGlobalSearchResults([]);
      setIsSearchingGlobal(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingGlobal(true);
      try {
        const { users } = await profileService.searchUsersAndHashtags(search);
        // Exclude current user from results
        setGlobalSearchResults(users.filter(u => u.id !== user?.id));
      } catch {
        setGlobalSearchResults([]);
      } finally {
        setIsSearchingGlobal(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [search, user?.id]);

  const filteredConversations = conversations.filter(c =>
    c.otherUser.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.otherUser.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full md:w-80 lg:w-96 h-full flex flex-col border-r border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-surface-cardDark transition-colors select-none">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white">Direct Messages</h2>
          <p className="text-[11px] text-slate-400">Collaborate & chat in realtime</p>
        </div>
        <button
          onClick={onOpenNewChat}
          className="p-2.5 rounded-2xl bg-gradient-to-tr from-brand-600 to-pink-600 text-white shadow-sm hover:opacity-90 active:scale-95 transition-all"
          title="New Message (Search Creators)"
        >
          <Edit3 className="w-4 h-4" />
        </button>
      </div>

      {/* Instant Search Bar */}
      <div className="p-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-surface-dark/50">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
          placeholder="Search chats or discover builders..."
        />
      </div>

      {/* Suggested / Online Builders Reel (visible when not searching) */}
      {!search && suggestedUsers.length > 0 && (
        <div className="p-3 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-surface-cardDark">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Suggested Builders</span>
            </span>
          </div>
          <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
            {suggestedUsers.map(builder => (
              <button
                key={builder.id}
                type="button"
                onClick={() => onSelectConversation(builder)}
                className="flex flex-col items-center gap-1 min-w-[56px] group"
                title={`Chat with ${builder.full_name}`}
              >
                <div className="relative">
                  <Avatar
                    src={builder.avatar_url}
                    alt={builder.username}
                    size="md"
                    className="ring-2 ring-transparent group-hover:ring-brand-500 transition-all group-hover:scale-105"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-surface-cardDark" />
                </div>
                <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300 truncate max-w-[54px]">
                  {builder.username.split('_')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Conversations & Search Results Scrollable Area */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800/50">
        {/* If user is actively searching */}
        {search.trim() ? (
          <div className="p-2 space-y-4">
            {/* Matching existing conversations */}
            {filteredConversations.length > 0 && (
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 pt-1">
                  Active Conversations
                </p>
                {filteredConversations.map(c => (
                  <button
                    key={c.otherUser.id}
                    type="button"
                    onClick={() => {
                      onSelectConversation(c.otherUser);
                      setSearch('');
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 p-2.5 rounded-2xl text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/50',
                      c.otherUser.id === activeUserId && 'bg-brand-500/10 dark:bg-brand-500/15'
                    )}
                  >
                    <Avatar src={c.otherUser.avatar_url} alt={c.otherUser.username} size="md" isVerified={c.otherUser.is_verified} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{c.otherUser.full_name}</p>
                      <p className="text-[11px] text-slate-400 truncate">@{c.otherUser.username}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Global creator search results */}
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-brand-500 px-2 pt-1 flex items-center gap-1">
                <Search className="w-3 h-3" />
                <span>Search All Builders on CraftPulse</span>
              </p>

              {isSearchingGlobal ? (
                <div className="p-4 text-center text-xs text-slate-400 animate-pulse">Searching creators...</div>
              ) : globalSearchResults.length === 0 && filteredConversations.length === 0 ? (
                <div className="p-6 text-center text-slate-400 space-y-2">
                  <UserPlus className="w-6 h-6 mx-auto opacity-40" />
                  <p className="text-xs font-medium">No users found matching "{search}"</p>
                </div>
              ) : (
                globalSearchResults.map(creator => (
                  <button
                    key={creator.id}
                    type="button"
                    onClick={() => {
                      onSelectConversation(creator);
                      setSearch('');
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-2xl text-left hover:bg-brand-50/50 dark:hover:bg-brand-950/30 border border-transparent hover:border-brand-500/20 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar src={creator.avatar_url} alt={creator.username} size="md" isVerified={creator.is_verified} />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{creator.full_name}</p>
                        <p className="text-[11px] text-slate-400 truncate">@{creator.username}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-brand-600 dark:text-brand-400 px-2.5 py-1 rounded-xl bg-brand-500/10">
                      Message
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        ) : (
          /* Normal Conversations List */
          conversations.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center mx-auto">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No active messages yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Click a suggested builder above or search to start chatting!</p>
              </div>
            </div>
          ) : (
            conversations.map(c => {
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
                  <div className="relative">
                    <Avatar
                      src={c.otherUser.avatar_url}
                      alt={c.otherUser.username}
                      size="md"
                      isVerified={c.otherUser.is_verified}
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-surface-cardDark" />
                  </div>

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
                        {c.lastMessage.media_url ? '📷 [Photo Attached]' : c.lastMessage.code_snippet ? '💻 [Code Snippet]' : c.lastMessage.audio_url ? '🎙️ [Voice Note]' : truncateText(c.lastMessage.content, 36)}
                      </p>

                      {c.unreadCount > 0 && (
                        <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-brand-600 to-pink-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          {c.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )
        )}
      </div>
    </div>
  );
};
