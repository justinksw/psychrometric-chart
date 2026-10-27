# Psychrometric Chart web app — Design brief v3 (light v2)

**Supersedes:** `briefs/brief-v2.md`  
**Direction:** `briefs/direction-v2.md` (Justin locked **A1 / B1 / C1 / D1**; Beatrice agreed)  
**Substance:** `briefs/ANSWERS-beatrice.md` + Beatrice light-v2 scope (via Sua)  
**Designer:** Celine · **Builder:** Jessie · **Calc:** Beatrice · **Coordinator:** Sua  
**Audience:** Hong Kong office / public MVAC (no OT)  
**Live base:** https://justinksw.github.io/psychrometric-chart/  
**Target ship:** GitHub Pages (Jessie) · **Tools:** Free only · **Hold live until Justin OK**

Light extension on top of live v1: **OA** may be entered as **DB+RH or DB+WB**. Still **not** a BEC compliance checker. Sea-level **P = 101325 Pa**. UI chrome follows live app + `wireframe/` tokens.

---

## Changelog vs v2

- **OA mode segmented control** under Outdoor header (**A1**): **DB + RH | DB + WB**; swaps second field RH % ↔ WB °C.
- **Default load (B1):** OA mode **DB + WB**, **33°C DB / 28°C WB** (≈ prior 33°C / 68% RH teaching pair).
- Mode switch keeps **same psychrometric state**: DB+WB → DB+RH shows **derived RH**; DB+RH → DB+WB shows **derived WB** (path must not jump).
- **WB > DB (C1):** soft-warn + **clamp** WB ≤ DB (cannot leave invalid). **WB = DB** = saturation OK.
- **Soft BEC Outdoor Summer badge (D1):** under Outdoor section when **DB > 35 or WB > 29** — hint only, no block / no pass-fail.
- Calc path for WB: psychrolib `GetHumRatioFromTWetBulb` **or** ASHRAE SI ω from Twb + Magnus; then RH from ω+DB.
- Out of scope unchanged + explicit: **RA WB**, winter, pass/fail, catalogue ADP.

Everything else from brief-v2 (layout, path animation, RA, coil, reheat, comfort, SHR, tokens, WebKit gate) **stays**.

---

## 1. Goal

Mobile-first teaching tool: psychrometric chart + animated MVAC path, with OA entry as **DB+RH or DB+WB**, bilingual EN primary, °C + g/kg.

## 2. Locked product decisions

| Decision | Value |
|---|---|
| Layout | Chart **top** (~52–60% vh), inputs **bottom** (~40–45%, live ~42% sheet OK). **No tab bar.** |
| Chart | DB → right, ω → up; soft comfort-band overlay |
| Language | Bilingual, **EN primary**; ZH secondary where space |
| Units | **°C** + **g/kg** only |
| Comfort band | Overlay; **default ON** |
| SHR path | Supply→Room; **OFF unless toggled**; Room ≡ RA |
| OA entry | **DB+RH \| DB+WB** toggle (OA only); RA stays DB+RH |
| Default OA | **DB+WB · 33°C / 28°C WB** |
| BEC badge | Soft hint only when DB>35 or WB>29 |
| Print | Not required |

## 3. Process animation (unchanged from v2)

1. OA and RA fade in  
2. Mix slides on OA–RA line (by OA ratio; mass ≈ volume OK for demo)  
3. Coil Mix → leaving; **ADP** = saturation kiss at leaving DB  
4. Reheat **horizontal RIGHT**, constant ω, DB += ΔT  
5. Optional Supply → Room (Room≡RA) when SHR on  
6. Pop ω / h / dew / RH at selected points  

Timing: fade 280–350 ms; Mix 450–550; Coil 500–650; Reheat 400–500; SHR 450–550; popover 150–200. `prefers-reduced-motion: reduce` → final state, no tween.

## 4. Default setpoints

