/**
 * Bind inputs (Beatrice defaults), toggles, chart, animation.
 */
(function () {
  "use strict";

  var DEFAULTS = {
    oaDb: 33,
    oaRh: 68,
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
    raDb: [5, 40],
    raRh: [10, 99],
    oaRatio: [0, 100],
    coilDb: [6, 24],
    reheatDt: [0, 12],
  };

  var pointMap = {};
  var process = null;
  var anim = null;

  function $(id) {
    return document.getElementById(id);
  }

  function readInputs() {
    return {
      oaDb: num("oaDb", DEFAULTS.oaDb),
      oaRh: num("oaRh", DEFAULTS.oaRh),
      raDb: num("raDb", DEFAULTS.raDb),
      raRh: num("raRh", DEFAULTS.raRh),
      oaRatio: num("oaRatio", DEFAULTS.oaRatio),
      coilDb: num("coilLeave", DEFAULTS.coilDb),
      coilRh: DEFAULTS.coilRh,
      reheatDt: num("reheat", DEFAULTS.reheatDt),
    };
  }

  function num(id, fallback) {
    var el = $(id);
    if (!el) return fallback;
    var v = parseFloat(el.value);
    return isFinite(v) ? v : fallback;
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

  function fmt(n, d) {
    if (!isFinite(n)) return "—";
    return Number(n).toFixed(d);
  }

  function showPopover(name) {
    var pop = $("popover");
    var meta = pointMap[name];
    if (!pop || !meta || !meta.state) return;
    var s = meta.state;
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
    // Position relative to chart card using SVG coords → %
    var card = $("chartCard");
    var svg = card.querySelector("svg");
    var vb = svg.viewBox.baseVal;
    var leftPct = (meta.x / vb.width) * 100;
    var topPct = (meta.y / vb.height) * 100;
    // Keep popover inside card
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
    var inputs = readInputs();
    process = Psychrometry.computeProcess(inputs);
    var showShr = $("togShr").checked;
    var svg = document.querySelector("#chartSvg");
    pointMap = Chart.updateProcess(svg, process, { showShr: showShr });
    renderWarns(process.softWarns);
    renderShrHint(showShr, process.shr);

    document.body.classList.toggle("shr-on", showShr);
    document.body.classList.toggle("comfort-off", !$("togComfort").checked);

    // Re-apply step visibility after rebuild
    if (anim) {
      anim.applyVisibility(anim.step, showShr);
      if (anim.step >= 6) {
        /* keep popover */
      } else {
        hidePopover();
      }
    }

    // Re-bind point clicks (nodes were recreated)
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

  function bindInputs() {
    ["oaDb", "oaRh", "raDb", "raRh", "coilLeave", "reheat"].forEach(function (
      id
    ) {
      var el = $(id);
      if (!el) return;
      el.addEventListener("change", function () {
        var key =
          id === "coilLeave" ? "coilDb" : id === "reheat" ? "reheatDt" : id;
        clampInput(id, key);
        rebuild();
      });
      el.addEventListener("input", function () {
        var key =
          id === "coilLeave" ? "coilDb" : id === "reheat" ? "reheatDt" : id;
        clampInput(id, key);
        rebuild();
      });
      el.addEventListener("blur", function () {
        var key =
          id === "coilLeave" ? "coilDb" : id === "reheat" ? "reheatDt" : id;
        clampInput(id, key);
        rebuild();
      });
    });
    $("oaRatio").addEventListener("input", function () {
      rebuild();
    });
    $("togComfort").addEventListener("change", function () {
      document.body.classList.toggle("comfort-off", !$("togComfort").checked);
    });
    $("togShr").addEventListener("change", function () {
      rebuild();
    });
  }

  function boot() {
    // Apply Beatrice defaults into fields
    $("oaDb").value = DEFAULTS.oaDb;
    $("oaRh").value = DEFAULTS.oaRh;
    $("raDb").value = DEFAULTS.raDb;
    $("raRh").value = DEFAULTS.raRh;
    $("oaRatio").value = DEFAULTS.oaRatio;
    $("coilLeave").value = DEFAULTS.coilDb;
    $("reheat").value = DEFAULTS.reheatDt;
    $("togComfort").checked = true;
    $("togShr").checked = false;

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

    // Query flags for screenshots
    var params = new URLSearchParams(location.search);
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
      // Default review: full path without SHR
      anim.setStep(4);
    }
    if (params.get("comfort") === "0") {
      $("togComfort").checked = false;
      document.body.classList.add("comfort-off");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
