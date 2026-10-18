-- Migration: 20261014000000_estimator_rules.sql
-- Rate Estimator Handling Rules, Special Surcharges & Global Logistics Settings

-- 1. Create handling_rules table
CREATE TABLE IF NOT EXISTS handling_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flag TEXT NOT NULL CHECK (flag IN ('liquid', 'meat', 'medicine', 'other')),
    country_code TEXT NULL, -- Null applies globally; ISO alpha-3 (e.g. 'USA', 'IND') applies to specific corridor
    mode TEXT NULL CHECK (mode IS NULL OR mode IN ('air', 'overland')),
    allowed BOOLEAN NOT NULL DEFAULT TRUE,
    surcharge_type TEXT NULL CHECK (surcharge_type IS NULL OR surcharge_type IN ('flat_npr', 'per_kg_npr', 'percent')),
    surcharge_value NUMERIC NOT NULL DEFAULT 0,
    requirements_md TEXT NOT NULL,
    is_placeholder BOOLEAN NOT NULL DEFAULT TRUE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookup by flag, corridor, and active status
CREATE INDEX IF NOT EXISTS idx_handling_rules_flag_corridor 
ON handling_rules (flag, country_code, mode, active);

-- 2. Create rate_settings table (fuel %, handling fee, USD->NPR conversion, min charge)
CREATE TABLE IF NOT EXISTS rate_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Enable Row Level Security
ALTER TABLE handling_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_settings ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies: Public read on active rules and settings
CREATE POLICY "Public read active handling_rules" 
ON handling_rules FOR SELECT 
USING (active = TRUE);

CREATE POLICY "Public read rate_settings" 
ON rate_settings FOR SELECT 
USING (TRUE);

-- 5. RLS Policies: Admin / Staff full write access using is_admin_user()
CREATE POLICY "Admins full access handling_rules" 
ON handling_rules FOR ALL 
USING (is_admin_user())
WITH CHECK (is_admin_user());

CREATE POLICY "Admins full access rate_settings" 
ON rate_settings FOR ALL 
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- 6. Seed rate_settings defaults
INSERT INTO rate_settings (key, value, updated_at)
VALUES 
    ('fuel_surcharge_percent', '{"value": 12, "description": "Global aviation fuel surcharge percentage"}'::jsonb, NOW()),
    ('handling_fee_npr', '{"value": 250, "description": "Standard origin handling & customs documentation fee in NPR"}'::jsonb, NOW()),
    ('usd_to_npr_rate', '{"value": 135, "description": "Operating foreign exchange conversion rate USD to NPR"}'::jsonb, NOW()),
    ('min_charge_npr', '{"value": 500, "description": "Minimum chargeable freight per consignment in NPR"}'::jsonb, NOW())
ON CONFLICT (key) DO UPDATE 
SET value = EXCLUDED.value, updated_at = NOW();

-- 7. Seed handling_rules rows (clearly flagged is_placeholder = true)
-- NOTE: Do not invent legal claims or regulatory agency decrees. Text is explicitly marked [PLACEHOLDER].
INSERT INTO handling_rules (flag, country_code, mode, allowed, surcharge_type, surcharge_value, requirements_md, is_placeholder, active)
VALUES
    -- Liquid: Global default (15% surcharge, leak-proof packaging requirements)
    (
        'liquid', 
        NULL, 
        NULL, 
        TRUE, 
        'percent', 
        15, 
        '[PLACEHOLDER] Leak-proof sealed packaging required. Containers must be cushioned with absorbent material and include Material Safety Data Sheet (MSDS) declaration for air customs clearance.', 
        TRUE, 
        TRUE
    ),
    -- Meat: Global default (Flat NPR 1000 handling, non-perishable/cured only)
    (
        'meat', 
        NULL, 
        NULL, 
        TRUE, 
        'flat_npr', 
        1000, 
        '[PLACEHOLDER] Factory-sealed, non-perishable dried or processed items only. Fresh or unsealed perishable animal products require cold-chain charter arrangements.', 
        TRUE, 
        TRUE
    ),
    -- Meat: Corridor Restriction (Blocked for USA standard air parcel import)
    (
        'meat', 
        'USA', 
        'air', 
        FALSE, 
        NULL, 
        0, 
        '[PLACEHOLDER] Perishable animal meat and food products of animal origin are prohibited on standard commercial air parcel flights to the United States under agricultural import restrictions. Please contact our cargo desk for specialized clearance.', 
        TRUE, 
        TRUE
    ),
    -- Medicine: Global default (Flat NPR 500 inspection surcharge, prescription documentation required)
    (
        'medicine', 
        NULL, 
        NULL, 
        TRUE, 
        'flat_npr', 
        500, 
        '[PLACEHOLDER] Valid registered doctor prescription and original pharmacy tax invoice required. Narcotics, psychotropic substances, and unlabelled bulk chemicals are strictly prohibited.', 
        TRUE, 
        TRUE
    ),
    -- Medicine: National Overland Corridor (Flat NPR 150 handling)
    (
        'medicine', 
        NULL, 
        'overland', 
        TRUE, 
        'flat_npr', 
        150, 
        '[PLACEHOLDER] Domestic transit of scheduled pharmaceuticals requires medical prescription copy and sender identification verification at origin counter.', 
        TRUE, 
        TRUE
    );
