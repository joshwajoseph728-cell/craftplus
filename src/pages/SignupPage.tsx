import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { storageService } from '../services/storageService';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import {
  Sparkles,
  Camera,
  CheckCircle2,
  Lock,
  Mail,
  User,
  Calendar,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const SignupPage: React.FC = () => {
  const { signup } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const check = storageService.validateFile(file);
    if (!check.valid) {
      showToast('Invalid Photo', check.error || 'Please select an image', 'warning');
      return;
    }
    setAvatarFile(file);
    const dataUrl = await storageService.fileToDataUrl(file);
    setAvatarPreview(dataUrl);
  };

  const getPasswordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score += 25;
    if (password.length >= 10) score += 25;
    if (/[A-Z]/.test(password)) score += 25;
    if (/[0-9!@#$%^&*]/.test(password)) score += 25;
    return score;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    const cleanUsername = username.trim().toLowerCase();
    if (!/^[a-zA-Z0-9_.]+$/.test(cleanUsername)) {
      setErrorMsg('Username can only contain letters, numbers, underscores and dots.');
      return;
    }
    if (cleanUsername.length < 3) {
      setErrorMsg('Username must be at least 3 characters long.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalAvatarUrl = avatarPreview;
      if (avatarFile) {
        // In real Supabase or local preview
        const res = await storageService.uploadMedia(avatarFile, 'avatars', cleanUsername);
        if (res.url) finalAvatarUrl = res.url;
      }

      const res = await signup({
        email: email.trim(),
        password,
        username: cleanUsername,
        full_name: fullName.trim(),
        date_of_birth: dob || undefined,
        avatar_url: finalAvatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80'
      });

      if (!res.success) {
        throw new Error(res.error || 'Registration failed');
      }

      showToast('Welcome to VibeSphere!', `Account created for @${cleanUsername} ✨`, 'success');
      navigate('/feed');
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please check your credentials.');
      showToast('Signup Error', err.message || 'Failed to sign up', 'warning');
    } finally {
      setIsSubmitting(false);
    }
  };

  const strength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-brand-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-pink-600/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Registration Card */}
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
          <h1 className="text-xl font-bold font-display text-white">Join the Community</h1>
          <p className="text-xs text-slate-400">Create your account to start sharing vibes & stories</p>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Avatar Picker */}
          <div className="flex flex-col items-center gap-2 pb-1">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative group cursor-pointer"
            >
              <Avatar
                src={avatarPreview || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200'}
                alt="Avatar Preview"
                size="xl"
                className="border-2 border-brand-500/40 group-hover:border-brand-500"
              />
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                <Camera className="w-5 h-5" />
              </div>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-[11px] font-bold text-brand-400 hover:underline"
            >
              Upload Profile Photo
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="space-y-3">
            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Jordan Hayes"
              required
            />

            <Input
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. jordanhayes"
              helperText="Letters, numbers, underscores or dots"
              required
            />

            <Input
              type="email"
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />

            <div>
              <Input
                type="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              {password && (
                <div className="mt-1.5 space-y-1">
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        strength <= 25
                          ? 'bg-rose-500 w-1/4'
                          : strength <= 50
                          ? 'bg-amber-500 w-2/4'
                          : strength <= 75
                          ? 'bg-brand-500 w-3/4'
                          : 'bg-emerald-500 w-full'
                      }`}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {strength <= 25 ? 'Weak password' : strength <= 75 ? 'Moderate password' : 'Strong password'}
                  </p>
                </div>
              )}
            </div>

            <Input
              type="date"
              label="Date of Birth (Optional)"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="gradient"
              className="w-full h-11 text-sm font-bold shadow-lg"
              isLoading={isSubmitting}
            >
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </form>

        {/* Footer Link */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs text-slate-400">
          <span>Already have an account? </span>
          <Link to="/auth/login" className="font-bold text-brand-400 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
