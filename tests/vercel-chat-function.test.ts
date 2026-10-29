import { describe, it, expect } from 'vitest';
import handler from '../api/chat.js';

const run = async (req: object) => {
  const out: { status?: number; body?: any } = {};
  const res: any = { setHeader() {}, status(c: number) { out.status = c; return res; }, json(b: any) { out.body = b; return res; } };
  await handler(req, res);
  return out;
};

describe('Vercel /api/chat function', () => {
  it('rejects non-POST and malformed bodies', async () => {
    expect((await run({ method: 'GET', headers: {} })).status).toBe(405);
    expect((await run({ method: 'POST', headers: { 'x-forwarded-for': '1.1.1.1' }, body: [1] })).status).toBe(400);
  });

  it('runs the shared pipeline: refuses off-topic and routes rate questions', async () => {
    const h = { 'x-forwarded-for': '2.2.2.2' };
    expect((await run({ method: 'POST', headers: h, body: { message: 'What is the capital of India?' } })).body).toMatchObject({ type: 'reply', intent: 'OUT_OF_SCOPE' });
    expect((await run({ method: 'POST', headers: h, body: { message: 'Japan 10kg' } })).body).toMatchObject({ type: 'lookup', intent: 'RATE_QUERY' });
  });
});