| Point | Value | Notes |
|---|---|---|
| OA mode | **DB + WB** | B1 |
| OA | **33°C DB / 28°C WB** | ≈ 33°C / ~68% RH; teaching point |
| RA | **24°C / 50% RH** | DB+RH only |
| OA ratio | **20%** | |
| Coil leaving | **13°C** @ **95% RH** default | User enters DB only by default |
| Reheat | **ΔT = +5 K** | → Supply **18°C** |
| Comfort | **ON** | |
| SHR / Room | **OFF**; Room ≡ RA when on | Helper: “Room uses return-air state” |

Winter / other seasons: out of defaults.

## 5. Inputs (sheet)

### Outdoor section (light v2)

| Control | EN / ZH | Spec |
|---|---|---|
| **OA mode** | DB + RH / 乾球+相對濕度 · DB + WB / 乾球+濕球 | **Segmented control under Outdoor section label, above the two fields (A1).** Tap targets ≥44px. Swaps second field only. |
| Outdoor DB | Outdoor DB / 室外乾球 | °C (both modes) |
| Outdoor RH | Outdoor RH / 室外相對濕度 | % — **visible only in DB+RH mode** |
| Outdoor WB | Outdoor WB / 室外濕球 | °C — **visible only in DB+WB mode** |
| WB soft-warn | — | When WB > DB: amber inline under WB + **clamp WB ≤ DB**. Copy: “WB can’t exceed DB (saturation at equal)” / “濕球不可高於乾球（相等＝飽和）”. WB = DB OK. |
| BEC soft badge | Outside typical BEC Outdoor Summer envelope (hint) / 超出常見 BEC 夏季室外包絡（提示） | Show under Outdoor section when **DB > 35 or WB > 29** (D1). Muted chip; **no** red fail; **no** block. Hide when inside. Use current OA DB and the active second value (WB in WB mode; derived WB or check via ω in RH mode — if only DB known from RH mode, evaluate DB>35 **or** derived WB>29). |

### Unchanged controls

| Control | EN / ZH | Spec |
|---|---|---|
| Return DB | Return DB / 回風乾球 | °C |
| Return RH | Return RH / 回風相對濕度 | % |
| OA ratio | OA ratio / 新風比 | % slider/stepper ≥44px |
| Coil leaving DB | Coil leaving / 盤管出風 | DB °C only (optional advanced leaving RH, default 95%) |
| Reheat | Reheat / 再熱 | **ΔT (K)** |
| Comfort band | Comfort band / 舒適區 | toggle, default **ON** |
| SHR step | Show room path (SHR) / 顯示室內路徑 | toggle, default **OFF**; caption when on |

Comfort / SHR stay at **top of sheet** (always visible). OA mode stays **with Outdoor fields**, not with those toggles.

### Mode-switch behaviour

- Switching modes **preserves psychrometric state** (same DB + ω):
  - DB+WB → DB+RH: show **derived RH %** from (DB, WB).
  - DB+RH → DB+WB: show **derived WB °C** from (DB, RH).
- Do not reset to defaults on toggle.
- Chart OA marker and path update from the single resolved (DB, ω) state.

## 6. Calc rules (Beatrice — Jessie wires)

### OA from wet-bulb (new)

Prefer **psychrolib** SI @ P=101325:

- `GetHumRatioFromTWetBulb(DB, WB, P)` → ω  
- Then RH from ω + DB (psychrolib or Magnus invert)

Else ASHRAE SI ω from Twb + Magnus; then RH from ω+DB. Full RH/DB path remains as brief-v2 / `ANSWERS-beatrice.md`.

### Mix / Coil / ADP / Reheat / Comfort / SHR / Popover

Unchanged from brief-v2.

### Popover

Always: **ω g/kg**, **h kJ/kgDA**, **dew °C**, **RH %**.  
Show **WB °C** on OA popover when useful (optional but preferred in light v2).

### Validation + off-chart

| Input | Min | Max |
|---|---|---|
| DB (OA/RA) | 5 | 40 |
| RH | 10 | 99 |
| WB (OA) | 5 | ≤ DB (clamped); practical max 40 |
| OA ratio | 0 | 100 % |
| Coil leaving DB | 6 | 24 |
| Reheat ΔT | 0 | 12 K |

