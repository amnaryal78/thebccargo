import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface PartnerItem {
  id: string;
  name: string;
  logoUrl: string;
  websiteUrl?: string;
  sortOrder?: number;
}

export const DEFAULT_PARTNERS: PartnerItem[] = [
  { id: 'p1', name: 'Nepal Customs Department', logoUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=300&q=80' },
  { id: 'p2', name: 'Lufthansa Cargo', logoUrl: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=300&q=80' },
  { id: 'p3', name: 'FlyDubai Logistics', logoUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=300&q=80' },
  { id: 'p4', name: 'Hetauda Industrial District (HID)', logoUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=300&q=80' }
];

export async function fetchPublishedPartners(): Promise<PartnerItem[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('published', true)
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((p: any) => ({
          id: p.id,
          name: p.name,
          logoUrl: p.logo_url,
          websiteUrl: p.website_url,
          sortOrder: p.sort_order
        }));
      }
    } catch (e) {}
  }
  return DEFAULT_PARTNERS;
}
