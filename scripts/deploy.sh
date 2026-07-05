#!/bin/bash
# Deploy: build แล้ว push dist ขึ้น gh-pages → https://hellopae.github.io/printorder/
set -e
cd "$(dirname "$0")/.."
npm run build
cd dist
touch .nojekyll
git init -q -b gh-pages
git add -A
git commit -q -m "Deploy: $(date '+%Y-%m-%d %H:%M')"
git push -f https://github.com/hellopae/printorder.git gh-pages
rm -rf .git
echo "✓ Deployed → https://hellopae.github.io/printorder/ (รอ ~1 นาที)"
