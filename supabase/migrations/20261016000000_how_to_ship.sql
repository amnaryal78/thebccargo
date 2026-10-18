-- Migration: 20261016000000_how_to_ship.sql
-- Description: Create how_to_ship table, indexes, RLS policies, realtime publication, and initial seed content.

-- 1. Create how_to_ship table
CREATE TABLE IF NOT EXISTS public.how_to_ship (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL DEFAULT 'default',
    title_en TEXT NOT NULL DEFAULT 'Before You Ship',
    title_np TEXT NOT NULL DEFAULT 'सामान पठाउनुअघि',
    intro_en TEXT NOT NULL DEFAULT 'Read this simple guide before sending your parcel with The BC Cargo.',
    intro_np TEXT NOT NULL DEFAULT 'The BC Cargo मार्फत आफ्नो पार्सल पठाउनुअघि यो सरल निर्देशिका पढ्नुहोस्।',
    sections JSONB NOT NULL DEFAULT '[]'::jsonb,
    warnings JSONB NOT NULL DEFAULT '[]'::jsonb,
    contact_title_en TEXT NOT NULL DEFAULT 'Not sure about your parcel?',
    contact_title_np TEXT NOT NULL DEFAULT 'सामानबारे अन्योलमा हुनुहुन्छ?',
    contact_text_en TEXT NOT NULL DEFAULT 'Contact The BC Cargo on WhatsApp before sending it.',
    contact_text_np TEXT NOT NULL DEFAULT 'सामान पठाउनुअघि The BC Cargo मा WhatsApp मार्फत सम्पर्क गर्नुहोस्।',
    whatsapp_number TEXT NOT NULL DEFAULT '9779855019485',
    published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by TEXT DEFAULT 'system'
);

-- 2. Indexes for lookup
CREATE INDEX IF NOT EXISTS idx_how_to_ship_slug ON public.how_to_ship (slug);
CREATE INDEX IF NOT EXISTS idx_how_to_ship_published ON public.how_to_ship (published);

-- 3. Row Level Security
ALTER TABLE public.how_to_ship ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Public read published how_to_ship" ON public.how_to_ship;
DROP POLICY IF EXISTS "Admins full access how_to_ship" ON public.how_to_ship;

-- Public can read only published how_to_ship content
CREATE POLICY "Public read published how_to_ship"
ON public.how_to_ship FOR SELECT
USING (published = true);

-- Authorized admin / staff can create, read, update, delete how_to_ship
CREATE POLICY "Admins full access how_to_ship"
ON public.how_to_ship FOR ALL
USING (
    auth.role() = 'service_role' OR
    (auth.role() = 'authenticated' AND (
        public.is_admin() OR
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE (user_id = auth.uid() OR lower(email) = lower(auth.jwt() ->> 'email'))
              AND active = true
              AND role IN ('super_admin', 'admin', 'editor')
        )
    ))
)
WITH CHECK (
    auth.role() = 'service_role' OR
    (auth.role() = 'authenticated' AND (
        public.is_admin() OR
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE (user_id = auth.uid() OR lower(email) = lower(auth.jwt() ->> 'email'))
              AND active = true
              AND role IN ('super_admin', 'admin', 'editor')
        )
    ))
);

-- 4. Enable Supabase Realtime for how_to_ship table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND tablename = 'how_to_ship'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.how_to_ship;
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- In case supabase_realtime publication is not configured or permissions vary
    NULL;
END $$;

