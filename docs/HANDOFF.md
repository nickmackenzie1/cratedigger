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
- Run the one-time import of THING's music data on the NAS: `sudo sh scripts/import-from-thing.sh` (the script is
  written; it hasn't been run yet).
- Cleanup after the split (2026-11-25): THING-only server code removed (calendar, daily, feeds, Havoc, NHL, company
  lookup, Zoho Cliq, recipes, and unused vendor files such as Harper and the Havoc engine). meeting.js is no longer
  loaded: core.js runs without it when there are no tasks. Words on screen use the app's name (`window.CadenceAppName`).
- Still in THING's copy of core.js and the shell plugins: the `CadenceAppName` / no-meeting.js changes above. Copy
  core.js, notify, status, secure-phone, account and dbview to THING so the two stay the same.
- The task code is still inside core.js (kept identical to THING's). Turned off with `tasks: false`; cutting it out
  would split the two copies.
- The Movie night theme reads Letterboxd from THING's Feeds plugin, which isn't here: it only shows its "add your
  diary" note.
- A CRATE DIGGER logo and favicon (Lucide, no copied artwork).
- From THING's backlog, music items: Radar mix playlists (Flows), a Navidrome / Plex / Jellyfin library link.
