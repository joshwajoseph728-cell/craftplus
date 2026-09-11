import React, { useState, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { MobileNav } from './MobileNav';
import { RightPanel } from './RightPanel';
import { CreatePostModal } from '../create/CreatePostModal';
import { ToastContainer } from '../ui/ToastContainer';
import { usePosts } from '../../hooks/usePosts';
import { useChat } from '../../contexts/ChatContext';

import { cn } from '../../lib/utils';

export interface AppLayoutProps {
  children: ReactNode;
  showRightPanel?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  showRightPanel = true
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { addOptimisticPost } = usePosts();
  const { activeUser } = useChat();
  const location = useLocation();

  const isMobileActiveChat = location.pathname.startsWith('/messages') && !!activeUser;

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors">
      {/* Desktop Left Sidebar */}
      <Sidebar onOpenCreate={() => setIsCreateModalOpen(true)} />

      {/* Main Column */}
      <div className={cn(
        "flex-1 flex flex-col min-w-0 min-h-screen",
        isMobileActiveChat ? "pb-0" : "pb-16 md:pb-0"
      )}>
        {/* Top Navbar (hidden on mobile during active DM) */}
        <div className={isMobileActiveChat ? "hidden md:block" : "block"}>
          <Navbar onOpenCreate={() => setIsCreateModalOpen(true)} />
        </div>

        <div className="flex-1 flex justify-center w-full min-h-0">
          <main className={cn(
            'w-full',
            isMobileActiveChat
              ? 'p-0 h-[100dvh] md:h-auto md:max-w-5xl md:px-4 md:py-6'
              : showRightPanel
                ? 'max-w-4xl px-4 py-6'
                : 'max-w-5xl p-0 md:px-4 md:py-6'
          )}>
            {children}
          </main>

          {/* Desktop Right Panel (Suggestions & Tech Stack) */}
          {showRightPanel && <RightPanel />}
        </div>
      </div>

      {/* Mobile Bottom Navigation (hidden when chatting inside active DM) */}
      {!isMobileActiveChat && (
        <MobileNav onOpenCreate={() => setIsCreateModalOpen(true)} />
      )}

      {/* Global Post Creation Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPostCreated={(post) => addOptimisticPost(post)}
      />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};


