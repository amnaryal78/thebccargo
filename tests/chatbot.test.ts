import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { processChatMessage } from '../src/services/chatbotService';
import { runLookup, resolveDestination } from '../src/services/chatbotTools';
import { calculateSheetShipmentQuote } from '../src/features/estimator/engine';

vi.mock('../src/services/ratesService', async (orig) => ({ ...(await orig<typeof import('../src/services/ratesService')>()), fetchSheetRates: vi.fn() }));
const { fetchSheetRates } = vi.mocked(await import('../src/services/ratesService'));

const row = (rate_group: string, display_name: string, supported_countries: string[]) => [
  ...[1, 2, 5, 8, 9.5].map((kg) => ({ rate_group, display_name, supported_countries, weight_tier: 'standard' as const, weight_kg: kg, price_npr: 1000 + kg * 400, currency: 'NPR', active: true })),
  { rate_group, display_name, supported_countries, weight_tier: '10_plus' as const, weight_kg: null, price_npr: 900, currency: 'NPR', active: true },
];
const RATES = [...row('Japan', 'Japan', ['Japan']), ...row('Korea', 'South Korea', ['Korea', 'Republic of Korea']), ...row('UK', 'United Kingdom', ['UK', 'United Kingdom'])];
const payload = (rates = RATES) => ({ rates, rowCount: rates.length, updatedAt: '', source: 'live' as const });

beforeEach(() => {
  fetchSheetRates.mockReset();
  fetchSheetRates.mockResolvedValue(payload());
});

describe('rate lookups use the real rate service and engine', () => {
  it('returns exactly what the Rates-page engine calculates for the same input', async () => {
    const facts = await runLookup('RATE_QUERY', { destination: 'japan', weightKg: 10 });
    const expected = calculateSheetShipmentQuote({ destination: 'Japan', actualWeightKg: 10 }, RATES);
    expect(fetchSheetRates).toHaveBeenCalled();
    expect(facts).toMatchObject({ status: 'quote', destination: 'Japan', weightKg: 10, totalNpr: expected.totalNpr, boxes: 1 });
    expect(expected.totalNpr).toBeGreaterThan(0);
  });

  it('asks for the missing weight or destination instead of inventing a price', async () => {
    expect(await runLookup('RATE_QUERY', { destination: 'japan', weightKg: null })).toMatchObject({ status: 'needs_weight', destination: 'Japan' });
    const none = await runLookup('RATE_QUERY', { destination: '', weightKg: null });
    expect(none).toMatchObject({ status: 'needs_destination' });
    expect(none).not.toHaveProperty('totalNpr');
  });

  it('never produces a rate for an unsupported country, including look-alike names', async () => {
    for (const name of ['atlantis', 'ukraine']) {
      const facts = await runLookup('RATE_QUERY', { destination: name, weightKg: 5 });
      expect(facts, name).toMatchObject({ status: 'unsupported_destination' });
      expect(facts, name).not.toHaveProperty('totalNpr');
    }
    expect(resolveDestination('south korea', RATES)?.displayName).toBe('South Korea');
    expect(resolveDestination('uk', RATES)?.displayName).toBe('United Kingdom');
  });

  it('reports unavailable rates instead of a number when the rate table cannot be loaded', async () => {
    fetchSheetRates.mockResolvedValue(payload([]));
    expect(await runLookup('RATE_QUERY', { destination: 'japan', weightKg: 5 })).toMatchObject({ status: 'rates_unavailable' });
  });

  it('adds liquid charges from the engine and describes meat rules without guessing a weight', async () => {
    const liquid = await runLookup('RATE_QUERY', { destination: 'japan', weightKg: 5, liquid: true });
    expect(liquid.liquidChargeNpr).toBe(700); // 1 bottle
    const meat = await runLookup('RATE_QUERY', { destination: 'japan', weightKg: 5, meat: true });
    expect(meat.meat).toEqual({ allowed: false });
    const uk = await runLookup('RATE_QUERY', { destination: 'uk', weightKg: 5, meat: true });
    expect(uk.meat).toMatchObject({ allowed: true, extraChargePerKgNpr: 800 });
  });

  it('answers country availability only from the rate list', async () => {
    expect(await runLookup('COUNTRY_AVAILABILITY', { destination: 'korea' })).toMatchObject({ status: 'served', destination: 'South Korea' });
    expect(await runLookup('COUNTRY_AVAILABILITY', { destination: 'atlantis' })).toMatchObject({ status: 'not_in_rate_list' });
    expect(await runLookup('COUNTRY_AVAILABILITY', {})).toMatchObject({ status: 'list', destinations: ['Japan', 'South Korea', 'United Kingdom'] });
  });

  it('takes contact details from the shared business facts', async () => {
    const { BUSINESS } = await import('../src/data/business');
    expect(await runLookup('CONTACT_INFO', {})).toMatchObject({ email: BUSINESS.email, mobileAndWhatsApp: BUSINESS.mobile });
  });

  it('asks for a tracking code when none is given', async () => {
    expect(await runLookup('TRACKING_QUERY', {})).toMatchObject({ status: 'needs_tracking_code' });
  });
});

