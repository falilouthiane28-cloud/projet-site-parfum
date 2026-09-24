/* =========================================================================
   shell.js — Chrome commun : en-tête, menu, pied de page, chargement,
   navigateur-labyrinthe. Injecté sur les 10 pages.
   ========================================================================= */
(function () {
  'use strict';
  var T = window.TERANGA;
  var cfg = T.config;

  /* Monogramme TERANGA (même géométrie que assets/logo.svg) */
  var MARK_INNER =
    '<rect class="lg-fill" x="30" y="0" width="40" height="8"/>' +
    '<rect class="lg-fill" x="35" y="13" width="9" height="8"/>' +
    '<rect class="lg-fill" x="56" y="13" width="9" height="8"/>' +
    '<path class="lg-stroke" d="M3.5 110 V29.5 H96.5 V70.5"/>' +
    '<path class="lg-stroke" d="M19.5 44.5 H80.5 V62.5 H19.5"/>' +
    '<path class="lg-stroke" d="M19.5 53.5 H66"/>' +
    '<path class="lg-stroke" d="M19.5 72 V110"/>' +
    '<rect class="lg-stroke" x="40.5" y="70.5" width="56" height="36"/>';
  T.mark = function (cls) {
    return '<svg class="' + (cls || '') + '" viewBox="0 0 100 110" aria-hidden="true" focusable="false">' +
      '<g fill="currentColor" stroke="currentColor" stroke-width="7" stroke-linecap="square">' +
      MARK_INNER.replace(/class="lg-stroke"/g, 'class="lg-stroke" fill="none"').replace(/class="lg-fill"/g, 'class="lg-fill" stroke="none"') +
      '</g></svg>';
  };

  var NAV = [
    ['index.html', 'Accueil'], ['boutique.html', 'Boutique'], ['maisons.html', 'Maisons'],
    ['rituel.html', 'Le Rituel'], ['journal.html', 'Journal'], ['maison.html', 'La Maison'], ['contact.html', 'Contact']
  ];
  var page = location.pathname.split('/').pop() || 'index.html';
  if (page.indexOf('.html') === -1) page = 'index.html';
  if (page === 'parfum.html') page = 'boutique.html';
  function cur(href) { return href === page ? ' aria-current="page"' : ''; }

  /* ---------- En-tête ---------- */
  var header = document.createElement('header');
  header.className = 'site-header';
  header.innerHTML =
    '<div class="wrap">' +
      '<a class="brand" href="index.html" aria-label="Teranga, retour à l\'accueil">' + T.mark() + '<span class="brand__name">Teranga</span></a>' +
      '<nav class="nav" aria-label="Navigation principale">' +
        NAV.map(function (n) { return '<a href="' + n[0] + '"' + cur(n[0]) + '>' + n[1] + '</a>'; }).join('') +
      '</nav>' +
      '<div class="header-actions">' +
        '<a class="icon-btn" href="compte.html" aria-label="Mon compte"' + cur('compte.html') + '><i class="bi bi-person" aria-hidden="true"></i></a>' +
        '<button class="icon-btn" type="button" id="cartBtn" aria-label="Ouvrir le panier, vide" aria-haspopup="dialog">' +
          '<i class="bi bi-bag" aria-hidden="true"></i><span class="cart-count" id="cartCount" hidden><span>0</span></span></button>' +
        '<button class="icon-btn burger" type="button" id="menuBtn" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="menu"><i class="bi bi-list" aria-hidden="true"></i></button>' +
      '</div>' +
    '</div>';
  document.body.prepend(header);

  /* ---------- Menu plein écran (mobile / tablette) ---------- */
  var menu = document.createElement('div');
  menu.className = 'menu'; menu.id = 'menu';
  menu.setAttribute('role', 'dialog'); menu.setAttribute('aria-modal', 'true'); menu.setAttribute('aria-label', 'Menu');
  menu.innerHTML =
    '<button class="icon-btn menu__close" type="button" aria-label="Fermer le menu"><i class="bi bi-x-lg" aria-hidden="true"></i></button>' +
    '<ul class="menu__links">' + NAV.map(function (n) {
      return '<li><a href="' + n[0] + '"' + cur(n[0]) + '><span>' + n[1] + '</span></a></li>';
    }).join('') + '</ul>' +
    '<div class="menu__meta"><span>' + T.esc(cfg.address) + '</span><span>' + T.esc(cfg.hours) + '</span>' +
    '<a href="compte.html">Mon compte</a></div>';
  document.body.appendChild(menu);

  var menuBtn = header.querySelector('#menuBtn');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    T.lockScroll(open);
    if (open) setTimeout(function () { menu.querySelector('.menu__close').focus(); }, 60);
    else menuBtn.focus();
  }
  menuBtn.addEventListener('click', function () { setMenu(true); });
  menu.querySelector('.menu__close').addEventListener('click', function () { setMenu(false); });
  menu.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); T.trapFocus(menu, e); });

  /* ---------- État de l'en-tête (au-dessus du hero photo / défilé) ---------- */
  var hero = document.querySelector('[data-hero]');
  function onScroll() {
    var overHero = false;
    if (hero) {
      var box = (hero.parentElement && hero.parentElement.classList.contains('pin-spacer')) ? hero.parentElement : hero;
      overHero = box.getBoundingClientRect().bottom > 64;
    }
    header.classList.toggle('is-over-hero', overHero);
    header.classList.toggle('is-scrolled', !overHero && scrollY > 8);
    if (lab) lab.classList.toggle('is-on', !overHero);
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });

  /* ---------- Pied de page ---------- */
  var footer = document.createElement('footer');
  footer.className = 'site-footer';
  footer.innerHTML =
    '<div class="wrap">' +
      '<div class="foot-grid">' +
        '<div class="foot-lede">' +
          '<a class="foot-logo" href="index.html" aria-label="Teranga, retour à l\'accueil">' + T.mark() + '</a>' +
          '<p>Parfumerie de niche et de prestige, à Dakar.</p>' +
          '<div class="foot-social">' +
            '<a class="icon-btn" href="https://www.instagram.com/" rel="noopener" aria-label="Instagram"><i class="bi bi-instagram" aria-hidden="true"></i></a>' +
            '<a class="icon-btn" href="https://www.tiktok.com/" rel="noopener" aria-label="TikTok"><i class="bi bi-tiktok" aria-hidden="true"></i></a>' +
            '<a class="icon-btn" href="https://wa.me/' + cfg.whatsapp + '" rel="noopener" aria-label="WhatsApp"><i class="bi bi-whatsapp" aria-hidden="true"></i></a>' +
            '<a class="icon-btn" href="https://www.facebook.com/" rel="noopener" aria-label="Facebook"><i class="bi bi-facebook" aria-hidden="true"></i></a>' +
          '</div></div>' +
        '<div class="foot-col"><h2>Naviguer</h2><a href="index.html">Accueil</a><a href="boutique.html">Boutique</a><a href="maisons.html">Maisons</a><a href="rituel.html">Le Rituel</a><a href="journal.html">Journal</a></div>' +
        '<div class="foot-col"><h2>Compte</h2><a href="compte.html">Mon compte</a><a href="compte.html#commandes">Mes commandes</a><a href="compte.html#envies">Liste de désirs</a><a href="panier.html">Panier</a></div>' +
        '<div class="foot-col"><h2>Aide</h2><a href="contact.html">Rendez-vous privé</a><a href="maison.html#engagements">Livraison CEDEAO</a><a href="maison.html#engagements">Authenticité</a><a href="contact.html">Nous écrire</a></div>' +
        '<div class="foot-col"><h2>Contact</h2><a href="https://wa.me/' + cfg.whatsapp + '" rel="noopener">' + T.esc(cfg.phoneDisplay) + '</a><a href="mailto:' + cfg.email + '">' + T.esc(cfg.email) + '</a><a href="contact.html">' + T.esc(cfg.address) + '</a></div>' +
      '</div>' +
      '<div class="foot-bottom"><span>© ' + new Date().getFullYear() + ' TERANGA — Parfumerie fondée à Dakar</span><span>Prix en FCFA (XOF) · Français</span></div>' +
    '</div>' + T.mark('foot-mark');
  document.body.appendChild(footer);

  /* ---------- Écran de chargement (accueil) ---------- */
  /* Affiché à chaque arrivée sur l'accueil (le tracé du monogramme dure
     1,4 s). Mouvement réduit : retiré immédiatement. */
  var loader = document.getElementById('loader');
  if (loader) {
    loader.innerHTML = T.mark();
    /* Rideau d'intro : une seule fois par session, levé dès que la première
       photo et les polices sont prêtes (0,35 s mini, 0,7 s maxi). Revenir à
       l'accueil ne remet plus d'attente. */
    var seen = false;
    try { seen = sessionStorage.getItem('teranga-intro') === '1'; sessionStorage.setItem('teranga-intro', '1'); } catch (e) {}
    var finished = false;
    var done = function () {
      if (finished) return; finished = true;
      loader.classList.add('is-done'); setTimeout(function () { loader.remove(); }, 600);
    };
    if (T.reduced || seen) { loader.remove(); loader = null; }
    else {
      var t0 = performance.now();
      var img = document.querySelector('.hs__slide img');
      Promise.all([
        document.fonts && document.fonts.ready ? document.fonts.ready : null,
        img && img.decode ? img.decode().catch(function () {}) : null
      ]).then(function () { setTimeout(done, Math.max(0, 350 - (performance.now() - t0))); });
      setTimeout(done, 700);
    }
  }

  /* ---------- Navigateur-labyrinthe : plan de sol, un carré par chambre ---------- */
  var lab = null;
  var chambers = Array.prototype.slice.call(document.querySelectorAll('[data-chamber]'));
  if (chambers.length > 2 && !T.reduced) {
    var NS = 'http://www.w3.org/2000/svg';
    lab = document.createElement('div');
    lab.className = 'labyrinth'; lab.setAttribute('aria-hidden', 'true');
    var svg = document.createElementNS(NS, 'svg');
    var path = document.createElementNS(NS, 'path');
    var mark = document.createElementNS(NS, 'rect');
    mark.setAttribute('width', '7'); mark.setAttribute('height', '7');
    svg.appendChild(path); svg.appendChild(mark); lab.appendChild(svg);
    document.body.appendChild(lab);
    var total = 0;
    var build = function () {
      var H = innerHeight, n = chambers.length, seg = (H * 0.84) / n, y = H * 0.08;
      svg.setAttribute('viewBox', '0 0 44 ' + H);
      var d = 'M22 0 V' + Math.round(y);
      for (var i = 0; i < n; i++) { d += ' H' + (i % 2 ? 12 : 32) + ' V' + Math.round(y + seg); y += seg; }
      d += ' H22 V' + H;
      path.setAttribute('d', d);
      total = path.getTotalLength();
    };
    var move = function () {
      var max = document.documentElement.scrollHeight - innerHeight;
      var p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
      var pt = path.getPointAtLength(p * total);
      mark.setAttribute('x', (pt.x - 3.5).toFixed(1)); mark.setAttribute('y', (pt.y - 3.5).toFixed(1));
    };
    build(); move();
    addEventListener('scroll', move, { passive: true });
    addEventListener('resize', function () { build(); move(); }, { passive: true });
  }

  onScroll();
})();
