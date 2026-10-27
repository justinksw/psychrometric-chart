/**
 * Psychrometry (Beatrice ANSWERS) — pure, no DOM.
 * Magnus/Tetens + humidity ratio at P = 101325 Pa.
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
   * t_d = 243.04 * ln(pv/610.94) / (17.625 - ln(pv/610.94))
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
    return {
      db: tC,
      rh: rhPct,
      omega: w,
      omegaG: omegaGPerKg(w),
      h: enthalpy(tC, w),
      dew: dewFromDbRh(tC, rhPct),
    };
  }

  /** Full state from DB + ω kg/kg. */
  function stateFromDbOmega(tC, omegaKg) {
    var rh = rhFromDbOmega(tC, omegaKg);
    return {
      db: tC,
      rh: rh,
      omega: omegaKg,
      omegaG: omegaGPerKg(omegaKg),
      h: enthalpy(tC, omegaKg),
      dew: dewFromPv((omegaKg * P) / (EPS + omegaKg)),
    };
  }

  /**
   * Mix on OA–RA by OA ratio (0–1). Mass ≈ volume OK for demo.
   * Mix DB and ω are linear in ratio; RH derived.
   */
  function mix(oa, ra, oaRatio) {
    var r = oaRatio;
    var db = r * oa.db + (1 - r) * ra.db;
    var w = r * oa.omega + (1 - r) * ra.omega;
    return stateFromDbOmega(db, w);
  }

  /**
   * Comfort polygon corners DB–RH → DB–ω states.
   * (22,40%), (26,40%), (26,60%), (22,60%)
   */
  function comfortCorners() {
    return [
      stateFromDbRh(22, 40),
      stateFromDbRh(26, 40),
      stateFromDbRh(26, 60),
      stateFromDbRh(22, 60),
    ];
  }

  /** Saturation curve points: φ=1, sweep DB min→max. */
  function satCurve(dbMin, dbMax, steps) {
    var n = steps || 80;
    var out = [];
    for (var i = 0; i <= n; i++) {
      var t = dbMin + ((dbMax - dbMin) * i) / n;
      out.push(stateFromDbRh(t, 100));
    }
    return out;
  }

  /**
   * Optional SHR number. Hide if nonsense.
   * SHR = cp(Tr-Ts) / (cp(Tr-Ts) + hfg(ωr-ωs))
   */
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

  /** Compute full process from inputs (Beatrice defaults shape). */
  function computeProcess(inputs) {
    var oa = stateFromDbRh(inputs.oaDb, inputs.oaRh);
    var ra = stateFromDbRh(inputs.raDb, inputs.raRh);
    var mx = mix(oa, ra, inputs.oaRatio / 100);
    var coilRh = inputs.coilRh != null ? inputs.coilRh : 95;
    var leaving = stateFromDbRh(inputs.coilDb, coilRh);
    var adp = stateFromDbRh(inputs.coilDb, 100); // kiss on sat @ leaving DB
    var supply = stateFromDbOmega(inputs.coilDb + inputs.reheatDt, leaving.omega);
    var room = ra; // Room ≡ RA in v1

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
    omegaGPerKg: omegaGPerKg,
    enthalpy: enthalpy,
    dewFromDbRh: dewFromDbRh,
    rhFromDbOmega: rhFromDbOmega,
    stateFromDbRh: stateFromDbRh,
    stateFromDbOmega: stateFromDbOmega,
    mix: mix,
    comfortCorners: comfortCorners,
    satCurve: satCurve,
    shrNumber: shrNumber,
    computeProcess: computeProcess,
  };
})(typeof window !== "undefined" ? window : globalThis);
