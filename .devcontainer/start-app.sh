#!/usr/bin/env bash
set -euo pipefail
PORT=4173
if python3 - "$PORT" <<'PY'
import sys, urllib.request
try:
    urllib.request.urlopen(f"http://127.0.0.1:{sys.argv[1]}/", timeout=1).read(1)
except Exception:
    raise SystemExit(1)
PY
then
  exit 0
fi
nohup npm run dev > /tmp/voicesadhana-dev.log 2>&1 < /dev/null &
