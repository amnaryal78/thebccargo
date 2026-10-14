import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { secureDataStorage } from '../lib/secureStorage';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl?: string;
  coverImageAlt?: string;
  authorName: string;
  published: boolean;
  publishedAt: string;
  updatedAt?: string;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  category: string;
  readTime: string;
  featuredOnHomepage?: boolean;
  homepageOrder?: number;
  status?: 'draft' | 'published' | 'archived';
}

export const INITIAL_BLOGS: BlogPost[] = [
  {
    id: 'BLOG-01',
    title: 'Air Cargo Export Guidelines from Tribhuvan International Airport (TIA)',
    slug: 'air-cargo-export-guidelines-tia-kathmandu',
    excerpt: 'Essential compliance steps, customs documentation, and bonded warehouse packaging rules for commercial air freight exports originating in Kathmandu.',
    content: `Exporting commercial freight via air from Kathmandu requires strict adherence to Civil Aviation Authority of Nepal (CAAN) and international IATA aviation security standards.

### 1. Mandatory Export Documentation
- **Customs Declaration (Pragyapan Patra)**: Issued by a licensed Nepalese customs broker under Broker Lic. #B-409.
- **Commercial Invoice & Packing List**: Detailing piece counts, gross weight, net weight, and declared FOB value.
- **PAN / EXIM Code Registration**: Verified tax identity for commercial exporters registered with the Department of Customs.
- **Certificate of Origin**: Issued by the Federation of Nepalese Chambers of Commerce and Industry (FNCCI) or relevant district chamber.

### 2. Cargo Packaging & Dangerous Goods (DG)
- Fragile handicrafts, tea, and pashmina must be packed in double-walled corrugated export boxes or wooden crates with ISPM-15 heat treatment stamps.
- Lithium batteries, perfumes, and flammable liquids require Dangerous Goods (DG) declarations certified by certified IATA handlers.

### 3. TIA Bonded Runway Warehouse Handoff
Cargo must arrive at TIA Cargo Terminal at least 6 hours prior to scheduled flight departure. BC Cargo handles direct airside transfer to scheduled carrier belly space.`,
    coverImageUrl: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=1200&q=80',
    coverImageAlt: 'Air Cargo aircraft handling at TIA Kathmandu airport terminal',
    authorName: 'Suresh Adhikari',
    published: true,
    publishedAt: '2026-09-15T10:00:00Z',
    updatedAt: '2026-09-15T10:00:00Z',
    seoTitle: 'TIA Kathmandu Air Cargo Export Guide 2026 | BC Cargo',
    seoDescription: 'Complete guide for air cargo export procedures, customs clearance, and aviation security standards at TIA Kathmandu.',
    category: 'Air Freight',
    readTime: '5 min read',
    featuredOnHomepage: true,
    homepageOrder: 1,
    status: 'published'
  },
  {
    id: 'BLOG-02',
    title: 'Understanding Birgunj ICD Dry Port & Transit Logistics',
    slug: 'birgunj-icd-dry-port-transit-logistics',
    excerpt: 'How Nepal’s premier Inland Container Depot connects ocean freight from Kolkata and Haldia ports via direct rail and road corridors.',
    content: `Birgunj Inland Container Depot (ICD) serves as the primary maritime gateway for Nepal's international trade. Located strategically near the Indian border at Sirsiya, it connects sea freight arriving at Kolkata and Haldia ports directly to Nepal via dedicated rail transit.

### Key Highlights of Birgunj ICD:
- **Direct Rail Transit**: Broad-gauge rail line connecting Kolkata Port to Birgunj ICD with customs escrow transit.
- **Customs Clearance Automation**: Integrated ASYCUDA World customs clearance engine for express container examination.
- **Multi-modal Container Handling**: High-capacity reach stackers, gantry cranes, and bonded warehousing with 120,000 sq. ft. storage capacity.`,
    coverImageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    coverImageAlt: 'Birgunj ICD container terminal cranes loading freight',
    authorName: 'Pooja Thapa',
    published: true,
    publishedAt: '2026-09-10T14:30:00Z',
    updatedAt: '2026-09-10T14:30:00Z',
    seoTitle: 'Birgunj ICD Dry Port Guide | BC Cargo & Courier',
    seoDescription: 'Overview of ocean freight transit corridors connecting Kolkata port to Birgunj ICD dry port in Nepal.',
    category: 'Ocean & Land',
    readTime: '4 min read',
    featuredOnHomepage: true,
    homepageOrder: 2,
    status: 'published'
  },
  {
    id: 'BLOG-03',
    title: 'How to Calculate Volumetric Weight for International Courier Parcels',
    slug: 'how-to-calculate-volumetric-weight-courier',
    excerpt: 'Avoid unexpected freight surcharges by understanding how dimensional volume affects chargeable shipping weight.',
    content: `When shipping lightweight but bulky items like pashmina shawls, wool garments, or bamboo crafts, carriers calculate shipping charges based on **Volumetric (Dimensional) Weight** rather than actual scale weight.

### The Standard Volumetric Formula:
For Air Express Courier:
\`\`\`
Volumetric Weight (kg) = (Length in cm × Width in cm × Height in cm) / 5000
\`\`\`

For Overland Cargo:
\`\`\`
Volumetric Weight (kg) = (Length in cm × Width in cm × Height in cm) / 6000
\`\`\`

### Example Calculation:
If a box weighs 3 kg on the scale, but measures 50 cm × 40 cm × 30 cm:
- Volume = 60,000 cubic cm.
- Volumetric Weight = 60,000 / 5000 = **12.0 kg**.
- **Chargeable Weight** = max(3 kg, 12 kg) = **12.0 kg**.

Always measure outer carton dimensions accurately to verify your freight budget before dispatch.`,
    coverImageUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80',
    coverImageAlt: 'Measuring dimensions and volumetric weight of parcel box',
    authorName: 'BC Operations Team',
    published: true,
    publishedAt: '2026-08-28T09:15:00Z',
    updatedAt: '2026-08-28T09:15:00Z',
    seoTitle: 'Volumetric Weight Calculator Guide | BC Cargo',
    seoDescription: 'Learn how to calculate volumetric dimensional weight for air and express courier shipments in Nepal.',
    category: 'Shipping Tips',
    readTime: '3 min read',
    featuredOnHomepage: true,
    homepageOrder: 3,
    status: 'published'
  },
  {
    id: 'BLOG-04',
    title: 'Navigating Customs Valuation & Harmonized System (HS) Codes in Nepal',
    slug: 'nepal-customs-valuation-hs-codes-guide',
    excerpt: 'A comprehensive primer on proper HS classification, duty rates, and invoice documentation under the Nepal Customs Act.',
    content: `Accurate classification under the Harmonized Commodity Description and Coding System (HS) is critical for smooth customs entry across Nepal border checkposts and airport clearance hubs.

### 1. The Role of the 8-Digit HS Code
Nepal applies customs tariffs based on 8-digit national tariff lines. Incorrect classification can lead to misdeclaration penalties or customs holds.

### 2. Transaction Value Method
Under WTO valuation principles adopted by Nepal Department of Customs, the primary basis for valuation is the transaction value—the price actually paid or payable for goods when sold for export to Nepal, adjusted for freight, insurance, and handling charges (CIF).

### 3. Broker Assistance
BC Cargo's dedicated brokerage team operates under license #B-409 to verify classifications prior to cargo arrival, minimizing clearance turnaround times to under 24 hours.`,
    coverImageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
    coverImageAlt: 'Customs declaration papers and valuation documents',
    authorName: 'Bimal Shrestha',
    published: true,
    publishedAt: '2026-08-14T11:00:00Z',
    updatedAt: '2026-08-14T11:00:00Z',
    seoTitle: 'Nepal Customs Valuation & HS Code Guide | BC Cargo',
    seoDescription: 'Expert guide to Nepal Customs valuation methods, HS code classification, and clearance documentation.',
    category: 'Customs & Compliance',
    readTime: '6 min read',
    featuredOnHomepage: false,
    status: 'published'
  }
];

