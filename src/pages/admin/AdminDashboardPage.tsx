import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  BarChart3, 
  Mail, 
  PackageCheck, 
  BookOpen, 
  Briefcase, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  LogOut,
  ShieldCheck,
  MapPin,
  Globe2,
  FileText,
  AlertCircle,
  Settings,
  Menu,
  X,
  Shield,
  QrCode,
  Download,
  Search,
  UserCheck,
  MousePointer,
  Bot,
  Sparkles,
  Upload,
  RefreshCw,
  Image as ImageIcon,
  Star,
  Eye,
  Copy,
  ExternalLink,
  Layers,
  Check
} from 'lucide-react';
import { AdminChatbotControl } from '../../components/admin/AdminChatbotControl';
import { AiBlogFixerModal } from '../../components/admin/AiBlogFixerModal';
import { compressAndProcessImage, ImageOptimizationResult } from '../../services/blogImageService';
import { 
  getCursorMessages, 
  addCursorMessage, 
  updateCursorMessage, 
  deleteCursorMessage, 
  CursorMessageItem 
} from '../../services/cursorService';
import { 
  getInitialInquiries, 
  getInquiries, 
  updateInquiryStatus, 
  deleteInquiry,
  InquiryRecord 
} from '../../services/inquiryService';
import { 
  fetchAllBlogs, 
  saveBlogPostAsync, 
  deleteBlogPostAsync, 
  checkSlugAvailability,
  generateSlug,
  updateHomepageFeaturedBlogs,
  BlogPost 
} from '../../services/blogService';
import { 
  fetchNationalRates, 
  saveNationalRate, 
  deleteNationalRate, 
  fetchInternationalRates, 
  saveInternationalRate, 
  deleteInternationalRate, 
  NationalRate, 
  InternationalRate 
} from '../../services/ratesService';
import { 
  fetchJobs, 
  saveJob, 
  deleteJob, 
  fetchJobApplications, 
  updateApplicationStatus, 
  deleteApplication, 
  JobPosting, 
  JobApplication 
} from '../../services/careersService';
import { 
  enrollMfa, 
  verifyMfaEnrollment,
  fetchUserRoles,
  grantUserAccess,
  updateUserRole,
  toggleUserActiveStatus,
  revokeUserAccess,
  UserRoleRecord,
  UserRoleType
} from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

import { INITIAL_SHIPMENTS } from '../../data/initialData';
import { Shipment, Milestone } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Switch } from '../../components/ui/Switch';
import { Dialog } from '../../components/ui/Dialog';
import { BcLogo } from '../../components/BcLogo';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { SEOHead } from '../../components/SEOHead';

