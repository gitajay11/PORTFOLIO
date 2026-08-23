/* =========================================================
   Ajay K — Developer Portfolio
   Vanilla JS. No dependencies.
   ========================================================= */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };

  /* =======================================================
     1. SCROLL-SCRUBBED HERO VIDEO
     The page scroll position drives video.currentTime.
     A lerp between "target" and "current" smooths out the
     coarse steps of a mouse wheel into fluid playback.
     ======================================================= */
  var video      = document.getElementById("scrubVideo");
  var hero       = document.getElementById("hero");
  var loader     = document.getElementById("heroLoader");
  var loaderFill = document.getElementById("heroLoaderFill");
  var loaderPct  = document.getElementById("heroLoaderPct");
  var hudFrame   = document.getElementById("hudFrame");
  var hudPct     = document.getElementById("hudPct");
  var scrollHint = document.getElementById("scrollHint");
  var stages     = Array.prototype.slice.call(document.querySelectorAll(".hero__stage"));

  var FPS       = 24;      // source is ~24fps / 240 frames
  var EASE      = 0.11;    // lerp factor — lower = smoother, laggier
  var SEEK_EPS  = 1 / 48;  // don't re-seek for sub-half-frame deltas

  var duration   = 0;
  var targetTime = 0;
  var currentTime = 0;
  var ready      = false;
  var progress   = 0;

  function heroProgress() {
    if (!hero) return 0;
    var scrollable = hero.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return 0;
    return clamp((window.scrollY - hero.offsetTop) / scrollable, 0, 1);
  }

  function setLoader(pct) {
    if (loaderFill) loaderFill.style.width = pct + "%";
    if (loaderPct) loaderPct.textContent = String(Math.round(pct));
  }

  function markReady() {
    if (ready) return;
    ready = true;
    setLoader(100);
    if (loader) loader.classList.add("is-done");
    video.classList.add("is-ready");
    updateScrub(true);
  }

  function trackBuffer() {
    if (ready || !video || !video.buffered || !video.buffered.length || !duration) return;
    var end = video.buffered.end(video.buffered.length - 1);
    setLoader(clamp((end / duration) * 100, 0, 99));
  }

  // Stage captions: which overlay block is visible at this progress.
  var activeStage = -1;
  function updateStages(p) {
    var i = p < 0.34 ? 0 : p < 0.68 ? 1 : 2;
    if (i === activeStage) return;
    activeStage = i;
    stages.forEach(function (el, idx) {
      el.classList.toggle("is-active", idx === i);
    });
  }

  function updateHud(p) {
    if (hudFrame) {
      var f = Math.round(p * duration * FPS);
      hudFrame.textContent = String(f).padStart(3, "0");
    }
    if (hudPct) hudPct.textContent = String(Math.round(p * 100)).padStart(2, "0");
  }

  function updateScrub(force) {
    progress = heroProgress();
    targetTime = progress * duration;
    updateStages(progress);
    if (scrollHint) scrollHint.classList.toggle("is-hidden", progress > 0.03);
    if (force) currentTime = targetTime;
  }

  function frame() {
    if (ready) {
      currentTime += (targetTime - currentTime) * EASE;
      if (Math.abs(targetTime - currentTime) < 0.0008) currentTime = targetTime;

      // Only issue a seek when the decoder is idle — queueing seeks
      // on a busy element is what makes naive scrubbing stutter.
      if (!video.seeking && Math.abs(video.currentTime - currentTime) > SEEK_EPS) {
        try { video.currentTime = currentTime; } catch (e) { /* seek not ready */ }
      }
      updateHud(currentTime / (duration || 1));
    }
    requestAnimationFrame(frame);
  }

  if (video && hero) {
    video.addEventListener("loadedmetadata", function () {
      duration = video.duration || 10;
      updateScrub(true);
      trackBuffer();
    });
    video.addEventListener("progress", trackBuffer);
    video.addEventListener("canplaythrough", markReady);
    video.addEventListener("loadeddata", function () {
      // Enough data for the first frames — don't wait for a full buffer.
      setTimeout(markReady, 400);
    });
    video.addEventListener("error", function () {
      // Video missing or codec unsupported: drop the loader, keep the text.
      if (loader) loader.classList.add("is-done");
      hero.style.height = "100vh";
      updateStages(0);
    });

    // Some mobile browsers refuse to decode until the element has been
    // "activated" by a gesture. A muted play/pause satisfies that.
    var unlock = function () {
      var p = video.play();
      if (p && p.then) p.then(function () { video.pause(); }).catch(function () {});
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("click", unlock);
    };
    window.addEventListener("touchstart", unlock, { passive: true });
    window.addEventListener("click", unlock);

    video.load();
    requestAnimationFrame(frame);

    // Safety net: never leave the loader up forever on a slow connection.
    setTimeout(markReady, 6000);
  }

  /* =======================================================
     2. SCROLL PROGRESS BAR + STICKY NAV
     ======================================================= */
  var nav = document.getElementById("nav");
  var bar = document.getElementById("scrollBar");

  function onScroll() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    if (bar) bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
    if (nav) nav.classList.toggle("is-stuck", window.scrollY > 40);
    updateScrub(false);
  }

  var ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { onScroll(); ticking = false; });
  }, { passive: true });

  window.addEventListener("resize", function () { updateScrub(true); onScroll(); });
  onScroll();

  /* =======================================================
     3. REVEAL ON SCROLL
     ======================================================= */
  var revealables = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        setTimeout(function () { el.classList.add("is-in"); }, i * 70);
        revealObs.unobserve(el);
      });
    }, { threshold: 0.05, rootMargin: "0px 0px -40px 0px" });
    revealables.forEach(function (el) { revealObs.observe(el); });

    // Safety net: content sitting inside the bottom margin can otherwise
    // never cross the threshold. Once the page is scrolled out, reveal it.
    window.addEventListener("scroll", function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      if (max - window.scrollY > 4) return;
      revealables.forEach(function (el) { el.classList.add("is-in"); });
    }, { passive: true });
  } else {
    revealables.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* =======================================================
     4. ACTIVE NAV LINK
     ======================================================= */
  var navAnchors = Array.prototype.slice.call(document.querySelectorAll(".nav__links a[href^='#']"));
  var sections = navAnchors
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navAnchors.forEach(function (a) {
          a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { threshold: 0.35 });
    sections.forEach(function (s) { navObs.observe(s); });
  }

  /* =======================================================
     5. COUNT-UP STATS
     ======================================================= */
  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
    var countObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var to = parseInt(el.getAttribute("data-count"), 10) || 0;
        var start = performance.now();
        var dur = 1300;
        (function step(now) {
          var t = clamp((now - start) / dur, 0, 1);
          var eased = 1 - Math.pow(1 - t, 3);
          el.textContent = String(Math.round(to * eased));
          if (t < 1) requestAnimationFrame(step);
        })(start);
        countObs.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { countObs.observe(el); });
  }

  /* =======================================================
     6. CURSOR GLOW + CARD SPOTLIGHT
     ======================================================= */
  var glow = document.querySelector(".cursor-glow");
  if (glow && window.matchMedia("(pointer: fine)").matches && !reduceMotion) {
    document.body.classList.add("has-pointer");
    var gx = window.innerWidth / 2, gy = window.innerHeight / 2, tx = gx, ty = gy;
    window.addEventListener("mousemove", function (e) { tx = e.clientX; ty = e.clientY; });
    (function glowLoop() {
      gx += (tx - gx) * 0.09;
      gy += (ty - gy) * 0.09;
      glow.style.transform = "translate(" + gx + "px," + gy + "px)";
      requestAnimationFrame(glowLoop);
    })();
  }

  document.querySelectorAll(".card").forEach(function (card) {
    card.addEventListener("mousemove", function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - r.left) + "px");
      card.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  /* =======================================================
     7. MOBILE MENU
     ======================================================= */
  var burger = document.getElementById("burger");
  var navLinks = document.getElementById("navLinks");
  if (burger && navLinks) {
    var toggle = function (open) {
      navLinks.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    };
    burger.addEventListener("click", function () {
      toggle(burger.getAttribute("aria-expanded") !== "true");
    });
    navLinks.addEventListener("click", function (e) {
      if (e.target.closest("a")) toggle(false);
    });
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape") toggle(false);
    });
  }

  /* =======================================================
     8. MISC
     ======================================================= */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
