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

      showToast('Welcome back!', 'Successfully signed in to CraftPlus ✨', 'success');
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
          <Link to="/" className="inline-flex items-center gap-2.5 mb-1 group">
            <img
              src="/logo.png"
              alt="CraftPlus Logo"
              className="w-10 h-10 rounded-2xl object-contain shadow-md shadow-brand-500/30 group-hover:scale-105 transition-transform duration-200"
            />
            <span className="font-display text-2xl font-extrabold tracking-tight text-white flex items-center">
              Craft<span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-pink-500 bg-clip-text text-transparent">Plus</span>
            </span>
          </Link>
          <h1 className="text-xl font-bold font-display text-white">Welcome Back</h1>
          <p className="text-xs text-slate-400">Sign in to your creator account</p>
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
              placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
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
              <span>Sign In to CraftPlus</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </form>

        {/* Create Account Primary Action */}
        <div className="mt-5 p-3 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
          <p className="text-xs text-slate-300 font-medium">New to CraftPlus?</p>
          <Link
            to="/auth/signup"
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 via-pink-600 to-accent-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:opacity-95 shadow-sm transition-all"
          >
            <span>Create a New Account</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

