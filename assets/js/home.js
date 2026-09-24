/* =========================================================================
   home.js — Accueil : séquence d'images du hero, sélection, maisons,
   nouveautés (rail glissable), journal, lettre.
   ========================================================================= */
(function () {
  'use strict';
  var T = window.TERANGA;
  var gsap = window.gsap;

  /* ---------- 4.1 Hero : séquence pilotée au scroll ----------
     Chorégraphie par temps : sortie du texte -> volet de la nouvelle image
     -> surtitre -> nom lettre à lettre -> ligne mot à mot. La sortie est
     terminée avant que le volet ne commence (jamais deux textes à l'écran). */
  var hs = document.querySelector('.hs');
  var slides = hs ? Array.prototype.slice.call(hs.querySelectorAll('.hs__slide')) : [];
  var counter = hs && hs.querySelector('[data-count]');
  var bar = hs && hs.querySelector('.hs__bar i');
  var cue = hs && hs.querySelector('.hs__cue');
  var n = slides.length;
  function pad(k) { return (k < 10 ? '0' : '') + k; }

  var shown = -1;
  function paintCount(i) {
    if (i === shown) return;
    shown = i;
    if (!counter) return;
    var txt = pad(i + 1) + ' / ' + pad(n);
    if (!T.motion.on) { counter.textContent = txt; return; }
    // l'ancien chiffre monte et s'efface, le nouveau monte depuis le bas
    gsap.to(counter, {
      y: -14, autoAlpha: 0, duration: 0.18, ease: 'power2.in',
      onComplete: function () {
        counter.textContent = txt;
        gsap.fromTo(counter, { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.3, ease: 'power2.out' });
      }
    });
  }
  if (counter) counter.textContent = pad(1) + ' / ' + pad(n);
  if (bar) bar.style.transform = 'scaleX(' + (1 / n) + ')';
  shown = 0;

  /* Découpe des légendes : le nom en lettres (dans des mots insécables pour
     que la césure reste propre), la ligne en mots. Le libellé accessible est
     conservé pour que les lecteurs d'écran lisent le texte, pas les lettres. */
  slides.forEach(function (s) {
    s.querySelectorAll('[data-words]').forEach(function (el) {
      var target = el.querySelector('a') || el;
      var txt = target.textContent.trim();
      var byChar = el.classList.contains('hs__name');
      target.setAttribute('aria-label', txt);
      target.innerHTML = txt.split(/\s+/).map(function (w) {
        if (!byChar) return '<span class="w" aria-hidden="true">' + T.esc(w) + '</span>';
        return '<span class="wd" aria-hidden="true">' + w.split('').map(function (c) {
          return '<span class="w">' + T.esc(c) + '</span>';
        }).join('') + '</span>';
      }).join(' ');
    });
    /* Le surtitre reçoit lui aussi une enveloppe interne : l'entrée anime les
       enveloppes, la sortie anime les lignes qui les portent. Une propriété,
       un seul propriétaire — sinon les deux animations se réécrivent l'une
       l'autre et la légende finit par rester invisible. */
    var eb = s.querySelector('.hs__cap .eyebrow');
    if (eb && !eb.querySelector('.w')) {
      eb.innerHTML = '<span class="w">' + T.esc(eb.textContent.trim()) + '</span>';
    }
  });

  function partsOf(s) {
    return {
      lines: s.querySelectorAll('.hs__cap > *'),          // sortie
      eyebrow: s.querySelectorAll('.hs__cap .eyebrow .w'), // entrée
      chars: s.querySelectorAll('.hs__name .w'),           // entrée
      words: s.querySelectorAll('.hs__line .w'),           // entrée
      inner: s.querySelectorAll('.hs__cap .w')
    };
  }

  if (T.motion.on && n > 1) {
    slides.slice(1).forEach(function (s, k) {
      // le volet arrive alternativement de la droite puis de la gauche
      gsap.set(s, { clipPath: k % 2 ? 'inset(0% 100% 0% 0%)' : 'inset(0% 0% 0% 100%)' });
      gsap.set(partsOf(s).inner, { autoAlpha: 0 });
    });

    // entrée du premier temps, une fois l'écran de chargement parti
    var first = partsOf(slides[0]);
    var t0 = document.getElementById('loader') ? 1.25 : 0.15;
    var intro = gsap.timeline({ delay: t0 });
    intro.from(slides[0].querySelector('img'), { scale: 1.1, duration: 2.2, ease: 'expo.out' }, 0)
      .from(first.eyebrow, { y: 20, autoAlpha: 0, duration: 0.5, ease: 'power3.out' }, 0)
      .from(first.chars, { y: 60, autoAlpha: 0, duration: 1, stagger: 0.02, ease: 'expo.out' }, 0.15)
      .from(first.words, { y: 25, autoAlpha: 0, duration: 0.7, stagger: 0.03, ease: 'power3.out' }, 0.45);
    // Filet : onglet ouvert en arrière-plan, l'horloge d'animation ne tourne
    // pas — on force alors l'état final plutôt que de laisser la légende vide.
    setTimeout(function () { if (intro.progress() < 1) intro.progress(1).pause(); }, (t0 + 3.5) * 1000);

    /* Rythme d'un temps (unités de scrub) :
         0    → 0,5  sortie du texte
         0,5  → 1,5  volet de la nouvelle image
         1,15 → 2,5  entrée du texte (« Club de Nuit », le plus long, finit à 2,48)
         2,5  → 2,8  repos : le temps est lu en entier avant de repartir.        */
    var SEG = 2.8;
    var LEAD = 0.4;   // amorce : aucune animation ne commence à l'instant zéro.
    var SWITCH = 1.0; // le compteur bascule à mi-volet, quand la nouvelle image domine.
    /* Sans l'amorce, la première animation de sortie serait posée à t = 0 :
       elle relèverait l'état de départ dès la création (le texte est alors
       encore caché par l'entrée) et le re-poserait à chaque rendu, ce qui
       effacerait définitivement la légende du premier temps. */

    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        // Un écran de défilement par transition.
        trigger: hs, start: 'top top', end: '+=' + (n - 1) * 100 + '%',
        pin: true, scrub: 0.8, anticipatePin: 1,
        onUpdate: function (st) {
          // Retour continu : la barre suit le doigt, elle ne saute pas.
          if (bar) bar.style.transform = 'scaleX(' + ((1 + st.progress * (n - 1)) / n).toFixed(4) + ')';
          var t = st.progress * (tl.duration() || 1);
          paintCount(Math.min(n - 1, Math.max(0, Math.floor((t - LEAD - SWITCH) / SEG) + 1)));
        }
      }
    });
    tl.to({}, { duration: LEAD });

    slides.forEach(function (s, i) {
      if (!i) return;
      var at = LEAD + (i - 1) * SEG;
      var prev = partsOf(slides[i - 1]);
      var cur = partsOf(s);
      /* Sens du volet : les temps pairs arrivent par la droite, les impairs
         par la gauche (cf. le clip-path posé plus haut). La nouvelle image
         glisse avec le volet et l'ancienne est poussée du même côté : le
         mouvement annonce d'où vient la suite. Amplitudes choisies pour ne
         jamais découvrir un bord — l'image est toujours plus agrandie que
         décalée (1,14 → 7 % de marge pour 5 % de course ; 1,05 → 2,5 % pour 2 %). */
      var dir = (i - 1) % 2 ? -1 : 1;

      /* 1. sortie : tout le texte monte et s'efface (terminée à at + 0.5).
         États de départ écrits noir sur blanc, et `immediateRender: false` :
         sinon la timeline relève l'état courant à sa création — le texte du
         premier temps est alors encore masqué par l'animation d'entrée, et
         il resterait invisible à chaque retour en haut de page. */
      tl.fromTo(prev.lines,
        { y: 0, autoAlpha: 1 },
        { y: -30, autoAlpha: 0, duration: 0.4, stagger: 0.02, ease: 'power2.in', immediateRender: false }, at)
        .fromTo(slides[i - 1].querySelector('img'),
          { scale: 1, xPercent: 0 },
          { scale: 1.05, xPercent: -2 * dir, duration: 1.5, ease: 'power1.in', immediateRender: false }, at)
        // 2. volet : la nouvelle image se découvre et se pose en suivant le volet
        .to(s, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'power3.inOut' }, at + 0.5)
        .fromTo(s.querySelector('img'),
          { scale: 1.14, xPercent: 5 * dir },
          { scale: 1, xPercent: 0, duration: 1.3, ease: 'power3.out' }, at + 0.5)
        // 3. texte : surtitre, puis nom lettre à lettre, puis ligne mot à mot
        .fromTo(cur.eyebrow, { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, ease: 'power3.out' }, at + 1.15)
        .fromTo(cur.chars, { y: 60, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, stagger: 0.02, ease: 'expo.out' }, at + 1.3)
        .fromTo(cur.words, { y: 25, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.03, ease: 'power3.out' }, at + 1.45);
    });
    tl.to({}, { duration: 0.35 });

    /* « Défiler » : pulsation lente, puis disparition définitive au 1er scroll */
    if (cue) {
      var pulse = gsap.to(cue, { opacity: 0.3, duration: 2, ease: 'sine.inOut', repeat: -1, yoyo: true });
      var hideCue = function () {
        removeEventListener('scroll', hideCue);
        removeEventListener('wheel', hideCue);
        removeEventListener('touchmove', hideCue);
        pulse.kill();
        gsap.to(cue, { autoAlpha: 0, duration: 0.4, ease: 'power2.out' });
      };
      addEventListener('scroll', hideCue, { passive: true, once: true });
      addEventListener('wheel', hideCue, { passive: true, once: true });
      addEventListener('touchmove', hideCue, { passive: true, once: true });
    }
  }

  /* ---------- 4.3 Sélection ---------- */
  var bento = document.getElementById('featured');
  if (bento) {
    // La première tuile occupe quatre cases : c'est la plus grande image de la
    // page après le hero. On la charge sans attendre le défilement.
    bento.innerHTML = T.products.filter(function (p) { return p.featured; }).slice(0, 8)
      .map(function (p, i) { return T.card(p, { eager: i === 0 }); }).join('');
  }

  /* ---------- 4.4 Maisons (uniquement celles qui ont des parfums en rayon) ---------- */
  var track = document.getElementById('maisonsTrack');
  if (track) {
    track.innerHTML = T.maisons.filter(function (m) { return !m.on_order && T.productsOf(m.name).length; })
      .map(function (m) {
        return '<a href="boutique.html?maison=' + encodeURIComponent(m.name) + '">' + T.esc(m.name) + '</a>';
      }).join('');
  }

  /* ---------- 4.5 Nouveautés : rail horizontal ---------- */
  var rail = document.getElementById('rail');
  if (rail) {
    var news = T.products.filter(function (p) { return !p.featured; })
      .sort(function (a, b) { return b.year - a.year; }).slice(0, 10);
    rail.innerHTML = news.map(function (p) { return T.card(p, { row: true }); }).join('');
    railControls(rail);
  }

  function railControls(rail) {
    var prev = document.querySelector('[data-rail-prev]');
    var next = document.querySelector('[data-rail-next]');
    var step = function () { var c = rail.firstElementChild; return c ? c.getBoundingClientRect().width + 20 : 400; };
    var paintNav = function () {
      if (prev) prev.disabled = rail.scrollLeft < 8;
      if (next) next.disabled = rail.scrollLeft + rail.clientWidth > rail.scrollWidth - 8;
    };
    if (prev) prev.addEventListener('click', function () { rail.scrollBy({ left: -step(), behavior: T.reduced ? 'auto' : 'smooth' }); });
    if (next) next.addEventListener('click', function () { rail.scrollBy({ left: step(), behavior: T.reduced ? 'auto' : 'smooth' }); });
    rail.addEventListener('scroll', paintNav, { passive: true });
    paintNav();

    // Glisser à la souris : suivi 1:1, puis élan projeté (fonction d'Apple) et aimantation
    if (!matchMedia('(pointer: fine)').matches) return;
    var down = false, moved = false, x0 = 0, s0 = 0, samples = [], tween = null;
    var project = function (v, d) { d = d || 0.998; return (v / 1000) * d / (1 - d); };
    rail.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 || e.target.closest('button')) return;
      down = true; moved = false; x0 = e.clientX; s0 = rail.scrollLeft;
      samples = [{ x: e.clientX, t: performance.now() }];
      if (tween) tween.kill();
    });
    rail.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - x0;
      if (!moved && Math.abs(dx) > 8) { moved = true; rail.setPointerCapture(e.pointerId); rail.classList.add('is-dragging'); }
      if (!moved) return;
      rail.scrollLeft = s0 - dx;
      samples.push({ x: e.clientX, t: performance.now() });
      if (samples.length > 5) samples.shift();
    });
    var up = function () {
      if (!down) return;
      down = false;
      if (!moved) return;
      var a = samples[0], b = samples[samples.length - 1];
      var v = b.t > a.t ? (b.x - a.x) / (b.t - a.t) * 1000 : 0;
      var goal = rail.scrollLeft - project(v, 0.994);
      var pl = parseFloat(getComputedStyle(rail).paddingLeft) || 0;
      var rl = rail.getBoundingClientRect().left;
      var best = 0, bd = Infinity;
      Array.prototype.forEach.call(rail.children, function (c) {
        var pos = rail.scrollLeft + c.getBoundingClientRect().left - rl - pl;
        var d = Math.abs(pos - goal);
        if (d < bd) { bd = d; best = pos; }
      });
      best = Math.max(0, Math.min(best, rail.scrollWidth - rail.clientWidth));
      var done = function () { rail.classList.remove('is-dragging'); paintNav(); };
      if (gsap && !T.reduced) tween = gsap.to(rail, { scrollLeft: best, duration: 0.7, ease: 'expo.out', onComplete: done });
      else { rail.scrollLeft = best; done(); }
    };
    rail.addEventListener('pointerup', up);
    rail.addEventListener('pointercancel', up);
  }

  /* ---------- 4.7 Journal : 3 derniers articles ---------- */
  var jg = document.getElementById('journal');
  if (jg) {
    jg.innerHTML = T.articles.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; }).slice(0, 3).map(function (a) {
      var d = new Date(a.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
      return '<article class="j-card"><a href="journal.html?a=' + a.id + '">' +
        '<figure class="j-card__media"><img src="' + T.esc(a.image) + '" alt="' + T.esc(a.alt) + '" width="800" height="1000" loading="lazy" decoding="async"></figure>' +
        '<p class="eyebrow j-card__kicker">' + T.esc(a.kicker) + '</p>' +
        '<h3>' + T.esc(a.title) + '</h3>' +
        '<p class="j-card__meta">' + d + ' · ' + a.reading + ' min de lecture</p></a></article>';
    }).join('');
  }

  /* ---------- 4.9 Lettre ---------- */
  var nl = document.getElementById('letterForm');
  if (nl) {
    nl.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = nl.querySelector('input'), err = nl.querySelector('.err');
      var v = input.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
        input.setAttribute('aria-invalid', 'true');
        err.textContent = 'Adresse incomplète : vérifiez le « @ » et le domaine, par exemple nom@domaine.sn.';
        input.focus();
        return;
      }
      input.removeAttribute('aria-invalid'); err.textContent = '';
      T.api.saveNewsletter(v).then(function () {
        nl.outerHTML = '<p class="letter__done" role="status">C\'est noté. La prochaine édition arrive à ' + T.esc(v) + '.</p>';
      });
    });
  }

  T.motion.refresh();
})();
