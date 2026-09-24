/* =========================================================================
   core.js — Espace de noms TERANGA : données, formatage, stockage, toast.
   Chargé avant tous les autres scripts du site.
   ========================================================================= */
(function () {
  'use strict';
  var T = window.TERANGA = window.TERANGA || {};
  var D = window.TERANGA_DATA || { parfums: [], maisons: [], articles: [] };

  T.config = window.TERANGA_CONFIG || {};
  T.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Formatage ---------- */
  T.fmt = function (n) {
    return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' FCFA';
  };
  T.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  T.genderLabel = function (g) { return { homme: 'Homme', femme: 'Femme', mixte: 'Mixte' }[g] || g; };

  /* ---------- Données ---------- */
  T.products = D.parfums || [];
  T.maisons = D.maisons || [];
  T.articles = D.articles || [];
  T.byId = function (id) { return T.products.find(function (p) { return p.id === id; }) || null; };
  T.maison = function (name) { return T.maisons.find(function (m) { return m.name === name; }) || null; };
  T.priceFrom = function (p) { return Math.min.apply(null, p.sizes.map(function (s) { return s.price_xof; })); };
  T.productsOf = function (maison) { return T.products.filter(function (p) { return p.maison === maison; }); };

  /* ---------- Stockage local (tolérant : navigation privée, quota…) ---------- */
  T.ls = {
    get: function (k, fallback) {
      try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
    },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* stockage indisponible */ } }
  };

  /* ---------- Toast (retour d'action, annoncé aux lecteurs d'écran) ---------- */
  T.toast = function (msg) {
    var el = document.getElementById('toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast'; el.className = 'toast';
      el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('is-on');
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.classList.remove('is-on'); }, 2600);
  };

  /* ---------- Piège de focus pour les dialogues ---------- */
  T.trapFocus = function (root, e) {
    if (e.key !== 'Tab') return;
    var f = root.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])');
    f = Array.prototype.filter.call(f, function (x) { return x.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  /* Verrou de défilement à compteur : modale + tiroir peuvent s'empiler */
  var locks = 0;
  T.lockScroll = function (on) {
    locks = Math.max(0, locks + (on ? 1 : -1));
    var locked = locks > 0;
    document.documentElement.classList.toggle('is-locked', locked);
    if (T.lenis) { if (locked) T.lenis.stop(); else T.lenis.start(); }
  };

  T.meter = function (v) {
    var s = '';
    for (var i = 1; i <= 5; i++) s += '<i class="' + (v >= i ? 'on' : (v >= i - 0.5 ? 'half' : '')) + '"></i>';
    return '<span class="meter" aria-hidden="true">' + s + '</span>' + String(v).replace('.', ',') + '/5';
  };
})();
