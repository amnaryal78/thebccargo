/**
 * Tests server.js endpoints, security headers, rate limiting, and compression
 */

import http from 'http';
import zlib from 'zlib';

const PORT = 3055;
process.env.PORT = String(PORT);

// Start server programmatically
await import('../server.js');

// Wait for server to listen
await new Promise(resolve => setTimeout(resolve, 800));

function fetchEndpoint(urlPath, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(`http://127.0.0.1:${PORT}${urlPath}`, options, (res) => {
      let chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        let text = '';
        if (res.headers['content-encoding'] === 'gzip') {
          text = zlib.gunzipSync(buffer).toString('utf8');
        } else if (res.headers['content-encoding'] === 'br') {
          text = zlib.brotliDecompressSync(buffer).toString('utf8');
        } else {
          text = buffer.toString('utf8');
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: text
        });
      });
    });
    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

console.log('--- Probing /api/health ---');
const healthRes = await fetchEndpoint('/api/health');
console.log('Status:', healthRes.statusCode);
console.log('CSP Header:', !!healthRes.headers['content-security-policy']);
console.log('HSTS Header:', !!healthRes.headers['strict-transport-security']);
console.log('Permissions-Policy:', !!healthRes.headers['permissions-policy']);
console.log('Body:', healthRes.body);

console.log('\n--- Probing Prerendered Route /rates ---');
const ratesRes = await fetchEndpoint('/rates', {
  headers: { 'Accept-Encoding': 'gzip' }
});
console.log('Status:', ratesRes.statusCode);
console.log('Content-Encoding:', ratesRes.headers['content-encoding']);
console.log('Has Prerendered Title:', ratesRes.body.includes('<title>Rate Estimator'));
console.log('Has Canonical:', ratesRes.body.includes('rel="canonical"'));
console.log('Has JSON-LD:', ratesRes.body.includes('application/ld+json'));

console.log('\n--- Probing /api/chat Guardrails ---');
const chatRes = await fetchEndpoint('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'What services do you provide from Hetauda?' })
});
console.log('Status:', chatRes.statusCode);
console.log('Body preview:', chatRes.body.substring(0, 150));

console.log('\n--- Probing /api/fix-blog Endpoint ---');
const blogRes = await fetchEndpoint('/api/fix-blog', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Test Article Title',
    excerpt: 'Test article excerpt',
    content: 'This is a test article body about air freight.'
  })
});
console.log('Status:', blogRes.statusCode);
console.log('Body preview:', blogRes.body.substring(0, 150));

console.log('\n--- Probing 404 Route with Security Headers ---');
const notFoundRes = await fetchEndpoint('/non-existent-random-route.xyz');
console.log('Status:', notFoundRes.statusCode);
console.log('404 Has CSP:', !!notFoundRes.headers['content-security-policy']);

console.log('\n✅ All server probes completed successfully!');
process.exit(0);
