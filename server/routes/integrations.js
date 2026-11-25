'use strict';
/* Routes: Weather (Open-Meteo) and the keys pasted in Settings → Connections. Each handler answers or leaves the request for the next. */
const { NEXT, readBody, send } = require('../lib/http');
const { safeFetch } = require('../lib/net');
const { wxCache } = require('../services/push');

// (req, res, { url, p, leaf }) → answers the request, or returns NEXT
module.exports = async function integrationsRoutes(req, res, { url, p }) {
  if (p === '/api/weather' || p === '/api/weather/geo') {
    // Open-Meteo: free, no API key. Cached 15 min per place.
    const geo = p.endsWith('/geo');
    const u = geo ? `https://geocoding-api.open-meteo.com/v1/search?count=6&language=en&format=json&name=${encodeURIComponent(String(url.searchParams.get('q') || '').slice(0, 80))}`
      : (() => { const lat = +url.searchParams.get('lat'), lon = +url.searchParams.get('lon'), f = url.searchParams.get('units') === 'f';
          if (!isFinite(lat) || !isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
          return `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(3)}&longitude=${lon.toFixed(3)}&timezone=auto&forecast_days=7${f ? '&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch' : ''}`
            + '&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,is_day,precipitation&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset'; })();
    if (!u) return send(res, 400, { error: 'bad place' });
    const hit = wxCache.get(u); if (hit && Date.now() - hit.at < 15 * 60e3) return send(res, 200, hit.data);
    try { const r = await safeFetch(u, {}, 512 * 1024); const data = JSON.parse(r.buf.toString('utf8')); wxCache.set(u, { at: Date.now(), data }); if (wxCache.size > 40) wxCache.delete(wxCache.keys().next().value); return send(res, 200, data); }
    catch (e) { return hit ? send(res, 200, hit.data) : send(res, 502, { error: 'Weather unavailable: ' + e.message }); }
  }
  // keys for outside services, pasted in Settings → Connections; never sent back, only whether each is set
  if (p === '/api/keys' && req.method === 'GET') return send(res, 200, require('../lib/keys').list());
  if (p === '/api/keys' && req.method === 'PUT') {
    let b; try { b = JSON.parse(await readBody(req, 8 * 1024)); } catch { return send(res, 400, { error: 'Bad request' }); }
    try { return send(res, 200, require('../lib/keys').set(String(b.id || ''), b.value)); } catch (e) { return send(res, e.code || 500, { error: e.message }); }
  }
  return NEXT;   // not ours
};
