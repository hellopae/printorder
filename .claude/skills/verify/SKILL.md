---
name: verify
description: Build/launch/drive recipe for verifying the TANAPAT Quotation Assistant (React+TS+Vite)
---

# Verify: Quotation Assistant (printorder)

React 19 + TypeScript + Vite. Data = `src/data/quotations.json` (1,666 real quotes, bundled in).

## Launch

```bash
cd "/Users/agapae/Documents/Work PAE/Claude/AI Print Order Assistant /app"
npm run build        # tsc -b && vite build — catches type errors
npm run dev -- --port 5199
```

## Drive (CDP headless Chrome — node ≥22, see scratchpad cdp-order.mjs pattern)

Flows worth driving, in order:
1. Home = Quotations list; search box filters (synonyms: พิมพ์ "โบรชัวร์" ต้องเจองาน "โบว์ชัวร์")
2. Click "⚡ ใช้ใบนี้เป็นแบบ" → EditorPage; sum of steps per item = old quote amount exactly
3. Change qty (e.g. 50→100): per_unit steps scale, fixed steps (เพลท/ปรุ๊ฟ) unchanged
4. "🖨️ ดูใบเสนอราคา" → PrintSheet: TANAPAT header, items table, VAT, Thai baht text
5. Reload → draft persists in "ใบที่สร้างเอง" (localStorage `orderassist_drafts_v1`)
6. "+ ใบเปล่า" → blank draft with 3 default steps

## Gotchas

- **React controlled inputs ignore synthetic events** — use CDP `Input.insertText` after
  `el.focus(); el.select()`, then blur via `document.activeElement.blur()`. NumField commits on blur/Enter.
- Step names live in `input.value`, not innerText — assert via `[...querySelectorAll('input')].some(i=>i.value===...)`.
- Old quotes may have subtotal > Σitems (off-table lines like ค่าส่ง); drafts only count parsed items.

## Deploy

`bash scripts/deploy.sh` → builds and force-pushes dist to `gh-pages` →
https://hellopae.github.io/printorder/ (live ~1 min). Source goes on `main`.