type AdminTab = 
  | 'overview' 
  | 'shipments' 
  | 'inquiries' 
  | 'chatbot'
  | 'national-rates' 
  | 'international-rates' 
  | 'blogs' 
  | 'careers' 
  | 'users'
  | 'cursor-messages'
  | 'settings';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout: authLogout, role: currentAdminRole } = useAuth();
  
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Operational Data States
  const [inquiries, setInquiries] = useState<InquiryRecord[]>(getInitialInquiries());
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [nationalRates, setNationalRates] = useState<NationalRate[]>([]);
  const [internationalRates, setInternationalRates] = useState<InternationalRate[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [cursorMessagesList, setCursorMessagesList] = useState<CursorMessageItem[]>(() => getCursorMessages());
  const [newCursorText, setNewCursorText] = useState('');
  const [newCursorCategory, setNewCursorCategory] = useState<CursorMessageItem['category']>('brand');

  // User Allowlist / Access Control States
  const [userRoles, setUserRoles] = useState<UserRoleRecord[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);
  const [grantEmail, setGrantEmail] = useState('');
  const [grantRole, setGrantRole] = useState<UserRoleType>('operations');
  const [grantLoading, setGrantLoading] = useState(false);
  const [grantError, setGrantError] = useState<string | null>(null);

  const [shipments, setShipments] = useState<Shipment[]>(() => {
    try {
      const saved = localStorage.getItem('bc_cargo_shipments');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_SHIPMENTS;
  });

  // Dialog Modal States
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [isAiFixerModalOpen, setIsAiFixerModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Partial<BlogPost>>({});
  const [blogSearchQuery, setBlogSearchQuery] = useState('');
  const [blogCategoryFilter, setBlogCategoryFilter] = useState('all');
  const [blogStatusFilter, setBlogStatusFilter] = useState('all');
  const [imageCompressing, setImageCompressing] = useState(false);
  const [imageCompressStats, setImageCompressStats] = useState<ImageOptimizationResult | null>(null);
  const [slugValidationMsg, setSlugValidationMsg] = useState<{ message: string; available: boolean } | null>(null);

  const [isNationalRateModalOpen, setIsNationalRateModalOpen] = useState(false);
  const [editingNationalRate, setEditingNationalRate] = useState<Partial<NationalRate>>({});

  const [isIntlRateModalOpen, setIsIntlRateModalOpen] = useState(false);
  const [editingIntlRate, setEditingIntlRate] = useState<Partial<InternationalRate>>({});

  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Partial<JobPosting>>({});

  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneLocation, setNewMilestoneLocation] = useState('');

  // MFA Enrollment Modal State
  const [isMfaModalOpen, setIsMfaModalOpen] = useState(false);
  const [mfaFactor, setMfaFactor] = useState<{ id: string; secret?: string; uri?: string } | null>(null);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaMessage, setMfaMessage] = useState<string | null>(null);
  const [mfaSuccess, setMfaSuccess] = useState(false);

  // Initial Data Fetching
  useEffect(() => {
    getInquiries().then(data => setInquiries(data));
    fetchAllBlogs().then(data => setBlogs(data));
    fetchNationalRates().then(data => setNationalRates(data));
    fetchInternationalRates().then(data => setInternationalRates(data));
    fetchJobs().then(data => setJobs(data));
    fetchJobApplications().then(data => setApplications(data));
    fetchUserRoles().then(data => setUserRoles(data));
  }, []);

  const handleLogout = async () => {
    await authLogout();
    navigate('/');
  };

  // User Allowlist Filtered List
  const filteredUserRoles = useMemo(() => {
    return userRoles.filter(u => 
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(userSearchQuery.toLowerCase())
    );
  }, [userRoles, userSearchQuery]);

  // User Management Actions
  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setGrantError(null);
    setGrantLoading(true);

    try {
      const res = await grantUserAccess(grantEmail, grantRole, user?.email || undefined);
      if (res.error) {
        setGrantError(res.error);
        return;
      }

      const updated = await fetchUserRoles();
      setUserRoles(updated);
      setIsGrantModalOpen(false);
      setGrantEmail('');
      setGrantRole('operations');
    } catch (err: any) {
      setGrantError(err.message || 'Failed to pre-authorize user.');
    } finally {
      setGrantLoading(false);
    }
  };

  const handleUpdateRole = async (id: string, newRole: UserRoleType, targetEmail: string) => {
    const res = await updateUserRole(id, newRole, targetEmail, user?.email || undefined);
    if (res.success) {
      const updated = await fetchUserRoles();
      setUserRoles(updated);
    } else {
      alert(`Role update failed: ${res.error}`);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean, targetEmail: string) => {
    const res = await toggleUserActiveStatus(id, !currentActive, targetEmail, user?.email || undefined);
    if (res.success) {
      const updated = await fetchUserRoles();
      setUserRoles(updated);
    } else {
      alert(`Status update failed: ${res.error}`);
    }
  };

  const handleRevokeAccess = async (id: string, targetEmail: string, role: UserRoleType) => {
    // Super Admin Protection check
    if (role === 'super_admin') {
      const superAdminCount = userRoles.filter(u => u.role === 'super_admin' && u.active).length;
      if (superAdminCount <= 1) {
        alert('Cannot revoke access for the final active super_admin.');
        return;
      }
    }

    if (window.confirm(`Revoke admin access for ${targetEmail}?`)) {
      const res = await revokeUserAccess(id, targetEmail, user?.email || undefined);
      if (res.success) {
        const updated = await fetchUserRoles();
        setUserRoles(updated);
      } else {
        alert(`Revoke failed: ${res.error}`);
      }
    }
  };

  // ==========================================================================
  // SHIPMENT OPERATIONS
  // ==========================================================================
  const handleUpdateShipmentStatus = (trackingNum: string, newStatus: any) => {
    const updated = shipments.map(s => {
      if (s.trackingNumber === trackingNum) {
        return { ...s, status: newStatus };
      }
      return s;
    });
    setShipments(updated);
    localStorage.setItem('bc_cargo_shipments', JSON.stringify(updated));
    if (selectedShipment?.trackingNumber === trackingNum) {
      setSelectedShipment({ ...selectedShipment, status: newStatus });
    }
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipment || !newMilestoneTitle) return;

    const newM: Milestone = {
      id: `m-${Date.now()}`,
      title: newMilestoneTitle,
      location: newMilestoneLocation || 'Hetauda Hub, Nepal',
      timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      status: 'completed',
      verifier: 'Admin Command Desk'
    };

    const updated = shipments.map(s => {
      if (s.trackingNumber === selectedShipment.trackingNumber) {
        return {
          ...s,
          milestones: [...s.milestones, newM]
        };
      }
      return s;
    });

    setShipments(updated);
    localStorage.setItem('bc_cargo_shipments', JSON.stringify(updated));
    setSelectedShipment(prev => prev ? { ...prev, milestones: [...prev.milestones, newM] } : null);
    setIsMilestoneModalOpen(false);
    setNewMilestoneTitle('');
    setNewMilestoneLocation('');
  };

  // ==========================================================================
  // INQUIRY ACTIONS
  // ==========================================================================
  const handleInquiryStatusChange = async (id: string, newStatus: InquiryRecord['status']) => {
    const updated = await updateInquiryStatus(id, newStatus);
    setInquiries(updated);
  };

  const handleDeleteInquiry = async (id: string) => {
    if (window.confirm('Delete this inquiry record permanently?')) {
      const updated = await deleteInquiry(id);
      setInquiries(updated);
    }
  };

  // ==========================================================================
  // BLOG CMS ACTIONS
  // ==========================================================================
  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) => {
      const matchesSearch =
        b.title.toLowerCase().includes(blogSearchQuery.toLowerCase()) ||
        b.category.toLowerCase().includes(blogSearchQuery.toLowerCase()) ||
        b.authorName.toLowerCase().includes(blogSearchQuery.toLowerCase()) ||
        b.slug.toLowerCase().includes(blogSearchQuery.toLowerCase());

      const matchesCategory = blogCategoryFilter === 'all' || b.category === blogCategoryFilter;

      let matchesStatus = true;
      if (blogStatusFilter === 'published') matchesStatus = b.published;
      if (blogStatusFilter === 'draft') matchesStatus = !b.published;
      if (blogStatusFilter === 'featured') matchesStatus = !!b.featuredOnHomepage;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [blogs, blogSearchQuery, blogCategoryFilter, blogStatusFilter]);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageCompressing(true);
    setImageCompressStats(null);
    try {
      const result = await compressAndProcessImage(file, 1200, 800, 0.8);
      setEditingBlog(prev => ({ ...prev, coverImageUrl: result.url }));
      setImageCompressStats(result);
    } catch (err: any) {
      alert(`Image processing failed: ${err.message}`);
    } finally {
      setImageCompressing(false);
    }
  };

  const handleCheckSlugAvailability = async () => {
    const targetSlug = editingBlog.slug || generateSlug(editingBlog.title || '');
    if (!targetSlug) return;
    const res = await checkSlugAvailability(targetSlug, editingBlog.id);
    if (res.available) {
      setSlugValidationMsg({ message: `✓ Slug "${targetSlug}" is valid and available.`, available: true });
    } else {
      setSlugValidationMsg({ 
        message: `✕ Slug "${targetSlug}" already taken. Suggested: "${res.suggestedSlug}"`, 
        available: false 
      });
      if (res.suggestedSlug) {
        setEditingBlog(prev => ({ ...prev, slug: res.suggestedSlug }));
      }
    }
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog.title || !editingBlog.content) {
      alert('Please fill in required fields: Article Title and Content.');
      return;
    }

    const blogToSave: BlogPost = {
      id: editingBlog.id || `BLOG-${Math.floor(100 + Math.random() * 900)}`,
      title: editingBlog.title,
      slug: editingBlog.slug || generateSlug(editingBlog.title),
      excerpt: editingBlog.excerpt || '',
      content: editingBlog.content,
      coverImageUrl: editingBlog.coverImageUrl || 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80',
      coverImageAlt: editingBlog.coverImageAlt || editingBlog.title,
      authorName: editingBlog.authorName || 'BC Cargo Team',
      category: editingBlog.category || 'Air Freight',
      readTime: editingBlog.readTime || '4 min read',
      published: editingBlog.published ?? true,
      publishedAt: editingBlog.publishedAt || new Date().toISOString(),
      seoTitle: editingBlog.seoTitle || editingBlog.title,
      seoDescription: editingBlog.seoDescription || editingBlog.excerpt,
      canonicalUrl: editingBlog.canonicalUrl || '',
      featuredOnHomepage: editingBlog.featuredOnHomepage || false,
      homepageOrder: editingBlog.homepageOrder || undefined,
      status: (editingBlog.published ?? true) ? 'published' : 'draft'
    };

    const updated = await saveBlogPostAsync(blogToSave);
    setBlogs(updated);
    setIsBlogModalOpen(false);
    setEditingBlog({});
    setImageCompressStats(null);
    setSlugValidationMsg(null);
  };

  const handleToggleBlogFeatured = async (blog: BlogPost) => {
    const currentFeatured = blogs
      .filter(b => b.featuredOnHomepage && b.id !== blog.id)
      .map(b => ({ id: b.id, order: b.homepageOrder || 1 }));

    if (!blog.featuredOnHomepage) {
      if (currentFeatured.length >= 3) {
        alert('Maximum 3 blogs can be featured on the homepage. Please unfeature an existing blog first or change slot selection.');
        return;
      }
      currentFeatured.push({ id: blog.id, order: currentFeatured.length + 1 });
    }

    const updated = await updateHomepageFeaturedBlogs(currentFeatured);
    setBlogs(updated);
  };

  const handleAssignHomepageSlot = async (slotNumber: number, selectedBlogId: string) => {
    const currentFeatured = blogs
      .filter(b => b.featuredOnHomepage)
      .sort((a, b) => (a.homepageOrder || 99) - (b.homepageOrder || 99));

    let newSlots = currentFeatured.filter(b => b.homepageOrder !== slotNumber);

    if (selectedBlogId) {
      const targetBlog = blogs.find(b => b.id === selectedBlogId);
      if (targetBlog) {
        newSlots = newSlots.filter(b => b.id !== selectedBlogId);
        newSlots.push({ ...targetBlog, featuredOnHomepage: true, homepageOrder: slotNumber });
      }
    }

    const payload = newSlots.map((b, idx) => ({ id: b.id, order: b.homepageOrder || (idx + 1) }));
    const updated = await updateHomepageFeaturedBlogs(payload);
    setBlogs(updated);
  };

  const handleDeleteBlog = async (id: string) => {
    if (window.confirm('Are you sure you want to delete/archive this blog post?')) {
      const updated = await deleteBlogPostAsync(id);
      setBlogs(updated);
    }
  };

  // ==========================================================================
  // RATES TARIFF ACTIONS
  // ==========================================================================
  const handleSaveNationalRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNationalRate.destinationRegion || !editingNationalRate.baseRateNpr) return;

    const rateToSave: NationalRate = {
      id: editingNationalRate.id || `NR-${Math.floor(10 + Math.random() * 90)}`,
      serviceName: editingNationalRate.serviceName || 'Express Parcel',
      originRegion: editingNationalRate.originRegion || 'Kathmandu Valley',
      destinationRegion: editingNationalRate.destinationRegion,
      minWeightKg: editingNationalRate.minWeightKg || 0,
      maxWeightKg: editingNationalRate.maxWeightKg || 1,
      baseRateNpr: editingNationalRate.baseRateNpr,
      perKgRateNpr: editingNationalRate.perKgRateNpr || 0,
      effectiveDate: editingNationalRate.effectiveDate || new Date().toISOString().split('T')[0]
    };

    const updated = await saveNationalRate(rateToSave);
    setNationalRates(updated);
    setIsNationalRateModalOpen(false);
    setEditingNationalRate({});
  };

  const handleDeleteNationalRate = async (id: string) => {
    if (window.confirm('Delete this national rate record?')) {
      const updated = await deleteNationalRate(id);
      setNationalRates(updated);
    }
  };

  const handleSaveIntlRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIntlRate.countryName || !editingIntlRate.rateUsd) return;

    const rateToSave: InternationalRate = {
      id: editingIntlRate.id || `IR-${Math.floor(10 + Math.random() * 90)}`,
      countryCode: editingIntlRate.countryCode || 'GEN',
      countryName: editingIntlRate.countryName,
      serviceName: editingIntlRate.serviceName || 'Air Freight Express',
      minWeightKg: editingIntlRate.minWeightKg || 0.5,
      maxWeightKg: editingIntlRate.maxWeightKg || 5,
      rateUsd: editingIntlRate.rateUsd,
      effectiveDate: editingIntlRate.effectiveDate || new Date().toISOString().split('T')[0]
    };

    const updated = await saveInternationalRate(rateToSave);
    setInternationalRates(updated);
    setIsIntlRateModalOpen(false);
    setEditingIntlRate({});
  };

  const handleDeleteIntlRate = async (id: string) => {
    if (window.confirm('Delete this international rate record?')) {
      const updated = await deleteInternationalRate(id);
      setInternationalRates(updated);
    }
  };

  // ==========================================================================
  // CAREERS ACTIONS
  // ==========================================================================
  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob.title || !editingJob.department) return;

    const jobToSave: JobPosting = {
      id: editingJob.id || `JOB-${Date.now().toString().slice(-4)}`,
      title: editingJob.title,
      slug: editingJob.slug || editingJob.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      department: editingJob.department,
      location: editingJob.location || 'Kathmandu Hub',
      type: (editingJob.type as any) || 'Full-time',
      description: editingJob.description || '',
      requirements: Array.isArray(editingJob.requirements) ? editingJob.requirements : ['Relevant logistics background'],
      responsibilities: Array.isArray(editingJob.responsibilities) ? editingJob.responsibilities : ['Coordinate dispatch manifests'],
      published: editingJob.published ?? true,
      createdAt: editingJob.createdAt || new Date().toISOString()
    };

    await saveJob(jobToSave);
    const updatedJobs = await fetchJobs();
    setJobs(updatedJobs);
    setIsJobModalOpen(false);
  };

  const handleDeleteJob = async (id: string) => {
    if (window.confirm('Archive this job posting?')) {
      await deleteJob(id);
      const updatedJobs = await fetchJobs();
      setJobs(updatedJobs);
    }
  };

  const handleApplicationStatusChange = async (id: string, status: JobApplication['status']) => {
    await updateApplicationStatus(id, status);
    const updatedApps = await fetchJobApplications();
    setApplications(updatedApps);
  };

  const handleDeleteApplication = async (id: string) => {
    if (window.confirm('Remove applicant record?')) {
      await deleteApplication(id);
      const updatedApps = await fetchJobApplications();
      setApplications(updatedApps);
    }
  };

  // ==========================================================================
  // MFA TOTP SETUP
  // ==========================================================================
  const handleStartMfaEnrollment = async () => {
    setIsMfaModalOpen(true);
    setMfaMessage(null);
    setMfaSuccess(false);

    const res = await enrollMfa();
    if (res.error) {
      setMfaMessage(res.error);
    } else if (res.factor) {
      setMfaFactor(res.factor);
    }
  };

  const handleVerifyMfaEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaFactor) return;

    const res = await verifyMfaEnrollment(mfaFactor.id, mfaCode);
    if (res.error) {
      setMfaMessage(res.error);
      setMfaSuccess(false);
    } else {
      setMfaSuccess(true);
      setMfaMessage('MFA TOTP successfully enrolled and verified for this administrator account.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#040817] text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      <SEOHead
        title="Operations Control Console | BC Cargo & Courier"
        description="Administrative operations dashboard for shipment management, inquiry processing, rate configuration, and CMS publishing."
      />

      {/* Top Operations Header Bar */}
      <header className="bg-white dark:bg-[#071A33] border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <div className="flex items-center gap-3">
            <BcLogo size="sm" showSubtitle={false} />
            <span className="hidden sm:inline-block font-mono text-xs px-2.5 py-0.5 rounded bg-[#0E1638] text-white font-bold uppercase tracking-wider">
              Control Console
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#0B2445] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>User: <strong className="text-slate-900 dark:text-white font-bold">{user?.email}</strong></span>
            <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 font-bold text-[10px] uppercase">
              {currentAdminRole || 'ADMIN'}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="text-red-500 hover:text-red-600 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 gap-6">
        
        {/* Navigation Sidebar */}
        <aside className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block w-full md:w-64 shrink-0 flex flex-col gap-2`}>
          <div className="bg-white dark:bg-[#071A33] border border-slate-200 dark:border-slate-800 rounded-2xl p-3 flex flex-col gap-1 shadow-sm">
            {[
              { id: 'overview', label: 'Dashboard Overview', icon: BarChart3 },
              { id: 'shipments', label: 'Shipments & AWBs', icon: PackageCheck, count: shipments.length },
              { id: 'inquiries', label: 'Customer Inquiries', icon: Mail, count: inquiries.filter(i => i.status === 'new').length },
              { id: 'chatbot', label: 'AI Chatbot Control', icon: Bot },
              { id: 'national-rates', label: 'National Tariffs', icon: MapPin },
              { id: 'international-rates', label: 'Worldwide Tariffs', icon: Globe2 },
              { id: 'blogs', label: 'Blogs & Articles', icon: BookOpen },
              { id: 'careers', label: 'Careers & Candidates', icon: Briefcase, count: applications.length },
              { id: 'users', label: 'Users & Access', icon: UserCheck, count: userRoles.length },
              { id: 'cursor-messages', label: 'Cursor & Interaction Messages', icon: MousePointer, count: cursorMessagesList.filter(c => c.enabled).length },
              { id: 'settings', label: 'Security & Governance', icon: Settings }
            ].map((nav) => {
              const Icon = nav.icon;
              const isActive = activeTab === nav.id;

              return (
                <button
                  key={nav.id}
                  onClick={() => {
                    setActiveTab(nav.id as AdminTab);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#0B5ED7] text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#0B2445]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{nav.label}</span>
                  </div>
                  {nav.count !== undefined && nav.count > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      isActive ? 'bg-white text-[#0B5ED7]' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      {nav.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col gap-6 overflow-hidden">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <h2 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white uppercase tracking-tight">
                  Operations Overview
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  Live cargo throughput, pending inquiries, and system metrics
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-5 flex items-center justify-between border-l-4 border-l-[#0B5ED7]">
                  <div className="flex flex-col">
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase">Active Shipments</span>
                    <strong className="text-2xl font-heading font-extrabold text-slate-900 dark:text-white">{shipments.length}</strong>
                  </div>
                  <PackageCheck className="w-8 h-8 text-[#0B5ED7] opacity-80" />
                </Card>

                <Card className="p-5 flex items-center justify-between border-l-4 border-l-amber-500">
                  <div className="flex flex-col">
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase">New Inquiries</span>
                    <strong className="text-2xl font-heading font-extrabold text-amber-500">
                      {inquiries.filter(i => i.status === 'new').length}
                    </strong>
                  </div>
                  <Mail className="w-8 h-8 text-amber-500 opacity-80" />
                </Card>

                <Card className="p-5 flex items-center justify-between border-l-4 border-l-emerald-500">
                  <div className="flex flex-col">
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase">Published Articles</span>
                    <strong className="text-2xl font-heading font-extrabold text-emerald-500">{blogs.length}</strong>
                  </div>
                  <BookOpen className="w-8 h-8 text-emerald-500 opacity-80" />
                </Card>

                <Card className="p-5 flex items-center justify-between border-l-4 border-l-purple-500">
                  <div className="flex flex-col">
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase">Authorized Staff</span>
                    <strong className="text-2xl font-heading font-extrabold text-purple-500">{userRoles.length}</strong>
                  </div>
                  <UserCheck className="w-8 h-8 text-purple-500 opacity-80" />
                </Card>
              </div>

              {/* Recent Active Shipments Quick Summary */}
              <Card className="p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white uppercase tracking-wider">
                    Recent Express Cargo Movements
                  </h3>
                  <Button size="sm" variant="outline" onClick={() => setActiveTab('shipments')}>
                    View All Cargo
                  </Button>
                </div>

                <div className="space-y-3">
                  {shipments.slice(0, 3).map((shipment) => (
                    <div key={shipment.trackingNumber} className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#071A33] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                      <div className="flex items-center gap-3">
                        <strong className="text-[#0B5ED7]">{shipment.trackingNumber}</strong>
                        <span>{shipment.origin} ➔ {shipment.destination}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 font-bold uppercase">{shipment.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* TAB: BLOGS & ARTICLES CMS */}
          {activeTab === 'blogs' && (
            <div className="flex flex-col gap-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-[#0B5ED7]" />
                    <span>Blog CMS &amp; Content Management</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    Create articles, edit SEO parameters, compress images, and run AI grammar corrections
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="primary"
                    onClick={() => {
                      setEditingBlog({
                        title: '',
                        slug: '',
                        excerpt: '',
                        content: '',
                        category: 'Air Freight',
                        authorName: user?.email || 'BC Cargo Team',
                        published: true,
                        featuredOnHomepage: false
                      });
                      setImageCompressStats(null);
                      setSlugValidationMsg(null);
                      setIsBlogModalOpen(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    <span>New Article</span>
                  </Button>
                </div>
              </div>

              {/* Homepage Slot Controller Card */}
              <Card className="p-5 flex flex-col gap-4 border-l-4 border-l-[#F5C84C] bg-white dark:bg-[#071A33]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-[#F5C84C] fill-[#F5C84C]" />
                    <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wide">
                      Homepage Featured Articles Controller (Max 3)
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    Admin-controlled backend selection for main landing page
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[1, 2, 3].map((slotNum) => {
                    const currentFeaturedBlog = blogs.find(
                      b => b.featuredOnHomepage && b.homepageOrder === slotNum
                    );
                    const publishedBlogs = blogs.filter(b => b.published);

                    return (
                      <div key={slotNum} className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B2445] border border-slate-200 dark:border-slate-800 flex flex-col gap-2">
                        <div className="flex items-center justify-between font-mono text-xs">
                          <span className="font-bold text-[#0B5ED7]">Slot #{slotNum}</span>
                          {currentFeaturedBlog && (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase">
                              Active
                            </span>
                          )}
                        </div>

                        <select
                          value={currentFeaturedBlog?.id || ''}
                          onChange={(e) => handleAssignHomepageSlot(slotNum, e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#071A33] border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#0B5ED7]"
                        >
                          <option value="">-- None Selected --</option>
                          {publishedBlogs.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.title.slice(0, 35)}...
                            </option>
                          ))}
                        </select>

                        {currentFeaturedBlog ? (
                          <div className="text-[11px] text-slate-500 line-clamp-1 font-mono">
                            Slug: /{currentFeaturedBlog.slug}
                          </div>
                        ) : (
                          <div className="text-[11px] text-amber-500 font-mono italic">
                            Empty Slot
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Filters Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search title, category, author, slug..."
                    value={blogSearchQuery}
                    onChange={(e) => setBlogSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-[#0B2445] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#0B5ED7]"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={blogCategoryFilter}
                    onChange={(e) => setBlogCategoryFilter(e.target.value)}
                    className="px-3 py-2 text-xs bg-white dark:bg-[#0B2445] border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="all">All Categories</option>
                    {Array.from(new Set(blogs.map(b => b.category))).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>

                  <select
                    value={blogStatusFilter}
                    onChange={(e) => setBlogStatusFilter(e.target.value)}
                    className="px-3 py-2 text-xs bg-white dark:bg-[#0B2445] border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="published">Published</option>
                    <option value="draft">Drafts Only</option>
                    <option value="featured">Featured on Homepage</option>
                  </select>
                </div>
              </div>

              {/* Blogs Table */}
              <Card className="p-0 overflow-hidden shadow-md">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                    <thead className="bg-slate-50 dark:bg-[#060919] uppercase font-mono text-[10px] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="p-4 font-bold">Cover</th>
                        <th className="p-4 font-bold">Article Title &amp; Slug</th>
                        <th className="p-4 font-bold">Category</th>
                        <th className="p-4 font-bold">Status</th>
                        <th className="p-4 font-bold">Homepage</th>
                        <th className="p-4 font-bold">Published Date</th>
                        <th className="p-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredBlogs.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-400 font-mono">
                            No blog posts found matching your filter criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredBlogs.map((post) => (
                          <tr key={post.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                            <td className="p-4">
                              <div className="w-12 h-10 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                                {post.coverImageUrl ? (
                                  <img src={post.coverImageUrl} alt={post.title} className="w-full h-full object-cover" />
                                ) : (
                                  <ImageIcon className="w-5 h-5 m-auto text-slate-400" />
                                )}
                              </div>
                            </td>
                            <td className="p-4 max-w-xs">
                              <div className="flex flex-col gap-0.5">
                                <strong className="font-heading font-bold text-slate-900 dark:text-white line-clamp-1">
                                  {post.title}
                                </strong>
                                <span className="font-mono text-[10px] text-slate-400 truncate">
                                  /blogs/{post.slug}
                                </span>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                {post.category}
                              </span>
                            </td>
                            <td className="p-4 font-mono">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                post.published 
                                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' 
                                  : 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                              }`}>
                                {post.published ? 'PUBLISHED' : 'DRAFT'}
                              </span>
                            </td>
                            <td className="p-4 font-mono">
                              {post.featuredOnHomepage ? (
                                <button
                                  type="button"
                                  onClick={() => handleToggleBlogFeatured(post)}
                                  className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-[#F5C84C]/20 text-[#D97706] dark:text-[#F5C84C] border border-[#F5C84C]/50 flex items-center gap-1 cursor-pointer"
                                  title="Click to remove from homepage"
                                >
                                  <Star className="w-3 h-3 fill-current" />
                                  <span>Slot #{post.homepageOrder || 1}</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleToggleBlogFeatured(post)}
                                  className="px-2 py-0.5 rounded text-[10px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-mono transition-colors cursor-pointer"
                                >
                                  + Feature
                                </button>
                              )}
                            </td>
                            <td className="p-4 font-mono text-[11px] text-slate-400">
                              {new Date(post.publishedAt).toLocaleDateString()}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Link
                                  to={`/blogs/${post.slug}`}
                                  target="_blank"
                                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                  title="Preview Article"
                                >
                                  <Eye className="w-4 h-4" />
                                </Link>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingBlog(post);
                                    setIsAiFixerModalOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors cursor-pointer"
                                  title="✨ Run AI Fixer"
                                >
                                  <Sparkles className="w-4 h-4" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingBlog(post);
                                    setImageCompressStats(null);
                                    setSlugValidationMsg(null);
                                    setIsBlogModalOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors cursor-pointer"
                                  title="Edit Article"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteBlog(post.id)}
                                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                                  title="Delete Article"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 2: SHIPMENTS & AWBs */}
          {activeTab === 'shipments' && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white uppercase tracking-tight">
                    Shipment Operations &amp; Air Waybills
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    Update status, add tracking checkpoints, and inspect telemetry
                  </p>
                </div>
              </div>

              <Card className="p-0 overflow-hidden shadow-md">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                    <thead className="bg-slate-50 dark:bg-[#060919] uppercase font-mono text-[10px] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="p-4 font-bold">Tracking # / AWB</th>
                        <th className="p-4 font-bold">Service Mode</th>
                        <th className="p-4 font-bold">Origin ➔ Destination</th>
                        <th className="p-4 font-bold">Current Status</th>
                        <th className="p-4 font-bold">Weight</th>
                        <th className="p-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {shipments.map((s) => (
                        <tr key={s.trackingNumber} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                          <td className="p-4 font-bold font-mono text-[#0B5ED7]">{s.trackingNumber}</td>
                          <td className="p-4 text-slate-600 dark:text-slate-300">{s.serviceName}</td>
                          <td className="p-4 text-slate-900 dark:text-white">{s.origin} ➔ {s.destination}</td>
                          <td className="p-4">
                            <select
                              value={s.status}
                              onChange={(e) => handleUpdateShipmentStatus(s.trackingNumber, e.target.value)}
                              className="px-2 py-1 rounded bg-slate-100 dark:bg-[#0B2445] border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-blue-600 focus:outline-none"
                            >
                              <option value="Order Placed">Order Placed</option>
                              <option value="Picked Up">Picked Up</option>
                              <option value="In Transit">In Transit</option>
                              <option value="Customs Clearance">Customs Clearance</option>
                              <option value="Out for Delivery">Out for Delivery</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Exception">Exception</option>
                            </select>
                          </td>
                          <td className="p-4 font-mono">{s.chargeableWeightKg} kg</td>
                          <td className="p-4 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedShipment(s);
                                setIsMilestoneModalOpen(true);
                              }}
                            >
                              Add Milestone
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* TAB: AI CHATBOT CONTROL CENTER */}
          {activeTab === 'chatbot' && <AdminChatbotControl />}

          {/* TAB: USERS & ACCESS MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white uppercase tracking-tight">
                    Users &amp; Admin Access Control
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    Database allowlist controlling who can access the BC Cargo admin portal via Google OAuth
                  </p>
                </div>

                <Button
                  variant="primary"
                  onClick={() => setIsGrantModalOpen(true)}
                  disabled={!['super_admin', 'admin'].includes(currentAdminRole || '')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <span>Pre-Authorize Google Account</span>
                </Button>
              </div>

              {/* Controls Bar */}
              <div className="flex items-center justify-between gap-4">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search user email or role..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-[#0B2445] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#0B5ED7]"
                  />
                </div>

                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 hidden sm:inline">
                  Total Users: <strong className="text-slate-900 dark:text-white">{userRoles.length}</strong>
                </span>
              </div>

              {/* User Roles Table */}
              <Card className="p-0 overflow-hidden shadow-md">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                    <thead className="bg-slate-50 dark:bg-[#060919] uppercase font-mono text-[10px] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="p-4 font-bold">Authorized Google Email</th>
                        <th className="p-4 font-bold">Supabase User ID</th>
                        <th className="p-4 font-bold">Role</th>
                        <th className="p-4 font-bold">Status</th>
                        <th className="p-4 font-bold">Added Date</th>
                        <th className="p-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredUserRoles.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-400 font-mono">
                            No authorized users found matching "{userSearchQuery}".
                          </td>
                        </tr>
                      ) : (
                        filteredUserRoles.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                            <td className="p-4 font-bold text-slate-900 dark:text-white">
                              <div className="flex items-center gap-2">
                                <ShieldCheck className={`w-4 h-4 ${u.active ? 'text-emerald-500' : 'text-slate-400'}`} />
                                <span className="font-mono">{u.email}</span>
                              </div>
                            </td>
                            <td className="p-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                              {u.userId ? `${u.userId.slice(0, 8)}...` : <span className="italic text-amber-500">Pending First Login</span>}
                            </td>
                            <td className="p-4">
                              <select
                                value={u.role}
                                disabled={!['super_admin', 'admin'].includes(currentAdminRole || '')}
                                onChange={(e) => handleUpdateRole(u.id, e.target.value as UserRoleType, u.email)}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#0B2445] border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold uppercase text-[#0B5ED7] focus:outline-none cursor-pointer disabled:opacity-50"
                              >
                                <option value="super_admin">SUPER_ADMIN</option>
                                <option value="admin">ADMIN</option>
                                <option value="editor">EDITOR</option>
                                <option value="operations">OPERATIONS</option>
                                <option value="support">SUPPORT</option>
                                <option value="read_only">READ_ONLY</option>
                              </select>
                            </td>
                            <td className="p-4 font-mono">
                              <button
                                type="button"
                                disabled={!['super_admin', 'admin'].includes(currentAdminRole || '')}
                                onClick={() => handleToggleActive(u.id, u.active, u.email)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                                  u.active 
                                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' 
                                    : 'bg-red-500/10 text-red-500 border border-red-500/30'
                                }`}
                              >
                                {u.active ? 'ACTIVE' : 'DISABLED'}
                              </button>
                            </td>
                            <td className="p-4 font-mono text-slate-400 text-[11px]">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-4 text-right">
                              <button
                                type="button"
                                disabled={!['super_admin', 'admin'].includes(currentAdminRole || '')}
                                onClick={() => handleRevokeAccess(u.id, u.email, u.role)}
                                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer disabled:opacity-50"
                                title="Revoke Admin Access"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* TAB: CURSOR & INTERACTION MESSAGES */}
          {activeTab === 'cursor-messages' && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                    <MousePointer className="w-6 h-6 text-[#F5C84C]" />
                    <span>Cursor Text Flag &amp; Interaction Messages</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    Manage the dynamic text trail messages displayed on mouse movement across public pages
                  </p>
                </div>
              </div>

              {/* Add New Cursor Message Form Card */}
              <Card className="p-5 flex flex-col gap-4 border-l-4 border-l-[#F5C84C]">
                <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                  Add New Cursor Banner Message
                </h3>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newCursorText.trim()) return;
                    const updated = addCursorMessage(newCursorText, newCursorCategory);
                    setCursorMessagesList(updated);
                    setNewCursorText('');
                  }} 
                  className="flex flex-col sm:flex-row gap-3 items-end"
                >
                  <div className="flex-1 space-y-1 w-full">
                    <label className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase">
                      Message Text *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Express Air Cargo Dispatch"
                      value={newCursorText}
                      onChange={(e) => setNewCursorText(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-white dark:bg-[#071A33] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#F5C84C] font-mono"
                    />
                  </div>

                  <div className="w-full sm:w-56 space-y-1">
                    <label className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase">
                      Category
                    </label>
                    <select
                      value={newCursorCategory}
                      onChange={(e) => setNewCursorCategory(e.target.value as any)}
                      className="w-full px-3.5 py-2 text-xs bg-white dark:bg-[#071A33] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#F5C84C] font-mono"
                    >
                      <option value="brand">Brand</option>
                      <option value="location">Location</option>
                      <option value="service">Service</option>
                      <option value="trust">Trust / Guarantee</option>
                      <option value="cta">Call to Action</option>
                      <option value="international">International</option>
                    </select>
                  </div>

                  <Button type="submit" variant="primary" className="shrink-0">
                    <Plus className="w-4 h-4 mr-1.5" />
                    <span>Add Message</span>
                  </Button>
                </form>
              </Card>

              {/* Cursor Messages Table */}
              <Card className="p-0 overflow-hidden shadow-md">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                    <thead className="bg-slate-50 dark:bg-[#060919] uppercase font-mono text-[10px] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="p-4 font-bold">Cursor Flag Message Text</th>
                        <th className="p-4 font-bold">Category</th>
                        <th className="p-4 font-bold">Status</th>
                        <th className="p-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {cursorMessagesList.map((msg) => (
                        <tr key={msg.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                          <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                            "{msg.text}"
                          </td>
                          <td className="p-4">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {msg.category}
                            </span>
                          </td>
                          <td className="p-4">
                            <button
                              type="button"
                              onClick={() => {
                                const updated = updateCursorMessage(msg.id, { enabled: !msg.enabled });
                                setCursorMessagesList(updated);
                              }}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase transition-colors cursor-pointer ${
                                msg.enabled 
                                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' 
                                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700'
                              }`}
                            >
                              {msg.enabled ? 'ACTIVE' : 'DISABLED'}
                            </button>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Delete message "${msg.text}"?`)) {
                                  const updated = deleteCursorMessage(msg.id);
                                  setCursorMessagesList(updated);
                                }
                              }}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                              title="Delete Message"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* TAB: SETTINGS & GOVERNANCE */}
          {activeTab === 'settings' && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <h2 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white uppercase tracking-tight">
                  Security &amp; Governance
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  Multi-Factor TOTP authentication and system diagnostics
                </p>
              </div>

              {/* MFA & Account Security Card */}
              <Card className="p-6 flex flex-col gap-6 border-l-4 border-l-[#0B5ED7]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-[#0B5ED7]">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                        Admin Account &amp; Multi-Factor Authentication (TOTP)
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Required for super_admin and admin roles accessing operations control centers.
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    onClick={handleStartMfaEnrollment}
                    className="shrink-0"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    <span>Setup TOTP MFA</span>
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#071A33] border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Authenticated Email:</span>
                    <strong className="text-slate-900 dark:text-white">{user?.email || 'System Admin'}</strong>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#071A33] border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned RBAC Role:</span>
                    <strong className="text-[#0B5ED7] uppercase">{currentAdminRole || 'super_admin'}</strong>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#071A33] border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Supabase Auth Provider:</span>
                    <strong className="text-emerald-500">Google Cloud OAuth</strong>
                  </div>
                </div>
              </Card>
            </div>
          )}

        </main>
      </div>

      {/* MODAL: PRE-AUTHORIZE GOOGLE ACCOUNT */}
      <Dialog
        isOpen={isGrantModalOpen}
        onClose={() => setIsGrantModalOpen(false)}
        title="Pre-Authorize Google Account for Admin Access"
        maxWidth="md"
      >
        <form onSubmit={handleGrantAccess} className="flex flex-col gap-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enter the exact Google email address of the person you want to allow into the BC Cargo admin portal. When they sign in with Google, the database will grant them access according to the assigned role.
          </p>

          {grantError && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{grantError}</span>
            </div>
          )}

          <Input
            label="Google Email Address *"
            type="email"
            placeholder="e.g. employee@gmail.com"
            value={grantEmail}
            onChange={(e) => setGrantEmail(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Assigned Role *
            </label>
            <select
              value={grantRole}
              onChange={(e) => setGrantRole(e.target.value as UserRoleType)}
              className="w-full h-10 px-3 bg-white dark:bg-[#0B2445] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold uppercase text-slate-900 dark:text-white focus:outline-none focus:border-[#0B5ED7]"
            >
              <option value="operations">OPERATIONS (Manage Shipments & AWBs)</option>
              <option value="editor">EDITOR (CMS, Blogs, Rates & Content)</option>
              <option value="admin">ADMIN (Full Admin Access)</option>
              <option value="super_admin">SUPER_ADMIN (Full Admin + Access Management)</option>
              <option value="support">SUPPORT (Inquiries & Customer Service)</option>
              <option value="read_only">READ_ONLY (View Only)</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setIsGrantModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={grantLoading}>
              {grantLoading ? 'Saving Access Record...' : 'Grant Access'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* MODAL: CREATE / EDIT BLOG ARTICLE */}
      <Dialog
        isOpen={isBlogModalOpen}
        onClose={() => setIsBlogModalOpen(false)}
        title={editingBlog.id ? `Edit Article: ${editingBlog.title}` : 'Create New Article'}
        maxWidth="3xl"
      >
        <form onSubmit={handleSaveBlog} className="flex flex-col gap-5 text-xs text-slate-700 dark:text-slate-300">
          
          {/* Header Action Bar with AI Fixer */}
          <div className="p-3.5 rounded-xl bg-[#F5C84C]/10 border border-[#F5C84C]/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#D97706] dark:text-[#F5C84C]" />
              <div className="flex flex-col">
                <strong className="font-bold text-slate-900 dark:text-white uppercase font-mono text-[11px]">
                  ✨ AI Blog Grammar &amp; Readability Fixer
                </strong>
                <span className="text-[10px] text-slate-500">
                  Run Gemma 4 / Poolside AI correction before publishing
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAiFixerModalOpen(true)}
              className="border-purple-500 text-purple-600 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-purple-500" />
              <span>Launch AI Fixer</span>
            </Button>
          </div>

          {/* Grid Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Article Title *"
              required
              placeholder="e.g. How to Send Parcel from Nepal to Korea"
              value={editingBlog.title || ''}
              onChange={(e) => {
                const newTitle = e.target.value;
                setEditingBlog(prev => ({
                  ...prev,
                  title: newTitle,
                  slug: prev.slug || generateSlug(newTitle)
                }));
              }}
            />

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>URL Slug *</span>
                <button
                  type="button"
                  onClick={handleCheckSlugAvailability}
                  className="text-[10px] text-[#0B5ED7] hover:underline font-mono font-bold uppercase cursor-pointer"
                >
                  Verify Slug
                </button>
              </label>
              <Input
                required
                placeholder="e.g. how-to-send-parcel-nepal-korea"
                value={editingBlog.slug || ''}
                onChange={(e) => setEditingBlog(prev => ({ ...prev, slug: generateSlug(e.target.value) }))}
                className="font-mono text-xs"
              />
              {slugValidationMsg && (
                <span className={`text-[10px] font-mono mt-0.5 ${slugValidationMsg.available ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {slugValidationMsg.message}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Category *</label>
              <select
                value={editingBlog.category || 'Air Freight'}
                onChange={(e) => setEditingBlog(prev => ({ ...prev, category: e.target.value }))}
                className="w-full h-10 px-3 bg-white dark:bg-[#0B2445] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold uppercase text-slate-900 dark:text-white focus:outline-none focus:border-[#0B5ED7]"
              >
                <option value="Air Freight">Air Freight</option>
                <option value="Ocean & Land">Ocean &amp; Land</option>
                <option value="Shipping Tips">Shipping Tips</option>
                <option value="Customs & Compliance">Customs &amp; Compliance</option>
                <option value="Logistics">Logistics</option>
                <option value="Company News">Company News</option>
              </select>
            </div>

            <Input
              label="Author Name *"
              required
              placeholder="e.g. Suresh Adhikari"
              value={editingBlog.authorName || 'BC Cargo Team'}
              onChange={(e) => setEditingBlog(prev => ({ ...prev, authorName: e.target.value }))}
            />
          </div>

          {/* Cover Image Upload & Compression */}
          <div className="flex flex-col gap-2 p-4 rounded-xl bg-slate-50 dark:bg-[#060919] border border-slate-200 dark:border-slate-800">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Cover Image Uploader &amp; Compression Pipeline</span>
              <span className="text-[10px] font-mono text-slate-400">WebP Auto-Compression</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              <div className="sm:col-span-2 flex flex-col gap-2">
                <Input
                  label="Image URL"
                  placeholder="https://images.unsplash.com/..."
                  value={editingBlog.coverImageUrl || ''}
                  onChange={(e) => setEditingBlog(prev => ({ ...prev, coverImageUrl: e.target.value }))}
                  className="font-mono text-xs"
                />

                <div className="flex items-center gap-2">
                  <label className="px-3 py-1.5 rounded-lg bg-[#0B5ED7] hover:bg-[#084298] text-white font-mono text-xs font-bold cursor-pointer flex items-center gap-1.5 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>

                  {imageCompressing && (
                    <span className="text-xs text-[#0B5ED7] font-mono flex items-center gap-1 animate-pulse">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Compressing image...
                    </span>
                  )}
                </div>
              </div>

              {/* Preview Thumbnail */}
              <div className="w-full h-24 rounded-lg bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 overflow-hidden relative flex items-center justify-center">
                {editingBlog.coverImageUrl ? (
                  <img src={editingBlog.coverImageUrl} alt={editingBlog.title || 'Cover'} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] font-mono text-slate-400">No Image</span>
                )}
              </div>
            </div>

            {/* Compression Stats */}
            {imageCompressStats && (
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-mono flex items-center justify-between">
                <span>Original: <strong>{imageCompressStats.originalSizeKb} KB</strong></span>
                <span>➜ Compressed: <strong>{imageCompressStats.compressedSizeKb} KB ({imageCompressStats.format.toUpperCase()})</strong></span>
                <strong className="text-emerald-500">{imageCompressStats.reductionPercentage}% Reduced</strong>
              </div>
            )}

            <Input
              label="Image Alt Text (Accessibility & SEO)"
              placeholder="e.g. BC Cargo international parcel packaging box"
              value={editingBlog.coverImageAlt || ''}
              onChange={(e) => setEditingBlog(prev => ({ ...prev, coverImageAlt: e.target.value }))}
            />
          </div>

          <Textarea
            label="Short Excerpt *"
            rows={2}
            required
            placeholder="Brief 1-2 sentence summary displayed on homepage cards..."
            value={editingBlog.excerpt || ''}
            onChange={(e) => setEditingBlog(prev => ({ ...prev, excerpt: e.target.value }))}
          />

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Article Content (Markdown Supported) *</label>
              <button
                type="button"
                onClick={() => setIsAiFixerModalOpen(true)}
                className="text-[11px] font-mono font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                <span>✨ Fix Grammar &amp; Formatting with AI</span>
              </button>
            </div>
            <Textarea
              rows={8}
              required
              placeholder="Write or paste your article content here..."
              value={editingBlog.content || ''}
              onChange={(e) => setEditingBlog(prev => ({ ...prev, content: e.target.value }))}
              className="font-mono text-xs leading-relaxed"
            />
          </div>

          {/* SEO Metadata Card */}
          <div className="flex flex-col gap-3 p-4 rounded-xl bg-slate-50 dark:bg-[#060919] border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold uppercase font-mono text-slate-500">SEO &amp; Open Graph Meta Configuration</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="SEO Title Tag"
                placeholder="Fallback to Article Title if empty"
                value={editingBlog.seoTitle || ''}
                onChange={(e) => setEditingBlog(prev => ({ ...prev, seoTitle: e.target.value }))}
              />
              <Input
                label="Canonical URL"
                placeholder="https://bccargo.com.np/blogs/..."
                value={editingBlog.canonicalUrl || ''}
                onChange={(e) => setEditingBlog(prev => ({ ...prev, canonicalUrl: e.target.value }))}
              />
            </div>
            <Textarea
              label="SEO Meta Description"
              rows={2}
              placeholder="Fallback to Article Excerpt if empty"
              value={editingBlog.seoDescription || ''}
              onChange={(e) => setEditingBlog(prev => ({ ...prev, seoDescription: e.target.value }))}
            />
          </div>

          {/* Publishing & Homepage Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-[#060919] border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-bold text-xs">Publish Immediately</span>
                <span className="text-[10px] text-slate-400">If disabled, article will be saved as a Private Draft</span>
              </div>
              <Switch
                checked={editingBlog.published ?? true}
                onChange={(checked) => setEditingBlog(prev => ({ ...prev, published: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-bold text-xs flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-[#F5C84C]" />
                  <span>Feature on Homepage</span>
                </span>
                <span className="text-[10px] text-slate-400">Display in main landing page section (max 3)</span>
              </div>
              <Switch
                checked={editingBlog.featuredOnHomepage ?? false}
                onChange={(checked) => setEditingBlog(prev => ({ ...prev, featuredOnHomepage: checked }))}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setIsBlogModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingBlog.id ? 'Save & Update Article' : 'Publish New Article'}
            </Button>
          </div>

        </form>
      </Dialog>

      {/* AI BLOG FIXER MODAL */}
      {isAiFixerModalOpen && (
        <AiBlogFixerModal
          isOpen={isAiFixerModalOpen}
          onClose={() => setIsAiFixerModalOpen(false)}
          title={editingBlog.title || ''}
          excerpt={editingBlog.excerpt || ''}
          content={editingBlog.content || ''}
          onApplyChanges={({ title, excerpt, content }) => {
            setEditingBlog(prev => ({
              ...prev,
              title,
              excerpt,
              content
            }));
          }}
        />
      )}

    </div>
  );
};
