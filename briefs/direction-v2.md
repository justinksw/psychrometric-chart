# Psychart light v2 — Direction note

**Designer:** Celine · **Coordinator:** Sua · **Calc scope:** Beatrice · **Builder (after brief):** Jessie  
**Live base:** https://justinksw.github.io/psychrometric-chart/  
**Status:** Justin locked A1/B1/C1/D1 (Beatrice agreed). Build: `briefs/brief-v3.md`.

## Goal

Light extension of the live teaching tool: let **Outdoor Air (OA)** be entered as **DB + RH** *or* **DB + WB**, matching Beatrice’s engineering scope. Still mobile-first, bilingual EN primary, °C + g/kg. **Not** a BEC compliance checker.

## Audience / constraints (unchanged)

- HK office / public MVAC teaching (no OT)
- Phone 320–430, iPhone WebKit + desktop Chrome
- Free tools only; hold live until Justin OK
- RA stays **DB + RH** only

## Beatrice scope (locked for design)

| Item | Rule |
|---|---|
| OA modes | Toggle **DB+RH \| DB+WB** (OA only) |
| RA | DB+RH only |
| Default teaching point | OA **33°C DB / 28°C WB** (≈ today’s 33°C / 68% RH) |
| WB > DB | Soft-warn + **block/clamp** (cannot leave invalid) |
| WB = DB | Saturation OK |
| BEC Outdoor Summer | Optional **soft badge** if DB>35 or WB>29 — hint only, no pass/fail |
| Out of scope | RA WB, winter, pass/fail, catalogue ADP |

Calc (Jessie later): psychrolib `GetHumRatioFromTWetBulb` or ASHRAE SI ω from Twb + Magnus; RH from ω+DB; P=101325.

## Proposed UI (need Justin picks)

### A. OA mode control — placement

**Recommend A1.** Segmented control **directly under the Outdoor section label**, above the two numeric fields. Swaps the second field: RH % ↔ WB °C. Same pattern as Comfort / SHR toggles (large tap target ≥44px).

| Option | Placement | Tradeoff |
|---|---|---|
| **A1 (rec)** | Under Outdoor header, above fields | Clear; mode owns the pair; no scroll hunt |
| A2 | Inline right of Outdoor header | Saves vertical space; tighter on 320 |
| A3 | Top of sheet with Comfort / SHR | Easy to find; farther from fields it controls |

Labels: **DB + RH** / **乾球+相對濕度** · **DB + WB** / **乾球+濕球**

### B. Default mode on load

**Recommend B1.** Open in **DB + WB** with **33 / 28** (Beatrice teaching point). Switching to DB+RH shows the **derived RH** (~68%) for the same state so the path doesn’t jump.

| Option | Default |
|---|---|
| **B1 (rec)** | DB+WB · 33°C / 28°C WB |
| B2 | Keep today’s DB+RH · 33°C / 68%; WB available via toggle |

### C. Soft-warn when WB > DB

**Recommend C1.** Inline amber helper under the WB field + clamp WB ≤ DB (or block Apply until fixed). Copy: EN “WB can’t exceed DB (saturation at equal)” / ZH “濕球不可高於乾球（相等＝飽和）”.

### D. Soft BEC Outdoor Summer badge

**Recommend D1.** Small muted chip under the Outdoor section (or beside OA marker popover) when **DB>35 or WB>29**: EN “Outside typical BEC Outdoor Summer envelope (hint)” / ZH “超出常見 BEC 夏季室外包絡（提示）”. **No** red fail, **no** block.

| Option | Where |
|---|---|
| **D1 (rec)** | Under Outdoor section when condition true |
| D2 | Next to OA chart marker only |
| D3 | Skip badge in v2 (scope optional) |

### E. What stays the same

Layout chart-top / sheet-bottom · RA fields · Mix / Coil / Reheat / Comfort / SHR · tokens · bilingual pattern · WebKit gate.

## Out of this direction

Wireframes, brief-v3 acceptance list, Jessie build — **after** Justin yes on A–D.

## Ask Justin (via Sua)

Please pick (or say “go with Celine’s recs”):

1. **A** — OA toggle placement (A1 / A2 / A3)  
2. **B** — Default mode (B1 / B2)  
3. **C** — Soft-warn OK as clamp+inline? (yes / tweak)  
4. **D** — Soft badge (D1 / D2 / D3)

Then Celine writes `briefs/brief-v3.md` → priority handoff Jessie → preview to Sua → live only after Justin OK.
