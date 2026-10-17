import React, { useState, useEffect } from 'react';
import {
  MousePointer,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Power,
  RotateCcw,
  Tag,
  AlertCircle
} from 'lucide-react';
import {
  CursorMessageItem,
  getCursorMessages,
  saveCursorMessages,
  addCursorMessage,
  updateCursorMessage,
  deleteCursorMessage,
  DEFAULT_CURSOR_MESSAGES
} from '../../../services/cursorService';

export const AdminCursorControl: React.FC = () => {
  const [messages, setMessages] = useState<CursorMessageItem[]>([]);
  const [newText, setNewText] = useState('');
  const [newCategory, setNewCategory] = useState<CursorMessageItem['category']>('ad');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadMessages = () => {
    setMessages(getCursorMessages());
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const updated = addCursorMessage(newText.trim(), newCategory);
    setMessages(updated);
    setNewText('');
    showToast('New cursor message/ad added successfully!');
  };

  const handleToggle = (id: string, currentEnabled: boolean) => {
    const updated = updateCursorMessage(id, { enabled: !currentEnabled });
    setMessages(updated);
    showToast(`Cursor message ${!currentEnabled ? 'enabled' : 'disabled'}.`);
  };

  const handleDelete = (id: string) => {
    const updated = deleteCursorMessage(id);
    setMessages(updated);
    showToast('Cursor message removed.');
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all cursor messages and promotions to default template?')) {
      saveCursorMessages(DEFAULT_CURSOR_MESSAGES);
      setMessages(DEFAULT_CURSOR_MESSAGES);
      showToast('Cursor messages reset to defaults.');
    }
  };

  const getCategoryBadge = (category: CursorMessageItem['category']) => {
    switch (category) {
      case 'ad':
        return 'bg-amber-500/15 text-amber-600 border-amber-500/30';
      case 'cta':
        return 'bg-blue-500/15 text-blue-600 border-blue-500/30';
      case 'international':
        return 'bg-teal-500/15 text-teal-700 border-teal-500/30';
      case 'trust':
        return 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30';
      case 'location':
        return 'bg-orange-500/15 text-orange-600 border-orange-500/30';
      default:
        return 'bg-slate-500/15 text-slate-700 border-slate-500/30';
    }
  };

  const activeCount = messages.filter(m => m.enabled).length;

  return (
    <div className="space-y-6 pt-6 border-t border-slate-200">
      
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#002147] text-[#F2B705]">
              <MousePointer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-black text-xl text-slate-900 uppercase tracking-tight">
                Cursor Text, Ads &amp; Promotional Slogans
              </h2>
              <p className="text-xs text-slate-500">
                Manage floating ticker ads, announcements, and trust slogans attached to the interactive desktop cursor.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#002147]/5 text-[#002147] border border-[#002147]/10">
            {activeCount} Active / {messages.length} Total
          </span>
          <button
            onClick={handleResetDefaults}
            type="button"
            className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-mono text-slate-600 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Restore Defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Add New Message / Ad Form */}
      <form onSubmit={handleAdd} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
        <span className="text-xs font-heading font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-[#F2B705]" />
          <span>Add New Ad / Slogan Banner</span>
        </span>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="e.g. Flash Promo: 20% Discount to UK & USA..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F2B705]"
            />
          </div>

          <div className="w-full sm:w-44">
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#F2B705]"
            >
              <option value="ad">🏷️ Promotional Ad</option>
              <option value="cta">🎯 Call to Action</option>
              <option value="brand">🏢 Brand Slogan</option>
              <option value="international">🌍 International</option>
              <option value="service">✈️ Service</option>
              <option value="trust">🛡️ Trust &amp; License</option>
              <option value="location">📍 Hub Location</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={!newText.trim()}
            className="px-5 py-2.5 rounded-xl bg-[#002147] text-white font-heading font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-hard-xs hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Banner</span>
          </button>
        </div>
      </form>

      {/* Messages List Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-hard-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Cursor Text / Promotional Banner</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {messages.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleToggle(item.id, item.enabled)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                        item.enabled
                          ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
                          : 'bg-slate-200 text-slate-400 border border-slate-300'
                      }`}
                      title={item.enabled ? 'Click to Disable' : 'Click to Enable'}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${item.enabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                      <span>{item.enabled ? 'Active' : 'Paused'}</span>
                    </button>
                  </td>

                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${getCategoryBadge(item.category)}`}>
                      {item.category}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <span className={`font-semibold text-slate-900 ${!item.enabled ? 'line-through opacity-50' : ''}`}>
                      {item.text}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete cursor message"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
