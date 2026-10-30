import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Users,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  Download,
  CheckCircle2,
  XCircle,
  FileText,
  Search,
  X
} from 'lucide-react';
import { adminDataService } from '../services/adminDataService';
import { AdminCareer, AdminJobApplication } from '../types';
import { useMyPermissions } from '../usePermissions';
import { useAuth } from '../../../context/AuthContext';
import { useAdminDialogs } from '../AdminConfirmDialog';

export const CareersTab: React.FC = () => {
  const { confirm, notify } = useAdminDialogs();
  const { role } = useAuth();
  const permissions = useMyPermissions();

  const [activeSubtab, setActiveSubtab] = useState<'openings' | 'applications'>('openings');
  const [careers, setCareers] = useState<AdminCareer[]>([]);
  const [applications, setApplications] = useState<AdminJobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Job Opening Modal
  const [editingCareer, setEditingCareer] = useState<AdminCareer | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<AdminCareer>>({
    title: '',
    slug: '',
    department: 'Customs & Compliance',
    location: 'Kathmandu (TIA Hub)',
    type: 'Full-time',
    description: '',
    published: true
  });

  const loadData = async () => {
    try {
      setError(null);
      const [c, a] = await Promise.all([
        adminDataService.fetchCareers(),
        adminDataService.fetchApplications()
      ]);
      setCareers(c);
      setApplications(a);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch careers and applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setFormData({
      title: '',
      slug: '',
      department: 'Customs & Compliance',
      location: 'Kathmandu (TIA Hub)',
      type: 'Full-time',
      description: 'Responsible for customs documentation, tariff classification, and cargo clearing.',
      published: true
    });
    setIsCreating(true);
  };

  const handleOpenEdit = (c: AdminCareer) => {
    setEditingCareer(c);
    setFormData({ ...c });
  };

  const handleSaveCareer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const slugGenerated = formData.slug || formData.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'role';
      const saved = await adminDataService.saveCareer({
        ...formData,
        slug: slugGenerated,
        id: editingCareer?.id
      });
      if (editingCareer) {
        setCareers(prev => prev.map(c => c.id === saved.id ? saved : c));
        setEditingCareer(null);
      } else {
        setCareers(prev => [saved, ...prev]);
        setIsCreating(false);
      }
    } catch (err: any) {
      void notify(err.message, 'Vacancy not saved');
    }
  };

  const handleDeleteCareer = async (c: AdminCareer) => {
    if (!(await confirm({ title: 'Delete this vacancy?', body: <>“{c.title}” will be removed from the careers page. Applications already received are kept.</>, confirmLabel: 'Delete vacancy', danger: true }))) return;
    try {
      await adminDataService.deleteCareer(c.id, c.slug);
      setCareers(prev => prev.filter(x => x.id !== c.id));
    } catch (err: any) {
      void notify(err.message, 'Vacancy not deleted');
    }
  };

  const handleAppStatusChange = async (appId: string, newStatus: AdminJobApplication['status']) => {
    try {
      const updated = await adminDataService.updateApplicationStatus(appId, newStatus);
      setApplications(prev => prev.map(a => a.id === updated.id ? updated : a));
    } catch (err: any) {
      void notify(err.message, 'Status not changed');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl lg:text-[28px] text-[var(--text)]">
            Careers and applicants
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage published job vacancies and track applicant resumes submitted through Turnstile-verified forms.
          </p>
        </div>

        <div className="p-1 rounded-2xl bg-slate-200 border border-slate-300 flex items-center gap-1 self-start sm:self-auto shadow-hard-xs">
          <button
            onClick={() => setActiveSubtab('openings')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold uppercase transition-all cursor-pointer ${
              activeSubtab === 'openings'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Vacancies ({careers.length})
          </button>
          <button
            onClick={() => setActiveSubtab('applications')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold uppercase transition-all cursor-pointer ${
              activeSubtab === 'applications'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Applicants ({applications.length})
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
          {error}
        </div>
      )}

      {/* VACANCIES SUBTAB */}
      {activeSubtab === 'openings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-500">
              {careers.length} openings registered in database
            </span>
            {permissions.canManageCareers && (
              <button
                onClick={handleOpenCreate}
                className="px-4 py-2 rounded-xl bg-ox-900 text-white font-heading font-bold text-xs uppercase tracking-wider hover:opacity-95 shadow-hard-xs flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Vacancy</span>
              </button>
            )}
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 shadow-hard-sm overflow-hidden">
            <table className="stack-table w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-ox-900 text-white text-[11px] font-heading font-bold uppercase tracking-wider sticky top-0">
                  <th className="py-2.5 px-4">Job Title &amp; Slug</th>
                  <th className="py-2.5 px-4">Department</th>
                  <th className="py-2.5 px-4">Location</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {careers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td data-label="Job Title & Slug" className="py-2.5 px-4 font-bold text-slate-900">
                      <span>{c.title}</span>
                      <span className="block text-[10px] font-mono text-slate-400">/careers/{c.slug}</span>
                    </td>
                    <td data-label="Department" className="py-2.5 px-4 font-mono">{c.department}</td>
                    <td data-label="Location" className="py-2.5 px-4 font-mono">{c.location}</td>
                    <td data-label="Status" className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        c.published ? 'bg-emerald-500/15 text-emerald-600' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {c.published ? 'Published' : 'Hidden'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      {permissions.canManageCareers && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(c)}
                            aria-label={`Edit ${c.title}`}
                            className="p-1 rounded-lg text-blue-600 hover:bg-blue-50"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCareer(c)}
                            aria-label={`Delete ${c.title}`}
                            className="p-1 rounded-lg text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* APPLICANTS SUBTAB */}
      {activeSubtab === 'applications' && (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-hard-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="stack-table w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-ox-900 text-white text-[11px] font-heading font-bold uppercase tracking-wider sticky top-0">
                  <th className="py-2.5 px-4">Applicant Name</th>
                  <th className="py-2.5 px-4">Target Vacancy</th>
                  <th className="py-2.5 px-4">Experience</th>
                  <th className="py-2.5 px-4">Resume</th>
                  <th className="py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 font-mono">
                      No candidate applications submitted yet.
                    </td>
                  </tr>
                ) : (
                  applications.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                      <td data-label="Applicant Name" className="py-2.5 px-4">
                        <span className="font-bold text-slate-900 block">{a.applicant_name}</span>
                        <span className="text-[10px] font-mono text-slate-400">{a.email} · {a.phone || 'No phone'}</span>
                      </td>
                      <td data-label="Target Vacancy" className="py-2.5 px-4 font-mono font-semibold">{a.job_title}</td>
                      <td data-label="Experience" className="py-2.5 px-4 font-mono">{a.experience_years ? `${a.experience_years} years` : 'Entry'}</td>
                      <td data-label="Resume" className="py-2.5 px-4">
                        {a.resume_url ? (
                          <a
                            href={a.resume_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:underline font-mono text-[11px]"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download CV</span>
                          </a>
                        ) : (
                          <span className="text-slate-400 font-mono">None</span>
                        )}
                      </td>
                      <td data-label="Status" className="py-2.5 px-4">
                        {permissions.canManageCareers ? (
                          <select
                            value={a.status}
                            onChange={(e) => handleAppStatusChange(a.id, e.target.value as AdminJobApplication['status'])}
                            className="px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-[10px] font-mono font-bold uppercase cursor-pointer"
                          >
                            <option value="new">New</option>
                            <option value="reviewing">Reviewing</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="rejected">Rejected</option>
                            <option value="hired">Hired</option>
                          </select>
                        ) : (
                          <span className="font-mono text-[10px] uppercase font-bold">{a.status}</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT VACANCY MODAL */}
      {(isCreating || editingCareer) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-hard-lg my-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-heading font-bold text-base text-slate-900 uppercase tracking-wider">
                {editingCareer ? 'Edit Job Opening' : 'Register New Vacancy'}
              </h2>
              <button
                onClick={() => { setIsCreating(false); setEditingCareer(null); }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCareer} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Senior Air Freight Logistics Officer"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={formData.department || ''}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">Location</label>
                  <input
                    type="text"
                    required
                    value={formData.location || ''}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">Role Description</label>
                <textarea
                  rows={4}
                  required
                  value={formData.description || ''}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setIsCreating(false); setEditingCareer(null); }}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-heading font-bold uppercase tracking-wider text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-ox-900 text-white font-heading font-bold uppercase tracking-wider text-xs shadow-hard-xs cursor-pointer"
                >
                  Save Vacancy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
