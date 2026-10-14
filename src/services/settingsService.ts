import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface CompanyInfoSetting {
  name: string;
  license: string;
  email: string;
  phone: string;
  headquarters: string;
}

export interface OfficeLocationSetting {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
}

export const DEFAULT_COMPANY_INFO: CompanyInfoSetting = {
  name: 'The BC Cargo & Courier Pvt. Ltd.',
  license: 'Customs Broker License #B-409',
  email: 'thebcargo@gmail.com',
  phone: '+977-057-520000',
  headquarters: 'Central HQ: Kantirajpath, Hetauda-4, Makwanpur, Nepal'
};

export const DEFAULT_OFFICE_LOCATIONS: OfficeLocationSetting[] = [
  {
    id: 'hetauda',
    name: 'Hetauda Central HQ',
    city: 'Hetauda',
    address: 'Kantirajpath, Ward 4, Makwanpur',
    phone: '+977-057-520000',
    email: 'thebcargo@gmail.com'
  },
  {
    id: 'kathmandu',
    name: 'Kathmandu Airport Hub',
    city: 'Kathmandu',
    address: 'Tribhuvan International Airport (TIA) Cargo Complex',
    phone: '+977-01-4429910',
    email: 'thebcargo@gmail.com'
  },
  {
    id: 'birgunj',
    name: 'Birgunj Dry Port Office',
    city: 'Birgunj',
    address: 'ICP Sirsiya / Dry Port Gate',
    phone: '+977-051-524100',
    email: 'thebcargo@gmail.com'
  }
];

export async function fetchSiteSetting<T>(key: string, fallback: T): Promise<T> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', key)
        .single();

      if (!error && data?.value) {
        return data.value as T;
      }
    } catch (e) {}
  }
  return fallback;
}

export async function updateSiteSetting(key: string, value: any): Promise<{ success: boolean; error: string | null }> {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ key, value, updated_at: new Date().toISOString() });

      if (!error) return { success: true, error: null };
      return { success: false, error: error.message };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }
  return { success: true, error: null };
}
