#!/usr/bin/env bash
# Lädt die Schriften des Journalyst-Designs in public/fonts (nicht im Repository, siehe .gitignore).
# Satoshi (Fontshare, ITF Free Font License: Nutzung erlaubt, Weitergabe der Dateien nicht) und Onest (OFL, über @fontsource).
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p public/fonts
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"
css=$(curl -sS -A "$UA" "https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap")
for w in 400 500 700 900; do
  url=$(printf '%s' "$css" | awk -v w="$w" 'BEGIN{RS="}"} $0 ~ "font-weight: "w";" {print}' | grep -oE "//cdn\.fontshare\.com/[^')]+\.woff2" | head -1)
  [ -n "$url" ] && curl -sS -o "public/fonts/satoshi-$w.woff2" "https:$url" && echo "satoshi-$w.woff2"
done
tmp=$(mktemp -d); (cd "$tmp" && npm init -y >/dev/null && npm install --no-audit --no-fund @fontsource/onest >/dev/null)
for w in 400 500 600 700; do cp "$tmp/node_modules/@fontsource/onest/files/onest-latin-$w-normal.woff2" "public/fonts/onest-$w.woff2" && echo "onest-$w.woff2"; done
rm -rf "$tmp"
