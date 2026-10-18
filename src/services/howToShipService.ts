import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { HowToShipData } from '../types/howToShip';
import { DEFAULT_HOW_TO_SHIP } from '../data/defaultHowToShip';

export async function fetchPublishedHowToShip(): Promise<HowToShipData> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('how_to_ship')
        .select('*')
        .eq('published', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          slug: data.slug || 'default',
          title_en: data.title_en || DEFAULT_HOW_TO_SHIP.title_en,
          title_np: data.title_np || DEFAULT_HOW_TO_SHIP.title_np,
          intro_en: data.intro_en || DEFAULT_HOW_TO_SHIP.intro_en,
          intro_np: data.intro_np || DEFAULT_HOW_TO_SHIP.intro_np,
          sections: Array.isArray(data.sections) && data.sections.length > 0 ? data.sections : DEFAULT_HOW_TO_SHIP.sections,
          warnings: Array.isArray(data.warnings) ? data.warnings : DEFAULT_HOW_TO_SHIP.warnings,
          contact_title_en: data.contact_title_en || DEFAULT_HOW_TO_SHIP.contact_title_en,
          contact_title_np: data.contact_title_np || DEFAULT_HOW_TO_SHIP.contact_title_np,
          contact_text_en: data.contact_text_en || DEFAULT_HOW_TO_SHIP.contact_text_en,
          contact_text_np: data.contact_text_np || DEFAULT_HOW_TO_SHIP.contact_text_np,
          whatsapp_number: data.whatsapp_number || DEFAULT_HOW_TO_SHIP.whatsapp_number,
          published: data.published ?? true,
          updated_at: data.updated_at,
          updated_by: data.updated_by,
        };
      }
    } catch (err) {
      console.warn('Error fetching how_to_ship from Supabase, falling back to default:', err);
    }
  }
  return DEFAULT_HOW_TO_SHIP;
}

export async function fetchAdminHowToShip(): Promise<HowToShipData> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('how_to_ship')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          slug: data.slug || 'default',
          title_en: data.title_en || DEFAULT_HOW_TO_SHIP.title_en,
          title_np: data.title_np || DEFAULT_HOW_TO_SHIP.title_np,
          intro_en: data.intro_en || DEFAULT_HOW_TO_SHIP.intro_en,
          intro_np: data.intro_np || DEFAULT_HOW_TO_SHIP.intro_np,
          sections: Array.isArray(data.sections) && data.sections.length > 0 ? data.sections : DEFAULT_HOW_TO_SHIP.sections,
          warnings: Array.isArray(data.warnings) ? data.warnings : DEFAULT_HOW_TO_SHIP.warnings,
          contact_title_en: data.contact_title_en || DEFAULT_HOW_TO_SHIP.contact_title_en,
          contact_title_np: data.contact_title_np || DEFAULT_HOW_TO_SHIP.contact_title_np,
          contact_text_en: data.contact_text_en || DEFAULT_HOW_TO_SHIP.contact_text_en,
          contact_text_np: data.contact_text_np || DEFAULT_HOW_TO_SHIP.contact_text_np,
          whatsapp_number: data.whatsapp_number || DEFAULT_HOW_TO_SHIP.whatsapp_number,
          published: data.published ?? true,
          updated_at: data.updated_at,
          updated_by: data.updated_by,
        };
      }
    } catch (err) {
      console.warn('Error fetching admin how_to_ship from Supabase:', err);
    }
  }
  return DEFAULT_HOW_TO_SHIP;
}

export async function saveHowToShip(content: HowToShipData, userEmail?: string): Promise<HowToShipData> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }

  const payload: any = {
    slug: content.slug || 'default',
    title_en: content.title_en,
    title_np: content.title_np,
    intro_en: content.intro_en,
    intro_np: content.intro_np,
    sections: content.sections,
    warnings: content.warnings || [],
    contact_title_en: content.contact_title_en,
    contact_title_np: content.contact_title_np,
    contact_text_en: content.contact_text_en,
    contact_text_np: content.contact_text_np,
    whatsapp_number: content.whatsapp_number || '9779855019485',
    published: content.published,
    updated_at: new Date().toISOString(),
    updated_by: userEmail || 'admin',
  };

  if (content.id) {
    payload.id = content.id;
  }

  const { data, error } = await supabase
    .from('how_to_ship')
    .upsert(payload, { onConflict: 'slug' })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return {
    id: data.id,
    slug: data.slug,
    title_en: data.title_en,
    title_np: data.title_np,
    intro_en: data.intro_en,
    intro_np: data.intro_np,
    sections: data.sections,
    warnings: data.warnings,
    contact_title_en: data.contact_title_en,
    contact_title_np: data.contact_title_np,
    contact_text_en: data.contact_text_en,
    contact_text_np: data.contact_text_np,
    whatsapp_number: data.whatsapp_number,
    published: data.published,
    updated_at: data.updated_at,
    updated_by: data.updated_by,
  };
}

export function subscribeToHowToShipUpdates(onUpdate: (updated: HowToShipData) => void): () => void {
  if (!isSupabaseConfigured) {
    return () => {};
  }

  const channel = supabase
    .channel('public:how_to_ship_realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'how_to_ship' },
      (payload) => {
        if (payload.new && (payload.new as any).published) {
          const raw = payload.new as any;
          onUpdate({
            id: raw.id,
            slug: raw.slug,
            title_en: raw.title_en,
            title_np: raw.title_np,
            intro_en: raw.intro_en,
            intro_np: raw.intro_np,
            sections: raw.sections,
            warnings: raw.warnings,
            contact_title_en: raw.contact_title_en,
            contact_title_np: raw.contact_title_np,
            contact_text_en: raw.contact_text_en,
            contact_text_np: raw.contact_text_np,
            whatsapp_number: raw.whatsapp_number,
            published: raw.published,
            updated_at: raw.updated_at,
            updated_by: raw.updated_by,
          });
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
