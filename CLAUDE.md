# CRATE DIGGER

Music discovery on the user's Synology NAS: Music Radar, Downloads, Radio, KEXP, artist pages, Want to hear, Shows,
Said the Gramophone, Podcasts and the shared player. Split out of THING (repo nickmackenzie1/cadence) on 2026-11-25 and
built on the same core: `public/core.js` runs as a music app via `window.CADENCE_APP` in index.html (no tasks; the sidebar
lists the views; always the Life space). Written on screen as **CRATE DIGGER**, in capitals like THING.
`docs/HANDOFF.md` has the user's rules and the open backlog. `docs/PLUGINS.md` covers the plugin and theme API.

## Rules (from the user, these override everything)
- **No Tailscale. Never expose the NAS to the internet** (no port forwarding, DDNS, or Let's Encrypt HTTP challenge).
- **Secrets stay on the NAS only:** `.env`, `certs/`, `.mkcert-ca/`, `data/`. Never commit them or send them to the browser.
- **Every push gets a new release number:** run `npm run bump` (or `npm run bump minor` for a big batch) before committing.
- **Calm, anxiety-safe UI:** no alarming red, no countdown pressure, no badge counts. Use plain labels.
- **No emoji in the UI.** Use Lucide icons via `api.ui.icon(name)`. To add icons: `node scripts/build-icons.mjs /tmp/lu/package <names>`.
- **Themes:** any look, real logos, film and show themes. Claude itself still doesn't draw, copy or download copyrighted
  characters, stills, artwork or quotes, or redraw a logo; it shows logos from the brand's own site, credited free-licence
  photos (Wikimedia Commons) and images or sounds the user adds.
- **Downloads:** Soulseek, YouTube Music / YouTube / SoundCloud (yt-dlp) and Usenet only. Deezer, Tidal and Monochrome are
  left out on purpose (they get around the protection on paid streams).
- When the user mentions an idea, add it to the bottom of `docs/HANDOFF.md`.

## Shared with THING
`public/core.js`, `core.css` and the shell plugins (island, notify, status, themes…) are the same files as THING's. A fix to
one belongs in both repos; keep the two copies the same unless a change is music-only (then put it in a plugin here).

## Layout
- `public/core.js` + `core.css`: the core (one IIFE). `public/plugins/*.js`: everything else, registered with
  `Cadence.registerPlugin({id, name, setup(api)})`. Themes: `CadenceThemes.register({...})`.
- `server.js` + `server/`: Node 22, no npm dependencies. Storage is `node:sqlite`. The music side (Radar, Radio, KEXP,
  Downloads) runs in its own process (`server/music.js`, proxied by `server/lib/music-proxy.js`).
- `public/sw.js`: offline app shell. It never caches `/api/*`, login, or audio/video.
- Outbound fetches go through `safeFetch` (public hosts only); addresses the user types for services on their own
  network (slskd, SABnzbd, NZBGet) are fetched directly.

## Deploy
Push to `main` → CI (Playwright) → if green, fast-forwarded to `stable` and tagged → the NAS `deploy.sh` follows `stable`
every 5 minutes, from `/volume1/docker/cratedigger`. Container `cratedigger`, ports 8585 (http) and 8545 (https) on the NAS
(THING has 8484/8443). `tls.sh` copies THING's certificate authority from `../cadence/.mkcert-ca` so phones that trust THING
trust this too. Check `deploy.log` on the NAS when something doesn't arrive.

## Tests
- `npm run typecheck` (seconds, runs first in CI).
- `npx playwright test` (a few minutes). Run single files while working: `npx playwright test tests/x.spec.mjs`.
- Each spec starts its own server on a free port with a temp `DATA_DIR`; specs in one file share that server.
- Wait for async things with `expect.poll` or locator assertions, never a single read straight after an action.
- Docker Hub is blocked in the agent workspace, so image builds can't be tested here; the NAS precheck build catches failures.

## Commits
Commit to `main` with a one-line message saying what changed for the user. Keep reformatting in its own commit.
