import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Save,
  RefreshCw,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  Eye,
  MessageSquare,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { HowToShipData, HowToShipSection, HowToShipItem } from '../../../types/howToShip';
import { fetchAdminHowToShip, saveHowToShip } from '../../../services/howToShipService';
import { DEFAULT_HOW_TO_SHIP } from '../../../data/defaultHowToShip';
import { useAuth } from '../../../context/AuthContext';
import { getRolePermissions } from '../types';
import { Link } from 'react-router-dom';

export const HowToShipAdminTab: React.FC = () => {
  const { user, role } = useAuth();
  const permissions = getRolePermissions(role);
  const canEdit = permissions.canManageHowToShip && !permissions.isReadOnly;

  const [data, setData] = useState<HowToShipData>(DEFAULT_HOW_TO_SHIP);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Collapsible section state for convenient editor UX
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: true,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchAdminHowToShip();
      setData(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to load How to Ship content.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleSection = (idx: number) => {
    setExpandedSections((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) {
      alert('You do not have permission to edit content.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);
      const saved = await saveHowToShip(data, user?.email || undefined);
      setData(saved);
      setSuccessMessage('How to Ship guide saved and published.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setError(err?.message || 'Failed to save How to Ship content.');
    } finally {
      setSaving(false);
    }
  };

  // Section handlers
  const handleSectionChange = (sIdx: number, field: keyof HowToShipSection, value: any) => {
    const updated = [...data.sections];
    updated[sIdx] = { ...updated[sIdx], [field]: value };
    setData({ ...data, sections: updated });
  };

  const handleItemChange = (sIdx: number, iIdx: number, field: keyof HowToShipItem, value: any) => {
    const updatedSections = [...data.sections];
    const updatedItems = [...updatedSections[sIdx].items];
    updatedItems[iIdx] = { ...updatedItems[iIdx], [field]: value };
    updatedSections[sIdx] = { ...updatedSections[sIdx], items: updatedItems };
    setData({ ...data, sections: updatedSections });
  };

  const handleAddItem = (sIdx: number) => {
    const updatedSections = [...data.sections];
    const updatedItems = [
      ...updatedSections[sIdx].items,
      { en: '', np: '', highlight_en: '', highlight_np: '' },
    ];
    updatedSections[sIdx] = { ...updatedSections[sIdx], items: updatedItems };
    setData({ ...data, sections: updatedSections });
  };

  const handleRemoveItem = (sIdx: number, iIdx: number) => {
    const updatedSections = [...data.sections];
    const updatedItems = updatedSections[sIdx].items.filter((_, idx) => idx !== iIdx);
    updatedSections[sIdx] = { ...updatedSections[sIdx], items: updatedItems };
    setData({ ...data, sections: updatedSections });
  };

  const handleWarningChange = (wIdx: number, value: string) => {
    const updated = [...(data.warnings || [])];
    updated[wIdx] = value;
    setData({ ...data, warnings: updated });
  };

  const handleAddWarning = () => {
    setData({ ...data, warnings: [...(data.warnings || []), ''] });
  };

  const handleRemoveWarning = (wIdx: number) => {
    setData({ ...data, warnings: (data.warnings || []).filter((_, idx) => idx !== wIdx) });
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 text-[#F2B705] animate-spin" />
        <span className="text-xs font-mono text-slate-500">Loading How to Ship CMS data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--line)] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-black text-2xl text-[var(--text)] tracking-tight">
              How to Ship Guide CMS
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold uppercase tracking-wider">
              Supabase
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Edit bilingual guide content, numbered sections, rules, packing instructions, and WhatsApp contact text.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/how-to-ship"
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--line)] text-[var(--text)] text-xs font-heading font-bold uppercase tracking-wider inline-flex items-center gap-1.5 border border-[var(--line)] transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Public Page</span>
            <ExternalLink className="w-3 h-3 text-[var(--text-muted)]" />
          </Link>

          {canEdit && (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="min-h-[40px] px-5 py-2 rounded-xl bg-[#F2B705] hover:bg-[#FAC623] text-[#002147] text-xs font-heading font-extrabold uppercase tracking-wider inline-flex items-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Page Header & Bilingual Intro */}
        <div className="p-5 sm:p-6 bg-[var(--surface)] border border-[var(--line)] rounded-2xl shadow-hard-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
            <h2 className="font-heading font-bold text-base text-[var(--text)]">
              1. Page Titles &amp; Introduction
            </h2>
            <div className="flex items-center gap-2">
              <label className="text-xs font-mono text-[var(--text-muted)] flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.published}
                  onChange={(e) => setData({ ...data, published: e.target.checked })}
                  disabled={!canEdit}
                  className="rounded border-[var(--line)] text-[#002147] focus:ring-[#F2B705]"
                />
                <span className="font-bold">Published</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Title (English)
              </label>
              <input
                type="text"
                value={data.title_en}
                onChange={(e) => setData({ ...data, title_en: e.target.value })}
                disabled={!canEdit}
                className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--line)] rounded-xl text-xs font-sans text-[var(--text)] focus:ring-2 focus:ring-[#002147] outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Title (Nepali)
              </label>
              <input
                type="text"
                value={data.title_np}
                onChange={(e) => setData({ ...data, title_np: e.target.value })}
                disabled={!canEdit}
                className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--line)] rounded-xl text-xs font-sans text-[var(--text)] focus:ring-2 focus:ring-[#002147] outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Introduction Text (English)
              </label>
              <textarea
                rows={2}
                value={data.intro_en}
                onChange={(e) => setData({ ...data, intro_en: e.target.value })}
                disabled={!canEdit}
                className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--line)] rounded-xl text-xs font-sans text-[var(--text)] focus:ring-2 focus:ring-[#002147] outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Introduction Text (Nepali)
              </label>
              <textarea
                rows={2}
                value={data.intro_np || ''}
                onChange={(e) => setData({ ...data, intro_np: e.target.value })}
                disabled={!canEdit}
                className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--line)] rounded-xl text-xs font-sans text-[var(--text)] focus:ring-2 focus:ring-[#002147] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Numbered Sections */}
        <div className="space-y-4">
          <h2 className="font-heading font-bold text-base text-[var(--text)]">
            2. Numbered Guide Sections ({data.sections.length})
          </h2>

          {data.sections.map((section, sIdx) => {
            const isExpanded = expandedSections[section.section_number] ?? true;

            return (
              <div
                key={section.section_number}
                className="p-5 sm:p-6 bg-[var(--surface)] border border-[var(--line)] rounded-2xl shadow-hard-xs space-y-4"
              >
                {/* Section Header Accordion Trigger */}
                <div
                  className="flex items-center justify-between cursor-pointer select-none"
                  onClick={() => toggleSection(section.section_number)}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-[#002147] text-[#F2B705] font-heading font-extrabold text-xs flex items-center justify-center shrink-0">
                      {section.section_number}
                    </span>
                    <div>
                      <h3 className="font-heading font-bold text-sm text-[var(--text)]">
                        {section.title_en} | {section.title_np}
                      </h3>
                      <span className="text-[10px] font-mono text-[var(--text-muted)]">
                        {section.items.length} items
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-2)]"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Section Details (Collapsible) */}
                {isExpanded && (
                  <div className="space-y-4 pt-3 border-t border-[var(--line)]">
                    {/* Section Titles */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono text-[var(--text-muted)] uppercase mb-1">
                          Section Title (EN)
                        </label>
                        <input
                          type="text"
                          value={section.title_en}
                          onChange={(e) => handleSectionChange(sIdx, 'title_en', e.target.value)}
                          disabled={!canEdit}
                          className="w-full px-3 py-1.5 bg-[var(--surface-2)] border border-[var(--line)] rounded-lg text-xs font-sans text-[var(--text)] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-[var(--text-muted)] uppercase mb-1">
                          Section Title (NP)
                        </label>
                        <input
                          type="text"
                          value={section.title_np}
                          onChange={(e) => handleSectionChange(sIdx, 'title_np', e.target.value)}
                          disabled={!canEdit}
                          className="w-full px-3 py-1.5 bg-[var(--surface-2)] border border-[var(--line)] rounded-lg text-xs font-sans text-[var(--text)] outline-none"
                        />
                      </div>
                    </div>

                    {/* Bullet Items */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-heading font-bold uppercase tracking-wider text-[var(--text-muted)]">
                          Bullet Items
                        </span>
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => handleAddItem(sIdx)}
                            className="text-xs font-mono text-[#002147] hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Item</span>
                          </button>
                        )}
                      </div>

                      <div className="space-y-2">
                        {section.items.map((item, iIdx) => (
                          <div
                            key={iIdx}
                            className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] space-y-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-mono font-bold text-[var(--text-muted)]">
                                Item #{iIdx + 1}
                              </span>
                              {canEdit && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(sIdx, iIdx)}
                                  className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                                  title="Delete Item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] font-mono text-[var(--text-muted)] block mb-0.5">
                                  Highlight Label (EN optional)
                                </label>
                                <input
                                  type="text"
                                  value={item.highlight_en || ''}
                                  placeholder="e.g. Medicine"
                                  onChange={(e) =>
                                    handleItemChange(sIdx, iIdx, 'highlight_en', e.target.value)
                                  }
                                  disabled={!canEdit}
                                  className="w-full px-2.5 py-1 bg-[var(--surface)] border border-[var(--line)] rounded-md text-xs font-sans outline-none"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-mono text-[var(--text-muted)] block mb-0.5">
                                  Highlight Label (NP optional)
                                </label>
                                <input
                                  type="text"
                                  value={item.highlight_np || ''}
                                  placeholder="e.g. औषधि"
                                  onChange={(e) =>
                                    handleItemChange(sIdx, iIdx, 'highlight_np', e.target.value)
                                  }
                                  disabled={!canEdit}
                                  className="w-full px-2.5 py-1 bg-[var(--surface)] border border-[var(--line)] rounded-md text-xs font-sans outline-none"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] font-mono text-[var(--text-muted)] block mb-0.5">
                                  Description (EN)
                                </label>
                                <textarea
                                  rows={2}
                                  value={item.en}
                                  onChange={(e) => handleItemChange(sIdx, iIdx, 'en', e.target.value)}
                                  disabled={!canEdit}
                                  className="w-full px-2.5 py-1 bg-[var(--surface)] border border-[var(--line)] rounded-md text-xs font-sans outline-none"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-mono text-[var(--text-muted)] block mb-0.5">
                                  Description (NP)
                                </label>
                                <textarea
                                  rows={2}
                                  value={item.np}
                                  onChange={(e) => handleItemChange(sIdx, iIdx, 'np', e.target.value)}
                                  disabled={!canEdit}
                                  className="w-full px-2.5 py-1 bg-[var(--surface)] border border-[var(--line)] rounded-md text-xs font-sans outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Section Special Notice / Extra Text */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block text-[11px] font-mono text-[var(--text-muted)] uppercase mb-1">
                          Extra Notice (EN optional)
                        </label>
                        <input
                          type="text"
                          value={section.extra_text_en || ''}
                          placeholder="e.g. Every country has different rules..."
                          onChange={(e) => handleSectionChange(sIdx, 'extra_text_en', e.target.value)}
                          disabled={!canEdit}
                          className="w-full px-3 py-1.5 bg-[var(--surface-2)] border border-[var(--line)] rounded-lg text-xs font-sans outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-[var(--text-muted)] uppercase mb-1">
                          Extra Notice (NP optional)
                        </label>
                        <input
                          type="text"
                          value={section.extra_text_np || ''}
                          placeholder="e.g. कुनै सामान पठाउन मिल्छ कि मिल्दैन..."
                          onChange={(e) => handleSectionChange(sIdx, 'extra_text_np', e.target.value)}
                          disabled={!canEdit}
                          className="w-full px-3 py-1.5 bg-[var(--surface-2)] border border-[var(--line)] rounded-lg text-xs font-sans outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Card 3: Regulatory Warnings */}
        <div className="p-5 sm:p-6 bg-[var(--surface)] border border-[var(--line)] rounded-2xl shadow-hard-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
            <h2 className="font-heading font-bold text-base text-[var(--text)]">
              3. Regulatory Notices &amp; Warnings
            </h2>
            {canEdit && (
              <button
                type="button"
                onClick={handleAddWarning}
                className="text-xs font-mono text-[#002147] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Warning</span>
              </button>
            )}
          </div>

          <div className="space-y-2">
            {(data.warnings || []).map((warning, wIdx) => (
              <div key={wIdx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={warning}
                  onChange={(e) => handleWarningChange(wIdx, e.target.value)}
                  disabled={!canEdit}
                  className="flex-1 px-3 py-2 bg-[var(--surface-2)] border border-[var(--line)] rounded-xl text-xs font-sans text-[var(--text)] outline-none"
                />
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => handleRemoveWarning(wIdx)}
                    className="p-2 text-red-500 hover:text-red-700 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Card 4: WhatsApp Contact Footer CTA */}
        <div className="p-5 sm:p-6 bg-[var(--surface)] border border-[var(--line)] rounded-2xl shadow-hard-xs space-y-4">
          <h2 className="font-heading font-bold text-base text-[var(--text)] border-b border-[var(--line)] pb-3">
            4. Final WhatsApp Contact Section
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Contact Title (English)
              </label>
              <input
                type="text"
                value={data.contact_title_en}
                onChange={(e) => setData({ ...data, contact_title_en: e.target.value })}
                disabled={!canEdit}
                className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--line)] rounded-xl text-xs font-sans text-[var(--text)] outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Contact Title (Nepali)
              </label>
              <input
                type="text"
                value={data.contact_title_np}
                onChange={(e) => setData({ ...data, contact_title_np: e.target.value })}
                disabled={!canEdit}
                className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--line)] rounded-xl text-xs font-sans text-[var(--text)] outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Contact Text (English)
              </label>
              <input
                type="text"
                value={data.contact_text_en}
                onChange={(e) => setData({ ...data, contact_text_en: e.target.value })}
                disabled={!canEdit}
                className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--line)] rounded-xl text-xs font-sans text-[var(--text)] outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Contact Text (Nepali)
              </label>
              <input
                type="text"
                value={data.contact_text_np}
                onChange={(e) => setData({ ...data, contact_text_np: e.target.value })}
                disabled={!canEdit}
                className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--line)] rounded-xl text-xs font-sans text-[var(--text)] outline-none"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">
                WhatsApp Phone Number (Country code without +, e.g. 9779855019485)
              </label>
              <input
                type="text"
                value={data.whatsapp_number || '9779855019485'}
                onChange={(e) => setData({ ...data, whatsapp_number: e.target.value })}
                disabled={!canEdit}
                className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--line)] rounded-xl text-xs font-mono text-[var(--text)] outline-none max-w-sm"
              />
            </div>
          </div>
        </div>

        {/* Bottom Save Bar */}
        {canEdit && (
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#F2B705] hover:bg-[#FAC623] text-[#002147] text-xs font-heading font-extrabold uppercase tracking-wider inline-flex items-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving to Supabase...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save How to Ship Changes</span>
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
