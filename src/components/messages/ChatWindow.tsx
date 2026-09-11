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
  Image as ImageIcon,
  ArrowLeft,
  CheckCheck,
  Code2,
  Mic,
  Play,
  Pause,
  Sparkles,
  ExternalLink,
  Briefcase,
  Search,
  X,
  Smile,
  Copy,
  Check,
  Download,
  ZoomIn,
  FileCode,
  Loader2
} from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ChatWindowProps {
  recipient: Profile;
  onBack?: () => void;
}

const QUICK_EMOJIS = ['👍', '❤️', '🔥', '🚀', '💡', '😂', '👏', '🎉', '💯', '✨'];

export const ChatWindow: React.FC<ChatWindowProps> = ({ recipient, onBack }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');

  // Image upload & preview state
  const [attachedImage, setAttachedImage] = useState<{ file: File; previewUrl: string } | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // In-chat search state
  const [isSearchingInChat, setIsSearchingInChat] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');

  // Code snippet state
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState('typescript');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Emoji picker state
  const [showEmojiTray, setShowEmojiTray] = useState(false);

  // Voice recording state
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const [isSending, setIsSending] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const loadMessages = async () => {
    if (!user) return;
    const history = await messageService.getMessagesWithUser(user.id, recipient.id);
    setMessages(history);
    await messageService.markAsRead(user.id, recipient.id);
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [recipient.id, user?.id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, attachedImage]);

  // Handle Clipboard Image Paste (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            const previewUrl = URL.createObjectURL(file);
            setAttachedImage({ file, previewUrl });
            e.preventDefault();
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // Voice recording timer
  useEffect(() => {
    if (isRecordingVoice) {
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecordingVoice]);

  const handleStartVoiceRecording = () => {
    setIsRecordingVoice(true);
  };

  const handleStopVoiceRecording = () => {
    setIsRecordingVoice(false);
  };

  const handleCancelVoiceRecording = () => {
    setIsRecordingVoice(false);
    setRecordingSeconds(0);
  };

  const handleSendVoiceNote = async () => {
    if (!user) return;
    setIsRecordingVoice(false);
    setIsSending(true);

    const seconds = recordingSeconds || 6;
    const minutes = Math.floor(seconds / 60);
    const remainingSecs = seconds % 60;
    const formattedDuration = `${minutes}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;

    const tempMsg: Message = {
      id: `temp-voice-${Date.now()}`,
      sender_id: user.id,
      receiver_id: recipient.id,
      content: `ðŸŽ™ï¸ Voice Note (${formattedDuration})`,
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
        content: `ðŸŽ™ï¸ Voice Note (${formattedDuration})`,
        audioUrl: 'https://actions.google.com/sounds/v1/science_fiction/teleport_whoosh.ogg'
      });
      await loadMessages();
    } finally {
      setIsSending(false);
      setRecordingSeconds(0);
    }
  };

  // Image Selection Handler
  const handleImageSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const previewUrl = URL.createObjectURL(file);
    setAttachedImage({ file, previewUrl });
    e.target.value = '';
  };

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        const previewUrl = URL.createObjectURL(file);
        setAttachedImage({ file, previewUrl });
      }
    }
  };

  // Send Message (Text, Image, Code Snippet)
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user || (!inputText.trim() && !codeSnippet.trim() && !attachedImage) || isSending) return;

    let mediaUrl: string | undefined = undefined;
    const content = inputText.trim() || (attachedImage ? 'ðŸ“· Photo Attachment' : codeSnippet ? 'ðŸ’» Code Snippet' : '');
    const currentCode = codeSnippet.trim() ? { language: codeLanguage, code: codeSnippet } : undefined;

    const currentAttached = attachedImage;
    setInputText('');
    setCodeSnippet('');
    setShowCodeInput(false);
    setShowEmojiTray(false);
    setAttachedImage(null);
    setIsSending(true);

    // Upload image if attached
    if (currentAttached) {
      setIsUploading(true);
      try {
        const uploadRes = await storageService.uploadMedia(currentAttached.file, 'posts', user.id);
        mediaUrl = uploadRes.url || currentAttached.previewUrl;
      } catch {
        mediaUrl = currentAttached.previewUrl;
      } finally {
        setIsUploading(false);
      }
    }

    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      sender_id: user.id,
      receiver_id: recipient.id,
      content,
      media_url: mediaUrl,
      code_snippet: currentCode,
      is_read: false,
      created_at: new Date().toISOString(),
      sender: user,
      tempStatus: 'sending'
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      await messageService.sendMessage({
        sender: user,
        receiverId: recipient.id,
        content,
        mediaUrl,
        codeSnippet: currentCode
      });
      await loadMessages();
    } finally {
      setIsSending(false);
    }
  };

  const handleSendCollabInvitation = () => {
    if (!user) return;
    const content = `ðŸ¤ Project Collaboration Invitation:\n"Hey @${recipient.username}, I'm building an exciting project and would love to collaborate based on your work in ${recipient.skills?.slice(0, 3).join(', ') || 'Software & Engineering'}. Let's team up!"`;
    setInputText(content);
  };

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleToggleReaction = async (msgId: string, emoji: string) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, reaction: m.reaction === emoji ? undefined : emoji } : m));
    await messageService.toggleReaction(msgId, emoji);
  };

  // Filter messages based on in-chat search
  const displayedMessages = chatSearchQuery.trim()
    ? messages.filter(m => m.content?.toLowerCase().includes(chatSearchQuery.toLowerCase()) || m.code_snippet?.code.toLowerCase().includes(chatSearchQuery.toLowerCase()))
    : messages;

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative flex-1 flex flex-col h-[100dvh] md:h-full w-full bg-slate-50/50 dark:bg-surface-dark transition-colors overflow-hidden"
    >
      {/* Drag & Drop Overlay */}
      {isDraggingOver && (
        <div className="absolute inset-0 z-50 bg-brand-600/20 backdrop-blur-sm border-4 border-dashed border-brand-500 rounded-3xl flex flex-col items-center justify-center pointer-events-none animate-pulse">
          <ImageIcon className="w-16 h-16 text-brand-500 mb-2" />
          <p className="text-lg font-bold text-brand-600 dark:text-brand-300">Drop your picture here to send</p>
        </div>
      )}

      {/* Header */}
      <div className="p-3.5 md:p-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-surface-cardDark/90 backdrop-blur-md flex items-center justify-between z-20">
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-1.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <Link to={`/profile/${recipient.username}`} className="flex items-center gap-2.5 min-w-0 group">
            <div className="relative shrink-0">
              <Avatar src={recipient.avatar_url} alt={recipient.username} size="sm" isVerified={recipient.is_verified} />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-surface-cardDark" />
            </div>
            <div className="min-w-0">
              <p className="text-xs md:text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-500 transition-colors truncate">
                {recipient.full_name}
              </p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold truncate flex items-center gap-1">
                <span>@{recipient.username}</span>
                <span>• Online</span>
              </p>
            </div>
          </Link>
        </div>

        {/* Action Controls in Header */}
        <div className="flex items-center gap-1.5">
          {/* In-Chat Search Button */}
          <button
            type="button"
            onClick={() => {
              setIsSearchingInChat(!isSearchingInChat);
              if (isSearchingInChat) setChatSearchQuery('');
            }}
            className={cn(
              'p-2 rounded-xl text-slate-600 dark:text-slate-300 transition-colors',
              isSearchingInChat ? 'bg-brand-500/20 text-brand-500' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
            title="Search Messages"
          >
            <Search className="w-4 h-4" />
          </button>

          {recipient.open_to_collab && (
            <button
              onClick={handleSendCollabInvitation}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 text-white shadow-sm hover:opacity-95 active:scale-95 transition-all"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Collab Invite</span>
            </button>
          )}

          <Link
            to={`/profile/${recipient.username}`}
            className="text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-brand-500 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 transition-colors"
          >
            Profile
          </Link>
        </div>
      </div>

      {/* Search Messages Bar */}
      {isSearchingInChat && (
        <div className="px-4 py-2 bg-slate-100/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 animate-fade-in z-20">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={chatSearchQuery}
            onChange={(e) => setChatSearchQuery(e.target.value)}
            placeholder="Search within this chat..."
            className="flex-1 bg-transparent text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none"
            autoFocus
          />
          {chatSearchQuery && (
            <button onClick={() => setChatSearchQuery('')} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Messages Thread Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {displayedMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
            <div className="relative">
              <Avatar src={recipient.avatar_url} alt={recipient.username} size="2xl" isVerified={recipient.is_verified} />
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-surface-dark" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{recipient.full_name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">@{recipient.username}</p>
            </div>
            <p className="text-xs text-slate-500 max-w-sm">
              {recipient.bio || `Connect with @${recipient.username} to discuss projects, code reviews, and technical collaborations.`}
            </p>
            {recipient.skills && recipient.skills.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1.5 max-w-xs">
                {recipient.skills.map(s => (
                  <span key={s} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {s}
                  </span>
                ))}
              </div>
            )}
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => setInputText(`Hey @${recipient.username}! 👋 Loved your projects on CraftPlus.`)}
                className="text-xs font-semibold px-3 py-1.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 hover:bg-brand-500/20 transition-colors"
              >
                Say Hello 👋
              </button>
              <button
                onClick={handleSendCollabInvitation}
                className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                Invite to Collab 🤝
              </button>
            </div>
          </div>
        ) : (
          displayedMessages.map(msg => {
            const isMe = msg.sender_id === user?.id;

            return (
              <div
                key={msg.id}
                className={cn(
                  'group relative flex flex-col max-w-[85%] md:max-w-[70%]',
                  isMe ? 'ml-auto items-end' : 'mr-auto items-start'
                )}
              >
                <div
                  className={cn(
                    'relative p-3.5 rounded-3xl text-xs md:text-sm shadow-sm leading-relaxed transition-all',
                    isMe
                      ? 'bg-gradient-to-r from-brand-600 via-purple-600 to-pink-600 text-white rounded-br-sm'
                      : 'bg-white dark:bg-surface-cardDark text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800 rounded-bl-sm'
                  )}
                >
                  {/* Photo / Image Attachment */}
                  {msg.media_url && (
                    <div className="relative mb-2 rounded-2xl overflow-hidden group/img cursor-pointer bg-slate-950/20">
                      <img
                        src={msg.media_url}
                        alt="Message attachment"
                        className="w-full max-h-72 object-cover rounded-2xl hover:opacity-95 transition-opacity"
                        onClick={() => setLightboxImage(msg.media_url!)}
                      />
                      <button
                        type="button"
                        onClick={() => setLightboxImage(msg.media_url!)}
                        className="absolute bottom-2 right-2 p-1.5 rounded-xl bg-black/60 text-white backdrop-blur-sm opacity-0 group-hover/img:opacity-100 transition-opacity"
                        title="Zoom Image"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Code Snippet Box */}
                  {msg.code_snippet && (
                    <div className="my-2 p-3 rounded-2xl bg-slate-950 text-slate-100 font-mono text-xs border border-white/10 shadow-inner">
                      <div className="flex items-center justify-between text-[11px] text-brand-400 font-bold mb-2 pb-1.5 border-b border-white/10">
                        <span className="flex items-center gap-1.5">
                          <FileCode className="w-3.5 h-3.5" />
                          <span>{msg.code_snippet.language.toUpperCase()}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(msg.id, msg.code_snippet!.code)}
                          className="flex items-center gap-1 text-[10px] text-slate-300 hover:text-white px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 transition-colors"
                          title="Copy Code"
                        >
                          {copiedCodeId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="overflow-x-auto p-1 leading-relaxed">
                        <code>{msg.code_snippet.code}</code>
                      </pre>
                    </div>
                  )}

                  {/* Audio Voice Note Player */}
                  {msg.audio_url && (
                    <div className="flex items-center gap-3 p-2.5 bg-black/20 rounded-2xl my-1 min-w-[200px]">
                      <button
                        type="button"
                        onClick={() => setPlayingAudioId(playingAudioId === msg.id ? null : msg.id)}
                        className="p-2.5 rounded-full bg-white text-slate-900 shadow-md hover:scale-105 active:scale-95 transition-transform"
                      >
                        {playingAudioId === msg.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      </button>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span>Voice Memo</span>
                          <span>0:08</span>
                        </div>
                        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                          <div className={cn('h-full bg-white transition-all', playingAudioId === msg.id ? 'w-full animate-pulse' : 'w-1/3')} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Text Content */}
                  {msg.content && (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}

                  {/* Attached Reaction Pill */}
                  {msg.reaction && (
                    <div className="absolute -bottom-2.5 right-2 px-1.5 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-xs select-none">
                      {msg.reaction}
                    </div>
                  )}
                </div>

                {/* Quick Emoji Reaction Hover Trigger */}
                <div className={cn(
                  'opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-1 px-1',
                  isMe ? 'justify-end' : 'justify-start'
                )}>
                  {['â¤ï¸', 'ðŸ”¥', 'ðŸš€', 'ðŸ‘'].map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleToggleReaction(msg.id, emoji)}
                      className="text-xs hover:scale-125 transition-transform p-0.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800"
                    >
                      {emoji}
                    </button>
                  ))}
                  <span className="text-[10px] text-slate-400 ml-1.5">{formatMessageTime(msg.created_at)}</span>
                  {isMe && (
                    <CheckCheck className={cn('w-3 h-3 ml-0.5', msg.is_read ? 'text-brand-500' : 'text-slate-400')} />
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={scrollRef} />
      </div>

      {/* Code Snippet Modal Input Tray */}
      {showCodeInput && (
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 space-y-2.5 text-xs animate-slide-up z-20">
          <div className="flex items-center justify-between text-white font-bold">
            <span className="flex items-center gap-2 text-brand-400">
              <Code2 className="w-4 h-4" />
              <span>Attach Code Snippet</span>
            </span>
            <div className="flex items-center gap-2">
              <select
                value={codeLanguage}
                onChange={(e) => setCodeLanguage(e.target.value)}
                className="bg-slate-800 text-white text-xs rounded-lg px-2.5 py-1 border border-slate-700 outline-none"
              >
                <option value="typescript">TypeScript</option>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="rust">Rust</option>
                <option value="sql">SQL</option>
                <option value="html">HTML / JSX</option>
                <option value="css">CSS / Tailwind</option>
                <option value="go">Go</option>
              </select>
              <button
                onClick={() => setShowCodeInput(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <textarea
            rows={4}
            value={codeSnippet}
            onChange={(e) => setCodeSnippet(e.target.value)}
            placeholder="// Paste code snippet to discuss architecture, review logic, or debug..."
            className="w-full p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs border border-slate-800 outline-none focus:border-brand-500"
          />
        </div>
      )}

      {/* Image Attachment Preview Tray */}
      {attachedImage && (
        <div className="p-2.5 sm:p-3 bg-brand-500/10 dark:bg-brand-950/40 border-t border-brand-500/20 flex items-center justify-between animate-slide-up z-20 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-brand-500/30 shrink-0 bg-black">
              <img src={attachedImage.previewUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {attachedImage.file.name}
              </p>
              <p className="text-[10px] text-slate-400">
                {(attachedImage.file.size / (1024 * 1024)).toFixed(2)} MB • Ready to send
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAttachedImage(null)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors ml-2 shrink-0"
            title="Remove attachment"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick Emoji Tray */}
      {showEmojiTray && (
        <div className="p-2.5 bg-white dark:bg-surface-cardDark border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar animate-slide-up z-20">
          {QUICK_EMOJIS.map(emoji => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                setInputText(prev => prev + emoji);
              }}
              className="text-lg hover:scale-125 transition-transform p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Live Voice Recording Tray */}
      {isRecordingVoice && (
        <div className="p-3.5 bg-rose-500/10 border-t border-rose-500/30 flex items-center justify-between animate-slide-up z-20">
          <div className="flex items-center gap-3 text-rose-500 font-bold text-xs">
            <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            <Mic className="w-4 h-4 animate-pulse" />
            <span>Recording Voice Note... ({Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, '0')})</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCancelVoiceRecording}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-200/50"
            >
              Cancel
            </button>
            <Button
              size="sm"
              variant="danger"
              onClick={handleSendVoiceNote}
              className="h-8 text-xs font-bold px-3.5"
            >
              Send Voice
            </Button>
          </div>
        </div>
      )}

      {/* Bottom Message Input Bar */}
      <form
        onSubmit={handleSendMessage}
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0.75rem))' }}
        className="p-2 sm:p-3 bg-white/95 dark:bg-surface-cardDark/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80 flex items-center gap-1.5 sm:gap-2 z-20 shrink-0 w-full max-w-full box-border"
      >
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
          {/* Photo Attachment Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl text-slate-500 hover:text-brand-500 hover:bg-brand-500/10 transition-colors shrink-0"
            title="Attach Photo"
            aria-label="Attach Photo"
          >
            <ImageIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>

          {/* Code Snippet Button */}
          <button
            type="button"
            onClick={() => setShowCodeInput(!showCodeInput)}
            className={cn(
              'w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl transition-colors shrink-0',
              showCodeInput
                ? 'bg-brand-500/20 text-brand-500'
                : 'text-slate-500 hover:text-brand-500 hover:bg-brand-500/10'
            )}
            title="Attach Code Snippet"
            aria-label="Attach Code Snippet"
          >
            <Code2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>

          {/* Voice Note Button */}
          <button
            type="button"
            onClick={isRecordingVoice ? handleStopVoiceRecording : handleStartVoiceRecording}
            className={cn(
              'w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl transition-colors shrink-0',
              isRecordingVoice
                ? 'bg-rose-500 text-white animate-pulse'
                : 'text-slate-500 hover:text-rose-500 hover:bg-rose-500/10'
            )}
            title="Record Voice Memo"
            aria-label="Record Voice Memo"
          >
            <Mic className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>

          {/* Emoji Button (Hidden on extra small mobile, visible sm+) */}
          <button
            type="button"
            onClick={() => setShowEmojiTray(!showEmojiTray)}
            className="hidden sm:flex w-9 h-9 items-center justify-center rounded-xl text-slate-500 hover:text-amber-500 hover:bg-amber-500/10 transition-colors shrink-0"
            title="Insert Emoji"
            aria-label="Insert Emoji"
          >
            <Smile className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Hidden File Picker */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageSelected}
          accept="image/*"
          className="hidden"
        />

        {/* Message Input Box */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Message ${recipient.username}...`}
          className="flex-1 min-w-0 w-0 px-3 py-2 text-xs sm:text-sm rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-transparent focus:border-brand-500 outline-none transition-colors"
        />

        {/* Dedicated Send Button */}
        <button
          type="submit"
          disabled={(!inputText.trim() && !codeSnippet.trim() && !attachedImage) || isSending || isUploading}
          className={cn(
            'h-9 w-9 sm:h-10 sm:w-10 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 transition-all shadow-sm active:scale-95',
            (inputText.trim() || codeSnippet.trim() || attachedImage)
              ? 'bg-gradient-to-r from-brand-600 via-pink-600 to-accent-500 text-white shadow-glow-brand cursor-pointer hover:opacity-95'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60'
          )}
          title="Send Message"
          aria-label="Send Message"
        >
          {isSending || isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>

      {/* Full-Screen Image Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightboxImage}
              alt="Full size attachment"
              className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl"
            />
            <div className="mt-4 flex items-center gap-3">
              <a
                href={lightboxImage}
                target="_blank"
                rel="noreferrer"
                download="CraftPlus-attachment.jpg"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/20 text-white font-semibold text-xs hover:bg-white/30 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Photo</span>
              </a>
              <button
                onClick={() => setLightboxImage(null)}
                className="px-4 py-2 rounded-xl bg-white text-slate-900 font-semibold text-xs hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

