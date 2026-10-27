# Psychrometric Chart · 濕空氣線圖

Mobile-first psychrometric chart + MVAC process path for Hong Kong office / public teaching demos.

**Status: PREVIEW** — built on branch `preview`. Not final live until Justin OK (via Sua).

## Open locally

```bash
# any static server from repo root, e.g.
python3 -m http.server 8080
# then open http://localhost:8080/
```

Or open `index.html` directly in a browser (file:// works for this static build).

## Preview on GitHub Pages

If Pages is enabled from the **`preview`** branch (root):

`https://justinksw.github.io/psychrometric-chart/`

That URL is a **PREVIEW**, not the final product. Main may exist with README only; do not treat main Pages as shipped until Justin OKs.

## Defaults (Beatrice demo)

| Point | Value |
|---|---|
| OA | 33°C / 68% RH |
| RA | 24°C / 50% RH |
| OA ratio | 20% |
| Coil leaving | 13°C @ 95% RH (DB-only input) |
| Reheat | ΔT +5 K → Supply 18°C, constant ω |
| Comfort band | ON (22–26°C × 40–60% RH polygon) |
| SHR / Room | OFF; Room ≡ RA when on |

P = 101325 Pa. Magnus + ω formulas in `js/psychrometry.js` (see `briefs/ANSWERS-beatrice.md`).

## Layout

- Chart top ~55–60%, inputs bottom ~40–45%
- No tab bar
- EN primary + ZH secondary
- Units: °C, g/kg, enthalpy kJ/kgDA

## Briefs

Build against `briefs/brief-v2.md` (supersedes v1). Calc detail: `briefs/ANSWERS-beatrice.md`.

## Screenshot query flags

- `?shr=1` — SHR on, step 5
- `?pop=1&point=Mix` — popover
- `?step=4` — scrubber step
- `?comfort=0` — hide comfort band
