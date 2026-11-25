#!/bin/sh
# One time, on the NAS: copy THING's music data into CRATE DIGGER (2026-11-25, the split).
#   sudo sh /volume1/docker/cratedigger/scripts/import-from-thing.sh
# Copies Radar (picks, likes, follows, Want to hear, listens), KEXP history, Downloads history, podcasts, lyrics, your
# settings and themes, and the keys you pasted in Settings → Connections. Both apps stop for a few seconds so the
# databases are copied whole, then start again. THING's own data isn't changed. It won't overwrite CRATE DIGGER data
# that's already there (FORCE=1 to replace it). THING_DIR if THING isn't in the folder next to this one.
set -eu
HERE="$(cd "$(dirname "$0")/.." && pwd)"
THING_DIR="${THING_DIR:-$HERE/../cadence}"
FROM="$THING_DIR/data"; TO="$HERE/data"
say() { echo "import: $*"; }

[ -s "$FROM/cadence.db" ] || { say "can't find THING's data at $FROM (set THING_DIR=/path/to/cadence)"; exit 1; }
if [ -s "$TO/cadence.db" ] && [ "${FORCE:-}" != 1 ]; then
  say "CRATE DIGGER already has data in $TO; nothing copied. Run with FORCE=1 to replace it with THING's."; exit 1
fi

say "stopping THING and CRATE DIGGER for a moment"
docker stop cadence >/dev/null 2>&1 || true
docker stop cratedigger >/dev/null 2>&1 || true
mkdir -p "$TO"
n=0
for f in cadence.db cadence.db-wal cadence.db-shm kexp.db kexp.db-wal kexp.db-shm keys.json prefs.json state.json \
         music-get.json lyrics-cache.json pocketcasts.json radio-cache.json commons.json; do
  if [ -e "$FROM/$f" ]; then cp -p "$FROM/$f" "$TO/$f"; n=$((n + 1)); fi
done
[ -d "$FROM/theme-media" ] && cp -Rp "$FROM/theme-media" "$TO/" && n=$((n + 1))
# the same owner as THING's files (the app runs as that user inside the container)
OWNER="$(stat -c %u:%g "$FROM/cadence.db")"
chown -R "$OWNER" "$TO" 2>/dev/null || true
date '+%F %T' > "$TO/.imported-from-thing"

say "starting them again"
docker start cadence >/dev/null 2>&1 || say "couldn't start THING (docker start cadence)"
docker start cratedigger >/dev/null 2>&1 || say "CRATE DIGGER isn't set up yet; its first deploy will use this data"
say "done: $n items copied from THING"