// Helper: check if string is a valid UUID
export function isValidUuid(id?: string): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

// Helper: estimate read time
export function calculateReadTime(content: string): string {
  if (!content) return '1 min read';
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

// Helper: Generate URL-friendly slug
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ============================================================================
// ASYNC SUPABASE & LOCALSTORAGE BACKED DATA ACCESS
// ============================================================================

export async function fetchPublishedBlogs(): Promise<BlogPost[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('published', true)
        .order('published_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map(mapDbRecordToBlogPost);
      }
    } catch (e) {
      console.warn('Supabase fetch blogs failed, falling back:', e);
    }
  }

  return getPublishedBlogs();
}

export async function fetchHomepageBlogs(): Promise<BlogPost[]> {
  const published = await fetchPublishedBlogs();
  
  // Filter for featured on homepage, sorted by homepage_order
  const featured = published
    .filter((b) => b.featuredOnHomepage)
    .sort((a, b) => (a.homepageOrder || 99) - (b.homepageOrder || 99));

  if (featured.length > 0) {
    return featured.slice(0, 3);
  }

  // Fallback: Return top 3 published articles if no specific homepage selection set
  return published.slice(0, 3);
}

export async function fetchAllBlogs(): Promise<BlogPost[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map(mapDbRecordToBlogPost);
      }
    } catch (e) {
      console.warn('Supabase fetch all blogs failed, falling back:', e);
    }
  }

  return getBlogs();
}

