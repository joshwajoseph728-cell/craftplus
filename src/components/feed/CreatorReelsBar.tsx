import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Avatar } from '../ui/Avatar';
import { Play, Heart, MessageCircle, Sparkles, Film, Music, Eye } from 'lucide-react';
import { formatCompactNumber } from '../../lib/utils';

export interface CreatorReel {
  id: string;
  creator_name: string;
  creator_avatar: string;
  title: string;
  tag: string;
  thumbnail_url: string;
  video_url: string;
  likes: number;
  comments: number;
}

export const MOCK_REELS: CreatorReel[] = [
  {
    id: 'reel-1',
    creator_name: 'Alexa Rivera',
    creator_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    title: 'Speed-designing a 3D glassmorphic card in Figma 🎨',
    tag: 'Design BTS',
    thumbnail_url: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=600&auto=format&fit=crop&q=80',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-42841-large.mp4',
    likes: 3420,
    comments: 128
  },
  {
    id: 'reel-2',
    creator_name: 'Leo Chen',
    creator_avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200',
    title: 'Cyberpunk desk setup tour with custom OLED audio visualizer ✨',
    tag: 'Desk Inspo',
    thumbnail_url: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=600&auto=format&fit=crop&q=80',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-hands-typing-on-a-glowing-mechanical-keyboard-41223-large.mp4',
    likes: 5890,
    comments: 245
  },
  {
    id: 'reel-3',
    creator_name: 'Kai Takahashi',
    creator_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    title: 'Jamming with a custom granular synth VST on Ableton Live 🎛️',
    tag: 'Music & Sound',
    thumbnail_url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&auto=format&fit=crop&q=80',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-sound-board-in-a-recording-studio-42585-large.mp4',
    likes: 2150,
    comments: 89
  },
  {
    id: 'reel-4',
    creator_name: 'Maya Patel',
    creator_avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200',
    title: 'When your 3D printer finishes a 48h print without failing! 🦾',
    tag: 'Maker Life',
    thumbnail_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-modern-3d-printer-printing-a-plastic-object-42861-large.mp4',
    likes: 4720,
    comments: 190
  }
];

export const CreatorReelsBar: React.FC = () => {
  const [selectedReel, setSelectedReel] = useState<CreatorReel | null>(null);

  return (
    <div className="space-y-3 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-amber-500/10 p-4 rounded-3xl border border-pink-500/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-pink-500" />
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Creator Reels & BTS Moments
          </h3>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-600 dark:text-pink-400">
          Normal Mood Exclusive
        </span>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
        {MOCK_REELS.map(reel => (
          <div
            key={reel.id}
            onClick={() => setSelectedReel(reel)}
            className="group relative w-36 h-56 rounded-2xl overflow-hidden bg-black shrink-0 cursor-pointer shadow-md hover:scale-[1.03] transition-all duration-300"
          >
            <img
              src={reel.thumbnail_url}
              alt={reel.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
            />

            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-sm group-hover:scale-110 group-hover:bg-pink-600 transition-all">
                <Play className="w-5 h-5 fill-white ml-0.5" />
              </div>
            </div>

            {/* Tag Badge */}
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-bold bg-black/70 text-white backdrop-blur-sm">
              {reel.tag}
            </span>

            {/* Info bottom */}
            <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white space-y-1">
              <p className="text-[10px] font-bold truncate">{reel.title}</p>
              <div className="flex items-center justify-between text-[9px] text-slate-300">
                <span>{reel.creator_name}</span>
                <span className="flex items-center gap-0.5">
                  <Heart className="w-2.5 h-2.5 fill-pink-500 text-pink-500" />
                  {formatCompactNumber(reel.likes)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reel Player Modal Lightbox */}
      {selectedReel && (
        <Modal
          isOpen={!!selectedReel}
          onClose={() => setSelectedReel(null)}
          title={selectedReel.title}
          maxWidth="sm"
        >
          <div className="space-y-3">
            <div className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-black flex items-center justify-center">
              <video
                src={selectedReel.video_url}
                controls
                autoPlay
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Avatar src={selectedReel.creator_avatar} alt={selectedReel.creator_name} size="sm" />
                <span className="font-bold text-slate-900 dark:text-white">{selectedReel.creator_name}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500 font-bold">
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4 fill-pink-500 text-pink-500" />
                  {formatCompactNumber(selectedReel.likes)}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  {formatCompactNumber(selectedReel.comments)}
                </span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
