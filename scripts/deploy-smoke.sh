#!/usr/bin/env bash
# Post-deploy smoke check of the production site (read-only GETs).
# Usage: scripts/deploy-smoke.sh [base-url]   (default https://bookchaowalit.com)
set -euo pipefail

BASE="${1:-https://bookchaowalit.com}"
BASE="${BASE%/}"
fail=0

check() {
  local path="$1" code
  code=$(curl -sS -o /dev/null -L --max-time 30 -w '%{http_code}' "$BASE$path" || echo "000")
  if [ "$code" = 200 ]; then
    echo "ok   $code $path"
  else
    echo "FAIL $code $path"
    fail=1
  fi
}

check /en
check /th
check /en/projects
check /en/projects/booktrading
check /en/projects/base64
check /en/projects/localcrm

# Cards must not link the pre-rename bookchaowalit-<slug>-frontend repositories.
legacy=$(curl -sS -L --max-time 30 "$BASE/en/projects" | grep -oE 'github\.com/bookchaowalit-website/bookchaowalit-[a-z0-9-]+-frontend' | sort -u || true)
if [ -n "$legacy" ]; then
  echo "FAIL legacy source links on /en/projects:"
  echo "$legacy"
  fail=1
else
  echo "ok   no legacy source links on /en/projects"
fi

exit "$fail"
