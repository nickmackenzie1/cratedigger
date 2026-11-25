'use strict';
/* Routes: Things looked up on the web for you: AI, favicons, logos and images. Each handler answers or leaves the request for the next. */
const { aiKey } = require('../config');
const { NEXT, readBody, send } = require('../lib/http');
const { DOMAIN_RE, safeFetch } = require('../lib/net');
const { callClaude } = require('../services/ai');
const { getIcon, getImage, sniff } = require('../services/favicons');

let imgCache = null;   // recently fetched images, in memory

// (req, res, { url, p, leaf }) → answers the request, or returns NEXT
module.exports = async function lookupRoutes(req, res, { url, p }) {
  if (p === '/api/ai' && req.method === 'POST') {
    if (!aiKey()) return send(res, 501, { error: 'AI not configured (set ANTHROPIC_API_KEY)' });
    const { prompt, tier } = JSON.parse(await readBody(req, 2 * 1024 * 1024));
    if (typeof prompt !== 'string' || !prompt) return send(res, 400, { error: 'Missing prompt' });
    try { return send(res, 200, { text: await callClaude(prompt, tier) }); }
    catch (e) { return send(res, e.status === 429 ? 429 : 502, { error: e.message }); }
  }

  if (p === '/api/favicon') {
    const d = String(url.searchParams.get('d') || '').toLowerCase();
    if (!DOMAIN_RE.test(d)) return send(res, 400, { error: 'Bad domain' });
    const buf = await getIcon(d);
    if (!buf) { res.writeHead(404, { 'Cache-Control': 'max-age=3600' }); return res.end(); }
    res.writeHead(200, { 'Content-Type': sniff(buf), 'Cache-Control': 'private, max-age=604800', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'" });
    return res.end(buf);
  }

  // a logo image at a given address, kept on the NAS (radio stations' own logos and the like)
  if (p === '/api/logo') {
    const buf = await getImage(String(url.searchParams.get('u') || ''));
    if (!buf) { res.writeHead(404, { 'Cache-Control': 'max-age=3600' }); return res.end(); }
    res.writeHead(200, { 'Content-Type': sniff(buf), 'Cache-Control': 'private, max-age=604800', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'" });
    return res.end(buf);
  }

  // image proxy (mural mosaic targets): raster images only, SSRF-safe, small memory cache
  if (p === '/api/img') {
    const u = url.searchParams.get('url') || '';
    if (!/^https?:\/\//i.test(u)) return send(res, 400, { error: 'Bad url' });
    imgCache = imgCache || new Map();
    let hit = imgCache.get(u);
    if (!hit) {
      try { const r = await safeFetch(u, { headers: { Accept: 'image/avif,image/webp,image/png,image/jpeg,*/*' } }, 8 * 1024 * 1024); const type = sniff(r.buf); if (!type || type === 'image/svg+xml') return send(res, 415, { error: 'Not a raster image' }); hit = { type, buf: r.buf }; imgCache.set(u, hit); if (imgCache.size > 24) imgCache.delete(imgCache.keys().next().value); }
      catch (e) { return send(res, 502, { error: e.message }); }
    }
    res.writeHead(200, { 'Content-Type': hit.type, 'Cache-Control': 'private, max-age=86400', 'X-Content-Type-Options': 'nosniff' }); return res.end(hit.buf);
  }

  return NEXT;   // not ours
};
