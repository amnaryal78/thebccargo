import React from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { AdminBlog } from '../types';

interface BlogEditorModalProps {
  isCreating: boolean;
  editingBlog: AdminBlog | null;
  formData: Partial<AdminBlog>;
  setFormData: (data: Partial<AdminBlog>) => void;
  aiFixing: boolean;
  aiSummary: string[] | null;
  onRunAiFixer: () => void;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
}

export const BlogEditorModal: React.FC<BlogEditorModalProps> = ({
  isCreating,
  editingBlog,
  formData,
  setFormData,
  aiFixing,
  aiSummary,
  onRunAiFixer,
  onClose,
  onSave
}) => {
  if (!isCreating && !editingBlog) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full p-6 shadow-hard-lg my-8 space-y-4">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h2 className="font-heading font-bold text-base text-slate-900 uppercase tracking-wider">
              {editingBlog ? 'Edit Blog Article' : 'Compose Blog Article'}
            </h2>
            <button
              type="button"
              onClick={onRunAiFixer}
              disabled={aiFixing}
              className="px-3 py-1 rounded-xl bg-[var(--ox-900)] hover:bg-[var(--ox-700)] text-white font-heading font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-hard-xs cursor-pointer disabled:opacity-50"
            >
              {aiFixing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-gd-500" />}
              <span>{aiFixing ? 'Polishing...' : 'AI Fix & Enhance'}</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {aiSummary && (
          <div className="p-3 rounded-xl bg-[var(--ox-50)] border border-[var(--ox-200)] text-[var(--ox-800)] text-xs">
            <span className="font-bold block mb-1">AI Polish Complete:</span>
            <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
              {aiSummary.map((s, idx) => (
                <li key={idx}>{s}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={onSave} className="space-y-4 text-xs">
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">Article Headline (H1)</label>
            <input
              type="text"
              required
              value={formData.title || ''}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Nepal Air Cargo Customs Guide 2026: TIA Gateway Requirements"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">Category</label>
              <select
                value={formData.category || 'Air Freight'}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono"
              >
                <option value="Air Freight">Air Freight</option>
                <option value="Customs & Trade">Customs &amp; Trade</option>
                <option value="Overland Logistics">Overland Logistics</option>
                <option value="Export Guide">Export Guide</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">Reading Time</label>
              <input
                type="text"
                value={formData.read_time || '4 min read'}
                onChange={e => setFormData({ ...formData, read_time: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">Publication Status</label>
              <select
                value={formData.published ? 'true' : 'false'}
                onChange={e => setFormData({ ...formData, published: e.target.value === 'true' })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono font-bold"
              >
                <option value="false">Draft</option>
                <option value="true">Published (Public)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">Short Excerpt (Meta Description fallback)</label>
            <textarea
              rows={2}
              value={formData.excerpt || ''}
              onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
              placeholder="Summary for blog card and search snippet..."
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">Article Body (Markdown)</label>
            <textarea
              rows={8}
              required
              value={formData.content || ''}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
              placeholder="# Introduction&#10;&#10;Write article in Markdown..."
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-heading font-bold uppercase tracking-wider text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-ox-900 text-white font-heading font-bold uppercase tracking-wider text-xs shadow-hard-xs cursor-pointer"
            >
              Save Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
