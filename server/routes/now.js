'use strict';
/* What's playing (2026-11-25, the split): CRATE DIGGER's player says what's on (POST), and THING's Music plugin asks
   (GET) from its own address on the same NAS name, with your CRATE DIGGER sign-in. Only pages on this same host name may
   read it (any port); nothing is kept on disk. */
const { NEXT, readBody, send } = require('../lib/http');
let NOW = null;
const clean = (v, n = 200) => String(v == null ? '' : v).slice(0, n);
module.exports = async function nowRoutes(req, res, { p }) {
  if (p !== '/api/now') return NEXT;
  const o = req.headers.origin;
  if (o) { try { if (new URL(o).hostname === String(req.headers.host || '').replace(/:\d+$/, '')) { res.setHeader('Access-Control-Allow-Origin', o); res.setHeader('Access-Control-Allow-Credentials', 'true'); res.setHeader('Vary', 'Origin'); } } catch {} }
  if (req.method === 'GET') return send(res, 200, NOW && Date.now() - NOW.at < 6 * 3600e3 ? NOW : { playing: false });
  if (req.method === 'POST') {
    let b = {}; try { b = JSON.parse(await readBody(req, 4096) || '{}'); } catch {}
    NOW = { playing: !!b.playing, title: clean(b.title), artist: clean(b.artist), kind: clean(b.kind, 20), at: Date.now() };
    return send(res, 200, { ok: true });
  }
  return send(res, 405, { error: 'GET or POST' });
};
