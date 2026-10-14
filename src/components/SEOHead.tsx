import React, { useEffect } from 'react';

export interface SEOProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  jsonLd?: object;
}

export const SEOHead: React.FC<SEOProps> = ({
  title = 'BC Cargo & Courier — National & International Courier Service from Nepal',
  description = 'Connecting Nepal and the world. Reliable air freight, ocean container lines, cross-border overland cargo, and 24/7 express courier service.',
  canonicalUrl,
  ogType = 'website',
  ogImage = 'https://thebccargo.com/og-banner.png',
  jsonLd
}) => {
  useEffect(() => {
    // 1. Document Title
    document.title = title;

    // 2. Helper to set or update meta tag
    const setMetaTag = (nameAttr: string, attrValue: string, content: string) => {
      let element = document.querySelector(`meta[${nameAttr}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(nameAttr, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Meta Description
    setMetaTag('name', 'description', description);

    // OpenGraph Tags
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:site_name', 'BC Cargo & Courier');

    // Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', ogImage);

    // Canonical Link
    const currentUrl = canonicalUrl || window.location.href;
    let canonicalLink = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', currentUrl);

    // JSON-LD Structured Data
    if (jsonLd) {
      let script = document.querySelector<HTMLScriptElement>('#jsonld-schema');
      if (!script) {
        script = document.createElement('script');
        script.id = 'jsonld-schema';
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(jsonLd);
    }
  }, [title, description, canonicalUrl, ogType, ogImage, jsonLd]);

  return null;
};
