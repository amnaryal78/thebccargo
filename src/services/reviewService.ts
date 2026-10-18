import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { FeedbackItem } from '../components/FeedbackSection';

/** No invented reviews: only approved rows from the `reviews` table are ever shown. */
export const DEFAULT_REVIEWS: FeedbackItem[] = [];

export async function fetchReviewsPage(options?: {
  limit?: number;
  offset?: number;
}): Promise<{ items: FeedbackItem[]; hasMore: boolean }> {
  const limit = options?.limit ?? 10;
  const offset = options?.offset ?? 0;

  if (isSupabaseConfigured) {
    try {
      const { data, error, count } = await supabase
        .from('reviews')
        .select('*', { count: 'exact' })
        .eq('approved', true)
        .order('is_top', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (!error && data && data.length > 0) {
        const items = data.map((r: any) => ({
          id: r.id,
          name: r.customer_name,
          role: r.role || 'Verified Customer',
          company: r.company || 'Personal',
          rating: r.rating,
          mode: r.mode || 'Air Delivery',
          comment: r.comment,
          date: new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          verified: r.verified !== false,
          avatarBg: r.avatar_bg || 'bg-[#002147] text-[#F2B705]',
          isTop: Boolean(r.is_top)
        }));
        const total = count ?? items.length;
        return { items, hasMore: total > offset + items.length };
      }
    } catch (e) {
      console.warn('Supabase reviews fetch error:', e);
    }
  }

  const items = DEFAULT_REVIEWS.slice(offset, offset + limit);
  return { items, hasMore: DEFAULT_REVIEWS.length > offset + items.length };
}

export async function fetchApprovedReviews(): Promise<FeedbackItem[]> {
  const { items } = await fetchReviewsPage({ limit: 10, offset: 0 });
  return items.length > 0 ? items : DEFAULT_REVIEWS;
}

export async function submitReview(review: Omit<FeedbackItem, 'id' | 'date'>): Promise<{ success: boolean; error: string | null }> {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          customer_name: review.name,
          role: review.role,
          company: review.company,
          rating: review.rating,
          mode: review.mode,
          comment: review.comment,
          verified: false,
          approved: false,
          avatar_bg: review.avatarBg
        });

      if (error) return { success: false, error: 'We could not send your feedback. Please try again.' };
      return { success: true, error: null };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to submit review' };
    }
  }
  return { success: true, error: null };
}
