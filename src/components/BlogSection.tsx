import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  fetchHomepageBlogs, 
  BlogPost 
} from '../services/blogService';
import { 
  Calendar, 
  Clock, 
  ArrowRight, 
  BookOpen, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { Card } from './ui/Card';

// Pointer-following light animation helper
const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;
  e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
  e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
};

interface BlogSectionProps {
  onNavigate: (page: string) => void;
}

export const BlogSection: React.FC<BlogSectionProps> = ({ onNavigate }) => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadHomepageBlogs() {
      try {
        const featured = await fetchHomepageBlogs();
        if (isMounted) {
          setBlogs(featured);
        }
      } catch (err) {
        console.error('Failed to fetch homepage blogs:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadHomepageBlogs();
    return () => { isMounted = false; };
  }, []);

  if (!loading && blogs.length === 0) return null;

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-slate-200 dark:border-slate-800/80">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="flex flex-col gap-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-[#0B5ED7] dark:text-[#2F80ED]">
            <BookOpen className="w-4 h-4" />
            <span>Latest Articles &amp; Shipping Guides</span>
          </div>
          <h2 className="font-heading font-extrabold text-2xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
            Logistics Insights &amp; Export Guides
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Stay updated with customs clearance, air cargo guidelines, and volumetric weight packaging tips.
          </p>
        </div>

        <button
          onClick={() => onNavigate('blogs')}
          className="self-start md:self-auto px-5 py-2.5 rounded-xl bg-[#0B5ED7] hover:bg-[#084298] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm flex items-center gap-2 cursor-pointer group shrink-0"
        >
          <span>View More Blogs</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Blog Cards Grid (Max 3 Blogs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map((n) => (
            <Card key={n} className="p-4 flex flex-col gap-4 animate-pulse">
              <div className="w-full h-44 rounded-xl bg-slate-200 dark:bg-slate-800" />
              <div className="w-20 h-4 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="w-full h-6 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="w-4/5 h-4 rounded bg-slate-200 dark:bg-slate-800" />
            </Card>
          ))
        ) : (
          blogs.map((post) => (
            <div
              key={post.id}
              onMouseMove={handleCardMouseMove}
              className="interactive-card interactive-radial-glow group bg-white dark:bg-[#0B2445] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:border-[#0B5ED7] dark:hover:border-[#2F80ED] transition-all flex flex-col justify-between"
            >
              <div>
                {/* Cover Image */}
                <div className="relative w-full h-48 overflow-hidden bg-slate-100 dark:bg-[#060919]">
                  <img
                    src={post.coverImageUrl || 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80'}
                    alt={post.coverImageAlt || post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-mono font-bold uppercase tracking-wider border border-white/10">
                    {post.category}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex flex-col gap-3">
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#0B5ED7]" />
                      {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#0B5ED7]" />
                      {post.readTime}
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white group-hover:text-[#0B5ED7] dark:group-hover:text-[#60A5FA] transition-colors line-clamp-2 leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              {/* Card Footer Link */}
              <div className="p-5 pt-0 mt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <Link
                  to={`/blogs/${post.slug}`}
                  className="text-xs font-bold uppercase tracking-wider text-[#0B5ED7] dark:text-[#60A5FA] group-hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Read Article</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Mobile Bottom CTA */}
      <div className="mt-8 flex justify-center md:hidden">
        <button
          onClick={() => onNavigate('blogs')}
          className="w-full py-3 rounded-xl bg-[#0B5ED7] text-white text-xs font-bold uppercase tracking-wider text-center flex items-center justify-center gap-2"
        >
          <span>View All Articles</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </section>
  );
};
