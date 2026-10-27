/**
 * SVG psychrometric chart — DB → right, ω → up.
 * Reads computed process points; no equations here.
 */
(function (global) {
  "use strict";

  var CHART = {
    dbMin: 5,
    dbMax: 40,
    omegaGMin: 0,
    omegaGMax: 30,
    // SVG plot rect inside viewBox 0 0 360 280
    padL: 48,
    padR: 24,
    padT: 16,
    padB: 44,
    vbW: 360,
    vbH: 280,
  };

  function plotW() {
    return CHART.vbW - CHART.padL - CHART.padR;
  }
  function plotH() {
    return CHART.vbH - CHART.padT - CHART.padB;
  }

  /** Map DB °C, ω g/kg → SVG x,y (y down). */
  function toXY(db, omegaG) {
    var x =
      CHART.padL +
      ((db - CHART.dbMin) / (CHART.dbMax - CHART.dbMin)) * plotW();
    var y =
      CHART.padT +
      plotH() -
      ((omegaG - CHART.omegaGMin) / (CHART.omegaGMax - CHART.omegaGMin)) *
        plotH();
    return { x: x, y: y };
  }

  function clampPoint(db, omegaG) {
    var off =
      db < CHART.dbMin ||
      db > CHART.dbMax ||
      omegaG < CHART.omegaGMin ||
      omegaG > CHART.omegaGMax;
    var cDb = Math.max(CHART.dbMin, Math.min(CHART.dbMax, db));
    var cW = Math.max(CHART.omegaGMin, Math.min(CHART.omegaGMax, omegaG));
    return { db: cDb, omegaG: cW, offChart: off };
  }

  function el(tag, attrs, kids) {
    var n = document.createElementNS("http://www.w3.org/2000/svg", tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (attrs[k] != null) n.setAttribute(k, attrs[k]);
      });
    }
    (kids || []).forEach(function (c) {
      if (typeof c === "string") n.appendChild(document.createTextNode(c));
      else if (c) n.appendChild(c);
    });
    return n;
  }

  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  /**
   * Build static layers once into svg root.
   */
  function init(svg) {
    clear(svg);
    svg.setAttribute("viewBox", "0 0 " + CHART.vbW + " " + CHART.vbH);
    svg.setAttribute("role", "img");
    svg.setAttribute(
      "aria-label",
      "Psychrometric chart. Dry-bulb right, humidity ratio up."
    );

    var defs = el("defs", null, [
      el("linearGradient", { id: "plotFade", x1: "0", y1: "0", x2: "0", y2: "1" }, [
        el("stop", { offset: "0%", "stop-color": "#F7FAFB" }),
        el("stop", { offset: "100%", "stop-color": "#EEF2F6" }),
      ]),
    ]);
    svg.appendChild(defs);

    var px = CHART.padL;
    var py = CHART.padT;
    var pw = plotW();
    var ph = plotH();

    svg.appendChild(
      el("rect", {
        x: px,
        y: py,
        width: pw,
        height: ph,
        fill: "url(#plotFade)",
        stroke: "#C8CDD8",
        "stroke-width": "1",
        rx: "4",
      })
    );

    var grid = el("g", { id: "grid", stroke: "#DDE1E8", "stroke-width": "0.75" });
    var i;
    for (i = 1; i <= 5; i++) {
      var gy = py + (ph * i) / 6;
      grid.appendChild(el("line", { x1: px, y1: gy, x2: px + pw, y2: gy }));
    }
    for (i = 1; i <= 6; i++) {
      var gx = px + (pw * i) / 7;
      grid.appendChild(el("line", { x1: gx, y1: py, x2: gx, y2: py + ph }));
    }
    svg.appendChild(grid);

    svg.appendChild(el("path", { id: "sat-curve", fill: "none", stroke: "#9AA3B5", "stroke-width": "1.5", "stroke-dasharray": "3 3", opacity: "0.9" }));
    svg.appendChild(el("g", { id: "comfort-band", class: "comfort" }));
    svg.appendChild(
      el("g", {
        id: "paths",
        fill: "none",
        stroke: "#C45C26",
        "stroke-width": "2.5",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      })
    );
    svg.appendChild(el("g", { id: "room-group" }));
    svg.appendChild(el("g", { id: "points" }));

    // Axis titles
    svg.appendChild(
      el(
        "text",
        {
          x: px + pw / 2,
          y: CHART.vbH - 8,
          "text-anchor": "middle",
          "font-size": "11",
          "font-weight": "700",
          fill: "#1E2A50",
        },
        ["DB (°C) →"]
      )
    );
    var yLabel = el(
      "text",
      {
        x: 14,
        y: py + ph / 2,
        "text-anchor": "middle",
        "font-size": "11",
        "font-weight": "700",
        fill: "#1E2A50",
        transform: "rotate(-90 14 " + (py + ph / 2) + ")",
      },
      ["ω (g/kg) →"]
    );
    svg.appendChild(yLabel);

    var ticks = el("g", {
      id: "ticks",
      "font-size": "11",
      fill: "#5A6178",
      "font-variant-numeric": "tabular-nums",
    });
    [10, 15, 20, 25, 30, 35].forEach(function (db) {
      var p = toXY(db, 0);
      ticks.appendChild(
        el("text", { x: p.x, y: py + ph + 16, "text-anchor": "middle" }, [String(db)])
      );
    });
    [5, 10, 15, 20, 25].forEach(function (w) {
      var p = toXY(CHART.dbMin, w);
      ticks.appendChild(
        el("text", { x: px - 6, y: p.y + 4, "text-anchor": "end" }, [String(w)])
      );
    });
    svg.appendChild(ticks);

    // Off-chart status text (hidden by default)
    svg.appendChild(
      el(
        "text",
        {
          id: "off-chart-status",
          x: px + 8,
          y: py + 14,
          "font-size": "11",
          "font-weight": "600",
          fill: "#C45C26",
          visibility: "hidden",
        },
        ["Off chart / 超出圖範圍"]
      )
    );
  }

  function updateSat(svg) {
    var path = svg.querySelector("#sat-curve");
    var pts = Psychrometry.satCurve(CHART.dbMin, CHART.dbMax, 80);
    var d = pts
      .map(function (s, i) {
        var p = toXY(s.db, s.omegaG);
        return (i === 0 ? "M" : "L") + p.x.toFixed(2) + " " + p.y.toFixed(2);
      })
      .join(" ");
    path.setAttribute("d", d);
  }

  function updateComfort(svg) {
    var g = svg.querySelector("#comfort-band");
    clear(g);
    var corners = Psychrometry.comfortCorners();
    // Plot order as polygon (DB–ω)
    var pts = corners.map(function (c) {
      return toXY(c.db, c.omegaG);
    });
    var d =
      pts
        .map(function (p, i) {
          return (i === 0 ? "M" : "L") + p.x.toFixed(2) + " " + p.y.toFixed(2);
        })
        .join(" ") + " Z";
    g.appendChild(
      el("path", {
        d: d,
        fill: "rgba(46,125,110,0.14)",
        stroke: "#2E7D6E",
        "stroke-width": "1.25",
        "stroke-dasharray": "4 3",
      })
    );
    var cx = (pts[0].x + pts[1].x) / 2;
    var cy = (pts[0].y + pts[2].y) / 2;
    g.appendChild(
      el(
        "text",
        {
          x: cx,
          y: cy + 4,
          "text-anchor": "middle",
          "font-size": "11",
          fill: "#2E7D6E",
          "font-weight": "600",
        },
        ["Comfort"]
      )
    );
  }

  function pointXY(state) {
    var c = clampPoint(state.db, state.omegaG);
    var p = toXY(c.db, c.omegaG);
    return { x: p.x, y: p.y, offChart: c.offChart, state: state };
  }

  function makePoint(id, label, xy, fill, visible) {
    var g = el("g", {
      id: id,
      class: "pt point-hit",
      "data-point": label,
      transform: "translate(" + xy.x.toFixed(2) + "," + xy.y.toFixed(2) + ")",
      style: visible === false ? "display:none" : null,
      opacity: "0",
    });
    g.appendChild(
      el("circle", { r: "7", fill: fill, stroke: "#fff", "stroke-width": "2" })
    );
    // Hit target ≥44 CSS px approximated via larger invisible circle in SVG space
    g.appendChild(
      el("circle", {
        r: "14",
        fill: "transparent",
        class: "hit",
      })
    );
    var labelEl = el(
      "text",
      {
        x: "10",
        y: "-8",
        "font-size": "10",
        "font-weight": "700",
        fill: "#1E2A50",
      },
      [label]
    );
    g.appendChild(labelEl);
    return g;
  }

  function line(id, a, b, extra) {
    var attrs = {
      id: id,
      class: "seg",
      x1: a.x.toFixed(2),
      y1: a.y.toFixed(2),
      x2: b.x.toFixed(2),
      y2: b.y.toFixed(2),
      opacity: "0",
    };
    if (extra) {
      Object.keys(extra).forEach(function (k) {
        attrs[k] = extra[k];
      });
    }
    return el("line", attrs);
  }

  /**
   * Update path + points from process result.
   * Returns map of label → {x,y,state,offChart} for popover positioning.
   */
  function updateProcess(svg, process, opts) {
    opts = opts || {};
    var showShr = !!opts.showShr;

    updateSat(svg);
    updateComfort(svg);

    var oa = pointXY(process.oa);
    var ra = pointXY(process.ra);
    var mx = pointXY(process.mix);
    var adp = pointXY(process.adp);
    var leaving = pointXY(process.leaving);
    var supply = pointXY(process.supply);
    var room = pointXY(process.room);

    var paths = svg.querySelector("#paths");
    clear(paths);
    paths.appendChild(line("seg-oa-ra", oa, ra));
    paths.appendChild(line("seg-coil", mx, leaving));
    // Reheat: leaving → supply, must be horizontal (same ω / same y)
    // Force y of supply to leaving.y for drawing (physics already const ω)
    var supplyDraw = { x: supply.x, y: leaving.y };
    paths.appendChild(line("seg-reheat", leaving, supplyDraw));

    var roomG = svg.querySelector("#room-group");
    clear(roomG);
    if (showShr) {
      roomG.appendChild(
        line("seg-shr", supplyDraw, room, {
          "stroke-dasharray": "5 4",
          stroke: "#C45C26",
          "stroke-width": "2.5",
          "stroke-linecap": "round",
          class: "seg",
          opacity: "0",
        })
      );
    }

    var pts = svg.querySelector("#points");
    clear(pts);
    pts.appendChild(makePoint("pt-oa", "OA", oa, "#1E2A50", true));
    pts.appendChild(makePoint("pt-ra", "RA", ra, "#1E2A50", true));
    pts.appendChild(makePoint("pt-mix", "Mix", mx, "#C45C26", true));
    // ADP on sat; also show Leaving near it — brief uses ADP kiss marker
    pts.appendChild(makePoint("pt-adp", "ADP", adp, "#1E2A50", true));
    // Leaving sits very near ADP; label Supply after reheat
    pts.appendChild(makePoint("pt-sup", "Supply", supplyDraw, "#C45C26", true));
    var roomPt = makePoint("pt-room", "Room", room, "#2E7D6E", showShr);
    pts.appendChild(roomPt);

    var anyOff =
      oa.offChart ||
      ra.offChart ||
      mx.offChart ||
      adp.offChart ||
      leaving.offChart ||
      supply.offChart ||
      (showShr && room.offChart);
    var status = svg.querySelector("#off-chart-status");
    status.setAttribute("visibility", anyOff ? "visible" : "hidden");

    return {
      OA: Object.assign({}, oa, { label: "OA", zh: "室外" }),
      RA: Object.assign({}, ra, { label: "RA", zh: "回風" }),
      Mix: Object.assign({}, mx, { label: "Mix", zh: "混合點" }),
      ADP: Object.assign({}, adp, { label: "ADP", zh: "盤管露點" }),
      Leaving: Object.assign({}, leaving, { label: "Leaving", zh: "盤管出風" }),
      Supply: Object.assign(
        { x: supplyDraw.x, y: supplyDraw.y, offChart: supply.offChart, state: process.supply },
        { label: "Supply", zh: "送風" }
      ),
      Room: Object.assign({}, room, { label: "Room", zh: "室內" }),
    };
  }

  global.Chart = {
    CHART: CHART,
    init: init,
    toXY: toXY,
    updateProcess: updateProcess,
    updateSat: updateSat,
    updateComfort: updateComfort,
  };
})(typeof window !== "undefined" ? window : globalThis);
