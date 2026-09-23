/* =========================================================================
   motion.js — Mouvement partagé : Lenis + GSAP (reveals, split, marquee,
   scroll horizontal épinglé, parallaxe, clip-path). Dégradation gracieuse.
   Idempotent : window.TERANGA.motionRefresh() re-scanne le contenu injecté.
   ========================================================================= */
(function () {
  'use strict';

  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mobile = matchMedia('(max-width: 767px)').matches;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  window.TERANGA = window.TERANGA || {};

  // Sans GSAP ou en reduced-motion : tout est visible, pas d'animation.
  if (!gsap || !ST || reduced) {
    var showAll = function () {
      document.querySelectorAll('[data-reveal],[data-split],[data-clip]').forEach(function (el) {
        el.style.opacity = '1'; el.style.transform = 'none'; el.style.clipPath = 'none';
      });
    };
    showAll();
    window.TERANGA.motionRefresh = showAll;
    document.documentElement.classList.add('motion-off');
    return;
  }

  gsap.registerPlugin(ST);

  /* ---------- Lenis (smooth scroll) ---------- */
  if (window.Lenis && !mobile && !window.TERANGA.lenis) {
    var lenis = new window.Lenis({ lerp: 0.08, smoothWheel: true });
    lenis.on('scroll', ST.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    window.TERANGA.lenis = lenis;
  }

  /* ---------- Split text léger ---------- */
  function splitText(el, mode) {
    var text = el.textContent; el.textContent = ''; el.setAttribute('aria-label', text);
    var units = mode === 'char' ? text.split('') : text.split(/(\s+)/);
    var out = [];
    units.forEach(function (u) {
      if (/^\s+$/.test(u)) { el.appendChild(document.createTextNode(u)); return; }
      var wrap = document.createElement('span');
      wrap.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:top;';
      var inner = document.createElement('span');
      inner.style.cssText = 'display:inline-block;will-change:transform;';
      inner.textContent = u; inner.setAttribute('aria-hidden', 'true');
      wrap.appendChild(inner); el.appendChild(wrap); out.push(inner);
    });
    return out;
  }

  function doSplits(root) {
    (root || document).querySelectorAll('[data-split]:not([data-split-done])').forEach(function (el) {
      el.setAttribute('data-split-done', '');
      var mode = el.dataset.split === 'char' ? 'char' : 'word';
      var parts = splitText(el, mode);
      gsap.set(parts, { yPercent: 110 });
      var isHero = el.closest('[data-hero]');
      gsap.to(parts, {
        yPercent: 0, duration: mode === 'char' ? 1.2 : 1, ease: 'expo.out',
        stagger: mode === 'char' ? 0.02 : 0.06, delay: isHero ? 0.4 : 0,
        scrollTrigger: { trigger: el, start: 'top 92%', once: true }
      });
      // Filet : si le tween traîne (onglet masqué → rAF throttlé), force la révélation.
      if (isHero) setTimeout(function () { gsap.killTweensOf(parts); gsap.set(parts, { yPercent: 0 }); }, 2600);
    });
  }

  /* ---------- Reveals directionnels (idempotent) ---------- */
  function doReveals(root) {
    (root || document).querySelectorAll('[data-reveal]:not([data-reveal-done])').forEach(function (el) {
      el.setAttribute('data-reveal-done', '');
      var dir = el.dataset.reveal;
      var from = { opacity: 0, y: 60 };
      if (dir === 'left') from = { opacity: 0, x: -50 };
      else if (dir === 'right') from = { opacity: 0, x: 50 };
      else if (dir === 'scale') from = { opacity: 0, scale: 0.94 };
      gsap.fromTo(el, from, {
        opacity: 1, x: 0, y: 0, scale: 1, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });
  }

  /* ---------- Clip-path image reveal ---------- */
  function doClips(root) {
    (root || document).querySelectorAll('[data-clip]:not([data-clip-done])').forEach(function (el) {
      el.setAttribute('data-clip-done', '');
      gsap.fromTo(el, { clipPath: 'inset(100% 0 0 0)' }, {
        clipPath: 'inset(0% 0 0 0)', duration: 1.4, ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'top 82%' }
      });
    });
  }

  /* ---------- Parallaxe ---------- */
  function doParallax() {
    document.querySelectorAll('[data-parallax]:not([data-parallax-done])').forEach(function (el) {
      el.setAttribute('data-parallax-done', '');
      var amt = parseFloat(el.dataset.parallax) || 15;
      gsap.to(el, { yPercent: amt, ease: 'none', scrollTrigger: { trigger: el.closest('section') || el, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  }

  /* ---------- Hero media + ligne SVG ---------- */
  function doHeroMedia() {
    var hm = document.querySelector('[data-hero-media]:not([data-hm-done])');
    if (hm) { hm.setAttribute('data-hm-done', ''); gsap.to(hm, { yPercent: 14, scale: 1.08, ease: 'none', scrollTrigger: { trigger: hm.closest('section'), start: 'top top', end: 'bottom top', scrub: true } }); }
  }
  function doDraw() {
    document.querySelectorAll('[data-draw]:not([data-draw-done]) path').forEach(function (path) {
      path.closest('[data-draw]').setAttribute('data-draw-done', '');
      var len = path.getTotalLength(); path.style.strokeDasharray = len; path.style.strokeDashoffset = len;
      gsap.to(path, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: path.closest('[data-draw]'), start: 'top 80%', end: 'bottom 55%', scrub: true } });
    });
  }

  /* ---------- Scroll horizontal épinglé ---------- */
  var hscrollDone = false;
  function doHScroll() {
    if (hscrollDone || mobile) return;
    var track = document.querySelector('[data-hscroll]');
    if (!track || !track.children.length) return;
    hscrollDone = true;
    var getShift = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
    gsap.to(track, {
      x: function () { return -getShift(); }, ease: 'none',
      scrollTrigger: { trigger: track.parentElement, start: 'top top', end: function () { return '+=' + getShift(); }, scrub: 1, pin: true, invalidateOnRefresh: true, anticipatePin: 1 }
    });
  }

  /* ---------- Marquee infini ---------- */
  function doMarquee() {
    document.querySelectorAll('[data-marquee]:not([data-mq-done])').forEach(function (m) {
      var inner = m.querySelector('.marquee-inner');
      if (!inner || !inner.children.length) return;
      m.setAttribute('data-mq-done', '');
      inner.innerHTML += inner.innerHTML;
      var w = inner.scrollWidth / 2, speed = 40, x = 0, paused = false, last = performance.now();
      m.addEventListener('pointerenter', function () { paused = true; });
      m.addEventListener('pointerleave', function () { paused = false; });
      (function tick(now) {
        var dt = (now - last) / 1000; last = now;
        if (!paused) { x -= speed * dt; if (x <= -w) x += w; inner.style.transform = 'translateX(' + x + 'px)'; }
        requestAnimationFrame(tick);
      })(last);
    });
  }

  function runStatic() { doSplits(); doReveals(); doClips(); doParallax(); doHeroMedia(); doDraw(); }
  function refresh() { doSplits(); doReveals(); doClips(); doHScroll(); doMarquee(); ST.refresh(); }

  window.TERANGA.motionRefresh = refresh;

  runStatic();
  refresh();
  addEventListener('load', function () { ST.refresh(); });
})();
