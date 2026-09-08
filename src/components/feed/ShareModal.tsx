import React, { useState } from 'react';
import { Post } from '../../types/database.types';
import { useNotifications } from '../../contexts/NotificationContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Copy, Check, Share2, Send, Twitter, Facebook } from 'lucide-react';

export interface ShareModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  post,
  isOpen,
  onClose
}) => {
  const { showToast } = useNotifications();
  const [copied, setCopied] = useState(false);

  if (!post) return null;

  const postUrl = `${window.location.origin}/feed?post=${post.id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      showToast('Link Copied', 'Post URL copied to clipboard', 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast('Error', 'Failed to copy link', 'warning');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by @${post.user.username} on VibeSphere`,
          text: post.caption,
          url: postUrl
        });
      } catch (err) {
        // user cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share Vibe"
      description="Share this creative work with friends or on social networks"
      maxWidth="sm"
    >
      <div className="space-y-4">
        {/* Copy Link Bar */}
        <div className="flex items-center gap-2 p-2 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <input
            type="text"
            readOnly
            value={postUrl}
            className="flex-1 bg-transparent text-xs text-slate-600 dark:text-slate-300 outline-none px-2 truncate"
          />
          <Button
            size="sm"
            variant={copied ? 'secondary' : 'gradient'}
            onClick={handleCopyLink}
            className="h-8 text-xs font-bold shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </Button>
        </div>

        {/* Quick Social Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={handleNativeShare}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition-colors"
          >
            <Share2 className="w-4 h-4 text-brand-500" />
            <span>Native Share</span>
          </button>

          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this vibe by @${post.user.username} on VibeSphere: `)}&url=${encodeURIComponent(postUrl)}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition-colors text-slate-800 dark:text-slate-200"
          >
            <Twitter className="w-4 h-4 text-sky-500" />
            <span>Share on X</span>
          </a>
        </div>
      </div>
    </Modal>
  );
};
