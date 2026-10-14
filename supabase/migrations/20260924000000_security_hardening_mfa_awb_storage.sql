-- BC Cargo & Courier — Security Hardening, RBAC, MFA, Storage, AWB & Notifications Migration
-- Migration Timestamp: 2026-09-24 00:00:00

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create / Update User Role Enum
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'editor', 'operations', 'support', 'read_only');
EXCEPTION WHEN duplicate_object THEN
    -- If user_role already exists, add any missing enum values safely
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'editor';
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'operations';
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'support';
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'read_only';
END $$;

-- 2. User Roles Table
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'operations',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- 3. Security Role Helper Functions
CREATE OR REPLACE FUNCTION has_role(p_user_id UUID, p_required_role user_role)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = p_user_id
        AND (
            role = p_required_role
            OR role = 'super_admin'
            OR (p_required_role = 'read_only' AND role IN ('admin', 'editor', 'operations', 'support'))
        )
    );
END;
$$;

CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF auth.role() = 'service_role' THEN
        RETURN TRUE;
    END IF;
    
    RETURN EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = auth.uid()
        AND role IN ('super_admin', 'admin', 'editor', 'operations', 'support')
    );
END;
$$;

-- 4. Air Waybills Table
CREATE TABLE IF NOT EXISTS air_waybills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
    shipment_id UUID REFERENCES shipments(id) ON DELETE SET NULL,
    awb_number TEXT UNIQUE NOT NULL,
    pdf_storage_path TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'generated',
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    generated_by TEXT DEFAULT 'system_edge_function',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_air_waybills_awb_number ON air_waybills(awb_number);
CREATE INDEX IF NOT EXISTS idx_air_waybills_booking_id ON air_waybills(booking_id);

-- 5. Proof of Delivery (POD) Documents Table
CREATE TABLE IF NOT EXISTS pod_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    tracking_event_id UUID,
    storage_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pod_documents_shipment_id ON pod_documents(shipment_id);

-- 6. Shipment Notifications Queue Table
CREATE TABLE IF NOT EXISTS shipment_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    tracking_event_id UUID,
    recipient TEXT NOT NULL,
    channel TEXT NOT NULL CHECK (channel IN ('email', 'sms')),
    event_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    provider_message_id TEXT,
    attempts INT NOT NULL DEFAULT 0,
    error_message TEXT,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_milestone_notification UNIQUE (shipment_id, event_type, channel, recipient)
);

CREATE INDEX IF NOT EXISTS idx_shipment_notifications_status ON shipment_notifications(status);
CREATE INDEX IF NOT EXISTS idx_shipment_notifications_shipment ON shipment_notifications(shipment_id);

-- 7. Notification Templates Table
CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    channel TEXT NOT NULL CHECK (channel IN ('email', 'sms')),
    subject_template TEXT,
    body_template TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(event_type, channel)
);

-- Seed Default Notification Templates
INSERT INTO notification_templates (event_type, channel, subject_template, body_template)
VALUES 
    ('booking_confirmed', 'email', 'BC Cargo Booking Confirmation: {{booking_ref}}', 'Dear {{sender_name}},\n\nYour booking {{booking_ref}} from {{origin}} to {{destination}} has been confirmed.\n\nAir Waybill Number: {{awb_number}}\n\nThank you for choosing BC Cargo & Courier.'),
    ('booking_confirmed', 'sms', NULL, 'BC Cargo: Booking {{booking_ref}} confirmed. AWB: {{awb_number}}. Origin: {{origin}} to {{destination}}.'),
    ('in_transit', 'email', 'Shipment Update: {{tracking_number}} is In Transit', 'Dear {{customer_name}},\n\nYour shipment {{tracking_number}} is currently in transit near {{location}}.\n\nEstimated Delivery: {{estimated_delivery}}.'),
    ('in_transit', 'sms', NULL, 'BC Cargo: Shipment {{tracking_number}} is in transit near {{location}}. EST Delivery: {{estimated_delivery}}.'),
    ('out_for_delivery', 'email', 'Shipment Update: {{tracking_number}} Out for Delivery', 'Dear {{customer_name}},\n\nYour shipment {{tracking_number}} is out for final delivery in {{destination}}.'),
    ('out_for_delivery', 'sms', NULL, 'BC Cargo: Shipment {{tracking_number}} is out for delivery in {{destination}}.'),
    ('delivered', 'email', 'Shipment Delivered: {{tracking_number}}', 'Dear {{customer_name}},\n\nYour shipment {{tracking_number}} has been successfully delivered. Proof of delivery is recorded in our system.'),
    ('delivered', 'sms', NULL, 'BC Cargo: Shipment {{tracking_number}} has been successfully delivered. Thank you!')
