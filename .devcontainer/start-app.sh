#!/usr/bin/env bash
set -euo pipefail
PORT=4173
APP_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG="${TMPDIR:-/tmp}/voicesadhana-dev.log"
cd "$APP_ROOT"

healthy() {
  node --input-type=module -e "import {get} from 'node:http'; const req=get('http://127.0.0.1:${PORT}/',res=>process.exit(res.statusCode===200?0:1)); req.setTimeout(1000,()=>{req.destroy();process.exit(1)}); req.on('error',()=>process.exit(1));" >/dev/null 2>&1
}

if healthy; then
  echo "VoiceSadhana is already responding on port ${PORT}."
  exit 0
fi

nohup npm run dev >"$LOG" 2>&1 </dev/null &
for _ in $(seq 1 30); do
  if healthy; then
    echo "VoiceSadhana is responding on port ${PORT}."
    exit 0
  fi
  sleep 0.5
done
cat "$LOG" >&2
exit 1
