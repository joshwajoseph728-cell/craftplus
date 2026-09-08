import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { storageService } from '../../services/storageService';
import { postService } from '../../services/postService';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { Avatar } from '../ui/Avatar';
import { Post, ProjectCategory } from '../../types/database.types';
import { extractHashtags } from '../../lib/utils';
import {
  ImagePlus,
  X,
  MapPin,
  Globe,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Hash,
  Code2,
  ExternalLink,
  Github,
  BookOpen,
  Briefcase,
  Users
} from 'lucide-react';

export interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: (post: Post) => void;
}

const PROJECT_CATEGORIES: ProjectCategory[] = [
  'Software & Web',
  'UI/UX & Product Design',
  'AI & Machine Learning',
  'Mobile Applications',
  'Creative & 3D Art',
  'Hardware & IoT',
  'Research & Case Studies',
  'Other'
];

const COMMON_TECH_SUGGESTIONS = [
  'React', 'TypeScript', 'Next.js', 'Python', 'Tailwind CSS',
  'PostgreSQL', 'Supabase', 'Node.js', 'Figma', 'PyTorch',
  'Docker', 'Rust', 'WebGPU', 'GraphQL', 'AWS', 'Flutter'
];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onPostCreated
}) => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);

  // Project Fields
  const [projectTitle, setProjectTitle] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('Software & Web');
  const [workStatus, setWorkStatus] = useState<'Completed' | 'In Progress' | 'Case Study' | 'Concept'>('Completed');
  const [caption, setCaption] = useState('');
  const [experienceLearnings, setExperienceLearnings] = useState('');
  const [techStackInput, setTechStackInput] = useState('');
  const [techStack, setTechStack] = useState<string[]>(['React', 'TypeScript']);
  const [liveDemoUrl, setLiveDemoUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [openToCollab, setOpenToCollab] = useState(true);
  const [location, setLocation] = useState('');
  const [audience, setAudience] = useState<'public' | 'followers' | 'private'>('public');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const selected = Array.from(e.target.files);
    const validFiles: File[] = [];
    const validPreviews: string[] = [];

    for (const file of selected) {
      const check = storageService.validateFile(file);
      if (!check.valid) {
        showToast('Invalid File', check.error || 'Please select a valid image/video', 'warning');
        continue;
      }
      validFiles.push(file);
      const url = await storageService.fileToDataUrl(file);
      validPreviews.push(url);
    }

    setFiles(prev => [...prev, ...validFiles].slice(0, 5));
    setPreviews(prev => [...prev, ...validPreviews].slice(0, 5));
  };

  const handleRemoveMedia = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
    if (activeSlide >= previews.length - 1) {
      setActiveSlide(Math.max(0, previews.length - 2));
    }
  };

  const handleAddTech = (tech: string) => {
    const trimmed = tech.trim();
    if (trimmed && !techStack.includes(trimmed)) {
      setTechStack(prev => [...prev, trimmed]);
      setTechStackInput('');
    }
  };

  const handleRemoveTech = (tech: string) => {
    setTechStack(prev => prev.filter(t => t !== tech));
  };

  const handleSubmit = async () => {
    if (!user) {
      showToast('Authentication Required', 'Please sign in to publish your work', 'warning');
      return;
    }
    if (previews.length === 0) {
      showToast('Screenshots / Media Required', 'Please attach at least one screenshot or demo media for your project', 'warning');
      return;
    }
    if (!projectTitle.trim()) {
      showToast('Project Title Required', 'Please provide a title for your work showcase', 'warning');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(20);

    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await storageService.uploadMedia(file, 'posts', user.id);
        if (res.url) {
          uploadedUrls.push(res.url);
        }
        setUploadProgress(20 + Math.round(((i + 1) / files.length) * 60));
      }

      const finalMedia = uploadedUrls.length > 0 ? uploadedUrls : previews;
      const hashtags = extractHashtags(caption);

      const { post, error } = await postService.createPost({
        user,
        project_title: projectTitle.trim(),
        category,
        caption: caption.trim(),
        experience_learnings: experienceLearnings.trim() || undefined,
        tech_stack: techStack,
        live_demo_url: liveDemoUrl.trim() || undefined,
        github_url: githubUrl.trim() || undefined,
        work_status: workStatus,
        open_to_collab: openToCollab,
        location: location.trim() || undefined,
        audience,
        mediaUrls: finalMedia,
        hashtags
      });

      if (error || !post) {
        throw new Error(error || 'Failed to publish project');
      }

      setUploadProgress(100);
      showToast('Project Showcase Published!', 'Your work is now live on the global feed & creator portfolio ✨', 'success');

      if (onPostCreated) {
        onPostCreated(post);
      }

      // Reset
      setFiles([]);
      setPreviews([]);
      setProjectTitle('');
      setCaption('');
      setExperienceLearnings('');
      setLiveDemoUrl('');
      setGithubUrl('');
      setLocation('');
      setActiveSlide(0);
      onClose();
    } catch (err: any) {
      showToast('Publish Error', err.message || 'Something went wrong', 'warning');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isSubmitting && onClose()}
      title="Showcase Work & Project Experience"
      description="Share what you built, technologies used, case studies, and key learnings"
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Creator Header Bar */}
        {user && (
          <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
            <div className="flex items-center gap-2.5">
              <Avatar src={user.avatar_url} alt={user.full_name} size="sm" isVerified={user.is_verified} />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-none">{user.full_name}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Publishing to Creator Portfolio</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={workStatus}
                onChange={(e) => setWorkStatus(e.target.value as any)}
                className="text-[11px] font-bold bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 rounded-lg px-2 py-1 border border-slate-200 dark:border-slate-700 outline-none"
              >
                <option value="Completed">✅ Completed Work</option>
                <option value="In Progress">🚧 Work In Progress</option>
                <option value="Case Study">📖 Case Study</option>
                <option value="Concept">💡 Concept / Prototype</option>
              </select>
            </div>
          </div>
        )}

        {/* Media Preview / Drag & Drop */}
        {previews.length > 0 ? (
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-[16/10] flex items-center justify-center group">
            <img
              src={previews[activeSlide]}
              alt={`Work preview ${activeSlide + 1}`}
              className="w-full h-full object-contain"
            />

            <button
              type="button"
              onClick={() => handleRemoveMedia(activeSlide)}
              className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-rose-600 text-white rounded-full transition-colors backdrop-blur-sm"
              title="Remove this photo"
            >
              <X className="w-4 h-4" />
            </button>

            {previews.length > 1 && (
              <>
                {activeSlide > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveSlide(prev => prev - 1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors backdrop-blur-sm"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}
                {activeSlide < previews.length - 1 && (
                  <button
                    type="button"
                    onClick={() => setActiveSlide(prev => prev + 1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors backdrop-blur-sm"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}

                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-sm">
                  {previews.map((_, i) => (
                    <span
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        activeSlide === i ? 'w-4 bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {previews.length < 5 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-3 right-3 text-xs font-semibold bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white px-2.5 py-1 rounded-lg backdrop-blur-sm flex items-center gap-1 hover:bg-white transition-colors"
              >
                <ImagePlus className="w-3.5 h-3.5" />
                <span>+ Add Slide</span>
              </button>
            )}
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 dark:hover:border-brand-500 rounded-2xl p-7 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-900/30 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <ImagePlus className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Upload Project Screenshots, Diagrams & Architecture Visuals
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Supports multiple images / carousel slides up to 5MB each
            </p>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFilesSelected}
          accept="image/*,video/mp4"
          multiple
          className="hidden"
        />

        {/* Project Name & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Project Title / Work Name *"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            placeholder="e.g. PrismUI Design System or Autonomous Drone Hub"
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Work Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ProjectCategory)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-100/80 dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 outline-none focus:border-brand-500"
            >
              {PROJECT_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Caption & Overview */}
        <Textarea
          label="Project Overview & Story"
          rows={3}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Describe what you created, who it is for, key features, and what problem it solves..."
          maxLength={1200}
        />

        {/* Experience & Challenges Overcome */}
        <Textarea
          label="💡 Experience & Key Learnings (Case Study Details)"
          rows={3}
          value={experienceLearnings}
          onChange={(e) => setExperienceLearnings(e.target.value)}
          placeholder="What challenges did you face? What architectural decisions did you make? Any performance or user breakthroughs?"
          maxLength={1500}
        />

        {/* Tech Stack Pills & Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Technologies & Tools Used
          </label>
          <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-100/80 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800">
            {techStack.map(tech => (
              <span
                key={tech}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-brand-500/15 text-brand-600 dark:text-brand-400 border border-brand-500/20"
              >
                <Code2 className="w-3 h-3" />
                <span>{tech}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTech(tech)}
                  className="hover:text-rose-500 ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={techStackInput}
              onChange={(e) => setTechStackInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTech(techStackInput);
                }
              }}
              placeholder="+ Add tech (press Enter)..."
              className="flex-1 min-w-[120px] bg-transparent text-xs outline-none px-1 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>

          {/* Quick Suggestions */}
          <div className="flex flex-wrap gap-1 pt-1">
            <span className="text-[10px] text-slate-400 mr-1 mt-0.5">Quick add:</span>
            {COMMON_TECH_SUGGESTIONS.slice(0, 7).map(sug => (
              <button
                key={sug}
                type="button"
                onClick={() => handleAddTech(sug)}
                className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-brand-500 hover:text-white transition-colors"
              >
                +{sug}
              </button>
            ))}
          </div>
        </div>

        {/* Project Links (Live Demo & Repository) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="relative">
            <ExternalLink className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={liveDemoUrl}
              onChange={(e) => setLiveDemoUrl(e.target.value)}
              placeholder="Live Demo URL (e.g. https://myproject.com)"
              className="pl-10 text-xs"
            />
          </div>

          <div className="relative">
            <Github className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="Repository / GitHub URL"
              className="pl-10 text-xs"
            />
          </div>
        </div>

        {/* Collaboration Open Checkbox */}
        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-500" />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Open to Project Collaborators & Inquiries</p>
              <p className="text-[10px] text-slate-400">Allows other creators to message you directly about this project</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={openToCollab}
            onChange={(e) => setOpenToCollab(e.target.checked)}
            className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
          />
        </div>

        {/* Upload Progress Bar */}
        {isSubmitting && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-brand-600 dark:text-brand-400">
              <span>Uploading Project & Case Study to Supabase...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-brand-600 to-pink-500 h-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="gradient"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={previews.length === 0 || !projectTitle.trim()}
            className="px-6"
          >
            <Sparkles className="w-4 h-4 mr-1.5" />
            <span>Publish Work Showcase</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};
