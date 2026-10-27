# Psychrometric Chart web app — Design brief v1

**Designer:** Celine  
**Builder:** Jessie  
**Substance / calc defaults:** Beatrice  
**Coordinator:** Sua  
**Audience:** Hong Kong office / public MVAC (no OT)  
**Target ship:** GitHub Pages (later; Jessie builds)  
**Tools:** Free tools only (no paid design reference services)

This brief is design-only. Do not invent psychrometric equations, saturation curves, or default setpoints — those come from Beatrice. Wireframe values are **placeholders** so the UI can be reviewed.

---

## 1. Goal

A mobile-first web tool that shows a simple psychrometric chart and an animated MVAC process path (OA → Mix → Coil/ADP → Reheat/Supply, optional Room along SHR), with bilingual labels and SI-friendly units for HK office work.

## 2. Locked product decisions (Justin via Sua)

| Decision | Value |
|---|---|
| Layout | Chart **top** (~55–60% viewport height), inputs **bottom** (~40–45%). **No tab bar.** |
| Chart | Simple psychart background: dry-bulb (DB) → right, humidity ratio ω → up. Soft comfort-band overlay. |
| Language | Bilingual, **EN primary**; smaller ZH secondary where space allows |
| Units | **°C** and **g/kg** only (no °F, no grains) |
| Comfort band | Overlay toggle (default: on in mock; confirm with Beatrice for product default) |
| SHR path | Optional supply→room up-right along SHR — **OFF unless toggled** |
| Print | Not required |

## 3. Process animation (Beatrice-corrected — motion intent only)

Jessie implements the visual sequence; Beatrice owns whether numbers are physically correct.

1. **OA** and **RA** points fade in  
2. **Mix** slides along the OA–RA line  
3. **Coil** moves toward lower DB + lower ω / near saturation (**ADP kiss**)  
4. **Reheat** moves ~**horizontal RIGHT** at constant ω — **not up**  
5. Optional **Supply → Room** up-right along SHR — only when SHR toggle is on  
6. Pop **ω / h / dew** near selected points  

Suggested timing (UI only, not physics): fade 280–350 ms; Mix slide 450–550 ms; Coil 500–650 ms; Reheat 400–500 ms; SHR optional 450–550 ms; popover appear 150–200 ms. Easing: ease-out for fades, ease-in-out for path slides. Honour `prefers-reduced-motion`: show final path + points with no tween.

Wireframe includes a simple **Play / Step 1–6** scrubber so the motion intent is reviewable without a full animation engine.

## 4. Screen structure (iPhone 13 portrait = 390×844 CSS px)

### 4.1 Chart pane (top ~55–60%)

- Axes labeled: **DB (°C)** along bottom → right; **ω (g/kg)** along left → up  
- Soft dashed/soft-fill **comfort band** (toggleable)  
- Saturation curve suggested as a light decorative arc (exact shape from Beatrice / real chart later — mock may use a schematic curve)  
- Process path in one strong accent stroke  
- Point markers with short EN labels (OA, RA, Mix, ADP, Supply; **Room** only if SHR on)  
- Selected-point **popover** for ω / h / dew (placeholder numbers OK until Beatrice wires calc)

### 4.2 Input pane (bottom ~40–45%, sheet-style)

Large fields, EN primary + ZH secondary:

| Control | EN / ZH | Notes |
|---|---|---|
| Outdoor air DB | Outdoor DB / 室外乾球 | °C |
| Outdoor air RH | Outdoor RH / 室外相對濕度 | % |
| Return air DB | Return DB / 回風乾球 | °C |
| Return air RH | Return RH / 回風相對濕度 | % |
| OA ratio | OA ratio / 新風比 | % — slider **or** stepper; tap targets ≥44px |
| Coil leaving | Coil leaving / 盤管出風 | DB °C (and/or ω — Beatrice confirms fields) |
| Reheat | Reheat / 再熱 | ΔT °C or leaving DB — Beatrice confirms |
| Comfort band | Comfort band / 舒適區 | toggle |
| SHR step | Show room path (SHR) / 顯示室內路徑 | toggle, **default OFF** |

Primary actions obvious; SHR is clearly an advanced/off-by-default control to reduce accidental taps.

## 5. Visual direction

- **Mode:** Operate (engineering tool), not consumer wellness  
- Canvas: cool gray (`#EEF1F4`) as shipped in wireframe (warm cream avoided after Impeccable cream-palette flag)  
- Ink / navy: `#1E2A50` for text and structure  
- Process path accent: one strong hue (e.g. `#C45C26` or `#D35400`) — single accent for the path  
- Comfort band: soft green/teal at low opacity (`rgba(46, 125, 110, 0.12–0.18)`), dashed border  
- Point markers: filled navy or accent with white ring for contrast  
- Typography: system UI stack; EN labels 14–16px primary; ZH secondary ~12px muted  
- Contrast: body text on canvas ≥ 4.5:1; chart axis labels ≥ 4.5:1 against chart fill  

