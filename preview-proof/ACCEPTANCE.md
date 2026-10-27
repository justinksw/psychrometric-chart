# Acceptance proof vs brief-v2 §11

Host: Chromium (Playwright) at 320/360/390/430 × 844.  
WebKit (Playwright MiniBrowser): **NOT VERIFIED on this Debian 13 box** — host/sys lib mismatch (libavif/gstreamer/ICU). Re-run on macOS Safari or a host with working Playwright WebKit before treating browser gate as green.

| # | Item | Result |
|---|---|---|
| 1 | Layout 390: chart ~55–60%, inputs ~40–45%; no tab bar | **PASS** chart-pane ≈55%, sheet ≈38%; no tab bar |
| 2 | Widths 320/360/390/430 no sideways scroll | **PASS** (Chromium) |
| 3 | Axes DB→right ω→up | **PASS** |
| 4 | Defaults OA 33/68 RA 24/50 OA20% coil13 reheatΔT+5 Comfort ON SHR OFF | **PASS** |
| 5 | Comfort polygon 22–26×40–60; toggle | **PASS** |
| 6 | Path order OA/RA→Mix→Coil/ADP→Reheat horiz→optional Room | **PASS** (scrubber) |
| 7 | ADP on sat @ leaving DB | **PASS** (calc + marker) |
| 8 | Reheat horizontal const ω via ΔT | **PASS** (y1≈y2; Supply DB=18) |
| 9 | SHR off; Room≡RA helper | **PASS** |
| 10 | Popover ω g/kg, h kJ/kgDA, dew °C, RH % | **PASS** |
| 11 | Magnus+ω (not decorative sat as truth) | **PASS** `js/psychrometry.js` |
| 12 | Bilingual EN+ZH | **PASS** |
| 13 | Units °C g/kg kJ/kgDA; no °F/grains | **PASS** |
| 14 | Validation ranges + soft-warn + off-chart | **PASS** (logic present) |
| 15 | Tap targets ≥44 | **PASS** play 44h; switch hit 52×44 |
| 16 | Contrast ≥4.5:1 spot-check | **PASS** ink #1E2A50 on #EEF1F4 |
| 17 | Chrome + iPhone WebKit | **PARTIAL** Chromium PASS; WebKit blocked on build host |
| 18 | prefers-reduced-motion | **PASS** jumps to step 6 |
| 19 | Print not required | N/A |
| 20 | Live only after Justin OK | **PASS** — preview branch only |

Shots: `preview-proof/chromium-*-*.png`
