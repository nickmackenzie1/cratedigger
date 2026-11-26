# CRATE DIGGER: handoff

## Where this came from (2026-11-25)
The user wanted the music side of THING to be its own app. It was split out with THING's core and shell, plus these
plugins: music-radar, artist, downloads, radio, kexp-race, podcasts, lyrics, visualizer, coverflow, themes-music,
themes-live, dbview, island, notify, status, secure-phone, account, datepick and the theme packs. THING's task side,
Havoc and the life/work tools stayed in THING. THING's history up to the split is in the cadence repo (its docs/HANDOFF.md
has the music notes: Radar, Downloads, KEXP and so on).

## Status
- Runs as a music app: opens on Music Radar, the sidebar lists the music pages, phone tabs are Radar / Want to hear / Radio.
- Running on the NAS since 2026-11-25, with the user's music data imported from THING. THING's music is gone; THING's
  `music-link` plugin links here and shows what's playing (it reads `api/now`, fed by `plugins/now-share.js`).
- Own sign-in cookie (`cratedigger_session`, SESSION_COOKIE in docker-compose.yml) so THING's and this one don't clash.
- Added after the split: jobs.js (Background work), the music checks, the music Connections keys; the watch-list keys
  (TMDB, TheGamesDB) were left out.

## Backlog
- THING's music data is imported (done by the user, 2026-11-25).
- Cleanup after the split (2026-11-25): THING-only server code removed (calendar, daily, feeds, Havoc, NHL, company
  lookup, Zoho Cliq, recipes, and unused vendor files such as Harper and the Havoc engine). meeting.js is no longer
  loaded: core.js runs without it when there are no tasks. Words on screen use the app's name (`window.CadenceAppName`).
- THING keeps its own copy of core.js and the shell plugins as they are (user, 2026-11-25: THING is fine).
- The task code is still inside core.js (kept identical to THING's). Turned off with `tasks: false`; cutting it out
  would split the two copies.
- The Movie night theme reads Letterboxd from THING's Feeds plugin, which isn't here: it only shows its "add your
  diary" note.
- A CRATE DIGGER logo and favicon (Lucide, no copied artwork).
- From THING's backlog, music items: Radar mix playlists (Flows), a Navidrome / Plex / Jellyfin library link.

## Ideas: holographic foil (2026-11-25, holospot: github.com/dmitrykurash/holospot, MIT)
The user loved these for CRATE DIGGER. THING already has the kit working (cadence: public/plugins/foil.js with
window.CadenceFoil, public/vendor/holo + three; real foil only on a real GPU, plain look otherwise). Port that here, then:
1. Holo record cards: covers in Cover Flow and on artist pages as foil trading cards that catch the light as the pointer
   moves or the phone tilts (motion needs https).
2. Rare-pull foil, by kind of find: a FLAC from Downloads in Gold Shatter, a Radar deep cut in Prism, a song KEXP played
   before it charted in Nebula Glitter.
3. Your year as a pack of holo cards to flip through (top artist, most-played song, best find, first FLAC).
4. Pick of the day: one foil card at the top of Radar, the pick it's surest you'll love.
5. A Foil Emboss CRATE DIGGER logo (sign-in page, sidebar).
Phones use the kit's lowest quality; three.js and the kit load only when a foil card first shows.
