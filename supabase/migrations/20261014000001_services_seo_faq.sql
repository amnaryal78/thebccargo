-- Migration: 20261014000001_services_seo_faq.sql
-- Add SEO metadata and per-service FAQs to services table

ALTER TABLE services ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS faq JSONB DEFAULT '[]'::jsonb;
ALTER TABLE services ADD COLUMN IF NOT EXISTS what_we_carry TEXT[] DEFAULT '{}';
ALTER TABLE services ADD COLUMN IF NOT EXISTS what_we_do_not_carry TEXT[] DEFAULT '{}';

-- Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_services_slug ON services (slug);

-- Update or insert canonical default services
INSERT INTO services (title, slug, category, description, features, icon_name, seo_title, seo_description, what_we_carry, what_we_do_not_carry, published)
VALUES
  (
    'International Air Freight Express',
    'international-air-freight',
    'Worldwide',
    'Daily priority air cargo departures from Kathmandu TIA Gateway to 190+ global destinations. Fast customs escort, temperature monitoring, and full telematics tracking.',
    ARRAY['Direct air links to FRA, DXB, BKK & HKG', 'Secured TIA bonded customs escort', 'Daily scheduled departures', 'Full AWB door-to-door tracking'],
    'Plane',
    'International Air Cargo & Freight from Nepal | The BC Cargo',
    'Fast international air cargo and express courier from Kathmandu Nepal to Europe, Americas, Middle East, and Asia. Government licensed customs clearance.',
    ARRAY['Garments, pashmina & textiles', 'Orthodox Himalayan tea & coffee', 'Handicrafts & religious art', 'Electronic equipment & commercial samples', 'Documents & personal consignments'],
    ARRAY['Unsealed perishable meats without cold-chain charter', 'Unlabelled bulk hazardous chemicals', 'Narcotics & psychotropic substances', 'Explosives, ammunition & illegal contraband'],
    true
  ),
  (
    'Cross-Border Overland Linehaul',
    'cross-border-overland',
    'Regional',
    'Heavy linehaul surface cargo connecting Nepal, India, and China with satellite GPS container trucks and bilateral treaty transit documentation.',
    ARRAY['Direct routes via Birgunj / Raxaul ICD', 'GPS satellite monitored fleet', 'Nepal-India transit treaty compliance', 'Covered container linehaul trucks'],
    'Truck',
    'Cross-Border Overland Freight Nepal to India & China | The BC Cargo',
    'Reliable surface trucking logistics between Hetauda, Kathmandu, Birgunj dry port, Delhi NCR, Kolkata port, and northern borders.',
    ARRAY['Industrial machinery & spare parts', 'Commercial wholesale goods', 'Agricultural products & pulses', 'Construction hardware', 'Raw manufacturing materials'],
    ARRAY['Loose flammable liquids without UN containers', 'Unaccompanied cash and bullion', 'Prohibited wildlife products', 'Unmanifested contraband'],
    true
  ),
  (
    'International Ocean Freight & Intermodal',
    'ocean-freight-intermodal',
    'Worldwide',
    'Economical maritime shipping for heavy bulk exports connecting Birgunj rail dry port with Kolkata and Visakhapatnam seaports.',
    ARRAY['LCL shared container consolidation', 'FCL full 20ft/40ft container dispatch', 'Direct CONCOR rail transit to ports', 'Marine cargo insurance coverage'],
    'Ship',
    'International Ocean Shipping & Sea Freight Nepal | The BC Cargo',
    'Cost-effective multimodal sea cargo shipping from Nepal to global seaports via Kolkata and Visakhapatnam dry ports.',
    ARRAY['Heavy export carpets & woollens', 'Handmade paper & wooden crafts', 'Bulk tea & agricultural commodities', 'Mining minerals & stone crafts', 'High-volume commercial crates'],
    ARRAY['Perishable foodstuffs on standard containers', 'Lithium batteries exceeding maritime safety limits', 'Uninspected hazardous waste', 'Stolen or counterfeit goods'],
    true
  ),
  (
    'Nepal Domestic Express & Surface Hubs',
    'nepal-domestic-express',
    'National',
    'Scheduled nightly linehaul and express courier linking Kathmandu, Hetauda, Pokhara, Biratnagar, Butwal, and Narayangarh hubs.',
    ARRAY['Nightly hub-to-hub trunk departures', 'Next-day delivery across major cities', 'Doorstep pickup in Kathmandu Valley & Hetauda', 'Electronic proof of delivery (e-POD)'],
    'Truck',
    'Nepal Domestic Courier & Cargo Services | The BC Cargo',
    'Fast, secure domestic courier and freight transport connecting major economic corridors across Nepal with daily scheduled runs.',
    ARRAY['Ecommerce parcels & retail goods', 'Office documents & tenders', 'Pharmaceuticals with doctor prescription', 'Textiles, footwear & hardware', 'Household and personal effects'],
    ARRAY['Illegal substances & unregistered weapons', 'Hazardous leaking chemicals', 'Counterfeit currency', 'Unpackaged fragile glassware'],
    true
  )
ON CONFLICT (slug) DO UPDATE
SET 
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  what_we_carry = EXCLUDED.what_we_carry,
  what_we_do_not_carry = EXCLUDED.what_we_do_not_carry,
  published = true;