export async function fetchBlogBySlug(slug: string): Promise<BlogPost | undefined> {
  const cleanSlug = slug.toLowerCase().trim();

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('slug', cleanSlug)
        .eq('published', true)
        .maybeSingle();

      if (!error && data) {
        return mapDbRecordToBlogPost(data);
      }
    } catch (e) {
      console.warn('Supabase fetch blog by slug failed, falling back:', e);
    }
  }

  return getBlogBySlug(cleanSlug);
}

export async function checkSlugAvailability(slug: string, currentId?: string): Promise<{ available: boolean; suggestedSlug?: string }> {
  const cleanSlug = generateSlug(slug);
  const all = await fetchAllBlogs();
  
  const existing = all.find(b => b.slug.toLowerCase() === cleanSlug && b.id !== currentId);
  
  if (!existing) {
    return { available: true };
  }

  let count = 2;
  let suggested = `${cleanSlug}-${count}`;
  while (all.some(b => b.slug.toLowerCase() === suggested && b.id !== currentId)) {
    count++;
    suggested = `${cleanSlug}-${count}`;
  }

  return { available: false, suggestedSlug: suggested };
}

export async function saveBlogPostAsync(post: BlogPost): Promise<BlogPost[]> {
  const now = new Date().toISOString();
  const slugToSave = post.slug ? generateSlug(post.slug) : generateSlug(post.title);
  
  let formattedPost: BlogPost = {
    ...post,
    slug: slugToSave,
    updatedAt: now,
    publishedAt: post.publishedAt || now,
    readTime: calculateReadTime(post.content),
    status: post.published ? 'published' : 'draft'
  };

  if (isSupabaseConfigured) {
    try {
      // Determine valid UUID or lookup existing DB record by slug
      let dbIdToUse: string | undefined = isValidUuid(formattedPost.id) ? formattedPost.id : undefined;

      if (!dbIdToUse) {
        const { data: existing } = await supabase
          .from('blogs')
          .select('id')
          .eq('slug', formattedPost.slug)
          .maybeSingle();

        if (existing?.id) {
          dbIdToUse = existing.id;
        }
      }

      const { data: upsertData, error: upsertError } = await supabase
        .from('blogs')
        .upsert({
          id: dbIdToUse,
          title: formattedPost.title,
          slug: formattedPost.slug,
          excerpt: formattedPost.excerpt,
          content: formattedPost.content,
          cover_image_url: formattedPost.coverImageUrl,
          cover_image_alt: formattedPost.coverImageAlt,
          author_name: formattedPost.authorName,
          published: formattedPost.published,
          published_at: formattedPost.publishedAt,
          updated_at: formattedPost.updatedAt,
          seo_title: formattedPost.seoTitle,
          seo_description: formattedPost.seoDescription,
          canonical_url: formattedPost.canonicalUrl,
          category: formattedPost.category,
          featured_on_homepage: formattedPost.featuredOnHomepage || false,
          homepage_order: formattedPost.homepageOrder || null,
          status: formattedPost.status
        })
        .select('*')
        .single();

      if (!upsertError && upsertData) {
        formattedPost = mapDbRecordToBlogPost(upsertData);
      } else if (upsertError) {
        console.warn('Supabase upsert error details:', upsertError);
      }
    } catch (e) {
      console.warn('Supabase save blog post failed:', e);
    }
  }

  // Persist to local memory/storage safely
  return saveBlogPost(formattedPost);
}

