import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { fetchPublishedBlogs, BlogPost } from '../services/blogService';
import { BookOpen, Calendar, User, ArrowRight, Search, Clock, Tag, RefreshCw } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { SEOHead } from '../components/SEOHead';

export const BlogListPage: React.FC = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadBlogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPublishedBlogs();
      setBlogs(data);
    } catch (err) {
      console.error('Failed to load published blogs:', err);
      setError('Unable to load logistics articles at this time.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(blogs.map((b) => b.category)))];
  }, [blogs]);

  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) => {
      const matchCat = selectedCategory === 'All' || b.category === selectedCategory;
      const matchQuery = 
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [blogs, selectedCategory, searchQuery]);

  // Designate the first blog as featured if no active search
  const featuredBlog = useMemo(() => {
    if (searchQuery || selectedCategory !== 'All' || filteredBlogs.length === 0) return null;
    return filteredBlogs[0];
  }, [filteredBlogs, searchQuery, selectedCategory]);

  const gridBlogs = useMemo(() => {
    if (featuredBlog) {
      return filteredBlogs.slice(1);
    }
    return filteredBlogs;
  }, [filteredBlogs, featuredBlog]);

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex flex-col gap-10">
      <SEOHead
        title="Helpful Guides & Shipping News | The BC Cargo & Courier"
        description="Simple guides on sending packages abroad, box size calculation, customs help, and shipping tips from Nepal by BC Cargo & Courier."
      />

      {/* Header */}
      <div className="flex flex-col items-center text-center gap-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-[#0B5ED7] text-xs font-mono font-bold uppercase tracking-wider">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Helpful Guides &amp; News</span>
        </div>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-slate-900 dark:text-white uppercase tracking-tight">
          Guides &amp; Shipping Advice
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
          Easy-to-read guides on sending packages, tracking boxes, calculating weight, and customs paperwork in Nepal.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#0E1638] dark:bg-[#0B5ED7] text-white shadow-sm'
                  : 'bg-white dark:bg-[#0B2445] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search guides &amp; articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-[#0B2445] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#0B5ED7]"
          />
        </div>
      </div>

      {/* Loading Skeleton State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="p-4 flex flex-col gap-4">
              <Skeleton className="w-full h-44 rounded-xl" />
              <Skeleton className="w-24 h-4 rounded" />
              <Skeleton className="w-full h-6 rounded" />
              <Skeleton className="w-3/4 h-4 rounded" />
            </Card>
          ))}
        </div>
      )}

      {/* Error / Retry State */}
      {!loading && error && (
        <Card className="p-8 text-center flex flex-col items-center gap-4">
          <p className="text-sm text-red-500 font-medium">{error}</p>
          <button
            onClick={loadBlogs}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B5ED7] text-white rounded-xl text-xs font-bold uppercase tracking-wider"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Loading</span>
          </button>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && filteredBlogs.length === 0 && (
        <Card className="p-12 text-center flex flex-col items-center gap-4">
          <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600" />
          <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
            No Articles Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
            We couldn't find any articles matching your search query "{searchQuery}". Try selecting another category.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-white/10 text-xs font-bold uppercase text-slate-700 dark:text-slate-200"
          >
            Clear Filters
          </button>
        </Card>
      )}

      {/* Content Rendering */}
      {!loading && !error && filteredBlogs.length > 0 && (
        <div className="flex flex-col gap-10">
          
          {/* Featured Article Hero Card */}
          {featuredBlog && (
            <Link
              to={`/blogs/${featuredBlog.slug}`}
              className="group block"
            >
              <Card className="p-0 overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 hover:border-[#0B5ED7] dark:hover:border-[#0B5ED7] transition-all">
                <div className="grid grid-cols-1 lg:grid-cols-12">
                  <div className="lg:col-span-7 h-64 sm:h-80 lg:h-96 overflow-hidden bg-slate-100 dark:bg-[#060919] relative">
                    <img
                      src={featuredBlog.coverImageUrl || 'https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=1200&q=80'}
                      alt={featuredBlog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-md bg-[#0B5ED7] text-white text-xs font-mono uppercase font-bold tracking-wider shadow-md">
                        Featured Guide
                      </span>
                    </div>
                  </div>

                  <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between gap-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                          {featuredBlog.category}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#0B5ED7]" />
                          {featuredBlog.readTime}
                        </span>
                      </div>

                      <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white group-hover:text-[#0B5ED7] transition-colors leading-tight">
                        {featuredBlog.title}
                      </h2>

                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-4 leading-relaxed">
                        {featuredBlog.excerpt}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
                        <User className="w-3.5 h-3.5 text-[#0B5ED7]" />
                        <span>{featuredBlog.authorName}</span>
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#0B5ED7] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        <span>Read Guide</span>
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          )}

          {/* Regular Blog Cards Grid */}
          {gridBlogs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gridBlogs.map((post) => (
                <Link
                  key={post.id}
                  to={`/blogs/${post.slug}`}
                  className="group block"
                >
                  <Card className="h-full p-0 overflow-hidden flex flex-col justify-between hover:border-[#0B5ED7] dark:hover:border-[#0B5ED7] transition-all shadow-md">
                    <div className="flex flex-col">
                      <div className="w-full h-48 overflow-hidden bg-slate-100 dark:bg-[#060919] relative">
                        <img
                          src={post.coverImageUrl || 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80'}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded bg-[#0E1638]/90 text-white text-[10px] font-mono uppercase font-bold tracking-wider backdrop-blur-sm">
                          {post.category}
                        </span>
                      </div>

                      <div className="p-5 flex flex-col gap-3">
                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[#0B5ED7]" />
                            {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span>•</span>
                          <span>{post.readTime}</span>
                        </div>

                        <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white group-hover:text-[#0B5ED7] transition-colors leading-snug line-clamp-2">
                          {post.title}
                        </h3>

                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                          {post.excerpt}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 pt-0 mt-auto flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-4">
                      <span className="text-[11px] font-mono text-slate-400">{post.authorName}</span>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#0B5ED7] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        <span>Read</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  );
};
