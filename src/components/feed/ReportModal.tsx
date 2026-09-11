import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { adminService } from '../../services/adminService';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Input';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

export interface ReportModalProps {
  postId?: string;
  commentId?: string;
  reportedUserId?: string;
  isOpen: boolean;
  onClose: () => void;
}

const REPORT_REASONS = [
  { id: 'spam', label: 'Spam or Misleading Content', desc: 'Repetitive messages or scam links' },
  { id: 'harassment', label: 'Harassment or Bullying', desc: 'Targeted hostility, threats, or intimidation' },
  { id: 'hate', label: 'Hate Speech', desc: 'Direct attacks on protected groups' },
  { id: 'violence', label: 'Violence or Dangerous Activity', desc: 'Threats of harm or graphic violence' },
  { id: 'nudity', label: 'Explicit Nudity or Sexual Content', desc: 'Inappropriate media violations' },
  { id: 'scam', label: 'Fraud or Scams', desc: 'Financial scams or impersonation' },
  { id: 'other', label: 'Other Guidelines Violation', desc: 'Other issues not listed above' }
];

export const ReportModal: React.FC<ReportModalProps> = ({
  postId,
  commentId,
  reportedUserId,
  isOpen,
  onClose
}) => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [selectedReason, setSelectedReason] = useState<any>('spam');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      showToast('Authentication Required', 'Please sign in to submit a report', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const { success, error } = await adminService.submitReport({
        reporterId: user.id,
        postId,
        commentId,
        reportedUserId,
        reason: selectedReason,
        details
      });

      if (!success) throw new Error(error || 'Failed to submit report');

      showToast('Report Submitted', 'Thank you for keeping VibeSphere safe. Our team will review this promptly.', 'success');
      setDetails('');
      onClose();
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to submit report', 'warning');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isSubmitting && onClose()}
      title="Report Content"
      description="Help maintain a safe, welcoming and inspiring community"
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {REPORT_REASONS.map(r => (
            <label
              key={r.id}
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                selectedReason === r.id
                  ? 'bg-brand-500/10 border-brand-500/40 text-brand-600 dark:text-brand-400'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <input
                type="radio"
                name="report_reason"
                value={r.id}
                checked={selectedReason === r.id}
                onChange={() => setSelectedReason(r.id)}
                className="mt-1 text-brand-600 focus:ring-brand-500"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white">{r.label}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{r.desc}</p>
              </div>
            </label>
          ))}
        </div>

        <Textarea
          label="Additional Details (Optional)"
          rows={2}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Describe why you are reporting this content..."
          maxLength={300}
        />

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleSubmit}
            isLoading={isSubmitting}
          >
            <ShieldAlert className="w-4 h-4 mr-1.5" />
            <span>Submit Report</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};

