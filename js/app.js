/**
 * Bind inputs (light v2: OA DB+RH | DB+WB), toggles, chart, animation.
 */
(function () {
  "use strict";

  var DEFAULTS = {
    oaMode: "wb", // B1
    oaDb: 33,
    oaRh: 68, // derived from 33/28; kept for RH mode
    oaWb: 28,
    raDb: 24,
    raRh: 50,
    oaRatio: 20,
    coilDb: 13,
    coilRh: 95,
    reheatDt: 5,
  };

  var RANGES = {
    oaDb: [5, 40],
    oaRh: [10, 99],
    oaWb: [5, 40],
    raDb: [5, 40],
    raRh: [10, 99],
    oaRatio: [0, 100],
    coilDb: [6, 24],
    reheatDt: [0, 12],
  };

  var oaMode = DEFAULTS.oaMode; // "wb" | "rh"
  var pointMap = {};
  var process = null;
  var anim = null;

  function $(id) {
    return document.getElementById(id);
  }

  function num(id, fallback) {
    var el = $(id);
    if (!el) return fallback;
    var v = parseFloat(el.value);
    return isFinite(v) ? v : fallback;
  }

  function readInputs() {
    return {
      oaMode: oaMode,
      oaDb: num("oaDb", DEFAULTS.oaDb),
      oaRh: num("oaRh", DEFAULTS.oaRh),
      oaWb: num("oaWb", DEFAULTS.oaWb),
      raDb: num("raDb", DEFAULTS.raDb),
      raRh: num("raRh", DEFAULTS.raRh),
      oaRatio: num("oaRatio", DEFAULTS.oaRatio),
      coilDb: num("coilLeave", DEFAULTS.coilDb),
      coilRh: DEFAULTS.coilRh,
      reheatDt: num("reheat", DEFAULTS.reheatDt),
    };
  }

  function clampInput(id, key) {
    var el = $(id);
    if (!el || !RANGES[key]) return;
    var r = RANGES[key];
    var v = parseFloat(el.value);
    if (!isFinite(v)) return;
    if (v < r[0]) el.value = String(r[0]);
    if (v > r[1]) el.value = String(r[1]);
  }

  /** Clamp WB ≤ DB on blur/change only (C1). */
  function clampWbToDb() {
    var dbEl = $("oaDb");
    var wbEl = $("oaWb");
    if (!dbEl || !wbEl) return;
    var db = parseFloat(dbEl.value);
    var wb = parseFloat(wbEl.value);
    if (!isFinite(db) || !isFinite(wb)) return;
    if (wb > db) {
      wbEl.value = String(db);
    }
  }

  function fmt(n, d) {
    if (!isFinite(n)) return "—";
    return Number(n).toFixed(d);
  }

  function syncModeUi() {
    var rhBtn = $("oaModeRh");
    var wbBtn = $("oaModeWb");
    var rhField = $("oaRhField");
    var wbField = $("oaWbField");
    if (!rhBtn || !wbBtn) return;
    var isWb = oaMode === "wb";
    rhBtn.setAttribute("aria-checked", isWb ? "false" : "true");
    wbBtn.setAttribute("aria-checked", isWb ? "true" : "false");
    if (rhField) rhField.hidden = isWb;
    if (wbField) wbField.hidden = !isWb;
  }

  /**
   * Switch OA mode preserving DB+ω (same psychrometric state).
   */
  function setOaMode(next) {
    if (next !== "rh" && next !== "wb") return;
    if (next === oaMode) return;
    var db = num("oaDb", DEFAULTS.oaDb);
    if (oaMode === "wb" && next === "rh") {
      var wb = num("oaWb", DEFAULTS.oaWb);
      var st = Psychrometry.stateFromDbWb(db, Math.min(wb, db));
      $("oaRh").value = String(Math.round(st.rh));
    } else if (oaMode === "rh" && next === "wb") {
      var rh = num("oaRh", DEFAULTS.oaRh);
      var st2 = Psychrometry.stateFromDbRh(db, rh);
      $("oaWb").value = String(Number(st2.wb.toFixed(1)));
    }
    oaMode = next;
    syncModeUi();
    updateWbWarn();
    updateBecBadge();
    rebuild();
  }

  function updateWbWarn() {
    var el = $("oaWbWarn");
    if (!el) return;
    if (oaMode !== "wb") {
      el.hidden = true;
      return;
    }
    var db = parseFloat($("oaDb").value);
    var wb = parseFloat($("oaWb").value);
    var show = isFinite(db) && isFinite(wb) && wb > db;
    el.hidden = !show;
  }

  function updateBecBadge() {
    var el = $("becBadge");
    if (!el) return;
    var db = num("oaDb", DEFAULTS.oaDb);
    var wb;
    if (oaMode === "wb") {
      wb = num("oaWb", DEFAULTS.oaWb);
      if (wb > db) wb = db; // effective after clamp logic
    } else {
      var rh = num("oaRh", DEFAULTS.oaRh);
      wb = Psychrometry.wbFromDbRh(db, rh);
    }
    var show = db > 35 || wb > 29;
    el.hidden = !show;
  }

  function showPopover(name) {
    var pop = $("popover");
    var meta = pointMap[name];
    if (!pop || !meta || !meta.state) return;
    var s = meta.state;
    var wbRow =
      name === "OA" && s.wb != null
        ? "<dt>WB</dt><dd>" + fmt(s.wb, 1) + " °C</dd>"
        : "";
    pop.innerHTML =
      '<div class="title">' +
      meta.label +
      ' <span class="zh">' +
      meta.zh +
      "</span></div>" +
      "<dl>" +
      "<dt>ω</dt><dd>" +
      fmt(s.omegaG, 1) +
      " g/kg</dd>" +
      "<dt>h</dt><dd>" +
      fmt(s.h, 1) +
      " kJ/kgDA</dd>" +
      "<dt>dew</dt><dd>" +
      fmt(s.dew, 1) +
      " °C</dd>" +
      "<dt>RH</dt><dd>" +
      fmt(s.rh, 0) +
      " %</dd>" +
      wbRow +
      "</dl>" +
      (meta.offChart
        ? '<p class="note warn">Off chart / 超出圖範圍</p>'
        : name === "Room"
          ? '<p class="note">Room uses return-air state / 室內點＝回風狀態</p>'
          : name === "ADP"
            ? '<p class="note">ADP = sat kiss @ leaving DB · 離開點預設 RH 95%</p>'
            : name === "Leaving"
              ? '<p class="note">Coil leaving · default RH 95% · 盤管出風（非飽和）</p>'
              : '<p class="note">Demo defaults (Beatrice) · 示範預設</p>');
    var card = $("chartCard");
    var svg = card.querySelector("svg");
    var vb = svg.viewBox.baseVal;
    var leftPct = (meta.x / vb.width) * 100;
    var topPct = (meta.y / vb.height) * 100;
    leftPct = Math.max(4, Math.min(62, leftPct));
    topPct = Math.max(4, Math.min(55, topPct));
    pop.style.left = leftPct + "%";
    pop.style.top = topPct + "%";
    pop.classList.add("show");
  }

  function hidePopover() {
    var pop = $("popover");
    if (pop) pop.classList.remove("show");
  }

  function renderWarns(softWarns) {
    var el = $("softWarn");
    if (!el) return;
    if (!softWarns || !softWarns.length) {
      el.hidden = true;
      el.textContent = "";
      return;
    }
    el.hidden = false;
    el.textContent = softWarns
      .map(function (w) {
        return w.en + " / " + w.zh;
      })
      .join(" · ");
  }

  function renderShrHint(show, shr) {
    var el = $("shrHint");
    if (!el) return;
    var cap = $("shrCaption");
    if (cap) cap.hidden = !show;
    if (!show) {
      el.hidden = true;
      return;
    }
    el.hidden = false;
    var extra =
      shr != null ? " · SHR ≈ " + (shr * 100).toFixed(0) + "%" : "";
    el.textContent =
      "Room uses return-air state / 室內點＝回風狀態" + extra;
  }

  function rebuild() {
    updateWbWarn();
    updateBecBadge();
    var inputs = readInputs();
    // While typing WB > DB, still compute with clamped WB so chart stays valid,
    // but do not rewrite the input mid-keystroke.
    if (inputs.oaMode === "wb" && inputs.oaWb > inputs.oaDb) {
      inputs = Object.assign({}, inputs, { oaWb: inputs.oaDb });
    }
    process = Psychrometry.computeProcess(inputs);
    var showShr = $("togShr").checked;
    var svg = document.querySelector("#chartSvg");
    pointMap = Chart.updateProcess(svg, process, { showShr: showShr });
    renderWarns(process.softWarns);
    renderShrHint(showShr, process.shr);

    document.body.classList.toggle("shr-on", showShr);
    document.body.classList.toggle("comfort-off", !$("togComfort").checked);

    if (anim) {
      anim.applyVisibility(anim.step, showShr);
      if (anim.step >= 6) {
        /* keep popover */
      } else {
        hidePopover();
      }
    }

    Array.prototype.forEach.call(
      document.querySelectorAll(".point-hit"),
      function (g) {
        g.addEventListener("click", function () {
          if (anim) {
            anim.stopPlay();
            anim.setStep(6);
          }
          showPopover(g.getAttribute("data-point"));
        });
      }
    );

    $("oaRatioVal").textContent = Math.round(inputs.oaRatio) + "%";
    $("oaRatio").setAttribute(
      "aria-valuetext",
      Math.round(inputs.oaRatio) + " percent"
    );
  }

  function bindNumeric(id, key, extraClamp) {
    var el = $(id);
    if (!el) return;
    el.addEventListener("input", function () {
      if (id === "oaWb" || id === "oaDb") updateWbWarn();
      rebuild();
    });
    el.addEventListener("change", function () {
      clampInput(id, key);
      if (extraClamp) extraClamp();
      rebuild();
    });
    el.addEventListener("blur", function () {
      clampInput(id, key);
      if (extraClamp) extraClamp();
      rebuild();
    });
  }

  function bindInputs() {
    bindNumeric("oaDb", "oaDb", function () {
      // If WB mode and DB dropped below WB, clamp WB on blur
      if (oaMode === "wb") clampWbToDb();
    });
    bindNumeric("oaRh", "oaRh");
    bindNumeric("oaWb", "oaWb", clampWbToDb);
    bindNumeric("raDb", "raDb");
    bindNumeric("raRh", "raRh");
    bindNumeric("coilLeave", "coilDb");
    bindNumeric("reheat", "reheatDt");

    $("oaRatio").addEventListener("input", function () {
      rebuild();
    });
    $("togComfort").addEventListener("change", function () {
      document.body.classList.toggle("comfort-off", !$("togComfort").checked);
    });
    $("togShr").addEventListener("change", function () {
      rebuild();
    });

    $("oaModeRh").addEventListener("click", function () {
      setOaMode("rh");
    });
    $("oaModeWb").addEventListener("click", function () {
      setOaMode("wb");
    });
  }

  function boot() {
    oaMode = DEFAULTS.oaMode;
    $("oaDb").value = DEFAULTS.oaDb;
    $("oaRh").value = DEFAULTS.oaRh;
    $("oaWb").value = DEFAULTS.oaWb;
    $("raDb").value = DEFAULTS.raDb;
    $("raRh").value = DEFAULTS.raRh;
    $("oaRatio").value = DEFAULTS.oaRatio;
    $("coilLeave").value = DEFAULTS.coilDb;
    $("reheat").value = DEFAULTS.reheatDt;
    $("togComfort").checked = true;
    $("togShr").checked = false;
    syncModeUi();

    var svg = $("chartSvg");
    Chart.init(svg);

    anim = new AnimationController({
      getShowShr: function () {
        return $("togShr").checked;
      },
      captionEl: $("stepCaption"),
      stepsEl: $("steps"),
      playBtn: $("btnPlay"),
      onStep: function (step) {
        anim.applyVisibility(step, $("togShr").checked);
        if (step < 6) hidePopover();
      },
      onPopover: function () {
        showPopover("Mix");
      },
    });
    anim.bind();
    bindInputs();
    rebuild();

    var params = new URLSearchParams(location.search);
    if (params.get("mode") === "rh") {
      setOaMode("rh");
    }
    if (params.get("shr") === "1") {
      $("togShr").checked = true;
      rebuild();
      anim.setStep(5);
    } else if (params.get("pop") === "1") {
      anim.setStep(6);
      showPopover(params.get("point") || "Mix");
    } else if (params.get("step")) {
      anim.setStep(parseInt(params.get("step"), 10) || 4);
    } else {
      anim.setStep(4);
    }
    if (params.get("comfort") === "0") {
      $("togComfort").checked = false;
      document.body.classList.add("comfort-off");
    }
    // Screenshot helpers for BEC / WB warn
    if (params.get("db")) {
      $("oaDb").value = params.get("db");
      rebuild();
    }
    if (params.get("wb")) {
      $("oaWb").value = params.get("wb");
      if (oaMode !== "wb") setOaMode("wb");
      else rebuild();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
