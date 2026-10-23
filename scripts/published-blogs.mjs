/**
 * Best-effort fetch of published blog posts from Supabase at build time, so the sitemap and prerendered
 * pages come from real published records instead of a hardcoded list. Uses only the public anon key
 * (same one the browser bundle uses) over PostgREST; draft/archived rows are excluded by published=eq.true.
 * Returns [] and logs a one-line notice (never the key or URL) if env is missing or the request fails.
 */
import 'dotenv/config';
import { loadCountryGuides } from './country-guides.mjs';

export async function loadPublishedBlogs() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.log('[BLOGS] Supabase env not set; skipping database posts.');
    return [];
  }
  try {
    const res = await fetch(`${url.replace(/\/$/, '')}/rest/v1/blogs?select=*&published=eq.true&order=published_at.desc&limit=500`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(10000)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows = await res.json();
    const guideSlugs = new Set((await loadCountryGuides()).map((g) => g.slug));
    const posts = rows
      .filter((r) => r.slug && r.title && !guideSlugs.has(r.slug) && (r.status ?? 'published') === 'published')
      .map((r) => ({
        slug: r.slug,
        title: String(r.title),
        description: String(r.meta_description || r.excerpt || '').slice(0, 300),
        image: r.image_url || r.cover_image || r.featured_image || '',
        publishedAt: r.published_at || r.created_at || '',
        updatedAt: r.updated_at || r.published_at || r.created_at || ''
      }));
    console.log(`[BLOGS] ${posts.length} published database post(s).`);
    return posts;
  } catch (e) {
    console.log(`[BLOGS] Could not load database posts (${e.message}); skipping.`);
    return [];
  }
}
