#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "$0")"
profile=$(mktemp -d)
trap 'rm -rf -- "$profile"' EXIT
google-chrome --headless --no-sandbox --disable-gpu --user-data-dir="$profile" --no-pdf-header-footer --print-to-pdf="$PWD/olhar-selvagem.pdf" "file://$PWD/index.html"
