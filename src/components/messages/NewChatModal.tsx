import React, { useState, useEffect } from 'react';
import { Profile } from '../../types/database.types';
import { profileService } from '../../services/profileService';
import { useAuth } from '../../contexts/AuthContext';
import { Modal } from '../ui/Modal';
import { SearchInput } from '../ui/Input';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { MessageSquarePlus, Sparkles, UserCheck } from 'lucide-react';

export interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: Profile) => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  isOpen,
  onClose,
  onSelectUser
}) => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Profile[]>([]);
  const [suggested, setSuggested] = useState<Profile[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const loadInitial = async () => {
        const users = await profileService.getSuggestedUsers(user?.id);
        setSuggested(users);
      };
      loadInitial();
    }
  }, [isOpen, user?.id]);

  const handleSearch = async (val: string) => {
    setQuery(val);
    if (!val.trim()) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const { users } = await profileService.searchUsersAndHashtags(val);
      setResults(users.filter(u => u.id !== user?.id));
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const displayedList = query.trim() ? results : suggested;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="New Direct Message"
      description="Find a builder or creator to collaborate with"
      maxWidth="sm"
    >
      <div className="space-y-4">
        <SearchInput
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onClear={() => handleSearch('')}
          placeholder="Search by name, @username, or skill..."
          autoFocus
        />

        <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
          {!query.trim() && (
            <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Suggested Creators & Builders</span>
            </div>
          )}

          {isSearching ? (
            <p className="text-center py-6 text-xs text-slate-400 animate-pulse">Searching creators...</p>
          ) : displayedList.length === 0 && query ? (
            <p className="text-center py-6 text-xs text-slate-400">No creators found matching "{query}"</p>
          ) : displayedList.length === 0 ? (
            <div className="text-center py-6 space-y-2">
              <MessageSquarePlus className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
              <p className="text-xs text-slate-500">Type a name or skill to find people to chat with</p>
            </div>
          ) : (
            displayedList.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectUser(item);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-transparent hover:border-brand-500/20 transition-all text-left group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative">
                    <Avatar src={item.avatar_url} alt={item.username} size="md" isVerified={item.is_verified} />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-surface-cardDark" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand-500 transition-colors truncate">
                      {item.full_name}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">@{item.username}</p>
                    {item.skills && item.skills.length > 0 && (
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">
                        {item.skills.slice(0, 2).join(' • ')}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400 px-3 py-1.5 rounded-xl bg-brand-500/10 group-hover:bg-brand-500 group-hover:text-white transition-all">
                  Chat
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};
