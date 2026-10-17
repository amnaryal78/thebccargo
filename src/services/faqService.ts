import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DEFAULT_FAQS, FaqItem } from '../components/FaqSection';

export async function fetchPublishedFaqs(): Promise<FaqItem[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('published', true)
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((f: any) => ({
          id: f.id,
          category: f.category || 'General Questions',
          question: f.question,
          answer: f.answer
        }));
      }
    } catch (e) {
      console.warn('Supabase faqs fetch error:', e);
    }
  }
  return DEFAULT_FAQS;
}
