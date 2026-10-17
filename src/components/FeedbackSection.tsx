import React, { useState, useEffect } from 'react';
import { Star, MessageSquarePlus, ThumbsUp, CheckCircle, X, Send, ChevronDown, RefreshCw } from 'lucide-react';
import { Card3D } from '../design/primitives/Card3D';
import { fetchReviewsPage, submitReview, DEFAULT_REVIEWS } from '../services/reviewService';

export interface FeedbackItem {
  id: string;
  name: string;
  role: string;
  company: string;
  rating: number;
  mode: string;
  comment: string;
  date: string;
  verified: boolean;
  avatarBg: string;
  isTop?: boolean;
}

export const FeedbackSection: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>(DEFAULT_REVIEWS);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newMode, setNewMode] = useState('Air Delivery');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    // Initial fetch for top 3 reviews
    let mounted = true;
    fetchReviewsPage({ limit: 3, offset: 0 }).then((res) => {
      if (mounted) {
        setFeedbacks(res.items);
        setHasMore(res.hasMore);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const res = await fetchReviewsPage({ limit: 10, offset: feedbacks.length });
      if (res.items.length > 0) {
        setFeedbacks((prev) => [...prev, ...res.items]);
        setHasMore(res.hasMore);
      } else {
        setHasMore(false);
      }
    } catch (e) {
      console.warn('Failed to load more reviews:', e);
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newComment.trim()) return;

    const colors = [
      'bg-[#002147] text-[#F2B705]',
      'bg-[#071A33] text-white',
      'bg-emerald-700 text-white',
      'bg-slate-700 text-white'
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newItemData = {
      name: newName.trim(),
      role: newRole.trim() || 'Verified Customer',
      company: newCompany.trim() || 'Personal / Business',
      rating: newRating,
      mode: newMode,
      comment: newComment.trim(),
      verified: false,
      avatarBg: randomColor,
      isTop: false
    };

    const res = await submitReview(newItemData);
    if (res.success) {
      setSuccessMsg(true);
      setTimeout(() => {
        setSuccessMsg(false);
        setIsModalOpen(false);
        setNewName('');
        setNewCompany('');
        setNewRole('');
        setNewComment('');
      }, 1500);
    }
  };

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="flex flex-col gap-2 max-w-2xl text-left">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#002147] font-mono">
            <ThumbsUp className="w-4 h-4 text-[#10B981]" />
            <span>Customer Reviews</span>
          </div>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-slate-900 tracking-tight headline-3d">
            Customer reviews
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Real reviews from people and businesses who send packages with The BC Cargo &amp; Courier.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="self-start md:self-auto px-4 py-2.5 rounded-[var(--r-sm)] bg-[#002147] hover:bg-[#123562] text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-hard-xs hover:-translate-y-0.5 active:translate-y-0.5 flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <MessageSquarePlus className="w-4 h-4 text-[#F5C84C]" />
          <span>Review</span>
        </button>
      </div>

      {/* Embedded Inline Review Form */}
      {isModalOpen && (
        <div className="mb-10 bg-[var(--surface)] rounded-[var(--r-md)] p-6 sm:p-8 shadow-hard-lg border border-[var(--line)] relative animate-fadeIn text-left">
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-[var(--r-sm)] bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            aria-label="Close review form"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-xs font-mono text-[#002147] uppercase font-bold mb-1">
            <MessageSquarePlus className="w-4 h-4 text-[#10B981]" />
            <span>Share Your Feedback</span>
          </div>
          <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900 mb-6">
            Submit Customer Review
          </h3>

          {successMsg ? (
            <div className="py-8 flex flex-col items-center justify-center text-center gap-3 bg-emerald-50/50 rounded-[var(--r-sm)] border border-emerald-200/60">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#10B981] flex items-center justify-center">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-900 text-lg">Thank You!</h4>
              <p className="text-xs text-slate-600 max-w-md">We received your review. It will appear here after our team approves it.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 font-mono">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Sujan Shrestha"
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-300 clay-inset text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#002147] focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 font-mono">Company / Business</label>
                  <input
                    type="text"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="e.g. Everest Exporters"
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-300 clay-inset text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#002147] focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 font-mono">Role / Title</label>
                  <input
                    type="text"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    placeholder="e.g. Freight Manager"
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-300 clay-inset text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#002147] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 font-mono">Delivery Service Type</label>
                  <select
                    value={newMode}
                    onChange={(e) => setNewMode(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-300 clay-inset text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#002147] focus:border-transparent transition-all"
                  >
                    <option value="Air Delivery">Air Delivery</option>
                    <option value="Sea Delivery">Sea Delivery</option>
                    <option value="Fast Courier">Fast Courier</option>
                    <option value="Road Delivery">Road Delivery</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 font-mono">Rating Score</label>
                  <select
                    value={newRating}
                    onChange={(e) => setNewRating(Number(e.target.value))}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-300 clay-inset text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#002147] focus:border-transparent transition-all"
                  >
                    <option value={5}>5 Stars - Excellent Service</option>
                    <option value={4}>4 Stars - Great Service</option>
                    <option value={3}>3 Stars - Good Service</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 font-mono">Your Experience &amp; Review *</label>
                <textarea
                  required
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Tell us how your package delivery went and your experience with our team..."
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-300 clay-inset text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#002147] focus:border-transparent transition-all"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="min-h-[44px] px-4 py-2 inline-flex items-center justify-center gap-1.5 rounded-[var(--r-sm)] border border-slate-300 text-slate-700 text-xs font-semibold uppercase hover:bg-slate-100 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B705]"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Close</span>
                </button>
                <button
                  type="submit"
                  disabled={!newName.trim() || !newComment.trim()}
                  className="min-h-[44px] px-6 py-2.5 inline-flex items-center justify-center rounded-[var(--r-sm)] bg-[#002147] hover:bg-[#123562] text-white text-xs font-semibold uppercase tracking-wider gap-2 shadow-hard-xs hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B705] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-3.5 h-3.5 text-[#F5C84C]" />
                  <span>Send</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {feedbacks.length === 0 && (
        <p className="rounded-[var(--r-md)] border border-dashed border-[#B9C6D8] bg-white p-6 text-base text-slate-700">
          No reviews yet. Sent a parcel with us? Tap Review and tell others how it went.
        </p>
      )}

      {/* Testimonials Grid with Card3D Tilt */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {feedbacks.map((fb) => (
          <Card3D
            key={fb.id}
            maxTilt={3.5}
            className="h-full bg-[var(--surface)] rounded-2xl p-6 border border-[var(--line)] shadow-hard-xs hover:shadow-hard-md transition-all flex flex-col justify-between text-left"
          >
            <div>
              {/* Top rating & mode */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-1 text-[#F5C84C]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < fb.rating ? 'fill-current' : 'text-slate-200'}`}
                    />
                  ))}
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                  {fb.mode}
                </span>
              </div>

              {/* Comment text */}
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic mb-6">
                "{fb.comment}"
              </p>
            </div>

            {/* Author details */}
            <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-sm ${fb.avatarBg}`}>
                {fb.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <span className="font-heading text-xs font-bold text-slate-900 truncate">
                    {fb.name}
                  </span>
                  {fb.verified && (
                    <CheckCircle className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                  )}
                </div>
                <span className="text-[11px] text-slate-500 truncate">
                  {fb.role} • {fb.company}
                </span>
              </div>
            </div>
          </Card3D>
        ))}
      </div>

      {/* Load More Button (Loads next 10 items from Supabase) */}
      {hasMore && (
        <div className="flex justify-center mt-10">
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="px-6 py-2.5 rounded-[var(--r-sm)] bg-[var(--surface)] hover:bg-[var(--surface-muted)] text-[var(--text)] border border-[var(--line)] text-xs font-heading font-bold uppercase tracking-wider transition-all shadow-hard-xs hover:-translate-y-0.5 active:translate-y-0.5 inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoadingMore ? (
              <RefreshCw className="w-4 h-4 animate-spin text-[var(--gold-dark)]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[var(--gold-dark)]" />
            )}
            <span>More</span>
          </button>
        </div>
      )}
    </section>
  );
};
