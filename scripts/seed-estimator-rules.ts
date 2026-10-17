/**
 * Seed Script: Populates handling_rules and rate_settings into Supabase
 * Usage: npx tsx scripts/seed-estimator-rules.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Attempt to load .env if present
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
  console.log('ℹ️  Supabase URL/Key not configured in environment. Skipping remote database seeding.');
  console.log('   The Estimator Engine is already populated with seed fallback defaults in src/features/estimator/constants.ts.');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('🚀 Seeding handling_rules and rate_settings to Supabase...');

  // 1. Seed Rate Settings
  const settingsRows = [
    { key: 'fuel_surcharge_percent', value: { value: 12, description: 'Global aviation fuel surcharge percentage' } },
    { key: 'handling_fee_npr', value: { value: 250, description: 'Standard origin handling & customs documentation fee in NPR' } },
    { key: 'usd_to_npr_rate', value: { value: 135, description: 'Operating foreign exchange conversion rate USD to NPR' } },
    { key: 'min_charge_npr', value: { value: 500, description: 'Minimum chargeable freight per consignment in NPR' } },
  ];

  for (const s of settingsRows) {
    const { error } = await supabase
      .from('rate_settings')
      .upsert(s, { onConflict: 'key' });
    if (error) {
      console.warn(`⚠️ Error seeding setting ${s.key}:`, error.message);
    } else {
      console.log(`✅ Seeded rate_setting: ${s.key}`);
    }
  }

  // 2. Seed Handling Rules
  const rulesRows = [
    {
      flag: 'liquid',
      country_code: null,
      mode: null,
      allowed: true,
      surcharge_type: 'percent',
      surcharge_value: 15,
      requirements_md: '[PLACEHOLDER] Leak-proof sealed packaging required. Containers must be cushioned with absorbent material and include Material Safety Data Sheet (MSDS) declaration for air customs clearance.',
      is_placeholder: true,
      active: true,
    },
    {
      flag: 'meat',
      country_code: null,
      mode: null,
      allowed: true,
      surcharge_type: 'flat_npr',
      surcharge_value: 1000,
      requirements_md: '[PLACEHOLDER] Factory-sealed, non-perishable dried or processed items only. Fresh or unsealed perishable animal products require cold-chain charter arrangements.',
      is_placeholder: true,
      active: true,
    },
    {
      flag: 'meat',
      country_code: 'USA',
      mode: 'air',
      allowed: false,
      surcharge_type: null,
      surcharge_value: 0,
      requirements_md: '[PLACEHOLDER] Perishable animal meat and food products of animal origin are prohibited on standard commercial air parcel flights to the United States under agricultural import restrictions. Please contact our cargo desk for specialized clearance.',
      is_placeholder: true,
      active: true,
    },
    {
      flag: 'medicine',
      country_code: null,
      mode: null,
      allowed: true,
      surcharge_type: 'flat_npr',
      surcharge_value: 500,
      requirements_md: '[PLACEHOLDER] Valid registered doctor prescription and original pharmacy tax invoice required. Narcotics, psychotropic substances, and unlabelled bulk chemicals are strictly prohibited.',
      is_placeholder: true,
      active: true,
    },
    {
      flag: 'medicine',
      country_code: null,
      mode: 'overland',
      allowed: true,
      surcharge_type: 'flat_npr',
      surcharge_value: 150,
      requirements_md: '[PLACEHOLDER] Domestic transit of scheduled pharmaceuticals requires medical prescription copy and sender identification verification at origin counter.',
      is_placeholder: true,
      active: true,
    },
  ];

  for (const r of rulesRows) {
    const { error } = await supabase
      .from('handling_rules')
      .upsert(r, { onConflict: 'flag,country_code,mode' });
    if (error) {
      console.warn(`⚠️ Error seeding handling rule for ${r.flag}:`, error.message);
    } else {
      console.log(`✅ Seeded handling_rule: ${r.flag} (${r.country_code || 'GLOBAL'})`);
    }
  }

  console.log('🎉 Seeding completed successfully.');
}

seed().catch((err) => {
  console.error('Fatal seed error:', err);
  process.exit(1);
});
