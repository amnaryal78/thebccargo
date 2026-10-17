import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface PolicyRecord {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  summary: string;
  content: string;
  version: string;
  lastUpdated: string;
}

export async function fetchPublishedPolicies(): Promise<PolicyRecord[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('policies')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((p: any) => ({
          id: p.id,
          slug: p.slug,
          title: p.title,
          shortTitle: p.short_title,
          summary: p.summary,
          content: p.content,
          version: p.version,
          lastUpdated: p.last_updated
        }));
      }
    } catch (e) {}
  }
  return [];
}
