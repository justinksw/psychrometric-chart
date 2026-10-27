# Psychart light v2 — Punch list (one pass)

**Against:** `briefs/brief-v3.md` · **Preview:** https://justinksw.github.io/psychrometric-chart/ (Pages=preview, Jessie SHA b8af6fe)  
**Reviewer:** Celine · **Proof reviewed:** `preview-proof/light-v2/` (+ OCR on sheet crops)  
**Date:** 2026-10-27 (HKT)

## P0 — must fix

### 1. Inactive OA second field still visible (fails brief §5 / acceptance #3)

In **DB + WB** mode, **Outdoor RH** remains on screen beside DB; **Outdoor WB** sits below (often clipped). In **DB + RH** mode, **Outdoor WB** remains visible under RH.

OCR on Jessie’s own proof shots (`chromium-390-default`, `mode-rh`, `bec`, `chromium-320`): labels **Outdoor DB + Outdoor RH** always present together; WB also present. Segment selection does not visually swap the second field.

JS sets `oaRhField.hidden` / `oaWbField.hidden` in `syncModeUi()`, and acceptance checks `element.hidden` — but **computed layout still shows the “hidden” field**. Same pattern as other chrome: you already force hide with `!important` for `.bec-badge[hidden]`, `.field-warn[hidden]`, etc.; **`.field` has `display: flex` and has no matching rule.**

**Fix:** In `styles.css` add:

```css
.field[hidden] { display: none !important; }
```

Re-prove: in DB+WB, `getComputedStyle($('oaRhField')).display === 'none'` and RH label absent from screenshot; only DB + WB. Mirror for DB+RH. No sideways scroll at 320–430 Chromium + WebKit.

## P1 — should fix

### 2. BEC soft badge not in the Outdoor first screenful (D1 / acceptance #7)

When DB=36 (proof `*-390-bec.png`), badge copy does **not** appear in the sheet crop; only DB / RH / clipped WB. `#becBadge` sits after both fields, so with the extra visible field (P0) it falls below the fold. Even after P0, confirm badge is visible under Outdoor without deep scroll when DB>35 or WB>29.

**Fix options (pick one):**
- Place `#becBadge` **immediately under the segmented control** (or directly under the active DB + second field), still inside `#outdoorSection`; or
- Keep position but ensure after P0 the badge clears the fold at 390×844 sheet ~42%.

Muted chip, hint-only — no red fail (already OK in CSS).

## P2 — optional / verify only

### 3. WB>DB warn screenshot timing

`chromium-390-wb-warn.png` looks like **post-clamp** (WB=33=DB); warn line not in crop. Acceptance mid-state `warn:true` is fine. After P0, one shot with WB typed above DB **before** blur still showing amber `#oaWbWarn`, then clamp on change/blur.

### 4. Acceptance SHA drift

Proof `ACCEPTANCE.md` lists SHA **e176718**; Jessie report **b8af6fe**. Refresh proof on the SHA Pages is serving before Justin live OK.

## Cleared (no punch)

- PREVIEW badge · A1 segment under Outdoor header · B1 default intent 33/28 WB · RA has no WB control · ω label `ω (g/kg) ↑` · Comfort ON / SHR OFF · bilingual segment labels · no sx-scroll numbers in Jessie REPORT (re-check after P0) · not a BEC checker (footer OK)

## Done when

1. P0 proven (screenshots + getComputedStyle) Chromium + WebKit @ 320 & 390  
2. P1 badge visible when DB>35 without hunting  
3. Report re-proof to **Sua**; ping Celine only if P0/P1 need another design call  
4. **Hold live / main** until Justin OK via Sua