-- 5. Seed Initial Published Content
INSERT INTO public.how_to_ship (
    slug,
    title_en,
    title_np,
    intro_en,
    intro_np,
    sections,
    warnings,
    contact_title_en,
    contact_title_np,
    contact_text_en,
    contact_text_np,
    whatsapp_number,
    published,
    updated_at,
    updated_by
) VALUES (
    'default',
    'Before You Ship',
    'सामान पठाउनुअघि',
    'Read this simple guide before sending your parcel with The BC Cargo.',
    'The BC Cargo मार्फत आफ्नो पार्सल पठाउनुअघि यो सरल निर्देशिका पढ्नुहोस्।',
    $SECTIONS$[
      {
        "order": 1,
        "section_number": 1,
        "title_en": "What Can You Send?",
        "title_np": "के पठाउन मिल्छ?",
        "icon": "PackageCheck",
        "items": [
          { "en": "Clothes, shoes and bags", "np": "लुगा, जुत्ता र झोला" },
          { "en": "Dry food, spices, tea and packed snacks", "np": "सुक्खा खानेकुरा, मसला, चिया र प्याकेटका खाजा" },
          { "en": "Documents, books and certificates", "np": "कागजात, किताब र प्रमाणपत्र" },
          { "en": "Gifts, household items and handicrafts", "np": "उपहार, घरायसी सामान र हस्तकलाका सामग्री" },
          { "en": "Prescribed medicine", "np": "डाक्टरले लेखिदिएको औषधि" },
          { "en": "Sealed pickles", "np": "राम्ररी प्याक गरिएको अचार" }
        ]
      },
      {
        "order": 2,
        "section_number": 2,
        "title_en": "Items With Special Rules",
        "title_np": "विशेष नियम भएका सामान",
        "icon": "AlertCircle",
        "items": [
          {
            "highlight_en": "Medicine",
            "highlight_np": "औषधि",
            "en": "A prescription is required. Only small amounts for personal use are allowed.",
            "np": "डाक्टरको प्रेस्क्रिप्सन अनिवार्य चाहिन्छ। व्यक्तिगत प्रयोगका लागि थोरै परिमाण मात्र पठाउन मिल्छ।"
          },
          {
            "highlight_en": "Meat",
            "highlight_np": "मासु",
            "en": "Allowed only for Europe, with an extra charge. Not allowed for South Korea, Japan or Australia.",
            "np": "युरोपका लागि मात्र अतिरिक्त शुल्क तिरेर पठाउन मिल्छ। दक्षिण कोरिया, जापान र अष्ट्रेलियाका लागि पूर्ण प्रतिबन्धित छ।"
          },
          {
            "highlight_en": "Phones and laptops",
            "highlight_np": "मोबाइल र ल्यापटप",
            "en": "The battery must be inside the device. Ask us first.",
            "np": "ब्याट्री उपकरणभित्रै जडान भएको हुनुपर्छ। प्याक गर्नुअघि हामीलाई सोध्नुहोस्।"
          },
          {
            "highlight_en": "Liquids",
            "highlight_np": "झोल पदार्थ",
            "en": "Must be sealed and packed well. Ask us first.",
            "np": "राम्ररी सिलबन्दी र सुरक्षित प्याकिङ हुनुपर्छ। प्याक गर्नुअघि हामीलाई सोध्नुहोस्।"
          }
        ]
      },
      {
        "order": 3,
        "section_number": 3,
        "title_en": "Items You Cannot Send",
        "title_np": "पठाउन नमिल्ने सामान",
        "icon": "Ban",
        "items": [
          {
            "highlight_en": "Dangerous items",
            "highlight_np": "खतरनाक सामान",
            "en": "Gas, lighters, matches, explosives and large amounts of perfume or paint.",
            "np": "ग्यास, लाइटर, सलाई, विस्फोटक पदार्थ तथा धेरै परिमाणको पर्फ्युम वा पेन्ट।"
          },
          {
            "highlight_en": "Loose batteries and power banks",
            "highlight_np": "छुट्टै ब्याट्री र पावर बैंक",
            "en": "Loose lithium batteries and standalone power banks are prohibited by aviation safety standards.",
            "np": "खुल्ला ब्याट्री र पावर बैंक हवाई सुरक्षा नियमअनुसार पूर्ण प्रतिबन्धित छन्।"
          },
          {
            "highlight_en": "Cash, gold, silver and jewellery",
            "highlight_np": "नगद, सुन, चाँदी र गहना",
            "en": "Currency notes, bullion, precious metals and high-value jewellery.",
            "np": "नगद रुपैयाँ, सुन, चाँदी तथा बहुमूल्य गहनाहरू।"
          },
          {
            "highlight_en": "Illegal drugs and other banned items",
            "highlight_np": "लागूऔषध र गैरकानुनी सामान",
            "en": "Narcotics, contraband and all substances restricted by state law.",
            "np": "लागूऔषध, प्रतिबन्धित औषधि तथा कानुनले निषेध गरेका सबै वस्तुहरू।"
          },
          {
            "highlight_en": "Weapons and bullets",
            "highlight_np": "हतियार र गोली",
            "en": "Firearms, ammunition, tactical knives and military equipment.",
            "np": "बन्दुक, गोली, धारिलो हतियार तथा सैन्य सामग्री।"
          },
          {
            "highlight_en": "Fresh fruits, vegetables, seeds and plants",
            "highlight_np": "ताजा फलफूल, तरकारी, बीउ र बिरुवा",
            "en": "Perishable fresh agriculture, soil, viable seeds and living flora.",
            "np": "काँचो फलफूल, हरियो तरकारी, बीउबिजन, माटो र जिउँदा बिरुवाहरू।"
          },
          {
            "highlight_en": "Fake branded goods",
            "highlight_np": "नक्कली ब्रान्डका सामान",
            "en": "Counterfeit designer items, unauthorized replicas and copyright-infringing merchandise.",
            "np": "नक्कली ब्रान्डेड लुगा, नक्कल गरिएका सामान तथा बौद्धिक सम्पत्ति उल्लङ्घन गर्ने सामग्री।"
          }
        ],
        "extra_text_en": "Every country has different rules. If you are unsure, send us a photo on WhatsApp before packing.",
        "extra_text_np": "कुनै सामान पठाउन मिल्छ कि मिल्दैन भन्ने थाहा छैन? प्याक गर्नुअघि WhatsApp मा फोटो पठाउनुहोस्।"
      },
      {
        "order": 4,
        "section_number": 4,
        "title_en": "What Should You Bring?",
        "title_np": "के-के ल्याउने?",
        "icon": "FileCheck2",
        "items": [
          { "en": "A copy of the sender’s citizenship card or passport", "np": "पठाउने व्यक्तिको नागरिकता वा राहदानीको प्रतिलिपि" },
          { "en": "Receiver’s full name, address and phone number", "np": "पाउने व्यक्तिको पूरा नाम, ठेगाना र फोन नम्बर" },
          { "en": "Korean or Japanese address in the local language, if possible", "np": "सम्भव भए कोरियन वा जापानी भाषामा ठेगाना पनि" },
          { "en": "South Korea: Receiver’s Personal Customs Clearance Code, if available", "np": "दक्षिण कोरियाका लागि पाउने व्यक्तिको व्यक्तिगत भन्सार कोड (개인통관고यु부호), भएमा" },
          { "en": "A doctor’s prescription for medicine", "np": "औषधिका लागि डाक्टरको प्रेस्क्रिप्सन" }
        ]
      },
      {
        "order": 5,
        "section_number": 5,
        "title_en": "How to Pack",
        "title_np": "सामान कसरी प्याक गर्ने?",
        "icon": "Box",
        "items": [
          { "en": "Bring items unpacked if possible. We will pack them safely.", "np": "सम्भव भए सामान प्याक नगरी ल्याउनुहोस्। हामी सुरक्षित रूपमा प्याक गरिदिन्छौँ।" },
          { "en": "Seal pickles and oil in two plastic bags.", "np": "अचार र तेललाई दुईवटा प्लास्टिक झोलामा राम्ररी बन्द गर्नुहोस्।" },
          { "en": "Do not hide items inside other items.", "np": "एउटा सामानभित्र अर्को सामान लुकाएर नराख्नुहोस्।" },
          { "en": "Make a simple list of all items.", "np": "पठाउने सबै सामानको सामान्य सूची बनाउनुहोस्।" }
        ]
      },
      {
        "order": 6,
        "section_number": 6,
        "title_en": "Customs and Tax",
        "title_np": "भन्सार र कर",
        "icon": "Scale",
        "items": [
          {
            "en": "We prepare the export papers in Nepal. The destination country may charge import tax or customs duty. The receiver must pay these charges.",
            "np": "नेपालबाट पठाउन चाहिने कागजात हामी तयार गर्छौँ। सामान पुगेको देशमा भन्सार वा कर लाग्न सक्छ। यस्तो शुल्क पाउने व्यक्तिले तिर्नुपर्छ।"
          },
          {
            "en": "If extra charges are likely, we will inform you in advance whenever possible.",
            "np": "थप शुल्क लाग्ने सम्भावना भएमा हामी सकेसम्म पहिले नै जानकारी दिन्छौँ."
          }
        ]
      }
    ]$SECTIONS$::jsonb,
    $WARNINGS$[
      "Every country has different customs and import regulations. Contact us before dispatching sensitive or commercial cargo.",
      "सबै देशका भन्सार र आयात नियम फरक हुन्छन्। संवेदनशील वा व्यावसायिक सामान पठाउनुअघि हामीलाई सम्पर्क गर्नुहोस्।"
    ]$WARNINGS$::jsonb,
    'Not sure about your parcel?',
    'सामानबारे अन्योलमा हुनुहुन्छ?',
    'Contact The BC Cargo on WhatsApp before sending it.',
    'सामान पठाउनुअघि The BC Cargo मा WhatsApp मार्फत सम्पर्क गर्नुहोस्।',
    '9779855019485',
    true,
    NOW(),
    'initial_seed'
)
ON CONFLICT (slug) DO UPDATE
SET
    title_en = EXCLUDED.title_en,
    title_np = EXCLUDED.title_np,
    intro_en = EXCLUDED.intro_en,
    intro_np = EXCLUDED.intro_np,
    sections = EXCLUDED.sections,
    warnings = EXCLUDED.warnings,
    contact_title_en = EXCLUDED.contact_title_en,
    contact_title_np = EXCLUDED.contact_title_np,
    contact_text_en = EXCLUDED.contact_text_en,
    contact_text_np = EXCLUDED.contact_text_np,
    whatsapp_number = EXCLUDED.whatsapp_number,
    published = EXCLUDED.published,
    updated_at = NOW();
