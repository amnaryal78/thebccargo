import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchBlogBySlug, fetchPublishedBlogs, BlogPost } from '../services/blogService';
import { SEOHead } from '../components/SEOHead';
import { Button } from '../design/primitives/Button';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { RegistrationCorners, BarcodeStrip } from '../design/icons';
import { 
  ArrowLeft, 
  Clock, 
  User, 
  Share2, 
  Check, 
  BookOpen, 
  ChevronRight,
  List,
  Send,
  Calendar
} from 'lucide-react';

export const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const [post, setPost] = useState<BlogPost | null | undefined>(undefined);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [copied, setCopied] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

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
    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Reading progress tracker
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100));
        setReadingProgress(progress);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Extract headings from markdown content for TOC
  const postContent = post?.content;
  const tableOfContents = useMemo(() => {
    if (!postContent) return [];
    const lines = postContent.split('\n');
    const headings: Array<{ id: string; text: string; level: number }> = [];

    lines.forEach((line) => {
      if (line.startsWith('### ')) {
        const text = line.replace('### ', '').trim();
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        headings.push({ id, text, level: 3 });
      } else if (line.startsWith('## ')) {
        const text = line.replace('## ', '').trim();
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        headings.push({ id, text, level: 2 });
      }
    });

    return headings;
  }, [postContent]);

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

  const getWhatsAppShareUrl = () => {
    const text = encodeURIComponent(`Read this export cargo guide: "${post?.title}"\n${window.location.href}`);
    return `https://wa.me/?text=${text}`;
  };

  if (post === undefined) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <p className="font-mono text-xs text-[var(--text-muted)]">Loading logistics dispatch...</p>
      </div>
    );
  }

  if (post === null) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center gap-3">
        <BookOpen className="w-10 h-10 text-[var(--text-muted)] mx-auto" />
        <h2 className="font-heading font-bold text-2xl text-[var(--text)]">Article Not Found</h2>
        <p className="text-xs text-[var(--text-muted)] max-w-sm">
          The requested export dispatch does not exist or has been archived.
        </p>
        <Link to="/blogs">
          <Button variant="primary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to All Guides
          </Button>
        </Link>
      </div>
    );
  }

  // Schema.org Article and BreadcrumbList JSON-LD
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: {
      '@type': 'Person',
      name: post.authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'The BC Cargo & Courier',
      url: 'https://thebccargo.com',
      logo: 'https://thebccargo.com/bc-logo.svg',
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://thebccargo.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Knowledge Base',
        item: 'https://thebccargo.com/blogs',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `https://thebccargo.com/blogs/${post.slug}`,
      },
    ],
  };

  return (
    <div className="w-full bg-[var(--bg,#F6F6F4)] text-[var(--text,#121211)] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 transition-colors relative">
      <SEOHead
        title={`${post.seoTitle || post.title} | The BC Cargo & Courier`}
        description={post.seoDescription || post.excerpt}
      />

      {/* Reading Progress Bar (Fixed Top) */}
      <div
        className="fixed top-0 left-0 h-1 bg-[var(--gold)] z-50 transition-all duration-75"
        style={{ width: `${readingProgress}%` }}
        aria-hidden="true"
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* BREADCRUMB */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
          <Link to="/" className="hover:text-[var(--text)]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/blogs" className="hover:text-[var(--text)]">Knowledge Base</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-bold text-[var(--text)] truncate">{post.title}</span>
        </nav>

        {/* ARTICLE HEADER CARD */}
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-md)] p-6 sm:p-10 shadow-hard-md">
          <RegistrationCorners className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[var(--text-muted)]">
              <span className="px-2.5 py-0.5 rounded-[var(--r-xs)] bg-[var(--surface-muted)] border border-[var(--line)] font-bold uppercase text-[var(--oxford-deep)] shadow-hard-xs">
                {post.category}
              </span>

              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {post.readTime || '5 min read'}
                </span>
                <span>
                  By {post.authorName}
                </span>
              </div>
            </div>

            <h1 className="font-heading font-extrabold text-2xl sm:text-4xl lg:text-5xl text-[var(--text)] tracking-tight leading-tight">
              {post.title}
            </h1>

            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed pt-1">
              {post.excerpt}
            </p>

            {/* Share and Action Buttons */}
            <div className="pt-4 border-t border-[var(--line)] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="text-xs font-mono"
                >
                  {copied ? <Check className="w-3.5 h-3.5 mr-1 text-[var(--green-mid,#16A34A)]" /> : <Share2 className="w-3.5 h-3.5 mr-1" />}
                  <span>{copied ? 'Link Copied' : 'Share Article'}</span>
                </Button>

                <a
                  href={getWhatsAppShareUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-semibold rounded-[var(--r-sm)] bg-[#25D366] text-white hover:bg-[#1EBE5D] transition-all border border-white/20 shadow-hard-xs hover:-translate-y-0.5 active:translate-y-0.5"
                >
                  <Send className="w-3 h-3" />
                  <span>WhatsApp</span>
                </a>
              </div>

              <Link to="/rates">
                <Button variant="primary" size="sm" className="text-xs font-semibold">
                  Calculate Rate
                </Button>
              </Link>
            </div>
          </RegistrationCorners>
        </div>

        {/* MAIN ARTICLE BODY WITH STICKY DESKTOP TOC */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ARTICLE CONTENT */}
          <div className="lg:col-span-8 bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-md)] p-6 sm:p-10 shadow-hard-md">
            <div className="prose max-w-none text-xs sm:text-sm leading-relaxed">
              <MarkdownRenderer content={post.content} />
            </div>

            {/* Article Footer Barcode */}
            <div className="mt-12 pt-6 border-t border-dashed border-[var(--line-strong)]">
              <BarcodeStrip code={`DISPATCH-${post.slug.slice(0, 8).toUpperCase()}`} height={28} />
            </div>
          </div>

          {/* STICKY TABLE OF CONTENTS & RELATED POSTS SIDEBAR */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
            
            {/* Table of Contents */}
            {tableOfContents.length > 0 && (
              <div className="p-5 bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-md)] shadow-hard-sm space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-[var(--line)]">
                  <List className="w-4 h-4 text-[var(--gold-dark)]" />
                  <span className="font-heading font-bold text-xs uppercase tracking-wider text-[var(--text)]">
                    Table of Contents
                  </span>
                </div>
                <nav className="space-y-1.5 text-xs font-sans">
                  {tableOfContents.map((h, idx) => (
                    <div
                      key={idx}
                      className="text-[var(--text-secondary)] hover:text-[var(--oxford-deep)] transition-colors py-0.5"
                      style={{ paddingLeft: h.level === 3 ? '12px' : '0' }}
                    >
                      <span className="font-mono text-[10px] text-[var(--text-muted)] mr-1">
                        0{idx + 1}.
                      </span>
                      <span>{h.text}</span>
                    </div>
                  ))}
                </nav>
              </div>
            )}

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="p-5 bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-md)] shadow-hard-sm space-y-3">
                <span className="font-heading font-bold text-xs uppercase tracking-wider text-[var(--text)] block pb-2 border-b border-[var(--line)]">
                  Related Operational Dispatches
                </span>
                <div className="space-y-3">
                  {relatedPosts.map((r) => (
                    <Link
                      key={r.id}
                      to={`/blogs/${r.slug}`}
                      className="block group space-y-1 text-xs"
                    >
                      <span className="font-mono text-[10px] uppercase text-[var(--gold-dark)] block font-bold">
                        {r.category}
                      </span>
                      <h4 className="font-heading font-bold text-xs text-[var(--text)] group-hover:text-[var(--gold-dark)] transition-colors leading-snug">
                        {r.title}
                      </h4>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Dispatch Action Card */}
            <div className="p-5 bg-[var(--surface-muted)] border border-[var(--line)] rounded-[var(--r-sm)] space-y-3 text-xs">
              <span className="font-mono font-bold uppercase text-[var(--text)] block">
                Direct Cargo Dispatch
              </span>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                Need guidance on export documentation or AWB customs declarations? Connect with our TIA airport clearing desk.
              </p>
              <Link to="/contact">
                <Button variant="primary" size="sm" className="w-full text-xs font-semibold">
                  Contact Clearing Desk
                </Button>
              </Link>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