- Soft-warn (don’t block): coil leaving DB ≥ Mix DB → existing copy.  
- **Hard constraint:** WB > DB → clamp + inline warn (C1).  
- Off-chart: compute popover; clamp/hide marker; status “Off chart / 超出圖範圍” — never fake an on-chart point.  
- BEC badge is **hint only** — never blocks input.

## 7. Visual direction

Unchanged tokens from wireframe / live:

- canvas `#EEF1F4`, panel `#FFFFFF`, ink `#1E2A50`, muted `#5A6178`, accent `#C45C26`, comfort teal  
- Segmented control: match Comfort/SHR visual weight; selected segment ink on soft fill; ≥44px height  
- Soft-warn: amber/muted, not alarm red  
- BEC badge: muted chip, hint typography (~12px), dismisses when condition clears  
- EN 14–16px primary; ZH ~12px muted  
- Contrast ≥4.5:1 body/axes

## 8. Responsive / browsers

| Requirement | Detail |
|---|---|
| Phone | **320–430** CSS px; **no sideways scroll** (incl. new segment + badge) |
| Primary | **390×844** |
| Desktop | Stackable; not a blocker |
| Browsers | Desktop **Chrome** + iPhone **WebKit** (Safari + iOS Chrome) |

## 9. Out of scope (light v2)

- OT / industrial · °F/grains · print · auth/save/export · paid design tools  
- **RA WB** · winter defaults · BEC **pass/fail** · catalogue ADP  
- Separate Room fields · true ADP ≠ leaving as user input  
- Not a BEC / CoP compliance checker

## 10. Artifacts

| Path | What |
|---|---|
| `briefs/brief-v3.md` | **Build against this** |
| `briefs/direction-v2.md` | Justin A1/B1/C1/D1 locks |
| `briefs/brief-v2.md` | Prior (superseded) |
| `briefs/ANSWERS-beatrice.md` | Core calc answers |
| Live / repo | justinksw/psychrometric-chart · https://justinksw.github.io/psychrometric-chart/ |
| `wireframe/` | Visual reference + tokens |

## 11. Acceptance list (measurable)

Preview accepted when **all** proven (inherit v2 gates + light v2):

1. **Layout:** 390×844 — chart top / sheet bottom; no tab bar; no sideways scroll at 320/360/390/430.  
2. **OA mode (A1):** Segment under Outdoor header, above fields; labels EN+ZH; ≥44px tap.  
3. **Field swap:** DB+RH shows RH; DB+WB shows WB; only one second field visible.  
4. **Defaults (B1):** Load in DB+WB with **33 / 28**; RA 24/50; OA 20%; coil 13°C; reheat +5 K; Comfort ON; SHR OFF.  
5. **State preserve:** Toggle modes — same OA point on chart (derived RH↔WB); path does not jump.  
6. **WB > DB (C1):** Inline warn + clamp WB ≤ DB; WB=DB allowed (sat).  
7. **BEC badge (D1):** Appears under Outdoor when DB>35 or WB>29; muted hint copy; no block; hides when clear.  
8. **RA:** Still DB+RH only — no RA WB control.  
9. **Axes / path / ADP / reheat / SHR / comfort / popover / math:** Same as brief-v2 acceptance (real sat curve; psychrolib or Beatrice formulas).  
10. **WB calc:** OA from Twb via psychrolib GetHumRatioFromTWetBulb **or** ASHRAE SI + Magnus; P=101325; RH from ω+DB.  
11. **Bilingual / units / tap / contrast / motion / WebKit:** Same as v2.  
12. **Not a checker:** No pass/fail, no winter pack, no catalogue ADP.  
13. **Live:** Merge / drop PREVIEW only after Justin OK (via Sua). Report preview + proof to **Sua**.

### Self-check

- A1/B1/C1/D1 match Justin locks; Beatrice scope folded.  
- Default 33/28 WB ≈ prior 33/68 RH — teaching continuity.  
- Badge is hint-only — does not contradict “not a BEC checker.”  
- RA has no WB — out of scope explicit.  
- Phone WebKit + 320–430 no sx scroll still hard gate (new segment must not overflow).

---

*End brief-v3. Amendments → `brief-v4.md`, never chat-only edits.*
