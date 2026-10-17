import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { fetchPublishedBlogs, BlogPost } from '../services/blogService';
import { SEOHead } from '../components/SEOHead';
import { Button } from '../design/primitives/Button';
import { RegistrationCorners } from '../design/icons';
import { Spotlight } from '../components/ui/spotlight';
import { 
  BookOpen, 
  Calendar, 
  User, 
  ArrowRight, 
  Search, 
  Clock, 
  Tag, 
  FileText,
  ChevronRight
} from 'lucide-react';

export const BlogListPage: React.FC = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      try {
        const data = await fetchPublishedBlogs();
        if (isMounted) setBlogs(data);
      } catch (err) {
        console.error('Failed to load published blogs:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(blogs.map((b) => b.category)))];
  }, [blogs]);

  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) => {
      const matchCat = selectedCategory === 'All' || b.category === selectedCategory;
      const matchQuery =
        !searchQuery.trim() ||
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [blogs, selectedCategory, searchQuery]);

  return (
    <div className="w-full bg-[var(--bg,#F6F6F4)] text-[var(--text,#121211)] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <SEOHead
        title="Customs, Export & Cargo Knowledge Base | The BC Cargo & Courier"
        description="Comprehensive guides on customs clearance, air cargo compliance, volumetric calculations, and international freight from Nepal."
      />

      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[var(--line)] pb-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[var(--surface)] border border-[var(--line-strong)] rounded-[var(--r-xs)]">
              <span className="w-2 h-2 rounded-full bg-[var(--gold)]" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--oxford-deep)]">
                Logistics &amp; Customs Knowledge Base
              </span>
            </div>
            <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-[var(--text)] tracking-tight leading-tight">
              Blog &amp; Cargo Guides
            </h1>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
              Operational documentation requirements, air cargo security standards, tariff classifications, and trade protocols curated by licensed customs brokers.
            </p>
          </div>

          <div className="p-3 bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-sm)] shadow-hard-xs font-mono text-xs text-right self-start md:self-end">
            <span className="text-[var(--text-muted)] block">PUBLISHED DISPATCHES</span>
            <span className="font-bold text-lg text-[var(--oxford-deep)]">
              {blogs.length} Official Articles
            </span>
          </div>
        </div>

        {/* SEARCH & CATEGORY CHIPS BAR */}
        <section className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-md)] p-5 shadow-hard-md space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-3.5" />
              <input
                type="text"
                placeholder="Search trade guides or regulations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-9 pr-4 bg-[var(--surface-muted)] text-[var(--text)] border border-[var(--line)] rounded-[var(--r-xs)] font-sans text-xs focus:outline-none focus:border-[var(--oxford-deep)] clay-inset"
              />
            </div>

            {/* Category Chips */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`min-h-[40px] py-2 px-3.5 inline-flex items-center rounded-lg font-mono text-xs font-bold uppercase tracking-wider transition-all duration-[var(--t-fast)] border shadow-sm hover:-translate-y-0.5 active:translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] ${
                    selectedCategory === cat
                      ? 'bg-[var(--oxford-deep)] text-white border-white/20'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

          </div>
        </section>

        {/* ARTICLES GRID */}
        {loading ? (
          <div className="p-16 text-center font-mono text-xs text-[var(--text-muted)]">
            Loading verified dispatches...
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="p-12 text-center bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-md)] shadow-hard-sm space-y-3">
            <BookOpen className="w-8 h-8 text-[var(--text-muted)] mx-auto" />
            <h3 className="font-heading font-bold text-lg text-[var(--text)]">
              No Articles Found
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              No trade dispatches match "{searchQuery}".
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlogs.map((blog) => (
              <Spotlight
                key={blog.id}
                intensity="subtle"
                elevateOnHover
                className="p-6 h-full bg-[var(--surface)] border border-[var(--line)] rounded-xl shadow-sm flex flex-col justify-between hover:border-[var(--oxford-deep)] transition-all duration-[var(--t-normal)] group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
                    <span className="px-2 py-0.5 rounded bg-[var(--surface-muted)] border border-[var(--line)] font-bold uppercase text-[var(--gold-dark)]">
                      {blog.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {blog.readTime || '5 min read'}
                    </span>
                  </div>

                  <h3 className="font-heading font-extrabold text-xl text-[var(--text)] group-hover:text-[var(--gold-dark)] transition-colors leading-snug">
                    <Link to={`/blogs/${blog.slug}`}>
                      {blog.title}
                    </Link>
                  </h3>

                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] line-clamp-3 leading-relaxed">
                    {blog.excerpt}
                  </p>
                </div>

                <div className="pt-4 mt-6 border-t border-[var(--line)] flex items-center justify-between text-xs font-mono">
                  <span className="text-[var(--text-muted)]">
                    By {blog.authorName}
                  </span>
                  <Link
                    to={`/blogs/${blog.slug}`}
                    className="inline-flex items-center gap-1 font-bold uppercase text-[var(--gold-dark)] hover:underline"
                  >
                    <span>Read Guide</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </Spotlight>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
