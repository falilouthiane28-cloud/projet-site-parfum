/* =========================================================================
   shell.js — Chrome partagé : header, menu, footer, curseur, loader, panier.
   Injecté sur toutes les pages. Vanilla ES2023, no-build.
   ========================================================================= */
(function () {
  'use strict';

  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = matchMedia('(hover: none), (pointer: coarse)').matches;

  /* ---------- Format prix XOF ---------- */
  function fmtXOF(n) {
    return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' FCFA';
  }
  window.TERANGA = window.TERANGA || {};
  window.TERANGA.fmtXOF = fmtXOF;

  /* ---------- Navigation partagée ---------- */
  var NAV = [
    { href: 'boutique.html', label: 'Boutique' },
    { href: 'maisons.html',  label: 'Maisons' },
    { href: 'rituel.html',   label: 'Le Rituel' },
    { href: 'journal.html',  label: 'Journal' },
    { href: 'maison.html',   label: 'La Maison' },
    { href: 'contact.html',  label: 'Contact' }
  ];
  var page = (location.pathname.split('/').pop() || 'index.html');
  if (page === '') page = 'index.html';

  var LOGO = '<svg viewBox="0 0 60 72" aria-hidden="true" fill="none">' +
    '<rect x="20" y="2" width="20" height="7" fill="currentColor"/>' +
    '<rect x="24" y="11" width="5" height="6" fill="currentColor"/>' +
    '<rect x="31" y="11" width="5" height="6" fill="currentColor"/>' +
    '<path d="M8 19 H52 V70 H8 Z M18 30 H44 M18 40 H36 V52 M28 52 H44 V62 H18" ' +
    'stroke="currentColor" stroke-width="4" fill="none"/></svg>';

  /* ================= HEADER ================= */
  var header = document.createElement('header');
  header.className = 'site-header';
  header.innerHTML =
    '<div class="wrap">' +
      '<a class="brand" href="index.html" aria-label="TERANGA, accueil">' +
        '<span class="brand-mark" style="color:var(--text);width:28px;display:block">' + LOGO + '</span>' +
        '<span class="brand-name">Teranga</span>' +
      '</a>' +
      '<nav class="main-nav" aria-label="Navigation principale">' +
        NAV.map(function (n) {
          return '<a href="' + n.href + '"' + (n.href === page ? ' aria-current="page"' : '') + '>' + n.label + '</a>';
        }).join('') +
      '</nav>' +
      '<div class="header-actions">' +
        '<a class="icon-btn" href="compte.html" aria-label="Mon compte"><i class="bi bi-person"></i></a>' +
        '<button class="icon-btn" id="cartOpen" aria-label="Ouvrir le panier"><i class="bi bi-bag"></i><span class="cart-count" id="cartCount" hidden>0</span></button>' +
        '<button class="icon-btn burger" id="burger" aria-label="Ouvrir le menu" aria-expanded="false"><i class="bi bi-list"></i></button>' +
      '</div>' +
    '</div>';
  document.body.prepend(header);

  var onScroll = function () { header.classList.toggle('scrolled', scrollY > 40); };
  onScroll(); addEventListener('scroll', onScroll, { passive: true });

  /* ================= MENU OVERLAY ================= */
  var menu = document.createElement('div');
  menu.className = 'menu-overlay';
  menu.id = 'menu';
  menu.setAttribute('role', 'dialog');
  menu.setAttribute('aria-modal', 'true');
  menu.setAttribute('aria-label', 'Menu');
  menu.innerHTML =
    '<div class="menu-inner">' +
      '<nav class="menu-links" aria-label="Menu">' +
        [{ href: 'index.html', label: 'Accueil' }].concat(NAV).map(function (n) {
          return '<a href="' + n.href + '"><span class="ml-inner">' + n.label + '</span></a>';
        }).join('') +
      '</nav>' +
      '<div class="menu-meta">' +
        '<span>Almadies · Dakar</span><span>+221 33 000 00 00</span><span>Lun–Sam · 10h–20h</span>' +
      '</div>' +
    '</div>' +
    '<div class="menu-scene" aria-hidden="true">' +
      '<img src="img/Tom Ford Oud Wood.jpg" alt="" loading="lazy" decoding="async" />' +
    '</div>';
  document.body.appendChild(menu);

  var burger = document.getElementById('burger');
  function openMenu() { menu.classList.add('open'); burger.setAttribute('aria-expanded', 'true'); document.body.classList.add('no-scroll'); }
  function closeMenu() { menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); document.body.classList.remove('no-scroll'); }
  burger.addEventListener('click', function () { menu.classList.contains('open') ? closeMenu() : openMenu(); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });

  /* ================= FOOTER ================= */
  var footer = document.createElement('footer');
  footer.className = 'site-footer';
  footer.setAttribute('data-theme', 'dark');
  var year = new Date().getFullYear();
  footer.innerHTML =
    '<div class="wrap">' +
      '<div class="foot-grid">' +
        '<div class="foot-col">' +
          '<p class="foot-lede">La mémoire d\'un désir, gardée à Dakar.</p>' +
        '</div>' +
        '<div class="foot-col"><h3>Naviguer</h3>' +
          '<a href="boutique.html">Boutique</a><a href="maisons.html">Maisons</a><a href="rituel.html">Le Rituel</a><a href="journal.html">Journal</a>' +
        '</div>' +
        '<div class="foot-col"><h3>Compte</h3>' +
          '<a href="compte.html">Se connecter</a><a href="compte.html">Mes commandes</a><a href="compte.html">Liste de désirs</a><a href="panier.html">Panier</a>' +
        '</div>' +
        '<div class="foot-col"><h3>Assistance</h3>' +
          '<a href="contact.html">Nous contacter</a><a href="contact.html">Rendez-vous privé</a><a href="maison.html">Livraison CEDEAO</a><a href="maison.html">Authenticité</a>' +
        '</div>' +
        '<div class="foot-col"><h3>Contact & Social</h3>' +
          '<a href="https://wa.me/221000000000" rel="noopener">WhatsApp</a><a href="#">Instagram</a><a href="mailto:bonjour@teranga.sn">bonjour@teranga.sn</a>' +
        '</div>' +
      '</div>' +
      '<div class="foot-bottom">' +
        '<span>© ' + year + ' Teranga — Fondée à Dakar</span>' +
        '<span><a href="#" style="color:inherit">Mentions légales</a> · <a href="#" style="color:inherit">Confidentialité</a></span>' +
        '<span>FCFA (XOF) · Français</span>' +
      '</div>' +
    '</div>' +
    '<div class="foot-watermark" aria-hidden="true">Teranga</div>';
  document.body.appendChild(footer);

  /* ================= SIGNATURE : NAVIGATEUR-LABYRINTHE ================= */
  // Un plan de sol à angles droits le long du bord gauche. Un carré avance
  // le long du tracé selon la progression de scroll et marque la « chambre »
  // (section) courante. Aide à la navigation — jamais l'unique moyen ; le
  // menu classique demeure. Masqué < 901px et en reduced-motion (statique).
  var labBuilt = false;
  function buildLabyrinth() {
    if (labBuilt) return;
    if (innerWidth === 0 || innerWidth <= 900) return; // panneau caché / mobile : réessaie au resize
    var chambers = Array.prototype.slice.call(document.querySelectorAll('main [data-chamber]'));
    if (chambers.length < 2) chambers = Array.prototype.slice.call(document.querySelectorAll('main > section')).slice(0, 8);
    if (chambers.length < 2) return;
    labBuilt = true;
    document.body.classList.add('has-labyrinth');

    var NS = 'http://www.w3.org/2000/svg';
    var box = document.createElement('div');
    box.className = 'labyrinth';
    box.setAttribute('aria-hidden', 'true');
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('preserveAspectRatio', 'none');
    var path = document.createElementNS(NS, 'path');
    var marker = document.createElementNS(NS, 'rect');
    marker.setAttribute('class', 'lab-marker');
    marker.setAttribute('width', '8'); marker.setAttribute('height', '8');
    svg.appendChild(path); svg.appendChild(marker);
    box.appendChild(svg);
    // libellés de chambres
    var labels = chambers.map(function (c) {
      var name = c.getAttribute('data-chamber') || (c.querySelector('h1,h2') && c.querySelector('h1,h2').textContent.trim().slice(0, 22)) || '';
      var el = document.createElement('span'); el.className = 'lab-label'; el.textContent = name;
      box.appendChild(el); return el;
    });
    document.body.appendChild(box);

    var W = 64, H = 0, total = 0, nodeLens = [];
    function build() {
      H = innerHeight;
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      // tracé en zig-zag à angles droits, un coude par chambre
      var n = chambers.length;
      var midX = 20, farX = 44;
      var d = 'M32 0 V' + Math.round(H * 0.04);
      var y = H * 0.04;
      var seg = (H * 0.92) / n;
      for (var i = 0; i < n; i++) {
        var x = (i % 2 === 0) ? farX : midX;
        d += ' H' + x + ' V' + Math.round(y + seg);
        y += seg;
      }
      d += ' H32 V' + H;
      path.setAttribute('d', d);
      total = path.getTotalLength();
      // longueur ~ centre de chaque segment de chambre
      nodeLens = [];
      for (var j = 0; j < n; j++) nodeLens.push(total * (0.04 + (j + 0.5) / n * 0.92));
    }

    function update() {
      var doc = document.documentElement;
      var max = doc.scrollHeight - innerHeight;
      var p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
      var pt = path.getPointAtLength(p * total);
      marker.setAttribute('x', (pt.x - 4).toFixed(1));
      marker.setAttribute('y', (pt.y - 4).toFixed(1));
      // chambre active = la plus proche du marqueur
      var cur = p * total, best = 0, bd = Infinity;
      for (var i = 0; i < nodeLens.length; i++) { var dd = Math.abs(nodeLens[i] - cur); if (dd < bd) { bd = dd; best = i; } }
      labels.forEach(function (el, i) {
        el.classList.toggle('on', i === best);
        var lp = path.getPointAtLength(nodeLens[i]);
        el.style.top = lp.y + 'px';
      });
    }

    build(); update();
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', function () { build(); update(); }, { passive: true });
    // tracé qui se dessine une fois (le moment de chargement)
    if (!reduced) {
      var len = total;
      path.style.strokeDasharray = len; path.style.strokeDashoffset = len;
      requestAnimationFrame(function () {
        path.style.transition = 'stroke-dashoffset 1400ms cubic-bezier(0.86,0,0.07,1)';
        path.style.strokeDashoffset = '0';
      });
    }
  }
  buildLabyrinth();
  if (!labBuilt) {
    // Le panneau peut être caché/étroit au chargement : réessaie tant que non bâti.
    var labTries = 0;
    var labRetry = function () { if (!labBuilt && labTries++ < 30) buildLabyrinth(); };
    addEventListener('resize', labRetry, { passive: true });
    addEventListener('load', labRetry);
    var labPoll = setInterval(function () { labRetry(); if (labBuilt || labTries >= 30) clearInterval(labPoll); }, 300);
  }

  /* ================= LOADER ================= */
  var loader = document.getElementById('loader');
  if (loader) {
    var finish = function () { loader.classList.add('done'); setTimeout(function () { loader.remove(); }, 1200); };
    if (reduced) { setTimeout(finish, 300); }
    else {
      addEventListener('load', function () { setTimeout(finish, 900); });
      setTimeout(finish, 4000); // filet de sécurité
    }
  }

  /* ================= PANIER (localStorage) ================= */
  var overlay = document.createElement('div'); overlay.className = 'drawer-overlay'; overlay.id = 'cartOverlay';
  var drawer = document.createElement('aside'); drawer.className = 'drawer'; drawer.id = 'cartDrawer';
  drawer.setAttribute('role', 'dialog'); drawer.setAttribute('aria-modal', 'true'); drawer.setAttribute('aria-label', 'Panier');
  drawer.innerHTML =
    '<div class="drawer__head"><h2>Votre panier</h2><button class="icon-btn" id="cartClose" aria-label="Fermer"><i class="bi bi-x-lg"></i></button></div>' +
    '<div class="drawer__body" id="cartBody"></div>' +
    '<div class="drawer__foot">' +
      '<div class="cart-total"><span>Total</span><span class="price" id="cartTotal">0 FCFA</span></div>' +
      '<a class="btn btn--wide" href="panier.html">Passer commande</a>' +
    '</div>';
  document.body.appendChild(overlay); document.body.appendChild(drawer);

  var KEY = 'teranga-cart';
  var cart = [];
  try { cart = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { cart = []; }
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {} }

  var $count = document.getElementById('cartCount');
  var $body = document.getElementById('cartBody');
  var $total = document.getElementById('cartTotal');

  function render() {
    var count = cart.reduce(function (s, i) { return s + i.qty; }, 0);
    if ($count) { $count.hidden = count === 0; $count.textContent = count; }
    var total = cart.reduce(function (s, i) { return s + i.qty * i.price; }, 0);
    if ($total) $total.textContent = fmtXOF(total);
    if (!$body) return;
    if (!cart.length) { $body.innerHTML = '<p class="cart-empty">Votre panier est vide.</p>'; }
    else {
      $body.innerHTML = cart.map(function (i, idx) {
        return '<div class="cart-item">' +
          '<img src="' + i.img + '" alt="" width="64" height="80" loading="lazy" />' +
          '<div><div class="ci-name">' + i.name + '</div>' +
          '<div class="ci-meta">' + (i.maison || '') + (i.ml ? ' · ' + i.ml + ' ml' : '') + '</div>' +
          '<div class="ci-meta price">' + fmtXOF(i.price) + '</div></div>' +
          '<div class="ci-qty"><button data-dec="' + idx + '" aria-label="Retirer un">−</button>' +
          '<span>' + i.qty + '</span>' +
          '<button data-inc="' + idx + '" aria-label="Ajouter un">+</button></div>' +
          '</div>';
      }).join('');
      $body.querySelectorAll('[data-inc]').forEach(function (b) { b.onclick = function () { cart[+b.dataset.inc].qty++; persist(); render(); }; });
      $body.querySelectorAll('[data-dec]').forEach(function (b) { b.onclick = function () { var i = +b.dataset.dec; if (--cart[i].qty <= 0) cart.splice(i, 1); persist(); render(); }; });
    }
    document.dispatchEvent(new CustomEvent('cart:change', { detail: { cart: cart } }));
  }

  function openCart() { drawer.classList.add('open'); overlay.classList.add('open'); document.body.classList.add('no-scroll'); }
  function closeCart() { drawer.classList.remove('open'); overlay.classList.remove('open'); document.body.classList.remove('no-scroll'); }

  document.getElementById('cartOpen').addEventListener('click', openCart);
  document.getElementById('cartClose').addEventListener('click', closeCart);
  overlay.addEventListener('click', closeCart);
  addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeCart(); closeMenu(); } });

  // API panier publique
  window.TERANGA.cart = {
    add: function (item) {
      var found = cart.find(function (i) { return i.id === item.id && i.ml === item.ml; });
      if (found) found.qty += (item.qty || 1);
      else cart.push({ id: item.id, name: item.name, maison: item.maison, price: item.price, ml: item.ml, img: item.img, qty: item.qty || 1 });
      persist(); render(); openCart();
    },
    get: function () { return cart.slice(); },
    setQty: function (idx, qty) { if (cart[idx]) { cart[idx].qty = Math.max(1, qty); persist(); render(); } },
    remove: function (idx) { cart.splice(idx, 1); persist(); render(); },
    clear: function () { cart = []; persist(); render(); },
    total: function () { return cart.reduce(function (s, i) { return s + i.qty * i.price; }, 0); },
    open: openCart, close: closeCart
  };

  render();
})();
