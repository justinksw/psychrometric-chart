# Beatrice answers — calc / defaults only (HK office / public)

For Jessie wiring. Demo defaults, not a Code of Practice extract. Sea-level P = 101325 Pa.

---

## 1. Default setpoints (demo)

| Point | DB | RH | Notes |
|---|---|---|---|
| **OA** (HK summer) | **33°C** | **68%** | Approx. classic HK summer teaching pair (~33°C DB / ~28°C WB). |
| **RA** (office) | **24°C** | **50%** | Typical office design comfort target. |
| **OA ratio** | **20%** | — | Recirc AHU demo; slider 0–100%. |
| **Coil leaving** | **13°C** | **95%** (derived) | Near-sat leaving for cool+dehumid story. Do **not** make user enter ω by default. |
| **Reheat** | **ΔT = +5 K** | — | Sensible reheat at **constant ω**. Supply DB = coil leaving DB + ΔT → **18°C**. Prefer **ΔT** control (not absolute supply DB) for animation clarity. |

Winter / other seasons: out of v1 defaults (keep summer demo).

---

## 2. Coil leaving field(s) + ADP

- **Inputs:** Coil leaving **DB only** (+ optional advanced “leaving RH”, default **95%**).
- **Compute:** ω_leaving from (DB_leaving, RH_leaving); h, dew from same.
- **ADP marker:** For v1 teaching, put **ADP on the saturation curve at DB = coil leaving DB** (the “kiss”). Do **not** require a separate ADP input.
- If later you want true ADP ≠ leaving: ADP = saturation intersection of the mix→leaving process line; still no extra field in v1.

---

## 3. Saturation curve (real math — not the decorative SVG)

Use **psychrometry from vapour pressure**, not a hand-traced SVG as truth.

**Saturation vapour pressure** (Magnus / Tetens over water, °C → Pa), good enough for MVAC demo:

\[
p_s = 610.94 \times \exp\left(\frac{17.625\, t}{t + 243.04}\right)
\]

**Humidity ratio** at pressure \(P = 101325\ \mathrm{Pa}\):

\[
\omega = 0.62198 \times \frac{\varphi\, p_s(t)}{P - \varphi\, p_s(t)}
\quad (\varphi = \mathrm{RH}/100,\ \omega\ \mathrm{in}\ \mathrm{kg/kg})
\]

Display ω as **g/kg** = ω × 1000.

**Saturation curve:** φ = 1.0, sweep t from chart DB min→max, plot (t, ω_sat).

**Library option (preferred if Jessie allows deps):** [psychrolib](https://github.com/psychrometrics/psychrolib) (MIT) — SI mode, sea level. Else implement Magnus + ω above in ~20 lines JS.

**Enthalpy** (approx., dry air + vapour), kJ/kgDA:

\[
h \approx 1.006\, t + \omega\, (2501 + 1.86\, t)
\]

with t in °C, ω in kg/kg.

**Dew point:** solve \(p_s(t_d) = \varphi\, p_s(t)\) for \(t_d\) (or psychrolib `GetTDewPointFromVapPres`).

---

## 4. Comfort band geometry

**Product default: ON.**

Simple **DB–RH polygon** (convert corners to DB–ω for plot), HK office summer-ish:

| Corner | DB | RH |
|---|---|---|
| 1 | 22°C | 40% |
| 2 | 26°C | 40% |
| 3 | 26°C | 60% |
| 4 | 22°C | 60% |

Soft fill only; not a full ASHRAE 55 compliance engine. Toggle can hide it.

---

## 5. Popover metrics

**Always show (selected point):**

- ω — **g/kg**
- h — **kJ/kgDA**
- dew — **°C**

**Also show (cheap, useful):** RH **%** (even when the point was defined by DB+RH).

**Optional / secondary line:** WB °C — nice-to-have, not required for v1 popover.

Do **not** clutter with specific volume in v1.

---

## 6. SHR path (Supply → Room)

- **Drawing:** straight line from Supply \((DB_s,\omega_s)\) to Room \((DB_r,\omega_r)\). That line **is** the room process; slope encodes SHR.
- **v1 Room point:** **Room ≡ RA** (same DB/RH as return). Document in UI helper: “Room uses return-air state”. No separate Room fields in v1.
- If RA ≠ Room later: Room = occupied-zone sensors; RA = return duct — only then split inputs.
- **Optional numeric SHR** (if you display it):

\[
\mathrm{SHR} = \frac{c_p (T_r - T_s)}{c_p (T_r - T_s) + h_{fg}(\omega_r - \omega_s)}
\]

with \(c_p \approx 1.006\ \mathrm{kJ/kg·K}\), \(h_{fg} \approx 2450\ \mathrm{kJ/kg}\), T in °C, ω in kg/kg. Clamp display 0–1; if \(T_r \le T_s\) or nonsense signs, hide SHR number.

Toggle **default OFF** (already locked in brief).

---

## 7. Units display

| Qty | EN string | ZH secondary |
|---|---|---|
| Enthalpy | **kJ/kgDA** | kJ/kg乾空氣 |
| Humidity ratio | **g/kg** | g/kg |
| Temp | **°C** | °C |

EN primary / ZH secondary per brief. No °F, no grains. No localization beyond that bilingual pair.

---

## 8. Validation ranges + off-chart

| Input | Min | Max | Notes |
|---|---|---|---|
| DB (OA/RA) | 5 | 40 | Chart may draw 5–40°C |
| RH | 10 | 99 | Avoid 0/100 numerics |
| OA ratio | 0 | 100 | % |
| Coil leaving DB | 6 | 24 | Soft-warn if ≥ Mix DB |
| Reheat ΔT | 0 | 12 | K |

**Logic soft-warns (don’t block typing):**

- Coil leaving DB ≥ Mix DB → “Coil should be cooler than mix / 盤管出風應低於混合點”
- Leaving RH default 95%; if advanced RH < 80% at low DB, unusual for dehumid coil — optional hint

**Off-chart result:**

- Still compute numbers in popover.
- Clamp **marker** to nearest chart edge (or hide marker).
- Show small status: **“Off chart / 超出圖範圍”** — do not invent a fake on-chart point.

---

## Quick wire checklist for Jessie

1. Defaults: OA 33/68, RA 24/50, OA 20%, coil 13°C @ 95% RH, reheat ΔT +5 K → Supply 18°C same ω.  
2. Mix on OA–RA line by OA ratio (mass ≈ volume OK for demo).  
3. Coil: Mix → (13°C, ω@95%); ADP marker = sat @ 13°C.  
4. Reheat: horizontal right, constant ω, DB += ΔT.  
5. Optional Room = RA; SHR line Supply→Room.  
6. Popover: ω g/kg, h kJ/kgDA, dew °C, RH %.  
7. Comfort band ON; polygon above.  
8. P = 101325 Pa; Magnus + ω formula or psychrolib.
