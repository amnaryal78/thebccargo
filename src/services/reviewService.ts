import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { FeedbackItem } from '../components/FeedbackSection';

export const DEFAULT_REVIEWS: FeedbackItem[] = [
  {
    id: 'fb-1',
    name: 'Ramesh Adhikari',
    role: 'Export Manager',
    company: 'Himalayan Handicrafts Ltd.',
    rating: 5,
    mode: 'Air Delivery',
    comment: 'The BC Cargo delivered our urgent package from Kathmandu to Frankfurt in under 48 hours. Easy customs clearance and clear live tracking throughout.',
    date: 'Sept 18, 2026',
    verified: true,
    avatarBg: 'bg-[#0B5ED7] text-white'
  },
  {
    id: 'fb-2',
    name: 'Priya Sharma',
    role: 'Supply Chain Director',
    company: 'Nepal Agro Industries',
    rating: 5,
    mode: 'Sea Delivery',
    comment: 'Dependable delivery from Birgunj to Kolkata port. Digital tracking gave us full peace of mind for our large shipment.',
    date: 'Sept 12, 2026',
    verified: true,
    avatarBg: 'bg-[#071A33] text-white'
  },
  {
    id: 'fb-3',
    name: 'David Miller',
    role: 'Logistics Procurement',
    company: 'Global Trade Syndicate (UAE)',
    rating: 5,
    mode: 'Fast Courier',
    comment: 'Very polite staff and fast delivery from Hetauda to Delhi. A trusted and reliable delivery partner in Nepal.',
    date: 'Aug 29, 2026',
    verified: true,
    avatarBg: 'bg-emerald-700 text-white'
  }
];

export async function fetchApprovedReviews(): Promise<FeedbackItem[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('approved', true)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((r: any) => ({
          id: r.id,
          name: r.customer_name,
          role: r.role || 'Verified Customer',
          company: r.company || 'Personal',
          rating: r.rating,
          mode: r.mode || 'Air Delivery',
          comment: r.comment,
          date: new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          verified: r.verified !== false,
          avatarBg: r.avatar_bg || 'bg-[#0B5ED7] text-white'
        }));
      }
    } catch (e) {
      console.warn('Supabase reviews fetch error:', e);
    }
  }
  return DEFAULT_REVIEWS;
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
          verified: true,
          approved: true,
          avatar_bg: review.avatarBg
        });

      if (!error) return { success: true, error: null };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to submit review' };
    }
  }
  return { success: true, error: null };
}
