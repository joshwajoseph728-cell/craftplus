import React, { useState, useEffect, useRef } from 'react';
import { Message, Profile } from '../../types/database.types';
import { messageService } from '../../services/messageService';
import { storageService } from '../../services/storageService';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { formatMessageTime } from '../../lib/utils';
import { Link } from 'react-router-dom';
import {
  Send,
  Image,
  ArrowLeft,
  CheckCheck,
  Code2,
  Mic,
  MicOff,
  Play,
  Pause,
  Sparkles,
  ExternalLink,
  Briefcase
} from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ChatWindowProps {
  recipient: Profile;
  onBack?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ recipient, onBack }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState('typescript');
  const [codeSnippet, setCodeSnippet] = useState('');

  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadMessages = async () => {
    if (!user) return;
    const history = await messageService.getMessagesWithUser(user.id, recipient.id);
    setMessages(history);
    await messageService.markAsRead(user.id, recipient.id);
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 4000);
    return () => clearInterval(interval);
  }, [recipient.id, user?.id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user || (!inputText.trim() && !codeSnippet.trim()) || isSending) return;

    const content = inputText.trim() || (codeSnippet ? 'Shared code snippet' : '');
    const currentCode = codeSnippet.trim() ? { language: codeLanguage, code: codeSnippet } : undefined;

    setInputText('');
    setCodeSnippet('');
    setShowCodeInput(false);
    setIsSending(true);

    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      sender_id: user.id,
      receiver_id: recipient.id,
      content,
      code_snippet: currentCode,
      is_read: false,
      created_at: new Date().toISOString(),
      sender: user
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      await messageService.sendMessage({
        sender: user,
        receiverId: recipient.id,
        content
      });
      await loadMessages();
    } finally {
      setIsSending(false);
    }
  };

  const handleSendVoiceNote = async () => {
    if (!user) return;
    setIsRecordingVoice(false);
    setIsSending(true);

    const tempMsg: Message = {
      id: `temp-voice-${Date.now()}`,
      sender_id: user.id,
      receiver_id: recipient.id,
      content: '🎙️ Voice Note (0:08)',
      audio_url: 'https://actions.google.com/sounds/v1/science_fiction/teleport_whoosh.ogg',
      is_read: false,
      created_at: new Date().toISOString(),
      sender: user
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      await messageService.sendMessage({
        sender: user,
        receiverId: recipient.id,
        content: '🎙️ Voice Note (0:08)'
      });
      await loadMessages();
    } finally {
      setIsSending(false);
    }
  };

  const handleSendCollabInvitation = async () => {
    if (!user) return;
    const content = `🤝 Project Collaboration Invitation:\n"Hey ${recipient.full_name}, I'm working on an open-source project and would love to collaborate based on your skills in ${recipient.skills?.slice(0, 3).join(', ') || 'software & design'}. Let's connect!"`;
    setInputText(content);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;
    const file = e.target.files[0];
    setIsUploading(true);

    try {
      const uploadRes = await storageService.uploadMedia(file, 'messages', user.id);
      if (uploadRes.url) {
        await messageService.sendMessage({
          sender: user,
          receiverId: recipient.id,
          content: 'Sent project image attachment',
          mediaUrl: uploadRes.url
        });
        await loadMessages();
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50 dark:bg-surface-dark transition-colors">
      {/* Header */}
      <div className="p-3.5 md:p-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-surface-cardDark/80 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <Link to={`/profile/${recipient.username}`} className="flex items-center gap-2.5">
            <Avatar src={recipient.avatar_url} alt={recipient.username} size="sm" isVerified={recipient.is_verified} />
            <div>
              <p className="text-xs md:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                {recipient.full_name}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <p className="text-[10px] text-slate-400">@{recipient.username} • Available for work</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {recipient.open_to_collab && (
            <button
              onClick={handleSendCollabInvitation}
              className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 hover:bg-brand-500/20 transition-colors"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Invite to Collab</span>
            </button>
          )}

          <Link
            to={`/profile/${recipient.username}`}
            className="text-xs font-bold text-brand-500 hover:underline px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800"
          >
            Portfolio
          </Link>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <Avatar src={recipient.avatar_url} alt={recipient.username} size="xl" isVerified={recipient.is_verified} className="mb-3" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{recipient.full_name}</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">{recipient.bio || `Message @${recipient.username} about projects & collaborations`}</p>
            {recipient.skills && (
              <div className="flex flex-wrap justify-center gap-1 mt-3 max-w-xs">
                {recipient.skills.map(s => (
                  <span key={s} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.sender_id === user?.id;

            return (
              <div
                key={msg.id}
                className={cn(
                  'flex flex-col max-w-[85%] md:max-w-[70%]',
                  isMe ? 'ml-auto items-end' : 'mr-auto items-start'
                )}
              >
                <div
                  className={cn(
                    'p-3.5 rounded-2xl text-xs md:text-sm shadow-sm leading-relaxed whitespace-pre-wrap',
                    isMe
                      ? 'bg-gradient-to-r from-brand-600 to-pink-600 text-white rounded-br-sm'
                      : 'bg-white dark:bg-surface-cardDark text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800 rounded-bl-sm'
                  )}
                >
                  {/* Photo Attachment */}
                  {msg.media_url && (
                    <img
                      src={msg.media_url}
                      alt="Attachment"
                      className="rounded-xl max-h-60 w-full object-cover mb-2"
                    />
                  )}

                  {/* Code Snippet Box */}
                  {msg.code_snippet && (
                    <div className="my-2 p-3 rounded-xl bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto border border-white/10">
                      <div className="flex justify-between text-[10px] text-brand-400 font-bold mb-1 pb-1 border-b border-white/10">
                        <span>{msg.code_snippet.language.toUpperCase()}</span>
                        <span>Code</span>
                      </div>
                      <pre><code>{msg.code_snippet.code}</code></pre>
                    </div>
                  )}

                  {/* Audio Voice Note Player */}
                  {msg.audio_url && (
                    <div className="flex items-center gap-3 p-2 bg-black/20 rounded-xl my-1">
                      <button
                        type="button"
                        onClick={() => setPlayingAudioId(playingAudioId === msg.id ? null : msg.id)}
                        className="p-2 rounded-full bg-white text-slate-900 shadow-sm"
                      >
                        {playingAudioId === msg.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </button>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span>Voice Note</span>
                          <span>0:08</span>
                        </div>
                        <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                          <div className={cn('h-full bg-white', playingAudioId === msg.id ? 'w-2/3 animate-pulse' : 'w-1/3')} />
                        </div>
                      </div>
                    </div>
                  )}

                  {msg.content}
                </div>

                <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 px-1">
                  <span>{formatMessageTime(msg.created_at)}</span>
                  {isMe && <CheckCheck className={cn('w-3 h-3', msg.is_read ? 'text-brand-500' : 'text-slate-400')} />}
                </div>
              </div>
            );
          })
        )}
        <div ref={scrollRef} />
      </div>

      {/* Code Snippet Modal Input Tray */}
      {showCodeInput && (
        <div className="p-3 bg-slate-900 border-t border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between text-white font-bold">
            <span className="flex items-center gap-1.5 text-brand-400">
              <Code2 className="w-4 h-4" />
              <span>Embed Code Snippet</span>
            </span>
            <div className="flex items-center gap-2">
              <select
                value={codeLanguage}
                onChange={(e) => setCodeLanguage(e.target.value)}
                className="bg-slate-800 text-white text-[11px] rounded px-2 py-0.5 border border-slate-700 outline-none"
              >
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="rust">Rust</option>
                <option value="sql">SQL</option>
                <option value="css">CSS</option>
              </select>
              <button onClick={() => setShowCodeInput(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
          </div>
          <textarea
            rows={4}
            value={codeSnippet}
            onChange={(e) => setCodeSnippet(e.target.value)}
            placeholder="// Paste code snippet to discuss architecture or implementation..."
            className="w-full p-2 rounded-lg bg-slate-950 text-slate-100 font-mono text-xs border border-slate-800 outline-none focus:border-brand-500"
          />
        </div>
      )}

      {/* Voice Recording Banner */}
      {isRecordingVoice && (
        <div className="p-3 bg-rose-500/10 border-t border-rose-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-500 text-xs font-bold animate-pulse">
            <Mic className="w-4 h-4" />
            <span>Recording audio memo... (0:08)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRecordingVoice(false)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1"
            >
              Cancel
            </button>
            <Button
              size="sm"
              variant="danger"
              onClick={handleSendVoiceNote}
              className="h-7 text-xs"
            >
              Send Audio
            </Button>
          </div>
        </div>
      )}

      {/* Input Bar */}
      <form
        onSubmit={handleSendMessage}
        className="p-3 md:p-4 bg-white dark:bg-surface-cardDark border-t border-slate-200/80 dark:border-slate-800/80 flex items-center gap-2"
      >
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="p-2.5 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Attach Image"
        >
          <Image className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => setShowCodeInput(!showCodeInput)}
          className={cn(
            'p-2.5 rounded-xl transition-colors',
            showCodeInput
              ? 'bg-brand-500/20 text-brand-500'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
          )}
          title="Attach Code Snippet"
        >
          <Code2 className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => setIsRecordingVoice(!isRecordingVoice)}
          className="p-2.5 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Voice Memo"
        >
          <Mic className="w-5 h-5" />
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Message ${recipient.username} about projects & work...`}
          className="flex-1 px-4 py-2.5 text-xs md:text-sm rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-transparent focus:border-brand-500 outline-none"
        />

        <Button
          type="submit"
          variant="gradient"
          size="sm"
          disabled={(!inputText.trim() && !codeSnippet.trim()) || isSending}
          isLoading={isSending}
          className="h-10 px-4 rounded-xl shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};