export async function updateHomepageFeaturedBlogs(featuredList: { id: string; order: number }[]): Promise<BlogPost[]> {
  const currentBlogs = getBlogs();
  const updated = currentBlogs.map(b => {
    const feat = featuredList.find(f => f.id === b.id);
    if (feat) {
      return { ...b, featuredOnHomepage: true, homepageOrder: feat.order };
    } else {
      return { ...b, featuredOnHomepage: false, homepageOrder: undefined };
    }
  });

  safeSetLocalStorage('bc_cargo_blogs', updated);

  if (isSupabaseConfigured) {
    try {
      for (const blog of updated) {
        if (isValidUuid(blog.id)) {
          await supabase
            .from('blogs')
            .update({
              featured_on_homepage: blog.featuredOnHomepage || false,
              homepage_order: blog.homepageOrder || null
            })
            .eq('id', blog.id);
        } else {
          await supabase
            .from('blogs')
            .update({
              featured_on_homepage: blog.featuredOnHomepage || false,
              homepage_order: blog.homepageOrder || null
            })
            .eq('slug', blog.slug);
        }
      }
    } catch (e) {
      console.warn('Supabase update homepage blogs failed:', e);
    }
  }

  return updated;
}

export async function deleteBlogPostAsync(id: string): Promise<BlogPost[]> {
  if (isSupabaseConfigured) {
    try {
      if (isValidUuid(id)) {
        await supabase.from('blogs').delete().eq('id', id);
      } else {
        const blogToDelete = getBlogs().find(b => b.id === id);
        if (blogToDelete?.slug) {
          await supabase.from('blogs').delete().eq('slug', blogToDelete.slug);
        }
      }
    } catch (e) {
      console.warn('Supabase delete blog post failed:', e);
    }
  }

  return deleteBlogPost(id);
}

function mapDbRecordToBlogPost(b: any): BlogPost {
  return {
    id: b.id,
    title: b.title,
    slug: b.slug,
    excerpt: b.excerpt || '',
    content: b.content,
    coverImageUrl: b.cover_image_url,
    coverImageAlt: b.cover_image_alt || b.title,
    authorName: b.author_name || 'BC Cargo Team',
    published: b.published ?? true,
    publishedAt: b.published_at || b.created_at,
    updatedAt: b.updated_at || b.created_at,
    seoTitle: b.seo_title,
    seoDescription: b.seo_description,
    canonicalUrl: b.canonical_url,
    category: b.category || 'Logistics',
    readTime: calculateReadTime(b.content),
    featuredOnHomepage: b.featured_on_homepage ?? false,
    homepageOrder: b.homepage_order,
    status: b.status || (b.published ? 'published' : 'draft')
  };
}

// Helper: Safely write encrypted data to localStorage without throwing QuotaExceededError
function safeSetLocalStorage(key: string, data: any) {
  try {
    secureDataStorage.setItem(key, data);
  } catch (e) {
    console.warn(`localStorage quota exceeded while saving ${key}. Stripping heavy image URLs for cache:`, e);
    try {
      const sanitized = Array.isArray(data) ? data.map(item => ({
        ...item,
        coverImageUrl: (item.coverImageUrl && item.coverImageUrl.length > 5000) 
          ? 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80' 
          : item.coverImageUrl
      })) : data;
      secureDataStorage.setItem(key, sanitized);
    } catch (fallbackErr) {
      console.error('Failed to write sanitized data to localStorage:', fallbackErr);
    }
  }
}

// ============================================================================
// SYNCHRONOUS LOCALSTORAGE FALLBACKS
// ============================================================================

export const getBlogs = (): BlogPost[] => {
  return secureDataStorage.getItem<BlogPost[]>('bc_cargo_blogs', INITIAL_BLOGS);
};

export const getPublishedBlogs = (): BlogPost[] => {
  return getBlogs().filter((b) => b.published && b.status !== 'archived');
};

export const getBlogBySlug = (slug: string): BlogPost | undefined => {
  const cleanSlug = slug.toLowerCase().trim();
  return getPublishedBlogs().find((b) => b.slug.toLowerCase() === cleanSlug);
};

export const saveBlogPost = (post: BlogPost): BlogPost[] => {
  const current = getBlogs();
  const index = current.findIndex((b) => b.id === post.id || b.slug === post.slug);
  let updated: BlogPost[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = post;
  } else {
    updated = [post, ...current];
  }
  safeSetLocalStorage('bc_cargo_blogs', updated);
  return updated;
};

export const deleteBlogPost = (id: string): BlogPost[] => {
  const current = getBlogs().filter((b) => b.id !== id);
  safeSetLocalStorage('bc_cargo_blogs', current);
  return current;
};
