import React, { useState } from 'react';
import { Sparkles, AlertCircle, Check, X, ArrowRight, RefreshCw, Cpu, Layers } from 'lucide-react';
import { 
  fixBlogContentWithAI, 
  AVAILABLE_AI_MODELS, 
  AiFixerResponse 
} from '../../services/aiBlogFixerService';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';

interface AiBlogFixerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  excerpt: string;
  content: string;
  onApplyChanges: (improved: { title: string; excerpt: string; content: string }) => void;
}

export const AiBlogFixerModal: React.FC<AiBlogFixerModalProps> = ({
  isOpen,
  onClose,
  title,
  excerpt,
  content,
  onApplyChanges
}) => {
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_AI_MODELS[0].id);
  const [selectedMode, setSelectedMode] = useState<'grammar' | 'formatting' | 'full'>('full');
  const [customInstructions, setCustomInstructions] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<AiFixerResponse | null>(null);

  const handleRunAiFixer = async () => {
    if (!content.trim() && !title.trim()) {
      setError('Please provide blog title or content before running AI Fixer.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fixBlogContentWithAI({
        title,
        excerpt,
        content,
        model: selectedModel,
        mode: selectedMode,
        customRules: customInstructions.trim() || undefined
      });
      setAiResult(res);
    } catch (err: any) {
      setError(err.message || 'AI Blog Fixer request failed. Original article has not been modified.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!aiResult) return;
    onApplyChanges({
      title: aiResult.improvedTitle,
      excerpt: aiResult.improvedExcerpt,
      content: aiResult.improvedContent
    });
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="✨ AI Blog Grammar, Readability & Formatting Fixer"
      maxWidth="4xl"
    >
      <div className="flex flex-col gap-5 text-xs text-slate-700 dark:text-slate-300">
        
        {/* Info Banner */}
        <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-[#071A33] border border-blue-200 dark:border-blue-900/50 flex items-start gap-3 text-blue-900 dark:text-blue-200">
          <Sparkles className="w-5 h-5 text-[#0B5ED7] shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <strong className="font-bold text-xs uppercase font-mono tracking-wider">Editorial Correction Guardrails</strong>
            <p className="text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed">
              The AI Fixer corrects grammar, spelling, punctuation, sentence structure, and markdown formatting. 
              <strong> It will NEVER alter original factual claims, dates, prices, phone numbers, or business claims.</strong>
            </p>
          </div>
        </div>

        {/* Configuration Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-[#060919] border border-slate-200 dark:border-slate-800">
          {/* Model Selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-[#0B5ED7]" />
              <span>Select AI Model</span>
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={loading}
              className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#0B2445] border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#0B5ED7]"
            >
              {AVAILABLE_AI_MODELS.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* Mode Selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-purple-500" />
              <span>Correction Level</span>
            </label>
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value as any)}
              disabled={loading}
              className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#0B2445] border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#0B5ED7]"
            >
              <option value="grammar">Grammar &amp; Spelling Only</option>
              <option value="formatting">Grammar + Headings &amp; Lists</option>
              <option value="full">Full Editorial Cleanup (Recommended)</option>
            </select>
          </div>

          {/* Action Trigger */}
          <div className="flex items-end">
            <Button
              variant="primary"
              onClick={handleRunAiFixer}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Processing AI Fixes...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#F5C84C]" />
                  <span>Run AI Correction</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-300 flex items-center gap-2 font-mono text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Before / After Preview Workspace */}
        {aiResult ? (
          <div className="flex flex-col gap-4">
            {/* Summary Chips */}
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex flex-col gap-2">
              <span className="font-mono font-bold uppercase text-[10px] flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>Improvements Identified &amp; Applied</span>
              </span>
              <ul className="list-disc list-inside text-xs font-sans space-y-0.5 pl-1">
                {aiResult.changesSummary.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>

            {/* Split View */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original Panel */}
              <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-slate-100 dark:bg-[#060919] border border-slate-200 dark:border-slate-800">
                <span className="font-mono text-[10px] font-bold uppercase text-slate-400">Original Article</span>
                <strong className="font-heading font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{title}</strong>
                <p className="text-xs text-slate-500 italic border-l-2 border-slate-300 dark:border-slate-700 pl-2">{excerpt}</p>
                <div className="mt-2 max-h-60 overflow-y-auto font-mono text-[11px] p-2 bg-white dark:bg-[#071A33] rounded border border-slate-200 dark:border-slate-800 whitespace-pre-wrap leading-relaxed">
                  {content}
                </div>
              </div>

              {/* Improved Panel */}
              <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/30">
                <span className="font-mono text-[10px] font-bold uppercase text-emerald-500 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>AI Improved Article</span>
                </span>
                <strong className="font-heading font-bold text-sm text-emerald-600 dark:text-emerald-400 line-clamp-1">{aiResult.improvedTitle}</strong>
                <p className="text-xs text-slate-600 dark:text-slate-300 italic border-l-2 border-emerald-500 pl-2">{aiResult.improvedExcerpt}</p>
                <div className="mt-2 max-h-60 overflow-y-auto font-mono text-[11px] p-2 bg-white dark:bg-[#071A33] rounded border border-emerald-500/30 whitespace-pre-wrap leading-relaxed">
                  {aiResult.improvedContent}
                </div>
              </div>
            </div>

            {/* Decision Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button variant="secondary" onClick={onClose}>
                <X className="w-4 h-4 mr-1.5" />
                <span>Cancel &amp; Discard</span>
              </Button>
              <Button variant="primary" onClick={handleApply} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Check className="w-4 h-4 mr-1.5" />
                <span>Apply Changes to Editor</span>
              </Button>
            </div>
          </div>
        ) : (
          !loading && (
            <div className="p-12 text-center flex flex-col items-center gap-3 bg-slate-50 dark:bg-[#060919] rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
              <Sparkles className="w-10 h-10 text-[#0B5ED7] animate-pulse" />
              <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wide">
                Ready to Review Editorial Corrections
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
                Click "Run AI Correction" above to process your draft with Gemma 4 or Poolside AI. You will be able to compare original vs improved side-by-side before applying.
              </p>
            </div>
          )
        )}

      </div>
    </Dialog>
  );
};
