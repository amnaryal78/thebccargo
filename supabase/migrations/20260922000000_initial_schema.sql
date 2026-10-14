-- BC Cargo & Courier — Initial Database Schema & RLS Policies Migration

-- 1. Create Custom Enums
CREATE TYPE service_mode AS ENUM ('air', 'sea', 'land', 'express');
CREATE TYPE shipment_status AS ENUM ('booked', 'pickup', 'in_transit', 'customs_hold', 'out_for_delivery', 'delivered', 'exception');
CREATE TYPE inquiry_status AS ENUM ('new', 'in_progress', 'resolved', 'spam');
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'content_manager', 'operations', 'support', 'analyst');

-- 2. User Roles Table (Tied to Supabase Auth Users)
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'operations',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- 3. Shipments Table
CREATE TABLE shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_number TEXT UNIQUE NOT NULL,
    service_mode service_mode NOT NULL DEFAULT 'air',
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    sender_name TEXT,
    sender_email TEXT,
    sender_phone TEXT,
    receiver_name TEXT,
    receiver_email TEXT,
    receiver_phone TEXT,
    status shipment_status NOT NULL DEFAULT 'booked',
    estimated_delivery TIMESTAMPTZ,
    declared_value NUMERIC(12, 2),
    currency TEXT DEFAULT 'USD',
    current_location TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Shipment Milestones Table
CREATE TABLE shipment_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status shipment_status NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. National Rates Table
CREATE TABLE national_rates (
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

-- 6. International Rates Table
CREATE TABLE international_rates (
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

-- 7. Blogs CMS Table
CREATE TABLE blogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    cover_image_url TEXT,
    author_name TEXT DEFAULT 'BC Cargo Team',
    published BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Inquiries / Bookings Queue Table
CREATE TABLE inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    service_mode service_mode,
    status inquiry_status NOT NULL DEFAULT 'new',
    internal_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. FAQs Table
CREATE TABLE faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL DEFAULT 'General',
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Reviews Table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    company TEXT,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    approved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Partners Table
CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    logo_url TEXT NOT NULL,
    website_url TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Audit Logs Table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE national_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE international_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if current user has an admin role
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = auth.uid()
        AND role IN ('super_admin', 'admin', 'operations', 'content_manager', 'support')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Public Read Policies for Website Content
CREATE POLICY "Public can view published blogs" ON blogs FOR SELECT USING (published = TRUE);
CREATE POLICY "Public can view national rates" ON national_rates FOR SELECT USING (TRUE);
CREATE POLICY "Public can view international rates" ON international_rates FOR SELECT USING (TRUE);
CREATE POLICY "Public can view published faqs" ON faqs FOR SELECT USING (published = TRUE);
CREATE POLICY "Public can view approved reviews" ON reviews FOR SELECT USING (approved = TRUE);
CREATE POLICY "Public can view published partners" ON partners FOR SELECT USING (published = TRUE);

-- Public Write Policy for Submitting Inquiries
CREATE POLICY "Public can submit inquiries" ON inquiries FOR INSERT WITH CHECK (TRUE);

-- Admin Full Access Policies
CREATE POLICY "Admins full access user_roles" ON user_roles FOR ALL USING (is_admin_user());
CREATE POLICY "Admins full access shipments" ON shipments FOR ALL USING (is_admin_user());
CREATE POLICY "Admins full access shipment_milestones" ON shipment_milestones FOR ALL USING (is_admin_user());
CREATE POLICY "Admins full access national_rates" ON national_rates FOR ALL USING (is_admin_user());
CREATE POLICY "Admins full access international_rates" ON international_rates FOR ALL USING (is_admin_user());
CREATE POLICY "Admins full access blogs" ON blogs FOR ALL USING (is_admin_user());
CREATE POLICY "Admins full access inquiries" ON inquiries FOR ALL USING (is_admin_user());
CREATE POLICY "Admins full access faqs" ON faqs FOR ALL USING (is_admin_user());
CREATE POLICY "Admins full access reviews" ON reviews FOR ALL USING (is_admin_user());
CREATE POLICY "Admins full access partners" ON partners FOR ALL USING (is_admin_user());
CREATE POLICY "Admins full access audit_logs" ON audit_logs FOR ALL USING (is_admin_user());

-- ============================================================================
-- SAFE PUBLIC TRACKING RPC (PROTECTS CUSTOMER PII)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_public_shipment(tracking_num TEXT)
RETURNS JSONB AS $$
DECLARE
    shipment_record RECORD;
    milestones_json JSONB;
BEGIN
    -- Query shipment matching tracking number
    SELECT id, tracking_number, service_mode, origin, destination, status, estimated_delivery, current_location, updated_at
    INTO shipment_record
    FROM shipments
    WHERE LOWER(tracking_number) = LOWER(tracking_num);

    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    -- Query associated milestones
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', id,
            'title', title,
            'description', description,
            'location', location,
            'timestamp', timestamp,
            'status', status,
            'completed', completed
        ) ORDER BY sort_order ASC, timestamp ASC
    ), '[]'::jsonb)
    INTO milestones_json
    FROM shipment_milestones
    WHERE shipment_id = shipment_record.id;

    -- Return safe public projection without customer PII
    RETURN jsonb_build_object(
        'tracking_number', shipment_record.tracking_number,
        'service_mode', shipment_record.service_mode,
        'origin', shipment_record.origin,
        'destination', shipment_record.destination,
        'status', shipment_record.status,
        'estimated_delivery', shipment_record.estimated_delivery,
        'current_location', shipment_record.current_location,
        'last_updated', shipment_record.updated_at,
        'milestones', milestones_json
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
