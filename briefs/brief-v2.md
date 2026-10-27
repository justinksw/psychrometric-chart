# Psychrometric Chart web app — Design brief v2

**Supersedes:** `briefs/brief-v1.md`  
**Substance folded from:** `briefs/ANSWERS-beatrice.md`  
**Designer:** Celine · **Builder:** Jessie · **Calc:** Beatrice · **Coordinator:** Sua  
**Audience:** Hong Kong office / public MVAC (no OT)  
**Target ship:** GitHub Pages (Jessie) · **Tools:** Free only

Design + locked substance for v1 build. UI chrome still follows the wireframe; numbers and formulas below are product truth for the demo (not CoP extracts). Sea-level **P = 101325 Pa**.

---

## Changelog vs v1

- Folded Beatrice defaults, coil/ADP rules, saturation math, comfort polygon, popover metrics, SHR/Room ≡ RA, validation ranges.
- Placeholders no longer “optional forever” — wire Beatrice formulas or psychrolib.
- Comfort band **default ON**; product default matches mock.
- Coil leaving = **DB only** (+ optional advanced leaving RH, default 95%); reheat = **ΔT** control.
- Popover always includes **RH %** as well as ω / h / dew.

Wireframe at `wireframe/` remains the visual reference (layout, tokens, scrubber). Update on-screen placeholder numbers to Beatrice defaults when building.

---

## 1. Goal

Mobile-first web tool: simple psychrometric chart + animated MVAC path (OA → Mix → Coil/ADP → Reheat/Supply, optional Room along SHR), bilingual EN primary, °C + g/kg for HK office teaching/demo.

## 2. Locked product decisions (Justin via Sua)

| Decision | Value |
|---|---|
| Layout | Chart **top** (~55–60% vh), inputs **bottom** (~40–45%). **No tab bar.** |
| Chart | DB → right, ω → up; soft comfort-band overlay |
| Language | Bilingual, **EN primary**; ZH secondary where space |
| Units | **°C** + **g/kg** only (no °F / grains) |
| Comfort band | Overlay; **default ON** (Beatrice) |
| SHR path | Supply→Room; **OFF unless toggled**; v1 Room ≡ RA |
| Print | Not required |

## 3. Process animation (Beatrice-corrected)

1. **OA** and **RA** fade in  
2. **Mix** slides on OA–RA line (by OA ratio; mass ≈ volume OK for demo)  
3. **Coil** Mix → leaving (lower DB+ω); **ADP** = saturation kiss at leaving DB (no separate ADP input)  
4. **Reheat** ~**horizontal RIGHT**, constant ω, DB += ΔT — **not up**  
5. Optional **Supply → Room** (Room≡RA) only when SHR toggle on  
6. Pop **ω / h / dew / RH** at selected points  

Timing (UI only): fade 280–350 ms; Mix 450–550; Coil 500–650; Reheat 400–500; SHR 450–550; popover 150–200. Ease-out fades, ease-in-out slides. `prefers-reduced-motion: reduce` → final state, no tween.

## 4. Default setpoints (Beatrice — demo)

| Point | Value | Notes |
|---|---|---|
| OA | **33°C / 68% RH** | HK summer teaching pair |
| RA | **24°C / 50% RH** | Office comfort target |
| OA ratio | **20%** | Slider 0–100% |
| Coil leaving | **13°C** @ **95% RH** (RH derived/default) | User enters **DB only** by default |
| Reheat | **ΔT = +5 K** | Const ω → Supply **18°C** |
| Comfort | **ON** | Polygon below |
| SHR / Room | **OFF**; Room ≡ RA when on | Helper: “Room uses return-air state” |

Winter / other seasons: out of v1 defaults.

## 5. Inputs (sheet)

| Control | EN / ZH | Spec |
|---|---|---|
| Outdoor DB | Outdoor DB / 室外乾球 | °C |
| Outdoor RH | Outdoor RH / 室外相對濕度 | % |
| Return DB | Return DB / 回風乾球 | °C |
| Return RH | Return RH / 回風相對濕度 | % |
| OA ratio | OA ratio / 新風比 | % slider or stepper ≥44px |
| Coil leaving DB | Coil leaving / 盤管出風 | **DB °C only** (optional advanced leaving RH, default 95%) |
| Reheat | Reheat / 再熱 | **ΔT (K)**, not absolute supply DB |
| Comfort band | Comfort band / 舒適區 | toggle, default **ON** |
| SHR step | Show room path (SHR) / 顯示室內路徑 | toggle, default **OFF** |

## 6. Calc rules (Beatrice — Jessie wires)

### Mix
On OA–RA line by OA ratio (demo: mass ≈ volume).

### Coil + ADP
- ω_leaving from (DB_leaving, RH_leaving default 95%).  
- **ADP marker** on saturation curve at **DB = coil leaving DB** (kiss). No separate ADP field in v1.

### Reheat
Horizontal right: ω fixed; DB_supply = DB_leaving + ΔT.

### Saturation / properties
Prefer **psychrolib** (MIT, SI, sea level) if deps OK; else Magnus + ω:

