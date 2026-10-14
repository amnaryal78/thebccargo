-- BC Cargo & Courier — Complete Production Schema, Seed Data, RLS Policies & RPC Functions

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Enums if they don't exist
DO $$ BEGIN
    CREATE TYPE service_mode AS ENUM ('air', 'sea', 'land', 'express');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE shipment_status AS ENUM ('booked', 'pickup', 'in_transit', 'customs_hold', 'out_for_delivery', 'delivered', 'exception');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE inquiry_status AS ENUM ('new', 'in_progress', 'resolved', 'spam');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'editor', 'operations', 'support', 'analyst');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. User Roles Table
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'operations',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- 3. Shipments Table
CREATE TABLE IF NOT EXISTS shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_number TEXT UNIQUE NOT NULL,
    booking_ref TEXT,
    mode TEXT NOT NULL DEFAULT 'air',
    service_name TEXT NOT NULL DEFAULT 'Air Freight Express',
    status TEXT NOT NULL DEFAULT 'In Transit',
    commodity TEXT,
    shipper_company TEXT,
    shipper_city TEXT,
    shipper_country TEXT DEFAULT 'Nepal',
    consignee_company TEXT,
    consignee_city TEXT,
    consignee_country TEXT,
    origin TEXT NOT NULL,
    origin_hub TEXT,
    destination TEXT NOT NULL,
    destination_gateway TEXT,
    carrier_info TEXT,
    gross_weight_kg NUMERIC(10, 2) DEFAULT 0,
    chargeable_weight_kg NUMERIC(10, 2) DEFAULT 0,
    volume_cbm NUMERIC(10, 2) DEFAULT 0,
    pieces INT DEFAULT 1,
    incoterm TEXT DEFAULT 'DDP',
    estimated_delivery TEXT,
    telemetry_temp TEXT,
    telemetry_eseal TEXT,
    battery_level TEXT DEFAULT '100%',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Shipment Milestones Table
CREATE TABLE IF NOT EXISTS shipment_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed',
    completed BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Bookings Queue Table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_ref TEXT UNIQUE NOT NULL,
    sender_name TEXT NOT NULL,
    sender_email TEXT NOT NULL,
    sender_phone TEXT,
    sender_address TEXT,
    receiver_name TEXT NOT NULL,
    receiver_email TEXT,
    receiver_phone TEXT,
    receiver_address TEXT,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    service_mode TEXT NOT NULL DEFAULT 'Air Delivery',
    commodity TEXT,
    weight_kg NUMERIC(10, 2) DEFAULT 1,
    box_count INT DEFAULT 1,
    dimensions TEXT,
    notes TEXT,
    estimated_price NUMERIC(10, 2),
    currency TEXT DEFAULT 'USD',
    status TEXT NOT NULL DEFAULT 'submitted',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. National Rates Table
CREATE TABLE IF NOT EXISTS national_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name TEXT NOT NULL,
    origin_region TEXT NOT NULL DEFAULT 'Kathmandu Valley',
    destination_region TEXT NOT NULL,
    min_weight_kg NUMERIC(8, 2) NOT NULL DEFAULT 0.0,
    max_weight_kg NUMERIC(8, 2) NOT NULL,
    base_rate_npr NUMERIC(10, 2) NOT NULL,
    per_kg_rate_npr NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. International Rates Table
CREATE TABLE IF NOT EXISTS international_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_code VARCHAR(3) NOT NULL,
    country_name TEXT NOT NULL,
    service_name TEXT NOT NULL,
    min_weight_kg NUMERIC(8, 2) NOT NULL DEFAULT 0.0,
    max_weight_kg NUMERIC(8, 2) NOT NULL,
    rate_usd NUMERIC(10, 2) NOT NULL,
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Blogs CMS Table
CREATE TABLE IF NOT EXISTS blogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    cover_image_url TEXT,
    author_name TEXT DEFAULT 'BC Cargo Team',
    category TEXT NOT NULL DEFAULT 'Shipping Tips',
    read_time TEXT DEFAULT '5 min read',
    published BOOLEAN NOT NULL DEFAULT TRUE,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Services CMS Table
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL DEFAULT 'Worldwide',
    description TEXT NOT NULL,
    features TEXT[] DEFAULT '{}',
    icon_name TEXT DEFAULT 'Plane',
    image_url TEXT,
    display_order INT DEFAULT 0,
    published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. FAQs Table
CREATE TABLE IF NOT EXISTS faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL DEFAULT 'General Questions',
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    role TEXT DEFAULT 'Customer',
    company TEXT DEFAULT 'Personal',
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    mode TEXT DEFAULT 'Air Delivery',
    comment TEXT NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT TRUE,
    approved BOOLEAN NOT NULL DEFAULT TRUE,
    avatar_bg TEXT DEFAULT 'bg-[#0B5ED7] text-white',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Partners Table
CREATE TABLE IF NOT EXISTS partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    logo_url TEXT NOT NULL,
    website_url TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Careers Table
CREATE TABLE IF NOT EXISTS careers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    department TEXT NOT NULL,
    location TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'Full-Time',
    description TEXT NOT NULL,
    requirements TEXT[] DEFAULT '{}',
    responsibilities TEXT[] DEFAULT '{}',
    published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. Job Applications Table
CREATE TABLE IF NOT EXISTS job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES careers(id) ON DELETE SET NULL,
    job_title TEXT NOT NULL,
    applicant_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    experience_years INT DEFAULT 0,
    cover_letter TEXT,
    resume_url TEXT,
    status TEXT NOT NULL DEFAULT 'received',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. Inquiries / Contact Messages Table
