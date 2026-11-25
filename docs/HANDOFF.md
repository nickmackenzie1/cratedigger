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
- One-time import of the music data from THING's data folder on the NAS (radar database and settings, downloads history,
  podcasts, keys for the music services).
- Trim the task code out of core.js here (meeting.js is still needed at start-up because core.js calls it).
- A CRATE DIGGER logo and favicon (Lucide, no copied artwork).
- From THING's backlog, music items: Radar mix playlists (Flows), a Navidrome / Plex / Jellyfin library link.