- \(p_s = 610.94 \exp(17.625 t / (t + 243.04))\) Pa  
- \(\omega = 0.62198 \cdot (\varphi p_s) / (P - \varphi p_s)\) kg/kg; display **g/kg** = ×1000  
- Sat curve: φ=1, sweep chart DB min→max  
- \(h \approx 1.006 t + \omega(2501 + 1.86 t)\) kJ/kgDA (t °C, ω kg/kg)  
- Dew: solve \(p_s(t_d) = \varphi p_s(t)\) or psychrolib  

Full formulas: `briefs/ANSWERS-beatrice.md`.

### Comfort band (default ON)
DB–RH rectangle → convert corners to DB–ω:

| Corner | DB | RH |
|---|---|---|
| 1–4 | 22 / 26 / 26 / 22 °C | 40 / 40 / 60 / 60 % |

Soft fill only — not full ASHRAE 55 engine.

### Popover (selected point)
Always: **ω g/kg**, **h kJ/kgDA** (ZH: kJ/kg乾空氣), **dew °C**, **RH %**.  
Optional v1: WB °C. No specific volume in v1.

### SHR (when toggled on)
Straight Supply→Room; **Room ≡ RA**. Optional numeric SHR per Beatrice formula; hide if nonsense. Default toggle OFF.

### Validation + off-chart

| Input | Min | Max |
|---|---|---|
| DB (OA/RA) | 5 | 40 |
| RH | 10 | 99 |
| OA ratio | 0 | 100 % |
| Coil leaving DB | 6 | 24 |
| Reheat ΔT | 0 | 12 K |

Soft-warn (don’t block): coil leaving DB ≥ Mix DB → “Coil should be cooler than mix / 盤管出風應低於混合點”.  
Off-chart: still compute popover; clamp or hide marker; status **“Off chart / 超出圖範圍”** — never invent a fake on-chart point.

## 7. Visual direction (unchanged from v1 / wireframe)

- Operate-mode tool: canvas `#EEF1F4`, ink `#1E2A50`, path accent `#C45C26`, soft teal comfort band  
- EN 14–16px primary; ZH ~12px muted  
- Contrast ≥4.5:1 body/axes  
- Free public psych conventions only (DB→right, ω→up)

## 8. Responsive / browsers

| Requirement | Detail |
|---|---|
| Phone | **320–430** CSS px; no sideways scroll |
| Primary | **390×844** |
| Desktop | Later; stackable; not a v1 blocker |
| Browsers | Desktop **Chrome** + iPhone **WebKit** (Safari + iOS Chrome) |

## 9. Out of scope (v1)

- OT / industrial · °F/grains · print · auth/save/export · paid design tools  
- Separate Room fields · true ADP ≠ leaving as a user input  

## 10. Artifacts

| Path | What |
|---|---|
| `briefs/brief-v2.md` | **This brief (build against this)** |
| `briefs/brief-v1.md` | Prior design-only (superseded) |
| `briefs/ANSWERS-beatrice.md` | Full calc answers |
| `wireframe/` | Visual reference + NOTES + renders |

## 11. Acceptance list (measurable)

Preview accepted when **all** proven:

1. **Layout:** 390×844 — chart ~55–60%, inputs ~40–45%; no tab bar.  
2. **Widths:** 320 / 360 / 390 / 430 — no horizontal scroll; controls usable.  
3. **Axes:** DB °C → right; ω g/kg → up; labels visible.  
4. **Defaults on load:** OA 33/68, RA 24/50, OA 20%, coil leaving 13°C, reheat ΔT +5 K → Supply 18°C; Comfort **ON**; SHR **OFF**.  
5. **Comfort:** Polygon 22–26°C × 40–60% RH; toggle hides/shows.  
6. **Path order:** OA/RA → Mix on OA–RA → Coil/ADP kiss → Reheat horizontal right → (optional) Room≡RA only when SHR on.  
7. **ADP:** Marker on sat curve at leaving DB; no separate ADP input.  
8. **Reheat:** Horizontal (const ω), driven by **ΔT**.  
9. **SHR default:** Off on first load; Room absent until toggled; helper that Room uses RA.  
10. **Popover:** ω g/kg, h kJ/kgDA, dew °C, RH %.  
11. **Math:** Saturation/properties via psychrolib **or** Beatrice Magnus+ω; not decorative SVG as truth.  
12. **Bilingual:** EN primary + ZH secondary on inputs where space.  
13. **Units:** °C + g/kg (+ kJ/kgDA for h); no °F/grains.  
14. **Validation:** Ranges + soft-warn coil≥mix; off-chart status without fake points.  
15. **Tap targets:** ≥44×44 for toggles, Play/Step, steppers.  
16. **Contrast:** Body/axis ≥4.5:1 (spot-check).  
17. **Browsers:** Desktop Chrome **and** iPhone WebKit.  
18. **Motion:** `prefers-reduced-motion` skips tweens.  
19. **Print:** Not required.  
20. **Live:** GitHub Pages only after Justin OK (via Sua).

### Self-check

- Comfort default ON (Beatrice) vs SHR default OFF (Justin) — both intentional.  
- Coil DB-only + ΔT reheat — matches animation clarity.  
- Room ≡ RA — no extra fields; helper copy required.  
- Real sat curve required — decorative arc alone fails acceptance #11.  
- Phone WebKit still a hard gate.

---

*End brief-v2. Amendments → `brief-v3.md`, never chat-only edits.*
