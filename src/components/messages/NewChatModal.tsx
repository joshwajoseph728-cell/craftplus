import React, { useState } from 'react';
import { Profile } from '../../types/database.types';
import { profileService } from '../../services/profileService';
import { Modal } from '../ui/Modal';
import { SearchInput } from '../ui/Input';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { MessageSquarePlus } from 'lucide-react';

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
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Profile[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (val: string) => {
    setQuery(val);
    if (!val.trim()) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const { users } = await profileService.searchUsersAndHashtags(val);
      setResults(users);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="New Direct Message"
      description="Find a creator or friend to start messaging"
      maxWidth="sm"
    >
      <div className="space-y-4">
        <SearchInput
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onClear={() => handleSearch('')}
          placeholder="Search by name or @username..."
          autoFocus
        />

        <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
          {isSearching ? (
            <p className="text-center py-6 text-xs text-slate-400">Searching creators...</p>
          ) : results.length === 0 && query ? (
            <p className="text-center py-6 text-xs text-slate-400">No users found</p>
          ) : results.length === 0 ? (
            <div className="text-center py-6">
              <MessageSquarePlus className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <p className="text-xs text-slate-500">Type a username to find people to chat with</p>
            </div>
          ) : (
            results.map(user => (
              <button
                key={user.id}
                type="button"
                onClick={() => {
                  onSelectUser(user);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar src={user.avatar_url} alt={user.username} size="sm" isVerified={user.is_verified} />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.full_name}</p>
                    <p className="text-[11px] text-slate-400 truncate">@{user.username}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-brand-500">Chat</span>
              </button>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};
