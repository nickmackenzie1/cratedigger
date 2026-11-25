# CRATE DIGGER: handoff

## Where this came from (2026-11-25)
The user wanted the music side of THING to be its own app. It was split out with THING's core and shell, plus these
plugins: music-radar, artist, downloads, radio, kexp-race, podcasts, lyrics, visualizer, coverflow, themes-music,
themes-live, dbview, island, notify, status, secure-phone, account, datepick and the theme packs. THING's task side,
Havoc and the life/work tools stayed in THING. THING's history up to the split is in the cadence repo (its docs/HANDOFF.md
has the music notes: Radar, Downloads, KEXP and so on).

## Status
- Runs as a music app: opens on Music Radar, the sidebar lists the music pages, phone tabs are Radar / Want to hear / Radio.
- THING still has its music until CRATE DIGGER is running on the NAS; then THING's music comes out and a small "Music"
  plugin there links here and shows what's playing.

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
