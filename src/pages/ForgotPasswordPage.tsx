import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { useNotifications } from '../contexts/NotificationContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Sparkles, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const { showToast } = useNotifications();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await authService.resetPassword(email.trim());
      if (!res.success) throw new Error(res.error || 'Failed to send reset link');
      setIsSent(true);
      showToast('Reset Link Sent', 'Check your inbox for password reset instructions', 'success');
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to send email', 'warning');
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
          <h1 className="text-xl font-bold font-display text-white">Reset Password</h1>
          <p className="text-xs text-slate-400">Enter your account email to receive a recovery link</p>
        </div>

        {isSent ? (
          <div className="text-center space-y-4 py-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-white">Recovery Email Sent</h3>
            <p className="text-xs text-slate-400">
              We've dispatched a password reset link to <strong className="text-white">{email}</strong>.
            </p>
            <Link to="/auth/login" className="inline-block mt-2">
              <Button variant="secondary" size="sm">Back to Login</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />

            <Button
              type="submit"
              variant="gradient"
              className="w-full h-11 text-sm font-bold shadow-lg"
              isLoading={isSubmitting}
            >
              <span>Send Recovery Link</span>
            </Button>

            <div className="text-center pt-2">
              <Link to="/auth/login" className="text-xs font-semibold text-slate-400 hover:text-white flex items-center justify-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to sign in</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

