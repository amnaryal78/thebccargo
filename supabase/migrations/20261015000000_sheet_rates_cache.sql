-- Migration: 20261015000000_sheet_rates_cache.sql
-- Table to persist the last good copy of rates fetched from the live Google Sheet

CREATE TABLE IF NOT EXISTS sheet_rates_cache (
    id TEXT PRIMARY KEY DEFAULT 'latest',
    rates JSONB NOT NULL,
    row_count INT NOT NULL DEFAULT 0,
    source TEXT NOT NULL DEFAULT 'google_sheet',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE sheet_rates_cache ENABLE ROW LEVEL SECURITY;

-- Public read access so clients can retrieve fallback cache
CREATE POLICY "Public read sheet_rates_cache"
ON sheet_rates_cache FOR SELECT
USING (TRUE);

-- Public insert/update policy for edge function / anon client syncing
CREATE POLICY "Allow write sheet_rates_cache"
ON sheet_rates_cache FOR ALL
USING (TRUE)
WITH CHECK (TRUE);
