import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { Avatar } from '../ui/Avatar';
import { Profile, Post } from '../../types/database.types';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useChat } from '../../contexts/ChatContext';
import { messageService } from '../../services/messageService';
import { Briefcase, Send, Sparkles, CheckCircle2, UserCheck } from 'lucide-react';

export interface CollabRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: Profile;
  project?: Post;
}

export const CollabRequestModal: React.FC<CollabRequestModalProps> = ({
  isOpen,
  onClose,
  targetUser,
  project
}) => {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const { refreshConversations } = useChat();

  const [role, setRole] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendProposal = async () => {
    if (!user) {
      showToast('Sign In Required', 'Please sign in to send a collaboration proposal', 'warning');
      return;
    }
    if (!role.trim()) {
      showToast('Role Required', 'Please specify what skill/role you want to collaborate on', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const fullContent = `ðŸ¤ Collaboration Proposal for "${project?.project_title || 'your projects'}":\nâ€¢ Proposed Role: ${role}\nâ€¢ Message: ${message || 'Excited to contribute to your work!'}`;

      const { error } = await messageService.sendMessage({
        sender: user,
        receiverId: targetUser.id,
        content: fullContent,
        projectReference: project ? {
          id: project.id,
          title: project.project_title || 'Project Showcase',
          thumbnail: project.media?.[0]?.media_url || ''
        } : undefined
      });

      if (error) throw new Error(error);

      await refreshConversations();

      showToast(
        'Collaboration Proposal Sent! ðŸš€',
        `Your message has been delivered directly to ${targetUser.full_name}`,
        'success'
      );
      setRole('');
      setMessage('');
      onClose();
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to send proposal', 'warning');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Send Collaboration Proposal"
      description={`Connect with ${targetUser.full_name} to build together`}
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Target Creator Banner */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <Avatar src={targetUser.avatar_url} alt={targetUser.full_name} size="md" isVerified={targetUser.is_verified} />
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{targetUser.full_name}</p>
            <p className="text-[11px] text-slate-400 truncate">@{targetUser.username} â€¢ {targetUser.skills?.[0] || 'Creator'}</p>
          </div>
        </div>

        {project && (
          <div className="p-3 bg-brand-500/10 rounded-2xl border border-brand-500/20 text-xs">
            <span className="font-bold text-brand-600 dark:text-brand-400">Project Reference: </span>
            <span className="text-slate-800 dark:text-slate-200 font-semibold">{project.project_title}</span>
          </div>
        )}

        <Input
          label="Your Skill / Proposed Contribution Role *"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="e.g. UI/UX Designer, PyTorch Engineer, 3D Modeler"
          required
        />

        <Textarea
          label="Intro & Why You Want to Build Together"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Share your experience, portfolio link, or ideas for the project..."
        />

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="gradient"
            size="sm"
            onClick={handleSendProposal}
            isLoading={isSubmitting}
            disabled={!role.trim()}
          >
            <Send className="w-3.5 h-3.5 mr-1.5" />
            <span>Send Proposal</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};

