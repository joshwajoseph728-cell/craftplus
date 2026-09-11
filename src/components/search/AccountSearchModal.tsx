import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Profile } from '../../types/database.types';
import { profileService } from '../../services/profileService';
import { Avatar } from '../ui/Avatar';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import { Search, X, User, MessageSquare, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { formatCompactNumber } from '../../lib/utils';

export interface AccountSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountSearchModal: React.FC<AccountSearchModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { setActiveUser } = useChat();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Profile[]>([]);
  const [suggested, setSuggested] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      const loadSuggested = async () => {
        const users = await profileService.getSuggestedUsers(user?.id);
        setSuggested(users);
      };
      loadSuggested();
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen, user?.id]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const { users } = await profileService.searchUsersAndHashtags(query);
        setResults(users.filter(u => u.id !== user?.id));
      } catch (err) {
        console.error('Account search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timeout);
  }, [query, user?.id]);

  if (!isOpen) return null;

  const handleSelectProfile = (username: string) => {
    onClose();
    navigate(`/profile/${username}`);
  };

  const handleStartDM = (targetUser: Profile) => {
    setActiveUser(targetUser);
    onClose();
    navigate('/messages');
  };

  const displayedUsers = query.trim() ? results : suggested;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-start justify-center p-4 pt-16 md:pt-24 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-surface-cardDark border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Input */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-3 bg-slate-50/50 dark:bg-surface-dark/50">
          <Search className="w-5 h-5 text-brand-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search accounts by name, @username, or skills (e.g. React, Figma)..."
            className="flex-1 bg-transparent text-sm md:text-base text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="text-xs font-bold uppercase px-1">Esc</span>
          </button>
        </div>

        {/* Search Status & Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-2">
          <div className="px-2 py-1 flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            <span>{query.trim() ? `Search Results (${results.length})` : 'Recommended Creators & Accounts'}</span>
            {loading && <span className="text-brand-500 animate-pulse">Searching...</span>}
          </div>

          {loading ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-500">Searching for accounts...</p>
            </div>
          ) : displayedUsers.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <User className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {query.trim() ? `No accounts found matching "${query}"` : 'No other creators registered yet'}
              </p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                {query.trim()
                  ? 'Try searching by their exact @username, full name, or skills like React, Figma, Python.'
                  : 'Search for accounts by name, username, or skills using the search bar above.'}
              </p>
            </div>
          ) : (
            displayedUsers.map((creator) => (
              <div
                key={creator.id}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between gap-3 transition-colors group"
              >
                <div
                  onClick={() => handleSelectProfile(creator.username)}
                  className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                >
                  <Avatar
                    src={creator.avatar_url}
                    alt={creator.full_name}
                    size="md"
                    isVerified={creator.is_verified}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-brand-500 transition-colors">
                        {creator.full_name}
                      </p>
                      {creator.is_verified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-500 fill-brand-500/20 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      @{creator.username} • {formatCompactNumber(creator.followers_count || 0)} followers
                    </p>
                    {creator.skills && creator.skills.length > 0 && (
                      <div className="flex items-center gap-1 mt-1 overflow-hidden">
                        {creator.skills.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {user && user.id !== creator.id && (
                    <button
                      onClick={() => handleStartDM(creator)}
                      className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-brand-500 hover:bg-brand-500/10 transition-colors"
                      title="Direct Message"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleSelectProfile(creator.username)}
                    className="p-2 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-brand-500 hover:text-white transition-colors"
                    title="View Portfolio"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Shortcut Tip */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-surface-dark flex items-center justify-between text-[11px] text-slate-400">
          <span>Tip: Search by name, username or technical skill</span>
          <button
            onClick={() => {
              onClose();
              navigate('/explore');
            }}
            className="font-bold text-brand-500 hover:underline"
          >
            Open Explore Hub &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};

