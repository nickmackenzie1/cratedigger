'use strict';
/* "Check outside services" (user, 2026-11-19, from the app review): the button on Background work asks every outside
   service CRATE DIGGER uses once, at the same time, and says which answered and whether CRATE DIGGER could read the answer. For
   the station playlists it runs the real readers, so a changed page shows up here instead of as a blank card.
   Services that need a key and have none say so instead of being asked. Nothing is saved; one check at a time. */
const { safeFetch } = require('../lib/net');

const UA = { 'User-Agent': 'CrateDigger/1 (self-hosted music app; checking services)' };
const key = n => !!String(process.env[n] || '').trim();
const json = buf => JSON.parse(buf.toString('utf8'));
const text = buf => buf.toString('utf8');

// each: id, name, what (what in CRATE DIGGER uses it), url (or a function), needs (env key), read(body) → a short note, or
// throws when CRATE DIGGER can't read it
const radio = () => require('./radio');
const CHECKS = [
  { id: 'radiobrowser', name: 'Radio Browser', what: 'Finding radio streams', url: 'https://de1.api.radio-browser.info/json/stations/byname/kexp?limit=1', read: b => { const j = json(b); if (!Array.isArray(j)) throw new Error('not a station list'); return `${j.length ? 'found KEXP' : 'answered'}`; } },
  { id: 'kexp', name: 'KEXP', what: 'Now playing, KEXP history', url: 'https://api.kexp.org/v2/plays/?format=json&limit=1', read: b => { const j = json(b); if (!Array.isArray(j.results)) throw new Error('no plays in the answer'); return 'latest play read'; } },
  { id: 'wxyc', name: 'WXYC playlist', what: 'Now playing on WXYC', url: 'https://api.wxyc.org/flowsheet', read: b => { const v = radio().parseWxyc(json(b), null); if (!v) throw new Error("CRATE DIGGER couldn't find a song in it"); return `${v.artist} – ${v.song}`; } },
  { id: 'ksua', name: 'KSUA playlist (Spinitron)', what: 'Now playing on KSUA', url: 'https://widgets.spinitron.com/widget/now-playing-v2?station=ksua&num=1&cover=1', read: b => { const v = radio().parseSpinitron(text(b), null); if (!v) throw new Error("CRATE DIGGER couldn't find a song in the page: its layout may differ"); return `${v.artist} – ${v.song}`; } },
  { id: 'wfuv', name: 'WFUV playlist', what: 'Now playing on WFUV', url: 'https://wfuv.org/playlist', read: b => { const v = radio().parseWfuv(text(b), null); if (!v) throw new Error("CRATE DIGGER couldn't find a song in the page: its layout may differ"); return `${v.artist} – ${v.song}`; } },
  { id: 'somafm', name: 'SomaFM', what: 'SomaFM channels', url: 'https://somafm.com/channels.json', read: b => `${(json(b).channels || []).length} channels` },
  { id: 'musicbrainz', name: 'MusicBrainz', what: 'Artist pages, Radar', url: 'https://musicbrainz.org/ws/2/artist?query=wet%20leg&limit=1&fmt=json', read: b => { const j = json(b); if (!Array.isArray(j.artists)) throw new Error('no artists in the answer'); return 'search works'; } },
  { id: 'listenbrainz', name: 'ListenBrainz', what: 'Radar charts and listener counts, scrobbling', url: 'https://api.listenbrainz.org/1/stats/sitewide/artists?count=1&range=week', read: b => { const a = ((json(b).payload || {}).artists || []); return a.length ? `top this week: ${a[0].artist_name}` : 'answered (no chart yet)'; } },
  { id: 'lrclib', name: 'LRCLIB', what: 'Lyrics', url: 'https://lrclib.net/api/search?track_name=Chaise%20Longue&artist_name=Wet%20Leg', read: b => { const j = json(b); if (!Array.isArray(j)) throw new Error('not a list'); return `${j.length} result${j.length === 1 ? '' : 's'}`; } },
  { id: 'lastfm', name: 'Last.fm', what: 'Optional Radar counts (needs Pro from 1 Dec 2026)', needs: ['LASTFM_API_KEY'], url: () => ({ u: 'https://ws.audioscrobbler.com/2.0/?method=chart.gettopartists&limit=1&format=json&api_key=' + encodeURIComponent(process.env.LASTFM_API_KEY.trim()) }), read: b => { const j = json(b); if (j.error) throw new Error(j.message || 'key turned down'); return 'key works'; } },
];

async function one(c) {
  const base = { id: c.id, name: c.name, what: c.what };
  if (c.needs && !c.needs.some(key)) return { ...base, state: 'nokey', note: `No key set (${c.needs[0]}), so it isn't used` };
  const t0 = Date.now();
  try {
    const target = typeof c.url === 'function' ? c.url() : { u: c.url };
    const r = await safeFetch(target.u, { headers: { ...UA, Accept: 'application/json, text/html;q=0.9, */*;q=0.5', ...(target.h || {}) }, timeout: 10000 }, 3 * 1024 * 1024);
    const ms = Date.now() - t0;
    if (r.status && r.status >= 400) return { ...base, state: 'down', ms, note: `answered ${r.status}` };
    let note;
    try { note = c.read(r.buf); } catch (e) { return { ...base, state: 'unreadable', ms, note: e.message || "CRATE DIGGER couldn't read the answer" }; }
    return { ...base, state: 'ok', ms, note: String(note || 'works').slice(0, 120) };
  } catch (e) {
    const m = String(e.message || e);
    return { ...base, state: 'down', ms: Date.now() - t0, note: /timeout|timed out|abort/i.test(m) ? 'no answer within 10 seconds' : /ENOTFOUND|EAI_AGAIN|getaddrinfo/i.test(m) ? "couldn't find it (DNS)" : m.slice(0, 120) };
  }
}

let running = null, last = null;
async function run() {
  if (running) return running;
  running = (async () => {
    const t0 = Date.now(), results = await Promise.all(CHECKS.map(one));
    last = { at: new Date().toISOString(), ms: Date.now() - t0, results };
    return last;
  })().finally(() => { running = null; });
  return running;
}

module.exports = { run, last: () => last, CHECKS, one };
