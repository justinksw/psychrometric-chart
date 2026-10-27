/**
 * Play / Step 1–6 scrubber. Honour prefers-reduced-motion.
 */
(function (global) {
  "use strict";

  var CAPTIONS = {
    1: "1 · OA & RA fade in · 室外／回風點出現",
    2: "2 · Mix slides on OA–RA · 混合點沿線移動",
    3: "3 · Coil → ADP (kiss) · 盤管至露點附近",
    4: "4 · Reheat horizontal right · 再熱水平向右（等濕）",
    5: "5 · Supply→Room along SHR · 沿顯熱比（需開啟）",
    6: "6 · Pop ω / h / dew / RH · 顯示點狀態",
  };

  var TIMING = {
    1: 320,
    2: 500,
    3: 575,
    4: 450,
    5: 500,
    6: 175,
  };

  function prefersReduced() {
    return (
      typeof matchMedia !== "undefined" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function AnimationController(opts) {
    this.getShowShr = opts.getShowShr;
    this.onStep = opts.onStep; // (step) => void — reveal geometry
    this.onPopover = opts.onPopover; // () => void
    this.captionEl = opts.captionEl;
    this.stepsEl = opts.stepsEl;
    this.playBtn = opts.playBtn;
    this.step = 1;
    this.playing = false;
    this._timer = null;
  }

  AnimationController.prototype.setStep = function (n, opts) {
    opts = opts || {};
    this.step = Math.max(1, Math.min(6, n));
    if (this.captionEl) this.captionEl.textContent = CAPTIONS[this.step];
    if (this.stepsEl) {
      Array.prototype.forEach.call(
        this.stepsEl.querySelectorAll("button[data-step]"),
        function (btn) {
          btn.setAttribute(
            "aria-current",
            String(btn.getAttribute("data-step") === String(this.step))
          );
        }.bind(this)
      );
    }
    if (this.onStep) this.onStep(this.step, opts);
    if (this.step >= 6 && this.onPopover) this.onPopover();
  };

  AnimationController.prototype.applyVisibility = function (step, showShr) {
    var ids = {
      1: ["pt-oa", "pt-ra"],
      2: ["seg-oa-ra", "pt-mix"],
      3: ["seg-coil", "pt-adp"],
      4: ["seg-reheat", "pt-sup"],
      5: showShr ? ["seg-shr", "pt-room"] : [],
    };
    // Reset
    [
      "pt-oa",
      "pt-ra",
      "pt-mix",
      "pt-adp",
      "pt-sup",
      "pt-room",
      "seg-oa-ra",
      "seg-coil",
      "seg-reheat",
      "seg-shr",
    ].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.classList.remove("on");
      el.style.opacity = "";
    });

    var reduced = prefersReduced();
    var max = reduced ? 6 : step;
    // When reduced, show final path (through 4, +5 if SHR)
    if (reduced) {
      max = showShr ? 5 : 4;
      // still allow step 6 popover separately
      if (step >= 6) max = showShr ? 5 : 4;
    }

    var s;
    for (s = 1; s <= Math.min(step, 5); s++) {
      (ids[s] || []).forEach(function (id) {
        var el = document.getElementById(id);
        if (el) {
          el.classList.add("on");
          if (id === "pt-room") el.style.display = "";
        }
      });
    }
    if (!showShr) {
      var room = document.getElementById("pt-room");
      if (room) room.style.display = "none";
      var seg = document.getElementById("seg-shr");
      if (seg) seg.classList.remove("on");
    }
  };

  AnimationController.prototype.stopPlay = function () {
    this.playing = false;
    if (this.playBtn) this.playBtn.textContent = "Play";
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
  };

  AnimationController.prototype.play = function () {
    var self = this;
    if (this.playing) {
      this.stopPlay();
      return;
    }
    if (prefersReduced()) {
      this.setStep(6);
      return;
    }
    this.playing = true;
    if (this.playBtn) this.playBtn.textContent = "Pause";
    if (this.step >= 6) this.setStep(1);
    function tick() {
      if (!self.playing) return;
      if (self.step >= 6) {
        self.stopPlay();
        return;
      }
      var next = self.step + 1;
      // Skip visual 5 content if SHR off, but still advance caption
      self.setStep(next);
      self._timer = setTimeout(tick, TIMING[next] || 500);
    }
    self._timer = setTimeout(tick, TIMING[self.step] || 400);
  };

  AnimationController.prototype.bind = function () {
    var self = this;
    if (this.stepsEl) {
      this.stepsEl.addEventListener("click", function (e) {
        var btn = e.target.closest("button[data-step]");
        if (!btn) return;
        self.stopPlay();
        self.setStep(parseInt(btn.getAttribute("data-step"), 10));
      });
    }
    if (this.playBtn) {
      this.playBtn.addEventListener("click", function () {
        self.play();
      });
    }
  };

  global.AnimationController = AnimationController;
  global.AnimationCaptions = CAPTIONS;
})(typeof window !== "undefined" ? window : globalThis);
