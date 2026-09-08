import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const res = await login(email.trim(), password);
      if (!res.success) {
        throw new Error(res.error || 'Invalid credentials');
      }

      showToast('Welcome back!', 'Successfully signed in to VibeSphere ✨', 'success');
      navigate('/feed');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sign in. Please verify your email and password.');
      showToast('Login Failed', err.message || 'Invalid credentials', 'warning');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = async () => {
    setEmail('jordan@vibesphere.app');
    setPassword('password123');
    setIsSubmitting(true);
    try {
      await login('jordan@vibesphere.app', 'password123');
      showToast('Demo Account', 'Signed in as Jordan Hayes (Admin & Creator)', 'success');
      navigate('/feed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-brand-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-pink-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-slate-900/90 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-pink-600 to-accent-500 p-[2px] shadow-glow-brand">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
            <span className="font-display text-xl font-extrabold tracking-tight text-white">
              Vibe<span className="bg-gradient-to-r from-brand-400 to-pink-500 bg-clip-text text-transparent">Sphere</span>
            </span>
          </Link>
          <h1 className="text-xl font-bold font-display text-white">Welcome Back</h1>
          <p className="text-xs text-slate-400">Sign in to continue to your creator feed</p>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            type="email"
            label="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">Password</label>
              <Link to="/auth/forgot-password" className="text-[11px] font-bold text-brand-400 hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="gradient"
              className="w-full h-11 text-sm font-bold shadow-lg"
              isLoading={isSubmitting}
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </form>

        {/* Quick Demo Sign In Button */}
        <div className="mt-4">
          <button
            type="button"
            onClick={handleQuickDemo}
            className="w-full py-2.5 px-3 rounded-xl border border-brand-500/30 bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>1-Click Instant Demo Login (Jordan Hayes)</span>
          </button>
        </div>

        {/* Footer Link */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs text-slate-400">
          <span>Don't have an account? </span>
          <Link to="/auth/signup" className="font-bold text-brand-400 hover:underline">
            Join VibeSphere
          </Link>
        </div>
      </div>
    </div>
  );
};
