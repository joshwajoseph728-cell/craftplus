import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { storageService } from '../../services/storageService';
import { postService } from '../../services/postService';
import { aiService } from '../../services/aiService';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { Avatar } from '../ui/Avatar';
import { AICreatorModal } from '../ai/AICreatorModal';
import { Post, ProjectCategory, Contributor } from '../../types/database.types';
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
  Users,
  Bot,
  Wrench,
  UserPlus
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
  'Robotics & Embedded',
  'Photography & Visuals',
  'Music & Sound Design',
  'Research & Case Studies',
  'Other'
];

const COMMON_TECH_SUGGESTIONS = [
  'React', 'TypeScript', 'Next.js', 'Python', 'Tailwind CSS',
  'PostgreSQL', 'Supabase', 'Node.js', 'Figma', 'PyTorch',
  'Docker', 'Rust', 'WebGPU', 'ROS 2', 'ESP32', 'Three.js'
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
  const [toolsInput, setToolsInput] = useState('');
  const [toolsUsed, setToolsUsed] = useState<string[]>(['Vite', 'Tailwind CSS']);
  const [liveDemoUrl, setLiveDemoUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [openToCollab, setOpenToCollab] = useState(true);
  const [collabRoleNeeded, setCollabRoleNeeded] = useState('');
  const [location, setLocation] = useState('');
  const [audience, setAudience] = useState<'public' | 'followers' | 'private'>('public');
  const [moodType, setMoodType] = useState<'work' | 'normal'>('work');

  // Contributors State
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [contribName, setContribName] = useState('');
  const [contribRole, setContribRole] = useState('');

  // AI Assistant Modal
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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

  const handleAddTool = (tool: string) => {
    const trimmed = tool.trim();
    if (trimmed && !toolsUsed.includes(trimmed)) {
      setToolsUsed(prev => [...prev, trimmed]);
      setToolsInput('');
    }
  };

  const handleRemoveTool = (tool: string) => {
    setToolsUsed(prev => prev.filter(t => t !== tool));
  };

  const handleAddContributor = () => {
    if (!contribName.trim()) return;
    const newContrib: Contributor = {
      id: `contrib-${Date.now()}`,
      username: contribName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      full_name: contribName.trim(),
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${contribName}`,
      role_in_project: contribRole.trim() || 'Co-Creator'
    };
    setContributors(prev => [...prev, newContrib]);
    setContribName('');
    setContribRole('');
  };

  const handleRemoveContributor = (id: string) => {
    setContributors(prev => prev.filter(c => c.id !== id));
  };

  const handleSubmit = async () => {
    if (!user) {
      showToast('Authentication Required', 'Please sign in to publish your work', 'warning');
      return;
    }
    if (previews.length === 0) {
      showToast('Media Required', 'Please attach at least one screenshot or demo image', 'warning');
      return;
    }
    if (!projectTitle.trim()) {
      showToast('Project Title Required', 'Please provide a title for your project showcase', 'warning');
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
        hashtags,
        mood_type: moodType
      });

      if (error || !post) {
        throw new Error(error || 'Failed to publish project');
      }

      // Attach contributors & tools locally
      post.contributors = contributors;
      post.tools_used = toolsUsed;
      post.collab_role_needed = collabRoleNeeded;

      setUploadProgress(100);
      showToast('Project Showcase Published!', 'Your work is live on the global feed & creator portfolio ✨', 'success');

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
      setContributors([]);
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
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => !isSubmitting && onClose()}
        title="Showcase Project & Case Study"
        description="Publish what you built, technologies used, case study learnings, and invite collaborators"
        maxWidth="2xl"
      >
        <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {/* Creator Header Bar with AI Studio Trigger */}
          <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
            {user && (
              <div className="flex items-center gap-2.5">
                <Avatar src={user.avatar_url} alt={user.full_name} size="sm" isVerified={user.is_verified} />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-none">{user.full_name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Publishing to Creator Portfolio</p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsAIModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-brand-600 to-pink-600 text-white shadow-sm hover:opacity-95 transition-opacity"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AI Creator Studio</span>
            </button>
          </div>

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
                Upload Project Screenshots, Diagrams & Visual Assets
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Supports multiple slides / carousels up to 5MB each
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

          {/* Mood Selection (Work vs Normal) */}
          <div className="p-2.5 rounded-2xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Target Mood Stream
              </label>
              <span className="text-[11px] text-slate-400">
                {moodType === 'work' ? 'Technical Builds & Showcases' : 'Creative Reels, BTS & Fun Clips'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMoodType('work')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                  moodType === 'work'
                    ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white border-transparent shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Work Mood (Portfolio)</span>
              </button>
              <button
                type="button"
                onClick={() => setMoodType('normal')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                  moodType === 'normal'
                    ? 'bg-gradient-to-r from-pink-600 to-amber-500 text-white border-transparent shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Normal Mood (Reel / BTS)</span>
              </button>
            </div>
          </div>

          {/* Project Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Project Title / Work Name *"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              placeholder="e.g. PrismUI Design System"
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
            label="💡 Case Study & Key Learnings (Architecture Challenges)"
            rows={3}
            value={experienceLearnings}
            onChange={(e) => setExperienceLearnings(e.target.value)}
            placeholder="What challenges did you face? What architectural decisions did you make? Any performance or user breakthroughs?"
            maxLength={1500}
          />

          {/* Tech Stack Pills & Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Technologies & Frameworks
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

          {/* Contributors & Co-Builders */}
          <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Co-Creators & Project Contributors
            </label>

            {contributors.length > 0 && (
              <div className="flex flex-wrap gap-2 pb-1">
                {contributors.map(c => (
                  <div
                    key={c.id}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  >
                    <Avatar src={c.avatar_url} alt={c.full_name} size="xs" />
                    <span className="font-bold text-slate-900 dark:text-white">{c.full_name}</span>
                    <span className="text-[10px] text-slate-400">({c.role_in_project})</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveContributor(c.id)}
                      className="text-slate-400 hover:text-rose-500 ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <div className="sm:col-span-5">
                <Input
                  value={contribName}
                  onChange={(e) => setContribName(e.target.value)}
                  placeholder="Contributor name or @username"
                  className="text-xs"
                />
              </div>
              <div className="sm:col-span-5">
                <Input
                  value={contribRole}
                  onChange={(e) => setContribRole(e.target.value)}
                  placeholder="Role (e.g. 3D Modeler, UI Designer)"
                  className="text-xs"
                />
              </div>
              <div className="sm:col-span-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddContributor}
                  className="w-full h-full text-xs font-bold"
                >
                  <UserPlus className="w-3.5 h-3.5 mr-1" />
                  <span>Add</span>
                </Button>
              </div>
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

          {/* Collaboration Open & Role Request */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800/60 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-500" />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Open to Project Collaborators & Inquiries</p>
                  <p className="text-[10px] text-slate-400">Allows other creators to discover and message you to collaborate</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={openToCollab}
                onChange={(e) => setOpenToCollab(e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
              />
            </div>

            {openToCollab && (
              <Input
                value={collabRoleNeeded}
                onChange={(e) => setCollabRoleNeeded(e.target.value)}
                placeholder="Specific role needed (e.g. 'Looking for a Three.js shader developer')"
                className="text-xs"
              />
            )}
          </div>

          {/* Upload Progress Bar */}
          {isSubmitting && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-brand-600 dark:text-brand-400">
                <span>Uploading Project Showcase & Case Study...</span>
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
              <span>Publish Project Showcase</span>
            </Button>
          </div>
        </div>
      </Modal>

      {/* Embedded AI Assistant Modal */}
      <AICreatorModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        initialTitle={projectTitle}
        initialCategory={category}
        onApplyCaption={(genCaption) => setCaption(genCaption)}
        onApplyTechStack={(tags) => setTechStack(tags)}
        onApplyCaseStudy={(learnings) => setExperienceLearnings(learnings)}
      />
    </>
  );
};