Borrow only public psychrometric conventions (DB → right, ω → up). Free tools only.

## 6. Responsive / browsers

| Requirement | Detail |
|---|---|
| Phone widths | **320–430** CSS px — no sideways scroll; chart remains readable (labels may abbreviate at 320) |
| Primary mock | **390×844** (iPhone 13 portrait) |
| Desktop | Later; note in build plan — keep layout stackable; do not block v1 on desktop polish |
| Browsers | Desktop **Chrome** + iPhone **WebKit** (Safari and iOS Chrome) — test both; WebKit wrap/overflow must pass |

## 7. Interaction rules

- Tap targets ≥ **44×44** px for toggles, steppers, Play/Step controls  
- Tapping a point selects it and shows the ω/h/dew popover  
- No tab bar; no hamburger required for v1  
- Dynamic numeric values: **from Beatrice / calc later** — placeholders in mock are fine; do **not** hardcode live engineering defaults as product truth  

## 8. Out of scope (v1 design)

- Real psychrometric equations / accurate saturation curve geometry  
- OT / industrial modes  
- °F / grains  
- Print stylesheet  
- Auth, save, export (unless Justin asks later)  
- Paid reference tools (Mobbin, Refero, etc.)

## 9. Handoff artifacts

| Path | What |
|---|---|
| `briefs/brief-v1.md` | This brief |
| `wireframe/index.html` | Static mobile wireframe (HTML+CSS, light JS scrubber only) |
| `wireframe/NOTES.md` | Tokens, motion, bilingual pattern, what not to hardcode |
| `wireframe/renders/` | 390×844 screenshots: default, SHR on, point popover |

Content / default numbers: **ask Beatrice**, not Justin, for substance. See `briefs/OPEN-QUESTIONS-beatrice.md`.

## 10. Acceptance list (measurable)

Jessie’s preview is accepted when **all** of the following are proven:

1. **Layout:** On 390×844, chart occupies ~55–60% height and inputs ~40–45%; no tab bar.  
2. **Widths:** At 320, 360, 390, and 430 CSS px: no horizontal scroll; primary controls usable.  
3. **Axes:** Chart shows DB (°C) increasing right and ω (g/kg) increasing up, with visible labels.  
4. **Comfort band:** Soft overlay present; toggle hides/shows it.  
5. **Path order:** Animation or step scrubber demonstrates OA/RA → Mix on OA–RA → Coil toward lower DB+ω/ADP → Reheat horizontal right → (optional) Room along SHR only when toggle on.  
6. **SHR default:** SHR / room path is **off** on first load; Room marker absent until toggled on.  
7. **Reheat direction:** Reheat segment is approximately horizontal (constant ω), not upward.  
8. **Popover:** Selecting a point shows ω, h, and dew (placeholders OK until Beatrice).  
9. **Bilingual:** EN primary labels with ZH secondary on input controls where space allows.  
10. **Units:** Only °C and g/kg appear for temperature and humidity ratio (no °F/grains).  
11. **Tap targets:** Interactive controls (toggles, Play/Step, steppers) meet ≥44×44 px.  
12. **Contrast:** Body and axis label text meet ≥4.5:1 on their backgrounds (spot-check).  
13. **Browsers:** Same acceptance checks pass in desktop Chrome **and** iPhone WebKit (Safari or iOS Chrome WebView).  
14. **Motion:** `prefers-reduced-motion: reduce` skips tweens and shows the final state.  
15. **No invented substance:** No claim that placeholder numbers are real MVAC defaults; calc hooks left for Beatrice.  
16. **Print:** No print requirement — do not block on print CSS.  
17. **Live:** Nothing deploys to GitHub Pages until Justin OK (via Sua).

### Self-check (contradictions)

- Chart top / inputs bottom — consistent; no competing “tabs for chart vs inputs”.  
- SHR off by default — consistent with “fewest accidental taps” and animation step 5 optional.  
- Reheat horizontal right — consistent; do not draw reheat up the chart.  
- Placeholders OK — consistent with “Beatrice owns substance”.  
- Free tools only — consistent with project rule.  
- Print not required — listed once; not in acceptance as a deliverable.  
- Desktop later — phone acceptance is hard gate; desktop is a note, not a v1 blocker.

---

*End brief-v1. Amendments → `brief-v2.md`, never chat-only edits.*
