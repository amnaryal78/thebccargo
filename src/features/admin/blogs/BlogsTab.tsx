import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Search,
  ExternalLink
} from 'lucide-react';
import { adminDataService } from '../services/adminDataService';
import { AdminBlog } from '../types';
import { useMyPermissions } from '../usePermissions';
import { useAuth } from '../../../context/AuthContext';
import { fixBlogContentWithAI } from '../../../services/aiBlogFixerService';
import { BlogEditorModal } from './BlogEditorModal';

export const BlogsTab: React.FC = () => {
  const { role } = useAuth();
  const permissions = useMyPermissions();

  const [blogs, setBlogs] = useState<AdminBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Editor Modal State
  const [editingBlog, setEditingBlog] = useState<AdminBlog | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [aiFixing, setAiFixing] = useState(false);
  const [aiSummary, setAiSummary] = useState<string[] | null>(null);

  const [formData, setFormData] = useState<Partial<AdminBlog>>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    author_name: 'The BC Cargo Editorial Team',
    category: 'Air Freight',
    read_time: '4 min read',
    published: false,
    seo_title: '',
    seo_description: '',
    cover_image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80'
  });

  const loadBlogs = async () => {
    try {
      setError(null);
      const data = await adminDataService.fetchBlogs();
      setBlogs(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch blogs from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const handleOpenCreate = () => {
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      author_name: 'The BC Cargo Editorial Desk',
      category: 'Air Freight',
      read_time: '4 min read',
      published: false,
      seo_title: '',
      seo_description: '',
      cover_image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80'
    });
    setAiSummary(null);
    setIsCreating(true);
  };

  const handleOpenEdit = (b: AdminBlog) => {
    setEditingBlog(b);
    setFormData({ ...b });
    setAiSummary(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const slugGenerated = formData.slug || formData.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'article';
      const saved = await adminDataService.saveBlog({
        ...formData,
        slug: slugGenerated,
        id: editingBlog?.id
      });
      if (editingBlog) {
        setBlogs(prev => prev.map(b => b.id === saved.id ? saved : b));
        setEditingBlog(null);
      } else {
        setBlogs(prev => [saved, ...prev]);
        setIsCreating(false);
      }
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    }
  };

  const handleDelete = async (b: AdminBlog) => {
    if (!confirm(`Delete blog post "${b.title}"?`)) return;
    try {
      await adminDataService.deleteBlog(b.id, b.slug);
      setBlogs(prev => prev.filter(x => x.id !== b.id));
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleRunAiFixer = async () => {
    if (!formData.title || !formData.content) {
      alert('Please provide at least a title and body content before running the AI fixer.');
      return;
    }
    setAiFixing(true);
    setAiSummary(null);
    try {
      const res = await fixBlogContentWithAI({
        title: formData.title,
        excerpt: formData.excerpt || '',
        content: formData.content,
        mode: 'full'
      });
      setFormData(prev => ({
        ...prev,
        title: res.improvedTitle,
        excerpt: res.improvedExcerpt,
        content: res.improvedContent
      }));
      setAiSummary(res.changesSummary);
    } catch (err: any) {
      alert(`AI Fixer error: ${err.message}`);
    } finally {
      setAiFixing(false);
    }
  };

  const filtered = blogs.filter(b =>
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-black text-2xl lg:text-3xl text-slate-900 uppercase tracking-tight">
              Blog CMS &amp; AI Fixer
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-600 text-[10px] font-mono font-bold">
              AI Editor Integrated
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Create authoritative trade and cargo articles with automated SEO keyword optimization.
          </p>
        </div>

        {permissions.canManageBlogs && (
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-ox-900 text-white font-heading font-bold text-xs uppercase tracking-wider hover:opacity-95 shadow-hard-xs flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Blog Post</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
          {error}
        </div>
      )}

      {/* Toolbar */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-hard-xs flex items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search blog title or category..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono text-slate-900 focus:outline-none"
          />
        </div>
        <span className="text-xs font-mono text-slate-500">
          {filtered.length} posts
        </span>
      </div>

      {/* Desktop Dense Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-hard-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-ox-900 text-white text-[11px] font-heading font-bold uppercase tracking-wider sticky top-0">
                <th className="py-2.5 px-4">Article Title &amp; Slug</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Published Date</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-4 max-w-md">
                    <span className="font-heading font-bold text-slate-900 block">
                      {b.title}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      /blogs/{b.slug}
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-slate-100 text-slate-700">
                      {b.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                      b.published ? 'bg-emerald-500/15 text-emerald-600' : 'bg-amber-500/15 text-amber-600'
                    }`}>
                      {b.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-mono text-slate-500 text-[11px]">
                    {new Date(b.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <a
                        href={`/blogs/${b.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        title="View Public URL"
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      {permissions.canManageBlogs && (
                        <>
                          <button
                            onClick={() => handleOpenEdit(b)}
                            title="Edit Article"
                            className="p-1 rounded-lg hover:bg-blue-50 text-blue-600 cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(b)}
                            title="Delete Article"
                            className="p-1 rounded-lg hover:bg-red-50 text-red-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL WITH AI FIXER */}
      <BlogEditorModal
        isCreating={isCreating}
        editingBlog={editingBlog}
        formData={formData}
        setFormData={setFormData}
        aiFixing={aiFixing}
        aiSummary={aiSummary}
        onRunAiFixer={handleRunAiFixer}
        onClose={() => { setIsCreating(false); setEditingBlog(null); }}
        onSave={handleSave}
      />
    </div>
  );
};
