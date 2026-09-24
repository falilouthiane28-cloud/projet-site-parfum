/* =========================================================================
   motion.js — Budget de mouvement : Lenis, titres mot à mot, cartes en batch,
   images en clip-path, défilé des maisons. Rien sur le texte courant.
   Sans GSAP ou en mouvement réduit : le site est complet et immobile.
   ========================================================================= */
(function () {
  'use strict';
  var T = window.TERANGA;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  T.motion = { refresh: function () {}, on: false };

  if (!gsap || !ST || T.reduced) {
    document.documentElement.classList.add('no-motion');
    return;
  }
  gsap.registerPlugin(ST);
  T.motion.on = true;
  // iPhone : la barre d'adresse qui apparaît/disparaît ne relance plus un
  // recalcul complet (à-coups du hero épinglé pendant le défilement).
  ST.config({ ignoreMobileResize: true });

  /* ---------- Lenis (pointeur fin uniquement) ---------- */
  if (window.Lenis && matchMedia('(pointer: fine)').matches) {
    var lenis = new window.Lenis({ lerp: 0.12, smoothWheel: true });
    lenis.on('scroll', ST.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    T.lenis = lenis;
    // ancres internes
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (a && a.getAttribute('href').length > 1) {
        var t = document.querySelector(a.getAttribute('href'));
        if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -80 }); }
      }
    });
  }

  function outsideModal(el) { return !el.closest('.drawer'); }

  /* ---------- Titres de section : mot à mot ----------
     Découpe seule (sans déclencheur) : c'est le bloc qui orchestre. */
  function splitWords(el) {
    if (el.hasAttribute('data-split-done')) return el.querySelectorAll('.sw');
    el.setAttribute('data-split-done', '');
    el.setAttribute('aria-label', el.textContent.trim());
    el.innerHTML = el.textContent.trim().split(/\s+/).map(function (w) {
      return '<span style="display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:0.08em;margin-bottom:-0.08em" aria-hidden="true"><span class="sw" style="display:inline-block">' + T.esc(w) + '</span></span>';
    }).join(' ');
    var parts = el.querySelectorAll('.sw');
    gsap.set(parts, { yPercent: 110 });
    return parts;
  }

  /* ---------- Blocs de section : surtitre -> titre -> texte -> bouton ----------
     Une seule chronologie par bloc pour que l'ordre de lecture soit tenu.
     Le corps de texte se révèle par paragraphe, jamais lettre à lettre. */
  var BLOCKS = '.sec-head, .page-head, .chapter > div, .visit__card, .ritual .wrap, .letter .wrap, .on-order > div, .quiz__result, .article__next';
  var SKIP = '.p-card, .j-card, .m-card, .j-row, .pd, .drawer';

  function blocks() {
    document.querySelectorAll(BLOCKS).forEach(function (b) {
      if (b.hasAttribute('data-blk') || !outsideModal(b) || b.closest(SKIP)) return;
      b.setAttribute('data-blk', '');

      var eyebrow = b.querySelector('.eyebrow');
      var titleEl = b.querySelector('[data-split]');
      var plainTitle = titleEl ? null : b.querySelector('h1, h2, h3');
      var body = Array.prototype.filter.call(b.querySelectorAll('p, form, .specs, dl'), function (el) {
        return el !== eyebrow && !el.closest(SKIP) && !el.querySelector('[data-split]');
      });
      var ctas = b.querySelectorAll('.btn, .link-u');
      if (!eyebrow && !titleEl && !plainTitle && !body.length && !ctas.length) return;

      var words = titleEl ? splitWords(titleEl) : null;
      if (eyebrow) gsap.set(eyebrow, { y: 20, autoAlpha: 0 });
      if (plainTitle) gsap.set(plainTitle, { y: 30, autoAlpha: 0 });
      if (body.length) gsap.set(body, { y: 30, autoAlpha: 0 });
      if (ctas.length) gsap.set(ctas, { y: 15, autoAlpha: 0 });

      ST.create({
        trigger: b, start: 'top 82%', once: true,
        onEnter: function () {
          var tl = gsap.timeline();
          if (eyebrow) tl.to(eyebrow, { y: 0, autoAlpha: 1, duration: 0.5, ease: 'power3.out' }, 0);
          if (words) tl.to(words, { yPercent: 0, duration: 0.9, stagger: 0.04, ease: 'expo.out' }, 0.12);
          if (plainTitle) tl.to(plainTitle, { y: 0, autoAlpha: 1, duration: 0.8, ease: 'expo.out' }, 0.1);
          if (body.length) tl.to(body, { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.08, ease: 'power3.out' }, 0.2);
          if (ctas.length) tl.to(ctas, { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.06, ease: 'power3.out' }, 0.4);
        }
      });
    });
  }

  /* Titres restés hors d'un bloc : même révélation, sans orchestration. */
  function splitTitles() {
    document.querySelectorAll('[data-split]:not([data-split-done])').forEach(function (el) {
      if (!outsideModal(el)) return;
      var parts = splitWords(el);
      ST.create({
        trigger: el, start: 'top 88%', once: true,
        onEnter: function () { gsap.to(parts, { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.04 }); }
      });
    });
  }

  /* ---------- Cartes : révélation groupée ----------
     `opacity` et NON `autoAlpha` : autoAlpha ajoute `visibility: hidden`, et
     un navigateur ne télécharge pas une image `loading="lazy"` placée dans un
     sous-arbre invisible. La carte se révélait alors sans sa photo — elle ne
     l'avait jamais demandée. `.is-rv` rend la carte inerte à la souris tant
     qu'elle est transparente (le déclencheur est à 92 % de la fenêtre : elle
     est révélée avant d'être atteignable au clavier). */
  var BATCH = '.p-card, .j-card, .m-card, .j-row';
  function batchCards() {
    var els = Array.prototype.filter.call(document.querySelectorAll(BATCH), function (el) {
      return !el.hasAttribute('data-rv') && outsideModal(el);
    });
    if (!els.length) return;
    els.forEach(function (el) { el.setAttribute('data-rv', ''); el.classList.add('is-rv'); });
    gsap.set(els, { y: 50, opacity: 0 });
    ST.batch(els, {
      start: 'top 88%', once: true,
      onEnter: function (b) {
        gsap.to(b, {
          y: 0, opacity: 1, duration: 0.7, ease: 'expo.out', stagger: 0.06,
          overwrite: true, clearProps: 'transform',
          onStart: function () { this.targets().forEach(function (el) { el.classList.remove('is-rv'); }); }
        });
      }
    });
  }

  /* ---------- Images : clip-path ---------- */
  function clips() {
    document.querySelectorAll('[data-clip]:not([data-clip-done])').forEach(function (el) {
      el.setAttribute('data-clip-done', '');
      // L'image s'ouvre du centre vers les bords : plus court, moins lourd
      // qu'un balayage plein cadre, et le sujet reste visible tout du long.
      gsap.fromTo(el, { clipPath: 'inset(12% 0% 12% 0%)' }, {
        clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true }
      });
    });
  }

  /* ---------- Défilé infini, suit le sens du scroll ---------- */
  function marquees() {
    document.querySelectorAll('[data-marquee]:not([data-mq-done])').forEach(function (m) {
      var track = m.querySelector('.marquee__track');
      if (!track || !track.children.length) return;
      m.setAttribute('data-mq-done', '');
      track.innerHTML += track.innerHTML;
      track.querySelectorAll('a').forEach(function (a, i) { if (i >= track.children.length / 2) { a.setAttribute('tabindex', '-1'); a.setAttribute('aria-hidden', 'true'); } });
      var half = track.scrollWidth / 2, x = 0, dir = -1, boost = 0, paused = false, lastY = scrollY;
      m.addEventListener('pointerenter', function () { paused = true; });
      m.addEventListener('pointerleave', function () { paused = false; });
      m.addEventListener('focusin', function () { paused = true; });
      m.addEventListener('focusout', function () { paused = false; });
      addEventListener('scroll', function () {
        var dy = scrollY - lastY; lastY = scrollY;
        if (dy) { dir = dy > 0 ? -1 : 1; boost = Math.min(6, boost + Math.abs(dy) * 0.02); }
      }, { passive: true });
      // Hors écran : aucune image calculée pour rien
      var visible = true;
      if (window.IntersectionObserver) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(m);
      gsap.ticker.add(function (t, dt) {
        if (paused || !visible) return;
        boost *= 0.94;
        x += dir * (0.04 + boost * 0.05) * dt;
        if (x <= -half) x += half; else if (x > 0) x -= half;
        track.style.transform = 'translate3d(' + x + 'px,0,0)';
      });
    });
  }

  /* ---------- Filet de sécurité ----------
     Tout ce qui est révélé part d'une opacité nulle. Si l'horloge d'animation
     ne tourne pas — onglet ouvert en arrière-plan, rendu suspendu — le contenu
     déjà à l'écran resterait blanc. On rétablit alors l'état final : le site
     doit être lisible même quand rien ne bouge. */
  function rescue() {
    var line = innerHeight * 0.95;
    document.querySelectorAll('[data-blk], [data-rv], [data-clip-done]').forEach(function (el) {
      if (el.hasAttribute('data-rescued')) return;
      var r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > line) return;   // pas encore à l'écran : le scroll s'en chargera
      el.setAttribute('data-rescued', '');
      if (el.hasAttribute('data-clip-done')) gsap.set(el, { clipPath: 'inset(0% 0% 0% 0%)' });
      if (el.hasAttribute('data-rv')) { gsap.set(el, { y: 0, opacity: 1 }); el.classList.remove('is-rv'); }
      if (el.hasAttribute('data-blk')) {
        gsap.set(el.querySelectorAll('.eyebrow, p, form, .specs, dl, .btn, .link-u, h1, h2, h3'), { y: 0, autoAlpha: 1 });
        gsap.set(el.querySelectorAll('.sw'), { yPercent: 0 });
      }
    });
  }

  T.motion.refresh = function () {
    blocks(); splitTitles(); batchCards(); clips(); marquees();
    ST.refresh();
    clearTimeout(T.motion._net);
    T.motion._net = setTimeout(rescue, 4000);
  };
  T.motion.refresh();
  addEventListener('load', function () { ST.refresh(); });
  // Les polices changent la hauteur des titres : on remesure une fois prêtes.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ST.refresh(); });
  // Retour sur l'onglet : on remesure, l'horloge repart d'un état sain.
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) { ST.refresh(); rescue(); }
  });
})();
