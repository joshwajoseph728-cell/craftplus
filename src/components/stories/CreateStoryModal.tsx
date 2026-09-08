import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { storageService } from '../../services/storageService';
import { storyService } from '../../services/storyService';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ImagePlus, Clock, Sparkles } from 'lucide-react';

export interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoryCreated?: () => void;
}

export const CreateStoryModal: React.FC<CreateStoryModalProps> = ({
  isOpen,
  onClose,
  onStoryCreated
}) => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const selected = e.target.files[0];
    const check = storageService.validateFile(selected);
    if (!check.valid) {
      showToast('Invalid Media', check.error || 'Please choose an image', 'warning');
      return;
    }
    setFile(selected);
    const dataUrl = await storageService.fileToDataUrl(selected);
    setPreview(dataUrl);
  };

  const handleSubmit = async () => {
    if (!user) {
      showToast('Authentication Required', 'Please sign in to post stories', 'warning');
      return;
    }
    if (!preview || !file) {
      showToast('Media Required', 'Please choose a photo for your story', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const uploadRes = await storageService.uploadMedia(file, 'stories', user.id);
      const mediaUrl = uploadRes.url || preview;

      const { error } = await storyService.createStory({
        user,
        mediaUrl,
        caption
      });

      if (error) throw new Error(error);

      showToast('Story Posted', 'Your story will be visible for 24 hours ⏱️', 'success');
      if (onStoryCreated) onStoryCreated();

      setFile(null);
      setPreview(null);
      setCaption('');
      onClose();
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to post story', 'warning');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isSubmitting && onClose()}
      title="Add to Your Story"
      description="24-hour ephemeral visual moment"
      maxWidth="md"
    >
      <div className="space-y-4">
        {preview ? (
          <div className="relative aspect-[9/16] max-h-[420px] rounded-2xl overflow-hidden bg-black flex items-center justify-center">
            <img src={preview} alt="Story preview" className="w-full h-full object-cover" />
            <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-white flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>Expires in 24h</span>
            </div>
            {caption && (
              <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md p-2.5 rounded-xl text-xs text-white text-center font-medium">
                {caption}
              </div>
            )}
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-900/30 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <ImagePlus className="w-7 h-7" />
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Select photo or video for your story
            </p>
            <p className="text-xs text-slate-400 mt-1">Portrait orientation looks best</p>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        <Input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Add an optional text overlay..."
          maxLength={120}
        />

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="gradient"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={!preview}
          >
            <Sparkles className="w-4 h-4 mr-1.5" />
            <span>Publish Story</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};
