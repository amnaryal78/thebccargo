import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  Filter,
  Mail,
  Send,
  Phone,
  FileText,
  Copy,
  Check,
  X,
  Clock,
  UserCheck
} from 'lucide-react';
import { adminDataService } from '../services/adminDataService';
import { AdminInquiry } from '../types';
import { useMyPermissions } from '../usePermissions';
import { useAuth } from '../../../context/AuthContext';
import { useAdminDialogs } from '../AdminConfirmDialog';

export const InquiriesTab: React.FC = () => {
  const { notify } = useAdminDialogs();
  const { role } = useAuth();
  const permissions = useMyPermissions();

  const [inquiries, setInquiries] = useState<AdminInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Selected inquiry for reply template modal
  const [activeReplyInquiry, setActiveReplyInquiry] = useState<AdminInquiry | null>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Editing notes state
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState('');

  const loadInquiries = async () => {
    try {
      setError(null);
      const data = await adminDataService.fetchInquiries();
      setInquiries(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch inquiries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  const handleStatusChange = async (inquiry: AdminInquiry, newStatus: AdminInquiry['status']) => {
    try {
      const updated = await adminDataService.updateInquiryStatus(inquiry.id, newStatus);
      setInquiries(prev => prev.map(i => i.id === updated.id ? updated : i));
    } catch (err: any) {
      void notify(err.message, 'Status not changed');
    }
  };

  const handleSaveNotes = async (id: string) => {
    try {
      const inquiry = inquiries.find(i => i.id === id);
      if (!inquiry) return;
      const updated = await adminDataService.updateInquiryStatus(id, inquiry.status, notesDraft);
      setInquiries(prev => prev.map(i => i.id === updated.id ? updated : i));
      setEditingNotesId(null);
    } catch (err: any) {
      void notify(err.message, 'Notes not saved');
    }
  };

  const handleCopyText = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const filtered = inquiries.filter(i => {
    const matchSearch =
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i.subject && i.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
      i.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === 'all' || i.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl lg:text-[28px] text-[var(--text)]">
            Inquiries and partners
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational workflow for quote requests, counter pickups, and rate inquiries.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
          {error}
        </div>
      )}

      {/* Toolbar */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-hard-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search sender, email, query..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono text-slate-900 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-heading font-semibold text-slate-700 cursor-pointer"
          >
            <option value="all">All Inquiries</option>
            <option value="new">New (Unread)</option>
            <option value="contacted">Contacted</option>
            <option value="quoted">Quoted</option>
            <option value="resolved">Resolved</option>
            <option value="spam">Spam</option>
          </select>
        </div>
      </div>

      {/* Desktop Dense Table */}
      <div className="hidden md:block rounded-2xl bg-white border border-slate-200 shadow-hard-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-ox-900 text-white text-[11px] font-heading font-bold uppercase tracking-wider sticky top-0">
                <th className="py-2.5 px-4">Contact</th>
                <th className="py-2.5 px-4">Subject &amp; Message</th>
                <th className="py-2.5 px-4">Service</th>
                <th className="py-2.5 px-4">Status Workflow</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 font-mono">
                    {loading ? 'Fetching inquiries...' : 'No inquiries found.'}
                  </td>
                </tr>
              ) : (
                filtered.map((i) => (
                  <tr key={i.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-4">
                      <div className="font-bold text-slate-900">
                        {i.name}
                      </div>
                      <span className="block text-[11px] font-mono text-slate-500 truncate">
                        {i.email}
                      </span>
                      {i.phone && (
                        <span className="text-[10px] font-mono text-slate-400">
                          {i.phone}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 max-w-md">
                      <div className="font-semibold text-slate-800 mb-0.5">
                        {i.subject || 'General Inquiry'}
                      </div>
                      <p className={`text-[11px] text-slate-500 ${i.service_mode === 'partner' ? 'whitespace-pre-line' : 'line-clamp-2'}`}>
                        {i.message}
                      </p>
                      {i.internal_notes && (
                        <span className="inline-block mt-1 text-[10px] font-mono bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded">
                          Note: {i.internal_notes}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-slate-100 text-slate-700">
                        {i.service_mode || 'Standard'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      {permissions.canManageInquiries ? (
                        <select
                          value={i.status}
                          onChange={(e) => handleStatusChange(i, e.target.value as AdminInquiry['status'])}
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold uppercase border cursor-pointer ${
                            i.status === 'new'
                              ? 'bg-blue-50 text-blue-600 border-blue-200'
                              : i.status === 'quoted'
                              ? 'bg-[var(--gd-500)]/15 text-[var(--gd-800)] border-[var(--gd-500)]/40'
                              : i.status === 'resolved'
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="quoted">Quoted</option>
                          <option value="resolved">Resolved</option>
                          <option value="spam">Spam</option>
                        </select>
                      ) : (
                        <span className="font-mono text-[11px] uppercase font-bold text-slate-600">
                          {i.status}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setActiveReplyInquiry(i)}
                          title="Generate Reply Template"
                          className="px-2.5 py-1 rounded-lg bg-ox-900 text-white font-heading font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-hard-xs cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          <span>Reply</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View (< 768px) */}
      <div className="md:hidden space-y-3">
        {filtered.map((i) => (
          <div key={i.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-hard-xs space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-bold text-sm text-slate-900 block">
                  {i.name}
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  {i.email}
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                i.status === 'new' ? 'bg-blue-500/15 text-blue-600' : 'bg-slate-100 text-slate-600'
              }`}>
                {i.status}
              </span>
            </div>

            <p className="text-xs text-slate-600">
              {i.message}
            </p>

            {/* Mobile Actions */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              {permissions.canManageInquiries && (
                <select
                  value={i.status}
                  onChange={(e) => handleStatusChange(i, e.target.value as AdminInquiry['status'])}
                  className="min-h-[44px] flex-1 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="quoted">Quoted</option>
                  <option value="resolved">Resolved</option>
                  <option value="spam">Spam</option>
                </select>
              )}
              <button
                onClick={() => setActiveReplyInquiry(i)}
                className="min-h-[44px] px-4 rounded-xl bg-ox-900 text-white text-xs font-heading font-bold uppercase flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Reply Template</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* REPLY TEMPLATE MODAL */}
      {activeReplyInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 shadow-hard-lg my-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="font-heading font-bold text-base text-slate-900 uppercase tracking-wider">
                  Operational Response Template
                </h2>
                <span className="text-[11px] font-mono text-slate-400">
                  Recipient: {activeReplyInquiry.name} ({activeReplyInquiry.email})
                </span>
              </div>
              <button
                onClick={() => setActiveReplyInquiry(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Email Template Preview */}
            <div className="space-y-2">
              <span className="text-[11px] font-heading font-bold uppercase text-slate-700">
                Official Email Response
              </span>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 whitespace-pre-wrap">
{`Dear ${activeReplyInquiry.name},

Thank you for reaching out to The BC Cargo & Courier.

Regarding your inquiry concerning "${activeReplyInquiry.subject || 'cargo logistics & courier services'}":
We have reviewed your consignment request and our commercial logistics desk is ready to assist you. 

Please let us know your approximate cargo weight (kg), dimensions (LxWxH cm), and pickup address so we can issue your finalized Air Waybill (AWB) or surface consignment note.

Phone: 057-591816 / 9855019485
The BC Cargo & Courier Pvt. Ltd.`}
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <a
                  href={`mailto:${activeReplyInquiry.email}?subject=${encodeURIComponent(`Re: ${activeReplyInquiry.subject || 'The BC Cargo & Courier Inquiry'}`)}&body=${encodeURIComponent(`Dear ${activeReplyInquiry.name},\n\nThank you for reaching out to The BC Cargo & Courier.\n\n`)}`}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-heading font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-hard-xs"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Open in Mail Client</span>
                </a>

                <button
                  onClick={() => handleCopyText(`Dear ${activeReplyInquiry.name},\n\nThank you for contacting The BC Cargo & Courier. Regarding your inquiry on "${activeReplyInquiry.subject || 'cargo services'}", our operations desk is reviewing your requirements. We will assist you promptly.\n\nOperations Desk: +977-1-4113000`, 'email')}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-heading font-bold uppercase flex items-center gap-1.5"
                >
                  {copiedType === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedType === 'email' ? 'Copied' : 'Copy Text'}</span>
                </button>
              </div>
            </div>

            {/* Internal Notes Editor */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <span className="text-[11px] font-heading font-bold uppercase text-slate-700">
                Staff Internal Notes
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  defaultValue={activeReplyInquiry.internal_notes || ''}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  placeholder="e.g. Quoted NPR 14,500 via phone call on Oct 14"
                  className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900"
                />
                <button
                  onClick={() => handleSaveNotes(activeReplyInquiry.id)}
                  className="px-4 py-1.5 rounded-xl bg-ox-900 text-white font-heading font-bold text-xs uppercase tracking-wider"
                >
                  Save Note
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