describe('browser chat flow', () => {
  const server = (...responses: any[]) => {
    const fetchMock = vi.fn();
    for (const r of responses) fetchMock.mockResolvedValueOnce({ ok: true, json: async () => r });
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
  };

  it('looks up facts, sends them back for wording, and remembers the shipping context', async () => {
    const fetchMock = server({ type: 'lookup', intent: 'RATE_QUERY', params: { destination: 'japan', weightKg: 10 } }, { type: 'reply', reply: 'Japan, 10 kg: done.' });
    const { message, context } = await processChatMessage('Japan 10kg', []);
    const second = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(second.facts).toMatchObject({ status: 'quote', destination: 'Japan' });
    expect(message.text).toBe('Japan, 10 kg: done.');
    expect(message.actions?.map((a) => a.label)).toEqual(['Rates', 'WhatsApp']);
    expect(context).toMatchObject({ lastIntent: 'RATE_QUERY', destination: 'Japan', weightKg: 10 });
  });

  it('sends the previous context so a follow-up can be resolved', async () => {
    const fetchMock = server({ type: 'reply', reply: 'ok' });
    await processChatMessage('What about Korea?', [], { lastIntent: 'RATE_QUERY', destination: 'Japan', weightKg: 10 });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).context).toMatchObject({ destination: 'Japan', weightKg: 10 });
  });

  it('shows refusals as normal answers without a lookup', async () => {
    const fetchMock = server({ type: 'reply', intent: 'OUT_OF_SCOPE', reply: "I'm the BC Cargo assistant." });
    const { message } = await processChatMessage('Tell me a joke', []);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(message.isError).toBeFalsy();
  });

  it('turns network failures and server errors into a friendly retryable message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    const net = await processChatMessage('Japan 10kg', []);
    expect(net.message).toMatchObject({ isError: true, retryText: 'Japan 10kg' });
    expect(net.message.text).toMatch(/having trouble responding/i);

    server({ type: 'error', reply: "I'm having trouble responding right now. Please try again in a moment, or contact BC Cargo directly." });
    const err = await processChatMessage('Japan 10kg', []);
    expect(err.message.isError).toBe(true);
  });
});

describe('secrets and homepage', () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const walk = (dir: string): string[] =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));

  it('keeps OpenRouter keys and settings out of the browser source', () => {
    for (const f of walk(path.join(root, 'src')).filter((p) => /\.(ts|tsx)$/.test(p))) {
      const text = fs.readFileSync(f, 'utf8');
      expect(text, f).not.toMatch(/OPENROUTER_API_KEY|sk-or-/i);
    }
  });

  it('keeps OpenRouter keys out of the built client bundle (when dist exists)', () => {
    const assets = path.join(root, 'dist', 'assets');
    if (!fs.existsSync(assets)) return;
    for (const f of fs.readdirSync(assets).filter((n) => n.endsWith('.js'))) {
      const text = fs.readFileSync(path.join(assets, f), 'utf8');
      expect(text, f).not.toMatch(/OPENROUTER_API_KEY|sk-or-v1|openrouter\.ai\/api/);
    }
  });

  it('still mounts the assistant on the homepage', () => {
    const landing = fs.readFileSync(path.join(root, 'src', 'components', 'LandingPage.tsx'), 'utf8');
    expect(landing).toMatch(/<BcCargoChatbot onNavigate=\{onNavigate\} onSearchTrack=\{onSearchTrack\} \/>/);
    expect(fs.readFileSync(path.join(root, 'src', 'components', 'StickyContactButtons.tsx'), 'utf8')).toContain('bc-cargo-ai-chatbot');
  });
});
