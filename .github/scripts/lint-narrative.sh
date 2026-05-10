#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-.}"

fail=0

if rg -n --hidden --glob '!node_modules' --glob '!dist' --glob '!.git' \
  --glob '!.github/scripts/lint-narrative.sh' \
  'replaces AGENTS.md|better than AGENTS.md|Vreko'\''s format|Vreko'\''s standard|AI memory|backup|Safety net|SnapBack|SnapBack-era' \
  "$ROOT"; then
  fail=1
fi

if [ "$fail" -ne 0 ]; then
  echo "Narrative lint failed. See canon/narrative/canonical-narrative.md for approved vocabulary and banned terms."
  exit 1
fi

echo "Narrative lint passed."
