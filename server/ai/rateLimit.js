/** Per-key sliding counter, used for the chat endpoint's own (stricter) limit on top of the global /api limit. */
export function createRateLimiter(max, windowMs, now = () => Date.now()) {
  const hits = new Map();
  setInterval(() => {
    for (const [k, r] of hits) if (now() - r.start > windowMs) hits.delete(k);
  }, 5 * 60 * 1000).unref();
  return (key) => {
    const r = hits.get(key);
    if (!r || now() - r.start > windowMs) {
      hits.set(key, { count: 1, start: now() });
      return true;
    }
    return ++r.count <= max;
  };
}
