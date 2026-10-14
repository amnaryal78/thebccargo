import React, { useState } from 'react';
import { Star, MessageSquarePlus, ThumbsUp, CheckCircle, X, Send } from 'lucide-react';

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
}

export const FeedbackSection: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([
    {
      id: 'fb-1',
      name: 'Ramesh Adhikari',
      role: 'Export Manager',
      company: 'Himalayan Handicrafts Ltd.',
      rating: 5,
      mode: 'Air Delivery',
      comment: 'The BC Cargo delivered our urgent package from Kathmandu to Frankfurt in under 48 hours. Easy customs clearance and clear live tracking throughout.',
      date: 'Sept 18, 2026',
      verified: true,
      avatarBg: 'bg-[#0B5ED7] text-white'
    },
    {
      id: 'fb-2',
      name: 'Priya Sharma',
      role: 'Supply Chain Director',
      company: 'Nepal Agro Industries',
      rating: 5,
      mode: 'Sea Delivery',
      comment: 'Dependable delivery from Birgunj to Kolkata port. Digital tracking gave us full peace of mind for our large shipment.',
      date: 'Sept 12, 2026',
      verified: true,
      avatarBg: 'bg-[#071A33] text-white'
    },
    {
      id: 'fb-3',
      name: 'David Miller',
      role: 'Logistics Procurement',
      company: 'Global Trade Syndicate (UAE)',
      rating: 5,
      mode: 'Fast Courier',
      comment: 'Very polite staff and fast delivery from Hetauda to Delhi. A trusted and reliable delivery partner in Nepal.',
      date: 'Aug 29, 2026',
      verified: true,
      avatarBg: 'bg-emerald-700 text-white'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newMode, setNewMode] = useState('Air Delivery');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newComment.trim()) return;

    const colors = [
      'bg-[#0B5ED7] text-white',
      'bg-[#071A33] text-white',
      'bg-emerald-700 text-white',
      'bg-slate-700 text-white'
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newItem: FeedbackItem = {
      id: `fb-${Date.now()}`,
      name: newName.trim(),
      role: newRole.trim() || 'Verified Customer',
      company: newCompany.trim() || 'Personal / Business',
      rating: newRating,
      mode: newMode,
      comment: newComment.trim(),
      date: 'Just Now',
      verified: true,
      avatarBg: randomColor
    };

    setFeedbacks([newItem, ...feedbacks]);
    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
      setIsModalOpen(false);
      setNewName('');
      setNewCompany('');
      setNewRole('');
      setNewComment('');
    }, 1500);
  };

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="flex flex-col gap-2 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0B5ED7] font-mono">
            <ThumbsUp className="w-4 h-4 text-[#10B981]" />
            <span>Customer Reviews</span>
          </div>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-slate-900 dark:text-white tracking-tight">
            What Our Customers Say
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Real reviews from people and businesses who send packages with The BC Cargo &amp; Courier.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-[#0B5ED7] hover:bg-[#084298] text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-sm flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <MessageSquarePlus className="w-4 h-4 text-[#F5C84C]" />
          <span>Write a Review</span>
        </button>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {feedbacks.map((fb) => (
          <div
            key={fb.id}
            className="bg-white dark:bg-[#0B2445] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Top rating & mode */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-1 text-[#F5C84C]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < fb.rating ? 'fill-current' : 'text-slate-200 dark:text-slate-700'}`}
                    />
                  ))}
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-[#071A33] text-slate-700 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700">
                  {fb.mode}
                </span>
              </div>

              {/* Comment text */}
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic mb-6">
                "{fb.comment}"
              </p>
            </div>

            {/* Author details */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-sm ${fb.avatarBg}`}>
                {fb.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <span className="font-heading text-xs font-bold text-slate-900 dark:text-white truncate">
                    {fb.name}
                  </span>
                  {fb.verified && (
                    <CheckCircle className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                  )}
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {fb.role} • {fb.company}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Embedded Inline Review Form (Integrated into Landing UI) */}
      {isModalOpen && (
        <div className="mb-10 bg-white dark:bg-[#0B2445] rounded-2xl p-6 sm:p-8 shadow-md border border-slate-200 dark:border-slate-800 relative animate-fadeIn">
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
            aria-label="Close review form"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-xs font-mono text-[#0B5ED7] uppercase font-bold mb-1">
            <MessageSquarePlus className="w-4 h-4 text-[#10B981]" />
            <span>Share Your Feedback</span>
          </div>
          <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white mb-6">
            Submit Customer Review
          </h3>

          {successMsg ? (
            <div className="py-8 flex flex-col items-center justify-center text-center gap-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[#10B981] flex items-center justify-center">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-lg">Thank You!</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md">Your review has been successfully submitted and added to our customer feedback section.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1 font-mono">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Sujan Shrestha"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#071A33] border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0B5ED7]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1 font-mono">Company / Business</label>
                  <input
                    type="text"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="e.g. Everest Exporters"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#071A33] border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0B5ED7]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1 font-mono">Role / Title</label>
                  <input
                    type="text"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    placeholder="e.g. Freight Manager"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#071A33] border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0B5ED7]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1 font-mono">Delivery Service Type</label>
                  <select
                    value={newMode}
                    onChange={(e) => setNewMode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#071A33] border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0B5ED7]"
                  >
                    <option value="Air Delivery">Air Delivery</option>
                    <option value="Sea Delivery">Sea Delivery</option>
                    <option value="Fast Courier">Fast Courier</option>
                    <option value="Road Delivery">Road Delivery</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1 font-mono">Rating Score</label>
                  <select
                    value={newRating}
                    onChange={(e) => setNewRating(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#071A33] border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0B5ED7]"
                  >
                    <option value={5}>5 Stars - Excellent Service</option>
                    <option value={4}>4 Stars - Great Service</option>
                    <option value={3}>3 Stars - Good Service</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1 font-mono">Your Experience &amp; Review *</label>
                <textarea
                  required
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Tell us how your package delivery went and your experience with our team..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#071A33] border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0B5ED7]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold uppercase hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#0B5ED7] hover:bg-[#084298] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-[#F5C84C]" />
                  <span>Post Review</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </section>
  );
};
