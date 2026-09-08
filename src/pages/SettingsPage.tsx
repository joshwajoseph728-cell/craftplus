import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { storageService } from '../services/storageService';
import { authService } from '../services/authService';
import { Input, Textarea } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import {
  Settings as SettingsIcon,
  Shield,
  User,
  Lock,
  Camera,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, updateProfile, isConfigured } = useAuth();
  const { showToast } = useNotifications();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [website, setWebsite] = useState(user?.website || '');
  const [location, setLocation] = useState(user?.location || '');
  const [isPrivate, setIsPrivate] = useState(user?.is_private || false);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;
    const file = e.target.files[0];
    const check = storageService.validateFile(file);
    if (!check.valid) {
      showToast('Invalid Image', check.error || 'Please choose a valid photo', 'warning');
      return;
    }

    try {
      const res = await storageService.uploadMedia(file, 'avatars', user.id);
      if (res.url) {
        setAvatarUrl(res.url);
        showToast('Avatar Uploaded', 'Remember to save changes to persist your profile photo.', 'info');
      }
    } catch {
      showToast('Error', 'Failed to upload avatar', 'warning');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      const res = await updateProfile({
        full_name: fullName.trim(),
        username: username.toLowerCase().trim(),
        bio: bio.trim(),
        website: website.trim(),
        location: location.trim(),
        is_private: isPrivate,
        avatar_url: avatarUrl
      });

      if (!res.success) throw new Error(res.error || 'Failed to update profile');
      showToast('Profile Updated', 'Your changes have been saved successfully ✨', 'success');
    } catch (err: any) {
      showToast('Update Failed', err.message || 'Something went wrong', 'warning');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast('Password Too Short', 'Password must be at least 6 characters', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Mismatch', 'Passwords do not match', 'warning');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await authService.updatePassword(newPassword);
      if (!res.success) throw new Error(res.error || 'Failed to update password');
      showToast('Password Changed', 'Your account password has been updated', 'success');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to update password', 'warning');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <h1 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-brand-500" />
          <span>Account Settings</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">Manage your profile, privacy, security and credentials</p>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSaveProfile} className="bg-white dark:bg-surface-cardDark border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <User className="w-4 h-4 text-brand-500" />
          <span>Public Profile</span>
        </h3>

        {/* Avatar change */}
        <div className="flex items-center gap-5">
          <div className="relative group">
            <Avatar src={avatarUrl} alt={fullName} size="xl" isVerified={user?.is_verified} />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
            >
              <Camera className="w-6 h-6" />
            </button>
          </div>

          <div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Change Photo
            </Button>
            <p className="text-[11px] text-slate-400 mt-1">JPEG, PNG or WEBP up to 5MB</p>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarSelect}
            accept="image/*"
            className="hidden"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <Textarea
          label="Bio"
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell the community about yourself..."
          maxLength={200}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://yourwebsite.com"
          />
          <Input
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, Country"
          />
        </div>

        {/* Privacy Toggle */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
          <div className="pr-4">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Private Account</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              When your account is private, only people you approve can see your photos, vibes and stories.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600" />
          </label>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" variant="gradient" isLoading={isSaving}>
            <Sparkles className="w-4 h-4 mr-1.5" />
            <span>Save Profile Changes</span>
          </Button>
        </div>
      </form>

      {/* Security & Password */}
      <form onSubmit={handlePasswordChange} className="bg-white dark:bg-surface-cardDark border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 md:p-8 space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Lock className="w-4 h-4 text-brand-500" />
          <span>Account Security</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            type="password"
            label="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
          />
          <Input
            type="password"
            label="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="secondary"
            disabled={!newPassword || isUpdatingPassword}
            isLoading={isUpdatingPassword}
          >
            Update Password
          </Button>
        </div>
      </form>
    </div>
  );
};
