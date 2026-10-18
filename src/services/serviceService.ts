import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ServiceItem } from '../types';


export const DEFAULT_SERVICES: ServiceItem[] = [
  {
    id: 's-1',
    title: 'Fast International Air Delivery',
    slug: 'fast-international-air-delivery',
    category: 'Worldwide',
    description: 'Daily flight connections from Kathmandu (TIA) to over 50 countries.',
    features: ['Daily Flights Worldwide', 'Kathmandu & Hetauda Export Pickup', 'Customs Paperwork Included'],
    iconName: 'Plane'
  },
  {
    id: 's-2',
    title: 'International Sea Delivery',
    slug: 'international-sea-delivery',
    category: 'Worldwide',
    description: 'Best for large, heavy, and bulk container shipments via Kolkata port.',
    features: ['Full Container (FCL) & Groupage (LCL)', 'Direct Rail Corridor Birgunj-Kolkata', 'Cost-Effective Heavy Cargo'],
    iconName: 'Ship'
  },
  {
    id: 's-3',
    title: 'Cross-Border Road Delivery',
    slug: 'cross-border-road-delivery',
    category: 'Overland Corridor',
    description: 'Daily truck network connecting Nepal, India, and China border posts.',
    features: ['Nepal-India ICP Raxaul/Birgunj', 'China Border Tatopani & Rasuwagadhi', 'GPS Tracked Fleet Trucks'],
    iconName: 'Truck'
  },
  {
    id: 's-4',
    title: 'Customs & Clearance Support',
    slug: 'customs-and-clearance-support',
    category: 'Worldwide',
    description: 'Government-licensed customs brokerage (#B-409) for stress-free export/import clearance.',
    features: ['Licensed Customs Broker #B-409', 'ASYCUDA World Pre-Filing', 'Commercial Duty Guidance'],
    iconName: 'FileCheck'
  }
];

export async function fetchPublishedServices(): Promise<ServiceItem[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('published', true)
        .order('display_order', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((s: any) => ({
          id: s.id,
          title: s.title,
          slug: s.slug,
          category: s.category || 'Worldwide',
          description: s.description,
          features: s.features || [],
          iconName: s.icon_name || 'Plane'
        }));
      }
    } catch (e) {
      console.warn('Supabase services fetch error:', e);
    }
  }
  return DEFAULT_SERVICES;
}
