# Psychrometric Chart

Mobile-first psychrometric chart + MVAC process path (HK office / public teaching demo).

**PREVIEW (light v2):** https://justinksw.github.io/psychrometric-chart/

GitHub Pages currently serves the **`preview`** branch (PREVIEW badge). Not final live — hold merge to `main` until Justin OK via Sua. Last live `main` tip remains available to restore.

## Light v2 (brief-v3)

- OA entry: **DB + RH | DB + WB** segmented control (Outdoor section)
- Default load: **DB+WB · 33°C / 28°C WB** (≈ 33°C / ~68% RH)
- Mode switch preserves psychrometric state (derived RH ↔ WB)
- WB > DB: soft-warn + clamp on blur (WB = DB sat OK)
- Soft BEC Outdoor Summer badge when DB>35 or WB>29 (hint only)
- RA stays DB+RH only · P = 101325 Pa · ASHRAE SI ω from Twb

## Local

Open `index.html` in a browser (static; no build step).

## Briefs

See `briefs/brief-v3.md` and `briefs/direction-v2.md` (Justin A1/B1/C1/D1).
