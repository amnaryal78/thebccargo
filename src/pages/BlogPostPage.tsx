import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchBlogBySlug, fetchPublishedBlogs, BlogPost } from '../services/blogService';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Clock, 
  Share2, 
  BookOpen, 
  Check, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { SEOHead } from '../components/SEOHead';
import { MarkdownRenderer } from '../components/MarkdownRenderer';

export const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [post, setPost] = useState<BlogPost | null | undefined>(undefined); // undefined: loading, null: not found
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadPostData() {
      if (!slug) {
        setPost(null);
        return;
      }
      setPost(undefined);
      try {
        const found = await fetchBlogBySlug(slug);
        if (isMounted) {
          setPost(found || null);
          if (found) {
            const allPublished = await fetchPublishedBlogs();
            if (isMounted) {
              const related = allPublished
                .filter((b) => b.slug !== slug)
                .slice(0, 3);
              setRelatedPosts(related);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load blog post:', err);
        if (isMounted) setPost(null);
      }
    }

    loadPostData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return () => { isMounted = false; };
  }, [slug]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        text: post?.excerpt,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Loading State
  if (post === undefined) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full flex flex-col gap-8">
        <Skeleton className="w-32 h-6 rounded" />
        <Skeleton className="w-full h-12 rounded" />
        <Skeleton className="w-64 h-5 rounded" />
        <Skeleton className="w-full h-80 rounded-2xl" />
        <div className="space-y-3">
          <Skeleton className="w-full h-4 rounded" />
          <Skeleton className="w-full h-4 rounded" />
          <Skeleton className="w-4/5 h-4 rounded" />
        </div>
      </div>
    );
  }

  // Not Found State
  if (post === null) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-[#060919] flex items-center justify-center text-slate-400">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="font-heading font-bold text-2xl text-slate-900 dark:text-white">
          Article Not Found
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md">
          The article you are looking for could not be found or may have moved.
        </p>
        <Link
          to="/blogs"
          className="px-5 py-2.5 bg-[#0B5ED7] hover:bg-[#0E1638] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
        >
          Back to All Articles
        </Link>
      </div>
    );
  }

  return (
    <article className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full flex flex-col gap-8">
      <SEOHead
        title={`${post.seoTitle || post.title} | BC Cargo`}
        description={post.seoDescription || post.excerpt}
        ogImage={post.coverImageUrl}
      />

      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/blogs"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0B5ED7] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Articles</span>
        </Link>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-mono font-semibold hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
          <span>{copied ? 'Link Copied' : 'Share Guide'}</span>
        </button>
      </div>

      {/* Header Container */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded bg-[#0E1638] text-white text-xs font-mono uppercase font-bold tracking-wider">
            {post.category}
          </span>
          <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#0B5ED7]" />
            {post.readTime}
          </span>
        </div>

        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-slate-900 dark:text-white tracking-tight leading-tight">
          {post.title}
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed italic border-l-2 border-[#0B5ED7] pl-4">
          {post.excerpt}
        </p>

        <div className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-mono border-b border-slate-200 dark:border-slate-800 pb-6 pt-2">
          <span className="flex items-center gap-1.5">
            <User className="w-4 h-4 text-[#0B5ED7]" />
            <span>Author: <strong>{post.authorName}</strong></span>
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#0B5ED7]" />
            <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </span>
          <span className="hidden sm:flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Verified Publication</span>
          </span>
        </div>
      </div>

      {/* Featured Cover Image */}
      {post.coverImageUrl && (
        <div className="w-full h-72 sm:h-96 rounded-2xl overflow-hidden shadow-lg bg-slate-100 dark:bg-[#060919]">
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Article Rich Body Content */}
      <MarkdownRenderer content={post.content} />

      {/* Author & Customer Support Footer Card */}
      <Card className="p-6 bg-slate-50 dark:bg-[#060919] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-mono uppercase text-[#0B5ED7] font-bold tracking-wider">
            Help &amp; Guidance
          </span>
          <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
            The BC Cargo &amp; Courier Customer Care Team
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Verified advice backed by Customs Broker License #B-409.
          </p>
        </div>
        <Link
          to="/contact"
          className="px-4 py-2 rounded-xl bg-[#0E1638] dark:bg-[#0B5ED7] text-white text-xs font-bold uppercase tracking-wider shrink-0"
        >
          Ask a Question
        </Link>
      </Card>

      {/* Related Posts Section */}
      {relatedPosts.length > 0 && (
        <div className="border-t border-slate-200 dark:border-slate-800 pt-10 mt-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-xl text-slate-900 dark:text-white uppercase tracking-wide">
              Related Guides &amp; Articles
            </h3>
            <Link
              to="/blogs"
              className="text-xs font-bold uppercase tracking-wider text-[#0B5ED7] hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedPosts.map((rel) => (
              <Link
                key={rel.id}
                to={`/blogs/${rel.slug}`}
                className="group block"
              >
                <Card className="h-full p-4 flex flex-col justify-between hover:border-[#0B5ED7] transition-all">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-mono font-bold text-[#0B5ED7] uppercase">
                      {rel.category}
                    </span>
                    <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white group-hover:text-[#0B5ED7] transition-colors line-clamp-2">
                      {rel.title}
                    </h4>
                  </div>
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 mt-3 flex items-center justify-between text-xs font-bold text-[#0B5ED7]">
                    <span>Read Article</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
};
