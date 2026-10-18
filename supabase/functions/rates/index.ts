import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GOOGLE_SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/1fYp7W6Q9Ri50wLQudjBWhI8J_gVGaOM47UCKrEoxS5o/export?format=csv';

export interface SheetRateItem {
  rate_group: string;
  display_name: string;
  supported_countries: string[];
  weight_tier: 'standard' | '10_plus' | '20_plus';
  weight_kg: number | null;
  price_npr: number;
  currency: string;
  active: boolean;
}

let inMemoryCache: {
  rates: SheetRateItem[];
  updatedAt: string;
  timestamp: number;
} | null = null;

const CACHE_TTL_MS = 60 * 1000; // 60 seconds

function parseCsv(text: string): string[][] {
  const lines: string[][] = [];
  const rawLines = text.split(/\r?\n/);

  for (const rawLine of rawLines) {
    if (!rawLine.trim()) continue;
    const row: string[] = [];
    let insideQuote = false;
    let cell = '';

    for (let i = 0; i < rawLine.length; i++) {
      const char = rawLine[i];
      if (char === '"') {
        if (insideQuote && rawLine[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          insideQuote = !insideQuote;
        }
      } else if (char === ',' && !insideQuote) {
        row.push(cell.trim());
        cell = '';
      } else {
        cell += char;
      }
    }
    row.push(cell.trim());
    lines.push(row);
  }

  return lines;
}

function validateAndCleanRates(rows: string[][]): SheetRateItem[] {
  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => h.toLowerCase().trim());
  const colIndex = {
    rate_group: headers.indexOf('rate_group'),
    display_name: headers.indexOf('display_name'),
    supported_countries: headers.indexOf('supported_countries'),
    weight_tier: headers.indexOf('weight_tier'),
    weight_kg: headers.indexOf('weight_kg'),
    price_npr: headers.indexOf('price_npr'),
    currency: headers.indexOf('currency'),
    active: headers.indexOf('active'),
  };

  // Ensure mandatory header columns exist
  if (
    colIndex.rate_group === -1 ||
    colIndex.display_name === -1 ||
    colIndex.weight_tier === -1 ||
    colIndex.price_npr === -1 ||
    colIndex.active === -1
  ) {
    console.error('Missing mandatory header columns in rates sheet CSV:', headers);
    return [];
  }

  const cleanList: SheetRateItem[] = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const activeStr = r[colIndex.active]?.toUpperCase() || '';
    if (activeStr !== 'TRUE') {
      continue; // Skip non-active rows
    }

    const rate_group = r[colIndex.rate_group]?.trim() || '';
    const display_name = r[colIndex.display_name]?.trim() || '';
    const tierRaw = r[colIndex.weight_tier]?.trim().toLowerCase() || '';

    if (!rate_group || !display_name) {
      console.warn(`Row ${i} missing rate_group or display_name, skipping:`, r);
      continue;
    }

    if (tierRaw !== 'standard' && tierRaw !== '10_plus' && tierRaw !== '20_plus') {
      console.warn(`Row ${i} unknown weight_tier "${tierRaw}", skipping:`, r);
      continue;
    }

    const priceNpr = parseFloat(r[colIndex.price_npr]);
    if (isNaN(priceNpr) || priceNpr <= 0) {
      console.warn(`Row ${i} invalid price_npr "${r[colIndex.price_npr]}", skipping:`, r);
      continue;
    }

    let weightKg: number | null = null;
    if (tierRaw === 'standard') {
      const parsedKg = parseFloat(r[colIndex.weight_kg]);
      if (isNaN(parsedKg) || parsedKg <= 0) {
        console.warn(`Row ${i} standard tier requires valid positive weight_kg, got "${r[colIndex.weight_kg]}", skipping:`, r);
        continue;
      }
      weightKg = parsedKg;
    }

    const supportedRaw = colIndex.supported_countries !== -1 ? r[colIndex.supported_countries] : '';
    const supported_countries = supportedRaw
      ? supportedRaw.split(';').map((c) => c.trim()).filter(Boolean)
      : [display_name];

    const currency = colIndex.currency !== -1 && r[colIndex.currency]?.trim() ? r[colIndex.currency].trim() : 'NPR';

    cleanList.push({
      rate_group,
      display_name,
      supported_countries,
      weight_tier: tierRaw as 'standard' | '10_plus' | '20_plus',
      weight_kg: weightKg,
      price_npr: priceNpr,
      currency,
      active: true,
    });
  }

  return cleanList;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  const now = Date.now();

  // 1. Check in-memory 60s cache
  if (inMemoryCache && now - inMemoryCache.timestamp < CACHE_TTL_MS) {
    return new Response(
      JSON.stringify({
        rates: inMemoryCache.rates,
        rowCount: inMemoryCache.rates.length,
        updatedAt: inMemoryCache.updatedAt,
        source: 'cache_memory',
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60',
        },
      }
    );
  }

  // 2. Fetch live Google Sheet
  try {
    const res = await fetch(GOOGLE_SHEET_CSV_URL, {
      headers: { 'User-Agent': 'BcCargoRates/1.0' },
    });

    if (!res.ok) {
      throw new Error(`Google Sheet returned HTTP ${res.status}`);
    }

    const csvText = await res.text();
    const rows = parseCsv(csvText);
    const cleanRates = validateAndCleanRates(rows);

    if (cleanRates.length === 0) {
      throw new Error('Google Sheet returned 0 valid rate rows');
    }

    const isoTime = new Date().toISOString();

    // 3. Save latest good copy in Supabase table
    try {
      await supabase.from('sheet_rates_cache').upsert({
        id: 'latest',
        rates: cleanRates,
        row_count: cleanRates.length,
        source: 'google_sheet',
        updated_at: isoTime,
      });
    } catch (dbErr) {
      console.warn('Failed to persist sheet_rates_cache to Supabase table:', dbErr);
    }

    inMemoryCache = {
      rates: cleanRates,
      updatedAt: isoTime,
      timestamp: now,
    };

    return new Response(
      JSON.stringify({
        rates: cleanRates,
        rowCount: cleanRates.length,
        updatedAt: isoTime,
        source: 'live',
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60',
        },
      }
    );
  } catch (sheetErr) {
    console.error('Error fetching live Google Sheet rates:', sheetErr);

    // 4. Fallback to last good copy in Supabase table
    try {
      const { data, error } = await supabase
        .from('sheet_rates_cache')
        .select('*')
        .eq('id', 'latest')
        .maybeSingle();

      if (!error && data && data.rates && data.rates.length > 0) {
        return new Response(
          JSON.stringify({
            rates: data.rates,
            rowCount: data.row_count,
            updatedAt: data.updated_at,
            source: 'cache_database',
            fallback: true,
          }),
          {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
              'Cache-Control': 'public, max-age=60',
            },
          }
        );
      }
    } catch (fallbackErr) {
      console.error('Failed to read fallback cache from database:', fallbackErr);
    }

    return new Response(
      JSON.stringify({
        error: 'Price not available now. Please chat with us.',
        rates: [],
      }),
      {
        status: 503,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
