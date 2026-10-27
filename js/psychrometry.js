/**
 * Psychrometry (Beatrice ANSWERS + light v2 WB) — pure, no DOM.
 * Magnus/Tetens + humidity ratio at P = 101325 Pa.
 * Wet-bulb: ASHRAE SI ω from Twb (Fundamentals).
 */
(function (global) {
  "use strict";

  var P = 101325; // Pa, sea level
  var EPS = 0.62198;

  /** Saturation vapour pressure Pa from dry-bulb °C (Magnus over water). */
  function ps(tC) {
    return 610.94 * Math.exp((17.625 * tC) / (tC + 243.04));
  }

  /**
   * Humidity ratio kg/kg from DB °C and RH % (0–100).
   */
  function omegaFromDbRh(tC, rhPct) {
    var phi = rhPct / 100;
    var p = ps(tC);
    var pv = phi * p;
    if (pv >= P * 0.99) pv = P * 0.99;
    return EPS * (pv / (P - pv));
  }

  /** Saturation humidity ratio kg/kg at t °C. */
  function omegaSat(tC) {
    return omegaFromDbRh(tC, 100);
  }

  /**
   * ASHRAE SI humidity ratio from dry-bulb and wet-bulb (°C).
   * W = ((2501 - 2.326 twb) Ws* - 1.006 (tdb - twb)) / (2501 + 1.86 tdb - 4.186 twb)
   * where Ws* = saturation humidity ratio at twb.
   * If twb >= tdb, return saturation at tdb (WB=DB = sat OK).
   */
  function omegaFromDbWb(tdb, twb) {
    if (twb >= tdb) return omegaSat(tdb);
    var ws = omegaSat(twb);
    var num = (2501 - 2.326 * twb) * ws - 1.006 * (tdb - twb);
    var den = 2501 + 1.86 * tdb - 4.186 * twb;
    if (den <= 0) return omegaSat(tdb);
    var w = num / den;
    if (!isFinite(w) || w < 0) return 0;
    // Cap at saturation at DB
    var wMax = omegaSat(tdb);
    if (w > wMax) w = wMax;
    return w;
  }

  /**
   * Wet-bulb °C from DB + RH (or DB + ω via rhFromDbOmega).
   * Binary search Twb in [dew, DB].
   */
  function wbFromDbRh(tdb, rhPct) {
    var wTarget = omegaFromDbRh(tdb, rhPct);
    return wbFromDbOmega(tdb, wTarget);
  }

  function wbFromDbOmega(tdb, omegaKg) {
    var wSat = omegaSat(tdb);
    if (omegaKg >= wSat * 0.9995) return tdb; // saturated
    if (omegaKg <= 0) {
      // very dry: approach dew of near-zero vapour
      return dewFromPv(1);
    }
    var lo = dewFromPv((omegaKg * P) / (EPS + omegaKg));
    var hi = tdb;
    if (lo > hi) lo = hi;
    // Expand slightly in case dew estimate is high
    lo = Math.min(lo, hi) - 0.5;
    if (lo < -20) lo = -20;
    for (var i = 0; i < 40; i++) {
      var mid = (lo + hi) / 2;
      var wMid = omegaFromDbWb(tdb, mid);
      if (wMid > omegaKg) {
        // mid too wet → raise WB toward DB? Wait:
        // Higher WB → higher ω. So if wMid > target, WB too high → lower hi.
        hi = mid;
      } else {
        lo = mid;
      }
    }
    return (lo + hi) / 2;
  }

  /** Display g/kg from kg/kg. */
  function omegaGPerKg(omegaKg) {
    return omegaKg * 1000;
  }

  /**
   * Enthalpy kJ/kgDA. t °C, ω kg/kg.
   * h ≈ 1.006 t + ω (2501 + 1.86 t)
   */
  function enthalpy(tC, omegaKg) {
    return 1.006 * tC + omegaKg * (2501 + 1.86 * tC);
  }

  /**
   * Dew point °C from vapour pressure Pa (inverse Magnus).
   */
  function dewFromPv(pv) {
    if (pv <= 0) return -50;
    var ln = Math.log(pv / 610.94);
    return (243.04 * ln) / (17.625 - ln);
  }

  function dewFromDbRh(tC, rhPct) {
    return dewFromPv((rhPct / 100) * ps(tC));
  }

  /** RH % from DB °C and ω kg/kg. */
  function rhFromDbOmega(tC, omegaKg) {
    var pv = (omegaKg * P) / (EPS + omegaKg);
    var sat = ps(tC);
    if (sat <= 0) return 0;
    return Math.max(0, Math.min(100, (pv / sat) * 100));
  }

  /** Full state from DB + RH. */
  function stateFromDbRh(tC, rhPct) {
    var w = omegaFromDbRh(tC, rhPct);
    var wb = wbFromDbOmega(tC, w);
    return {
      db: tC,
      rh: rhPct,
      wb: wb,
      omega: w,
      omegaG: omegaGPerKg(w),
      h: enthalpy(tC, w),
      dew: dewFromDbRh(tC, rhPct),
    };
  }

  /** Full state from DB + ω kg/kg. */
  function stateFromDbOmega(tC, omegaKg) {
    var rh = rhFromDbOmega(tC, omegaKg);
    var wb = wbFromDbOmega(tC, omegaKg);
    return {
      db: tC,
      rh: rh,
      wb: wb,
      omega: omegaKg,
      omegaG: omegaGPerKg(omegaKg),
      h: enthalpy(tC, omegaKg),
      dew: dewFromPv((omegaKg * P) / (EPS + omegaKg)),
    };
  }

  /** Full state from DB + WB °C (ASHRAE SI). */
  function stateFromDbWb(tdb, twb) {
    var w = omegaFromDbWb(tdb, twb);
    var rh = rhFromDbOmega(tdb, w);
    return {
      db: tdb,
      rh: rh,
      wb: Math.min(twb, tdb),
      omega: w,
      omegaG: omegaGPerKg(w),
      h: enthalpy(tdb, w),
      dew: dewFromPv((w * P) / (EPS + w)),
    };
  }

  /**
   * Mix on OA–RA by OA ratio (0–1). Mass ≈ volume OK for demo.
   */
  function mix(oa, ra, oaRatio) {
    var r = oaRatio;
    var db = r * oa.db + (1 - r) * ra.db;
    var w = r * oa.omega + (1 - r) * ra.omega;
    return stateFromDbOmega(db, w);
  }

  function comfortCorners() {
    return [
      stateFromDbRh(22, 40),
      stateFromDbRh(26, 40),
      stateFromDbRh(26, 60),
      stateFromDbRh(22, 60),
    ];
  }

  function satCurve(dbMin, dbMax, steps) {
    var n = steps || 80;
    var out = [];
    for (var i = 0; i <= n; i++) {
      var t = dbMin + ((dbMax - dbMin) * i) / n;
      out.push(stateFromDbRh(t, 100));
    }
    return out;
  }

  function shrNumber(supply, room) {
    var cp = 1.006;
    var hfg = 2450;
    var dT = room.db - supply.db;
    var dw = room.omega - supply.omega;
    if (dT <= 0) return null;
    var num = cp * dT;
    var den = num + hfg * dw;
    if (den <= 0) return null;
    var s = num / den;
    if (s < 0 || s > 1) return null;
    return s;
  }

  /**
   * Compute full process.
   * inputs.oaMode: "rh" | "wb" (default "wb" for light v2 B1)
   * When oaMode==="wb", use inputs.oaWb; else inputs.oaRh.
   */
  function computeProcess(inputs) {
    var oa;
    if (inputs.oaMode === "wb") {
      oa = stateFromDbWb(inputs.oaDb, inputs.oaWb);
    } else {
      oa = stateFromDbRh(inputs.oaDb, inputs.oaRh);
    }
    var ra = stateFromDbRh(inputs.raDb, inputs.raRh);
    var mx = mix(oa, ra, inputs.oaRatio / 100);
    var coilRh = inputs.coilRh != null ? inputs.coilRh : 95;
    var leaving = stateFromDbRh(inputs.coilDb, coilRh);
    var adp = stateFromDbRh(inputs.coilDb, 100);
    var supply = stateFromDbOmega(inputs.coilDb + inputs.reheatDt, leaving.omega);
    var room = ra;

    var softWarns = [];
    if (inputs.coilDb >= mx.db) {
      softWarns.push({
        en: "Coil should be cooler than mix",
        zh: "盤管出風應低於混合點",
      });
    }

    var shr = shrNumber(supply, room);

    return {
      oa: oa,
      ra: ra,
      mix: mx,
      leaving: leaving,
      adp: adp,
      supply: supply,
      room: room,
      softWarns: softWarns,
      shr: shr,
    };
  }

  global.Psychrometry = {
    P: P,
    ps: ps,
    omegaFromDbRh: omegaFromDbRh,
    omegaFromDbWb: omegaFromDbWb,
    omegaSat: omegaSat,
    omegaGPerKg: omegaGPerKg,
    enthalpy: enthalpy,
    dewFromDbRh: dewFromDbRh,
    rhFromDbOmega: rhFromDbOmega,
    wbFromDbRh: wbFromDbRh,
    wbFromDbOmega: wbFromDbOmega,
    stateFromDbRh: stateFromDbRh,
    stateFromDbOmega: stateFromDbOmega,
    stateFromDbWb: stateFromDbWb,
    mix: mix,
    comfortCorners: comfortCorners,
    satCurve: satCurve,
    shrNumber: shrNumber,
    computeProcess: computeProcess,
  };
})(typeof window !== "undefined" ? window : globalThis);
