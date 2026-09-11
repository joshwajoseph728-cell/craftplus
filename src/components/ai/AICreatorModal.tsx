import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { aiService, AISafetyReport } from '../../services/aiService';
import {
  Sparkles,
  Bot,
  Copy,
  Check,
  Code2,
  ShieldCheck,
  ShieldAlert,
  Lightbulb,
  FileText,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { cn } from '../../lib/utils';

export interface AICreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTitle?: string;
  initialCategory?: string;
  onApplyCaption?: (caption: string) => void;
  onApplyTechStack?: (tags: string[]) => void;
  onApplyCaseStudy?: (learnings: string) => void;
}

export const AICreatorModal: React.FC<AICreatorModalProps> = ({
  isOpen,
  onClose,
  initialTitle = '',
  initialCategory = 'Software & Web',
  onApplyCaption,
  onApplyTechStack,
  onApplyCaseStudy
}) => {
  const [activeTab, setActiveTab] = useState<'caption' | 'tags' | 'casestudy' | 'safety'>('caption');

  // Caption Generator State
  const [title, setTitle] = useState(initialTitle);
  const [category, setCategory] = useState(initialCategory);
  const [highlights, setHighlights] = useState('');
  const [tagsInput, setTagsInput] = useState('React, TypeScript, Tailwind');
  const [tone, setTone] = useState<'professional' | 'hype' | 'technical' | 'concise'>('professional');
  const [generatedCaption, setGeneratedCaption] = useState('');
  const [captionLoading, setCaptionLoading] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);

  // Tag Suggester State
  const [tagDesc, setTagDesc] = useState('');
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [tagsLoading, setTagsLoading] = useState(false);

  // Case Study Polisher State
  const [rawNotes, setRawNotes] = useState('');
  const [polishedNotes, setPolishedNotes] = useState('');
  const [caseStudyLoading, setCaseStudyLoading] = useState(false);

  // Safety Scanner State
  const [safetyText, setSafetyText] = useState('');
  const [safetyReport, setSafetyReport] = useState<AISafetyReport | null>(null);
  const [safetyLoading, setSafetyLoading] = useState(false);

  const handleGenerateCaption = async () => {
    if (!title.trim()) return;
    setCaptionLoading(true);
    try {
      const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
      const res = await aiService.generateCaption({
        title,
        category,
        tags,
        keyHighlights: highlights,
        tone
      });
      setGeneratedCaption(res);
    } finally {
      setCaptionLoading(false);
    }
  };

  const handleSuggestTags = async () => {
    if (!tagDesc.trim() && !title.trim()) return;
    setTagsLoading(true);
    try {
      const tags = await aiService.suggestTechStack(title, tagDesc);
      setSuggestedTags(tags);
    } finally {
      setTagsLoading(false);
    }
  };

  const handlePolishCaseStudy = async () => {
    setCaseStudyLoading(true);
    try {
      const res = await aiService.polishCaseStudy(rawNotes);
      setPolishedNotes(res);
    } finally {
      setCaseStudyLoading(false);
    }
  };

  const handleAnalyzeSafety = async () => {
    if (!safetyText.trim()) return;
    setSafetyLoading(true);
    try {
      const report = await aiService.analyzeSafety(safetyText);
      setSafetyReport(report);
    } finally {
      setSafetyLoading(false);
    }
  };

  const copyToClipboard = (text: string, setter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="CraftPlus AI Creator Studio"
      description="Intelligent tools for project descriptions, tech stack discovery, case study refinement & safety audits"
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('caption')}
            className={cn(
              'flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5',
              activeTab === 'caption'
                ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            )}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Caption Studio</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tags')}
            className={cn(
              'flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5',
              activeTab === 'tags'
                ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            )}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Tech Stack</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('casestudy')}
            className={cn(
              'flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5',
              activeTab === 'casestudy'
                ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            )}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Case Study</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('safety')}
            className={cn(
              'flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5',
              activeTab === 'safety'
                ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            )}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Safety Audit</span>
          </button>
        </div>

        {/* Tab 1: Caption Generator */}
        {activeTab === 'caption' && (
          <div className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Project Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. PrismUI Design Tokens"
              />
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tone & Format
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-100/80 dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 outline-none"
                >
                  <option value="professional">💼 Professional Creator</option>
                  <option value="technical">⚡ Deep Technical / Architecture</option>
                  <option value="hype">🚀 Launch & Hype</option>
                  <option value="concise">🎯 Short & Punchy</option>
                </select>
              </div>
            </div>

            <Input
              label="Key Technologies (comma separated)"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="React, TypeScript, WebGPU, Three.js"
            />

            <Textarea
              label="Key Feature Highlights (Optional)"
              rows={2}
              value={highlights}
              onChange={(e) => setHighlights(e.target.value)}
              placeholder="e.g. Sub-millisecond latency, zero-runtime tokens, 60+ components..."
            />

            <Button
              variant="gradient"
              size="sm"
              onClick={handleGenerateCaption}
              isLoading={captionLoading}
              disabled={!title.trim()}
              className="w-full py-2.5"
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              <span>Generate AI Caption & Overview</span>
            </Button>

            {generatedCaption && (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-brand-500/20 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-brand-500 uppercase tracking-wider flex items-center gap-1">
                    <Bot className="w-3.5 h-3.5" />
                    <span>AI Generated Caption</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(generatedCaption, setCopiedCaption)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1"
                    >
                      {copiedCaption ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCaption ? 'Copied' : 'Copy'}</span>
                    </button>
                    {onApplyCaption && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          onApplyCaption(generatedCaption);
                          onClose();
                        }}
                        className="text-xs h-7 px-2.5"
                      >
                        Apply to Project
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {generatedCaption}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Tech Stack Suggester */}
        {activeTab === 'tags' && (
          <div className="space-y-3.5">
            <Input
              label="Project Name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Autonomous SLAM Quadruped"
            />
            <Textarea
              label="Describe What You're Building"
              rows={3}
              value={tagDesc}
              onChange={(e) => setTagDesc(e.target.value)}
              placeholder="e.g. We are building a real-time raymarching shader engine in WebGPU with Rust webassembly for high fps graphics..."
            />

            <Button
              variant="gradient"
              size="sm"
              onClick={handleSuggestTags}
              isLoading={tagsLoading}
              className="w-full py-2.5"
            >
              <Code2 className="w-4 h-4 mr-1.5" />
              <span>Suggest Tech Stack & Tools</span>
            </Button>

            {suggestedTags.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Recommended Technologies & Tools
                  </span>
                  {onApplyTechStack && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        onApplyTechStack(suggestedTags);
                        onClose();
                      }}
                      className="text-xs h-7 px-2.5"
                    >
                      Insert All Tags
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestedTags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-xl text-xs font-bold bg-brand-500/15 text-brand-600 dark:text-brand-400 border border-brand-500/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Case Study Polisher */}
        {activeTab === 'casestudy' && (
          <div className="space-y-3.5">
            <Textarea
              label="Raw Notes / Key Challenges Faced"
              rows={3}
              value={rawNotes}
              onChange={(e) => setRawNotes(e.target.value)}
              placeholder="e.g. WebGL was lagging when rendering 10k particles. We solved it by switching to WebGPU compute passes and reduced draw calls by 70%."
            />

            <Button
              variant="gradient"
              size="sm"
              onClick={handlePolishCaseStudy}
              isLoading={caseStudyLoading}
              className="w-full py-2.5"
            >
              <FileText className="w-4 h-4 mr-1.5" />
              <span>Format into Engineering Case Study</span>
            </Button>

            {polishedNotes && (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-brand-500/20 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-brand-500 uppercase tracking-wider flex items-center gap-1">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Formatted Case Study</span>
                  </span>
                  {onApplyCaseStudy && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        onApplyCaseStudy(polishedNotes);
                        onClose();
                      }}
                      className="text-xs h-7 px-2.5"
                    >
                      Apply to Case Study
                    </Button>
                  )}
                </div>
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {polishedNotes}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Safety & Scam Audit */}
        {activeTab === 'safety' && (
          <div className="space-y-3.5">
            <Textarea
              label="Paste Text to Scan for Scams, Toxicity or Suspicious Links"
              rows={3}
              value={safetyText}
              onChange={(e) => setSafetyText(e.target.value)}
              placeholder="e.g. DM me for guaranteed investment returns on your open source project at bit.ly/xyz..."
            />

            <Button
              variant="gradient"
              size="sm"
              onClick={handleAnalyzeSafety}
              isLoading={safetyLoading}
              disabled={!safetyText.trim()}
              className="w-full py-2.5"
            >
              <ShieldCheck className="w-4 h-4 mr-1.5" />
              <span>Run AI Safety & Scam Audit</span>
            </Button>

            {safetyReport && (
              <div className={cn(
                'p-4 rounded-2xl border space-y-3',
                safetyReport.isSafe
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-rose-500/10 border-rose-500/30'
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {safetyReport.isSafe ? (
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <ShieldAlert className="w-5 h-5 text-rose-500" />
                    )}
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {safetyReport.isSafe ? 'Content Safe & Verified' : 'Safety Warnings Detected'}
                    </span>
                  </div>
                  <span className={cn(
                    'text-xs font-extrabold px-2.5 py-0.5 rounded-full',
                    safetyReport.score > 80 ? 'bg-emerald-500/20 text-emerald-600' : 'bg-rose-500/20 text-rose-600'
                  )}>
                    Score: {safetyReport.score}/100
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {safetyReport.reasons.map((r, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="text-brand-500">•</span>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>

                {safetyReport.scamRisk !== 'none' && (
                  <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Scam alert: Never share sensitive private keys, passwords, or send upfront money for collaboration proposals.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

