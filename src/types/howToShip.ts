export interface HowToShipItem {
  id?: string;
  en: string;
  np: string;
  highlight_en?: string;
  highlight_np?: string;
  note_en?: string;
  note_np?: string;
}

export interface HowToShipSection {
  id?: string;
  order: number;
  section_number: number;
  title_en: string;
  title_np: string;
  icon?: string;
  items: HowToShipItem[];
  extra_text_en?: string;
  extra_text_np?: string;
}

export interface HowToShipData {
  id?: string;
  slug: string;
  title_en: string;
  title_np: string;
  intro_en: string;
  intro_np?: string;
  sections: HowToShipSection[];
  warnings?: string[];
  contact_title_en: string;
  contact_title_np: string;
  contact_text_en: string;
  contact_text_np: string;
  whatsapp_number?: string;
  published: boolean;
  updated_at?: string;
  updated_by?: string;
}
