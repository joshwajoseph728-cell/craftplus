import React, { useState, ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { MobileNav } from './MobileNav';
import { RightPanel } from './RightPanel';
import { CreatePostModal } from '../create/CreatePostModal';
import { ToastContainer } from '../ui/ToastContainer';
import { usePosts } from '../../hooks/usePosts';

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

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors">
      {/* Desktop Left Sidebar */}
      <Sidebar onOpenCreate={() => setIsCreateModalOpen(true)} />

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen pb-16 md:pb-0">
        {/* Top Navbar */}
        <Navbar onOpenCreate={() => setIsCreateModalOpen(true)} />

        <div className="flex-1 flex justify-center w-full">
          <main className={cn('w-full', showRightPanel ? 'max-w-4xl px-4 py-6' : 'max-w-5xl p-0 md:px-4 md:py-6')}>
            {children}
          </main>

          {/* Desktop Right Panel (Suggestions & Tech Stack) */}
          {showRightPanel && <RightPanel />}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav onOpenCreate={() => setIsCreateModalOpen(true)} />

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

