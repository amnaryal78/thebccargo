import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface InquiryRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  serviceMode?: string;
  status: 'new' | 'in_progress' | 'resolved' | 'spam';
  internalNotes?: string;
  createdAt: string;
}

const INITIAL_INQUIRIES: InquiryRecord[] = [
  {
    id: 'INQ-1001',
    name: 'Rajesh Sharma',
    email: 'rajesh@himalayanexports.np',
    phone: '+977-9851092831',
    subject: 'Bulk Handicraft Air Cargo to Frankfurt',
    message: 'We require weekly air freight capacity of 250kg carpet and handicraft shipment to FRA.',
    serviceMode: 'air',
    status: 'new',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'INQ-1002',
    name: 'Anita Gurung',
    email: 'anita@pashminanepal.com',
    phone: '+977-9801234567',
    subject: 'Express Courier Rate Inquiry for Dubai',
    message: 'Requesting volume pricing bracket for 15kg pashmina parcels sent bi-weekly.',
    serviceMode: 'express',
    status: 'in_progress',
    internalNotes: 'Contacted customer, rate quote sent on Sep 22.',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

export const getInitialInquiries = (): InquiryRecord[] => {
  try {
    const saved = localStorage.getItem('bc_cargo_inquiries');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return INITIAL_INQUIRIES;
};

export const getInquiries = async (): Promise<InquiryRecord[]> => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          name: d.name,
          email: d.email,
          phone: d.phone,
          subject: d.subject,
          message: d.message,
          serviceMode: d.service_mode,
          status: d.status || 'new',
          internalNotes: d.internal_notes,
          createdAt: d.created_at
        }));
      }
    } catch (err) {
      console.warn('Supabase inquiries fetch fallback:', err);
    }
  }

  try {
    const saved = localStorage.getItem('bc_cargo_inquiries');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return INITIAL_INQUIRIES;
};

export const submitInquiry = async (
  inquiry: Omit<InquiryRecord, 'id' | 'createdAt' | 'status'>,
  _turnstileToken?: string
): Promise<{ record: InquiryRecord | null; error: string | null }> => {
  if (isSupabaseConfigured) {
    // Insert straight into Supabase. The id is made here because visitors cannot read rows back.
    const id = crypto.randomUUID();
    const { error } = await supabase.from('inquiries').insert({
      id,
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone ?? null,
      subject: inquiry.subject ?? null,
      message: inquiry.message,
      service_mode: inquiry.serviceMode ?? null,
    });
    if (error) {
      console.warn('Inquiry insert failed:', error.message);
      return { record: null, error: 'We could not send your message. Please try again or call us.' };
    }
    return { record: { ...inquiry, id, status: 'new', createdAt: new Date().toISOString() }, error: null };
  }

  // Local development only (Supabase not configured)
  const generatedId = `INQ-2026-${Math.floor(10000 + Math.random() * 90000)}`;
  const localRecord: InquiryRecord = { ...inquiry, id: generatedId, status: 'new', createdAt: new Date().toISOString() };
  try {
    const saved = localStorage.getItem('bc_cargo_inquiries');
    const current = saved ? JSON.parse(saved) : INITIAL_INQUIRIES;
    localStorage.setItem('bc_cargo_inquiries', JSON.stringify([localRecord, ...current]));
  } catch (e) {}
  return { record: localRecord, error: null };
};

export const updateInquiryStatus = async (
  id: string,
  status: InquiryRecord['status'],
  internalNotes?: string
): Promise<InquiryRecord[]> => {
  if (isSupabaseConfigured) {
    try {
      await supabase
        .from('inquiries')
        .update({
          status,
          internal_notes: internalNotes
        })
        .eq('id', id);
    } catch (err) {
      console.warn('Failed to update inquiry status in Supabase:', err);
    }
  }

  let updated: InquiryRecord[] = [];
  try {
    const saved = localStorage.getItem('bc_cargo_inquiries');
    const current: InquiryRecord[] = saved ? JSON.parse(saved) : INITIAL_INQUIRIES;
    updated = current.map(item => item.id === id ? { ...item, status, internalNotes } : item);
    localStorage.setItem('bc_cargo_inquiries', JSON.stringify(updated));
  } catch (e) {}
  return updated;
};

export const deleteInquiry = async (id: string): Promise<InquiryRecord[]> => {
  if (isSupabaseConfigured) {
    try {
      await supabase.from('inquiries').delete().eq('id', id);
    } catch (err) {
      console.warn('Failed to delete inquiry from Supabase:', err);
    }
  }

  let updated: InquiryRecord[] = [];
  try {
    const saved = localStorage.getItem('bc_cargo_inquiries');
    const current: InquiryRecord[] = saved ? JSON.parse(saved) : INITIAL_INQUIRIES;
    updated = current.filter(item => item.id !== id);
    localStorage.setItem('bc_cargo_inquiries', JSON.stringify(updated));
  } catch (e) {}
  return updated;
};
