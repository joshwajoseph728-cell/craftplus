import React, { useState } from 'react';
import { useStories } from '../../hooks/useStories';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar } from '../ui/Avatar';
import { StoryViewerModal } from './StoryViewerModal';
import { CreateStoryModal } from './CreateStoryModal';
import { Plus } from 'lucide-react';

export const StoriesBar: React.FC = () => {
  const { user } = useAuth();
  const { storyGroups, refreshStories, markViewed } = useStories();

  const [activeGroupIndex, setActiveGroupIndex] = useState<number | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Check if current user has an active story
  const myGroup = storyGroups.find(g => g.user.id === user?.id);

  return (
    <>
      <div className="w-full bg-white dark:bg-surface-cardDark border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-3.5 mb-6 shadow-sm overflow-x-auto scrollbar-none transition-colors">
        <div className="flex items-center gap-4 min-w-max px-1">
          {/* Add / View Your Story */}
          <div className="flex flex-col items-center gap-1.5 cursor-pointer group">
            <div className="relative">
              <Avatar
                src={user?.avatar_url}
                alt={user?.full_name || 'You'}
                size="lg"
                hasStory={!!myGroup}
                storyViewed={!myGroup?.hasUnviewed}
                onClick={() => {
                  if (myGroup) {
                    const idx = storyGroups.findIndex(g => g.user.id === user?.id);
                    setActiveGroupIndex(idx);
                  } else {
                    setIsCreateOpen(true);
                  }
                }}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCreateOpen(true);
                }}
                className="absolute bottom-0 right-0 p-1 bg-brand-600 group-hover:bg-brand-500 text-white rounded-full ring-2 ring-white dark:ring-surface-cardDark shadow-sm transition-transform group-hover:scale-110"
                title="Add to story"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 max-w-[64px] truncate text-center">
              Your story
            </span>
          </div>

          {/* Other Users' Stories */}
          {storyGroups
            .filter(g => g.user.id !== user?.id)
            .map((group) => {
              const groupIndex = storyGroups.indexOf(group);

              return (
                <div
                  key={group.user.id}
                  onClick={() => setActiveGroupIndex(groupIndex)}
                  className="flex flex-col items-center gap-1.5 cursor-pointer group"
                >
                  <Avatar
                    src={group.user.avatar_url}
                    alt={group.user.username}
                    size="lg"
                    hasStory={true}
                    storyViewed={!group.hasUnviewed}
                    className="group-hover:scale-105 transition-transform"
                  />
                  <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 max-w-[64px] truncate text-center group-hover:text-brand-500">
                    {group.user.username}
                  </span>
                </div>
              );
            })}
        </div>
      </div>

      {/* Story Fullscreen Viewer */}
      {activeGroupIndex !== null && (
        <StoryViewerModal
          groups={storyGroups}
          initialGroupIndex={activeGroupIndex}
          isOpen={activeGroupIndex !== null}
          onClose={() => setActiveGroupIndex(null)}
          onStoryViewed={markViewed}
          onStoryDeleted={() => refreshStories()}
        />
      )}

      {/* Create Story Modal */}
      <CreateStoryModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onStoryCreated={() => refreshStories()}
      />
    </>
  );
};

