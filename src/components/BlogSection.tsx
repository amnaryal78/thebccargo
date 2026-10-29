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
import { Card } from '../design/primitives';
import { Spotlight } from './ui/spotlight';
import { BlogCover } from './ui/BlogCover';
import { CountryGuideGrid } from '../features/countryGuides/CountryGuideGrid';
import { COUNTRY_GUIDES } from '../data/countryGuides';


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
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="flex flex-col gap-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ox-900">
            <BookOpen className="w-4 h-4" />
            <span>Blog</span>
          </div>
          <h2 className="font-heading font-extrabold text-2xl sm:text-4xl text-slate-900 tracking-tight">
            Latest from our blog
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Customs, packing and cargo tips from our team.
          </p>
        </div>

        <button
          onClick={() => onNavigate('blogs')}
          className="self-start md:self-auto px-5 py-2.5 rounded-[var(--r-sm)] bg-ox-900 hover:bg-[#123562] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-hard-xs hover:-translate-y-0.5 active:translate-y-0.5 flex items-center gap-2 cursor-pointer group shrink-0"
        >
          <span>Read guides</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Blog Cards Grid (Max 3 Blogs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map((n) => (
            <Card key={n} className="p-4 flex flex-col gap-4 animate-pulse">
              <div className="w-full h-44 rounded-xl bg-slate-200" />
              <div className="w-20 h-4 rounded bg-slate-200" />
              <div className="w-full h-6 rounded bg-slate-200" />
              <div className="w-4/5 h-4 rounded bg-slate-200" />
            </Card>
          ))
        ) : (
          blogs.map((post) => (
            <Spotlight
              key={post.id}
              intensity="normal"
              elevateOnHover
              className="interactive-card group h-full bg-white rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Cover Image */}
                <div className="relative w-full h-48 overflow-hidden bg-slate-100">
                  <BlogCover
                    src={post.coverImageUrl}
                    alt={post.coverImageAlt || post.title}
                    label={post.category}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-[var(--r-xs)] bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider border border-white/10 shadow-sm">
                    {post.category}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex flex-col gap-3">
                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-ox-900" />
                      {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-ox-900" />
                      {post.readTime}
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-base text-slate-900 group-hover:text-ox-900 transition-colors line-clamp-2 leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              {/* Card Footer Link */}
              <div className="p-5 pt-0 mt-2 border-t border-[var(--line)] flex items-center justify-between">
                <Link
                  to={`/blogs/${post.slug}`}
                  className="text-xs font-bold uppercase tracking-wider text-ox-900 group-hover:underline inline-flex items-center gap-1 cursor-pointer min-h-[36px] py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gd-500 rounded"
                >
                  <span>Read Article</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </Spotlight>
          ))
        )}
      </div>

      {/* Mobile Bottom CTA */}
      <div className="mt-8 flex justify-center md:hidden">
        <button
          onClick={() => onNavigate('blogs')}
          className="w-full min-h-[48px] py-3.5 rounded-[var(--r-sm)] bg-ox-900 text-white text-xs font-bold uppercase tracking-wider text-center flex items-center justify-center gap-2 shadow-hard-xs hover:-translate-y-0.5 active:translate-y-0.5 transition-all"
        >
          <span>View All Articles</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </section>
  );
};

/** Home "Where can we ship?" block: the main country guides plus a link to all of them. */
export const HomeCountryGuides: React.FC<BlogSectionProps> = ({ onNavigate }) => (
  <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
    <CountryGuideGrid compact />
    <a
      href="/blogs#country-guides"
      onClick={(e) => {
        e.preventDefault();
        onNavigate('blogs');
      }}
      className="mt-5 inline-flex items-center gap-1.5 min-h-[44px] text-sm font-bold text-[var(--gold-dark)] hover:underline whitespace-nowrap"
    >
      See all {COUNTRY_GUIDES.length} country guides <ArrowRight className="w-4 h-4" aria-hidden="true" />
    </a>
  </section>
);