ON CONFLICT (event_type, channel) DO UPDATE SET 
    subject_template = EXCLUDED.subject_template,
    body_template = EXCLUDED.body_template,
    updated_at = NOW();

-- 8. Supabase Storage Buckets Setup
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('job-resumes', 'job-resumes', false, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
    ('pod-photos', 'pod-photos', false, 15728640, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
    ('awb-documents', 'awb-documents', false, 10485760, ARRAY['application/pdf']),
    ('general-assets', 'general-assets', true, 20971520, NULL)
ON CONFLICT (id) DO UPDATE SET 
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES HARDENING
-- ============================================================================

-- Enable RLS on newly created tables
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE air_waybills ENABLE ROW LEVEL SECURITY;
ALTER TABLE pod_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;

-- 8.1 User Roles RLS Policies
DROP POLICY IF EXISTS "Admins full access user_roles" ON user_roles;
CREATE POLICY "Admins read user_roles" ON user_roles FOR SELECT USING (is_admin_user());
CREATE POLICY "Super Admins manage user_roles" ON user_roles FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
    OR auth.role() = 'service_role'
);

-- 8.2 Air Waybills RLS Policies
CREATE POLICY "Staff read air_waybills" ON air_waybills FOR SELECT USING (is_admin_user());
CREATE POLICY "Service role write air_waybills" ON air_waybills FOR ALL USING (auth.role() = 'service_role' OR is_admin_user());

-- 8.3 POD Documents RLS Policies
CREATE POLICY "Staff read pod_documents" ON pod_documents FOR SELECT USING (is_admin_user());
CREATE POLICY "Operations insert pod_documents" ON pod_documents FOR INSERT WITH CHECK (is_admin_user());

-- 8.4 Shipment Notifications RLS Policies
CREATE POLICY "Staff read notifications" ON shipment_notifications FOR SELECT USING (is_admin_user());
CREATE POLICY "Service role write notifications" ON shipment_notifications FOR ALL USING (auth.role() = 'service_role' OR is_admin_user());

-- 8.5 Storage Objects RLS Policies
-- Public access for general-assets bucket
DROP POLICY IF EXISTS "Public read general-assets" ON storage.objects;
CREATE POLICY "Public read general-assets" ON storage.objects FOR SELECT USING (bucket_id = 'general-assets');

-- Private buckets access limited to staff / service role
DROP POLICY IF EXISTS "Staff access private storage" ON storage.objects;
CREATE POLICY "Staff access private storage" ON storage.objects FOR ALL USING (
    (bucket_id IN ('job-resumes', 'pod-photos', 'awb-documents') AND is_admin_user())
    OR auth.role() = 'service_role'
);

-- Public Upload Policy via Service Role / Edge Function only for job-resumes
DROP POLICY IF EXISTS "Service role upload resumes" ON storage.objects;
CREATE POLICY "Service role upload resumes" ON storage.objects FOR INSERT WITH CHECK (
    auth.role() = 'service_role' OR is_admin_user()
);

-- 8.6 Hardening Public Form RLS Policies (Bookings, Inquiries, Job Applications)
-- Service Role (Edge Functions) can insert public submissions after Turnstile verification.
-- Authenticated staff can view and manage records.
DROP POLICY IF EXISTS "Public insert bookings" ON bookings;
CREATE POLICY "Service role or Staff insert bookings" ON bookings FOR INSERT WITH CHECK (auth.role() = 'service_role' OR is_admin_user());

DROP POLICY IF EXISTS "Public insert inquiries" ON inquiries;
CREATE POLICY "Service role or Staff insert inquiries" ON inquiries FOR INSERT WITH CHECK (auth.role() = 'service_role' OR is_admin_user());

DROP POLICY IF EXISTS "Public insert job applications" ON job_applications;
CREATE POLICY "Service role or Staff insert job applications" ON job_applications FOR INSERT WITH CHECK (auth.role() = 'service_role' OR is_admin_user());

-- Read policies for staff
DROP POLICY IF EXISTS "Staff read bookings" ON bookings;
CREATE POLICY "Staff read bookings" ON bookings FOR SELECT USING (is_admin_user());

DROP POLICY IF EXISTS "Staff read inquiries" ON inquiries;
CREATE POLICY "Staff read inquiries" ON inquiries FOR SELECT USING (is_admin_user());

DROP POLICY IF EXISTS "Staff read job applications" ON job_applications;
CREATE POLICY "Staff read job applications" ON job_applications FOR SELECT USING (is_admin_user());

-- Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION has_role(UUID, user_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION is_admin_user() TO authenticated, service_role;
