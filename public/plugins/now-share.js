/* What's playing, shared (2026-11-25, the split): when the player starts, stops or changes song, CRATE DIGGER tells its
   own server (server/routes/now.js), so THING's Music plugin can show it on THING's Island. Nothing else is sent. */
(() => {
  let last = '', t = 0;
  function send() {
    const P = window.CadencePodcasts; if (!P) return;
    const c = P.current, a = P.audio, playing = !!(c && a && !a.paused);
    const now = c ? (c.live && c.now ? { title: c.now.title || c.title, artist: c.now.artist || c.title } : { title: c.title, artist: c.podcastTitle || '' }) : { title: '', artist: '' };
    const body = JSON.stringify({ playing, title: now.title || '', artist: now.artist || '', kind: c ? (c.live ? 'radio' : c.full ? 'song' : c.preview ? 'preview' : 'podcast') : '' });
    if (body === last) return; last = body;
    fetch('api/now', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body }).catch(() => { last = ''; });
  }
  const soon = () => { clearTimeout(t); t = setTimeout(send, 400); };
  Cadence.registerPlugin({
    id: 'now-share', name: 'What’s playing, for THING', version: '1.0.0', category: 'Media', spaces: ['life'],
    description: "Tells THING what CRATE DIGGER is playing, so THING's Island can show it.",
    setup() {
      const P = window.CadencePodcasts; if (!P) return;
      P.on(soon); for (const e of ['play', 'pause', 'ended']) P.audio.addEventListener(e, soon);
      addEventListener('pagehide', () => { const P2 = window.CadencePodcasts; if (P2 && P2.audio && !P2.audio.paused) return; navigator.sendBeacon && navigator.sendBeacon('api/now', new Blob([JSON.stringify({ playing: false })], { type: 'application/json' })); });
    }
  });
})();