CREATE TABLE IF NOT EXISTS inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    service_mode TEXT,
    status inquiry_status NOT NULL DEFAULT 'new',
    internal_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. Policies Table
CREATE TABLE IF NOT EXISTS policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    short_title TEXT NOT NULL,
    summary TEXT,
    content TEXT NOT NULL,
    version TEXT DEFAULT '2026-v1',
    last_updated TEXT DEFAULT 'January 2026',
    published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. Site Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. Analytics Events Table
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 19. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_email TEXT,
    action TEXT NOT NULL,
    target_entity TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_shipments_tracking_number ON shipments(tracking_number);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipment_milestones_shipment_id ON shipment_milestones(shipment_id);
CREATE INDEX IF NOT EXISTS idx_bookings_ref ON bookings(booking_ref);
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
CREATE INDEX IF NOT EXISTS idx_careers_slug ON careers(slug);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);

-- ============================================================================
-- RPC FUNCTIONS
-- ============================================================================

-- Function 1: Safe Public Tracking Query (protects PII)
CREATE OR REPLACE FUNCTION get_public_shipment(tracking_num TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_shipment RECORD;
    v_milestones JSONB;
BEGIN
    SELECT * INTO v_shipment 
    FROM shipments 
    WHERE UPPER(tracking_number) = UPPER(TRIM(tracking_num));

    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', id,
            'title', title,
            'description', COALESCE(description, ''),
            'location', location,
            'timestamp', timestamp,
            'status', status,
            'completed', completed
        ) ORDER BY sort_order ASC, created_at ASC
    ), '[]'::jsonb) INTO v_milestones
    FROM shipment_milestones
    WHERE shipment_id = v_shipment.id;

    RETURN jsonb_build_object(
        'tracking_number', v_shipment.tracking_number,
        'service_mode', v_shipment.mode,
        'origin', v_shipment.origin,
        'destination', v_shipment.destination,
        'status', v_shipment.status,
        'estimated_delivery', COALESCE(v_shipment.estimated_delivery, 'In Scheduled Transit'),
        'last_updated', v_shipment.updated_at::text,
        'milestones', v_milestones
    );
END;
$$;

-- Function 2: Admin Dashboard Aggregated Metrics
CREATE OR REPLACE FUNCTION get_admin_dashboard_metrics()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total_shipments INT;
    v_in_transit INT;
    v_delivered INT;
    v_new_bookings INT;
    v_new_inquiries INT;
    v_published_blogs INT;
    v_active_jobs INT;
BEGIN
    SELECT COUNT(*) INTO v_total_shipments FROM shipments;
    SELECT COUNT(*) INTO v_in_transit FROM shipments WHERE status ILIKE '%transit%';
    SELECT COUNT(*) INTO v_delivered FROM shipments WHERE status ILIKE '%delivered%';
    SELECT COUNT(*) INTO v_new_bookings FROM bookings WHERE status = 'submitted';
    SELECT COUNT(*) INTO v_new_inquiries FROM inquiries WHERE status = 'new';
    SELECT COUNT(*) INTO v_published_blogs FROM blogs WHERE published = true;
    SELECT COUNT(*) INTO v_active_jobs FROM careers WHERE published = true;

    RETURN jsonb_build_object(
        'total_shipments', v_total_shipments,
        'in_transit', v_in_transit,
        'delivered', v_delivered,
        'new_bookings', v_new_bookings,
        'new_inquiries', v_new_inquiries,
        'published_blogs', v_published_blogs,
        'active_jobs', v_active_jobs
    );
END;
$$;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE national_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE international_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE careers ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Public READ policies for published CMS data
CREATE POLICY "Public read published blogs" ON blogs FOR SELECT USING (published = true);
CREATE POLICY "Public read published services" ON services FOR SELECT USING (published = true);
CREATE POLICY "Public read published faqs" ON faqs FOR SELECT USING (published = true);
CREATE POLICY "Public read approved reviews" ON reviews FOR SELECT USING (approved = true);
CREATE POLICY "Public read published partners" ON partners FOR SELECT USING (published = true);
CREATE POLICY "Public read published careers" ON careers FOR SELECT USING (published = true);
CREATE POLICY "Public read national rates" ON national_rates FOR SELECT USING (true);
CREATE POLICY "Public read international rates" ON international_rates FOR SELECT USING (true);
CREATE POLICY "Public read published policies" ON policies FOR SELECT USING (published = true);
CREATE POLICY "Public read site settings" ON site_settings FOR SELECT USING (true);

-- Public INSERT policies for customer interactions
CREATE POLICY "Public insert inquiries" ON inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert job applications" ON job_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert reviews" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert analytics" ON analytics_events FOR INSERT WITH CHECK (true);

-- Full access for authenticated staff/admin
CREATE POLICY "Staff full access shipments" ON shipments FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Staff full access shipment_milestones" ON shipment_milestones FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Staff full access bookings" ON bookings FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Staff full access national_rates" ON national_rates FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Staff full access international_rates" ON international_rates FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Staff full access blogs" ON blogs FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Staff full access services" ON services FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Staff full access faqs" ON faqs FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Staff full access reviews" ON reviews FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Staff full access partners" ON partners FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Staff full access careers" ON careers FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Staff full access job_applications" ON job_applications FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Staff full access inquiries" ON inquiries FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Staff full access policies" ON policies FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Staff full access site_settings" ON site_settings FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Staff full access audit_logs" ON audit_logs FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Allow anon execute on public RPC functions
GRANT EXECUTE ON FUNCTION get_public_shipment(TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_admin_dashboard_metrics() TO anon, authenticated, service_role;
