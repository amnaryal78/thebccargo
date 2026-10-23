import React, { useEffect } from 'react';

export interface SeoProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
  noindex?: boolean;
  keywords?: string[];
}

const DEFAULT_TITLE = 'International Courier & Cargo from Nepal | BC Cargo';
const DEFAULT_DESCRIPTION = 'International courier and cargo from Hetauda, Nepal. Send parcels, documents and commercial cargo worldwide with live per-kg rates and online tracking.';
const DEFAULT_OG_IMAGE = 'https://thebccargo.com/og-banner.png';
const BASE_URL = 'https://thebccargo.com';

export const Seo: React.FC<SeoProps> = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  canonicalUrl,
  ogType = 'website',
  ogImage = DEFAULT_OG_IMAGE,
  jsonLd,
  noindex = false,
  keywords
}) => {
  useEffect(() => {
    // 1. Validation warning in development
    if (process.env.NODE_ENV !== 'production') {
      if (title.length > 65) {
        console.warn(`[SEO Warning] Title exceeds recommended 60 chars (${title.length} chars): "${title}"`);
      }
      if (description.length > 160) {
        console.warn(`[SEO Warning] Description exceeds recommended 155 chars (${description.length} chars): "${description}"`);
      }
    }

    // 2. Document Title
    document.title = title;

    // 3. Helper to set or update meta tag
    const setMetaTag = (attrName: string, attrVal: string, content: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrVal}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrVal);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Meta Description & Robots
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');

    if (keywords && keywords.length > 0) {
      setMetaTag('name', 'keywords', keywords.join(', '));
    }

    // OpenGraph Tags
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:site_name', 'The BC Cargo & Courier');

    // Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', ogImage);

    // Canonical Link
    const currentCanonical = canonicalUrl || (BASE_URL + (window.location.pathname.replace(/\/+$/, '') || '/'));
    let canonicalLink = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', currentCanonical);

    // JSON-LD Structured Data: support array of multiple schema blocks
    // Clean up any existing injected schemas
    const existingScripts = document.querySelectorAll('script[data-seo-jsonld="true"]');
    existingScripts.forEach((s) => s.remove());

    if (jsonLd) {
      const schemas = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      schemas.forEach((schema, idx) => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-seo-jsonld', 'true');
        script.id = `jsonld-schema-${idx}`;
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
      });
    }

    return () => {
      // Cleanup on unmount
      const scripts = document.querySelectorAll('script[data-seo-jsonld="true"]');
      scripts.forEach((s) => s.remove());
    };
  }, [title, description, canonicalUrl, ogType, ogImage, jsonLd, noindex, keywords]);

  return null;
};

// Aliases for full backward compatibility
export const SEOHead = Seo;
export type SEOProps = SeoProps;
export default Seo;
