import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useNotifications } from '../contexts/NotificationContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Sparkles, Lock, CheckCircle2 } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast('Too Short', 'Password must be at least 6 characters', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Mismatch', 'Passwords do not match', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authService.updatePassword(newPassword);
      if (!res.success) throw new Error(res.error || 'Failed to reset password');
      showToast('Password Updated', 'Your password has been changed. Please sign in.', 'success');
      navigate('/auth/login');
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to update password', 'warning');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      <div className="relative z-10 w-full max-w-md bg-slate-900/90 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center space-y-2 mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-pink-600 p-[2px]">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
            <span className="font-display text-xl font-extrabold text-white">VibeSphere</span>
          </Link>
          <h1 className="text-xl font-bold font-display text-white">Choose New Password</h1>
          <p className="text-xs text-slate-400">Set a strong new password for your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            label="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <Input
            type="password"
            label="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <Button
            type="submit"
            variant="gradient"
            className="w-full h-11 text-sm font-bold shadow-lg"
            isLoading={isSubmitting}
          >
            <span>Update Password</span>
          </Button>
        </form>
      </div>
    </div>
  );
};
