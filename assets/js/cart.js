/* =========================================================================
   cart.js — Panier (localStorage, + Supabase si connecté).
   Le panier est une étape d'achat, pas de commande : il liste, ajuste et
   totalise. La saisie client (livraison, paiement) vit sur checkout.html.
   Un seul magasin de données sert le tiroir, panier.html et checkout.html.
   ========================================================================= */
(function () {
  'use strict';
  var T = window.TERANGA;
  var KEY = 'teranga-cart';
  var MAX = 10; // exemplaires par ligne

  /* ============================ STORE ============================ */
  /* Le stockage ne contient que { id, ml, qty } : nom, image et prix sont
     toujours relus dans le catalogue — un prix ne peut donc jamais être
     faux, périmé ou NaN, même si le stockage a été altéré. */
  function clampQty(q) {
    q = Math.floor(Number(q));
    return isFinite(q) ? Math.min(MAX, Math.max(1, q)) : 1;
  }
  function sizeOf(p, ml) {
    return p.sizes.find(function (s) { return s.ml === Number(ml); }) || p.sizes[0];
  }
  function sanitize(list) {
    var out = [];
    (Array.isArray(list) ? list : []).forEach(function (i) {
      var p = i && T.byId(i.id);
      if (!p) return;                                   // produit retiré du catalogue
      var ml = sizeOf(p, i.ml).ml;
      var twin = out.find(function (x) { return x.id === p.id && x.ml === ml; });
      if (twin) twin.qty = clampQty(twin.qty + clampQty(i.qty)); // fusion des doublons
      else out.push({ id: p.id, ml: ml, qty: clampQty(i.qty) });
    });
    return out;
  }

  function loadCart() { return sanitize(T.ls.get(KEY, [])); }
  var items = loadCart();
  var syncTimer;
  function saveCart() {
    T.ls.set(KEY, items);
    clearTimeout(syncTimer);
    syncTimer = setTimeout(function () { if (T.api) T.api.syncCart(items); }, 800);
    document.dispatchEvent(new CustomEvent('cart:change'));
  }

  /* Ligne enrichie, prête à afficher ou à commander */
  function lineOf(i) {
    var p = T.byId(i.id), s = sizeOf(p, i.ml);
    return {
      id: p.id, name: p.name, maison: p.maison, image: p.images[0], pack: !!p.pack,
      ml: s.ml, multi: p.sizes.length > 1, price: s.price_xof, qty: i.qty, total: s.price_xof * i.qty
    };
  }
  function lines() { return items.map(lineOf); }
  function count() { return items.reduce(function (n, i) { return n + i.qty; }, 0); }
  function calculateSubtotal() { return lines().reduce(function (n, l) { return n + l.total; }, 0); }
  function indexOf(id, ml) {
    for (var k = 0; k < items.length; k++) if (items[k].id === id && items[k].ml === Number(ml)) return k;
    return -1;
  }

  function addToCart(id, ml, qty, silent) {
    var p = T.byId(id);
    if (!p) { T.toast('Ce parfum n\'est plus disponible.'); return false; }
    ml = sizeOf(p, ml).ml;
    qty = clampQty(qty || 1);
    var k = indexOf(id, ml);
    if (k !== -1) {
      var before = items[k].qty;
      items[k].qty = clampQty(before + qty);
      if (items[k].qty === before) { T.toast('Maximum ' + MAX + ' exemplaires par parfum.'); return false; }
    } else items.unshift({ id: id, ml: ml, qty: qty });
    saveCart();
    if (!silent) T.toast(p.name + (p.sizes.length > 1 ? ' ' + ml + ' ml' : '') + ' ajouté au panier.');
    return true;
  }
  function updateQuantity(id, ml, qty) {
    var k = indexOf(id, ml); if (k === -1) return;
    var q = clampQty(qty);
    if (q === items[k].qty) return;
    items[k].qty = q; saveCart();
  }
  function removeFromCart(id, ml) {
    var k = indexOf(id, ml); if (k === -1) return;
    var name = T.byId(id).name;
    items.splice(k, 1); saveCart();
    T.toast(name + ' est retiré du panier.');
  }
  function clearCart() { items = []; saveCart(); }

  /* ============================ RENDU ============================ */
  var IMG_FALLBACK = "this.onerror=null;this.removeAttribute('src');this.classList.add('is-missing')";

  function lineHTML(l) {
    var key = ' data-id="' + T.esc(l.id) + '" data-ml="' + l.ml + '"';
    return '<li class="ci"' + key + '>' +
      '<a class="ci__media" href="parfum.html?id=' + encodeURIComponent(l.id) + '" tabindex="-1" aria-hidden="true">' +
        '<img class="ci__img' + (l.pack ? ' is-pack' : '') + '" src="' + T.esc(l.image) + '" alt="" width="88" height="110" loading="lazy" decoding="async" onerror="' + IMG_FALLBACK + '"></a>' +
      '<div class="ci__info">' +
        '<p class="ci__maison">' + T.esc(l.maison) + '</p>' +
        '<p class="ci__name"><a href="parfum.html?id=' + encodeURIComponent(l.id) + '">' + T.esc(l.name) + '</a></p>' +
        '<p class="ci__meta">' + l.ml + ' ml<span aria-hidden="true"> · </span><span class="visually-hidden">, prix unitaire </span>' + T.fmt(l.price) + '</p>' +
        '<div class="ci__row">' +
          '<div class="qty" role="group" aria-label="Quantité de ' + T.esc(l.name) + '">' +
            '<button type="button" data-act="dec" aria-label="Retirer un exemplaire"' + (l.qty <= 1 ? ' disabled' : '') + '><i class="bi bi-dash" aria-hidden="true"></i></button>' +
            '<output aria-live="polite" aria-label="' + l.qty + ' exemplaire' + (l.qty > 1 ? 's' : '') + '">' + l.qty + '</output>' +
            '<button type="button" data-act="inc" aria-label="Ajouter un exemplaire"' + (l.qty >= MAX ? ' disabled' : '') + '><i class="bi bi-plus" aria-hidden="true"></i></button>' +
          '</div>' +
          '<button class="ci__remove" type="button" data-act="remove" aria-label="Retirer ' + T.esc(l.name) + ' du panier">Retirer</button>' +
        '</div>' +
      '</div>' +
      '<p class="ci__total price">' + T.fmt(l.total) + '</p>' +
    '</li>';
  }

  function emptyHTML() {
    return '<div class="cart-empty">' +
      '<p class="eyebrow">Votre panier</p>' +
      '<p class="cart-empty__title">Votre panier est vide.</p>' +
      '<p class="cart-empty__text">' + T.products.length + ' parfums vous attendent, choisis un par un.</p>' +
      '<a class="btn" href="boutique.html">Découvrir les parfums</a>' +
    '</div>';
  }

  function summaryHTML() {
    var n = count();
    return '<div class="cart-sum">' +
      '<div class="cart-sum__row"><span>Sous-total <span class="muted">(' + n + ' article' + (n > 1 ? 's' : '') + ')</span></span><span class="price">' + T.fmt(calculateSubtotal()) + '</span></div>' +
      '<p class="cart-sum__note">Livraison calculée à l\'étape suivante, selon votre ville.</p>' +
      '<a class="btn btn--block" href="checkout.html" data-checkout>Passer la commande</a>' +
    '</div>';
  }

  /* Un « rendeur » de panier : la liste + le récapitulatif, où qu'ils soient.
     Le focus est rendu au même bouton après chaque mise à jour, pour qu'on
     puisse enchaîner les + / − au clavier sans le perdre. */
  function renderCart(listEl, sumEl, opts) {
    opts = opts || {};
    var a = document.activeElement, keep = null;
    if (a && listEl.contains(a) && a.dataset.act) {
      var row = a.closest('.ci');
      keep = row && { id: row.dataset.id, ml: row.dataset.ml, act: a.dataset.act };
    }
    if (!items.length) {
      listEl.innerHTML = emptyHTML();
      if (sumEl) { sumEl.innerHTML = ''; sumEl.hidden = true; }
      if (opts.onEmpty) opts.onEmpty();
      return;
    }
    listEl.innerHTML = '<ul class="cart-list">' + lines().map(lineHTML).join('') + '</ul>';
    if (sumEl) { sumEl.hidden = false; sumEl.innerHTML = summaryHTML(); }
    if (keep) {
      var r = listEl.querySelector('.ci[data-id="' + keep.id + '"][data-ml="' + keep.ml + '"]');
      var b = r && (r.querySelector('[data-act="' + keep.act + '"]:not([disabled])') || r.querySelector('[data-act]:not([disabled])'));
      if (b) b.focus({ preventScroll: true });
    }
  }

  /* Délégation : un seul écouteur par conteneur, quel que soit le nombre de lignes */
  function bindList(listEl) {
    listEl.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]'); if (!b || b.disabled) return;
      var row = b.closest('.ci'); if (!row) return;
      var k = indexOf(row.dataset.id, row.dataset.ml); if (k === -1) return;
      if (b.dataset.act === 'inc') updateQuantity(row.dataset.id, row.dataset.ml, items[k].qty + 1);
      else if (b.dataset.act === 'dec') updateQuantity(row.dataset.id, row.dataset.ml, items[k].qty - 1);
      else if (b.dataset.act === 'remove') {
        // La ligne se retire en douceur avant la mise à jour
        if (!T.reduced) {
          row.classList.add('is-leaving');
          setTimeout(function () { removeFromCart(row.dataset.id, row.dataset.ml); }, 220);
        } else removeFromCart(row.dataset.id, row.dataset.ml);
      }
    });
  }

  /* ============================ BADGE ============================ */
  function paintBadge() {
    var n = count();
    var badge = document.getElementById('cartCount');
    var btn = document.getElementById('cartBtn');
    if (badge) {
      var was = badge.hidden ? 0 : +badge.textContent;
      badge.hidden = n === 0;
      badge.firstChild ? (badge.firstChild.textContent = n) : (badge.textContent = n);
      if (n > was && !T.reduced) { badge.classList.remove('is-bump'); void badge.offsetWidth; badge.classList.add('is-bump'); }
    }
    if (btn) btn.setAttribute('aria-label', n ? 'Ouvrir le panier, ' + n + ' article' + (n > 1 ? 's' : '') : 'Ouvrir le panier, vide');
  }

  /* ============================ TIROIR ============================ */
  var scrim = document.createElement('div');
  scrim.className = 'scrim';
  var drawer = document.createElement('aside');
  drawer.className = 'drawer';
  drawer.setAttribute('role', 'dialog'); drawer.setAttribute('aria-modal', 'true'); drawer.setAttribute('aria-labelledby', 'drawerTitle');
  drawer.setAttribute('data-lenis-prevent', '');
  drawer.innerHTML = '<div class="drawer__head"><h2 class="drawer__title" id="drawerTitle">Votre panier <small data-n></small></h2>' +
    '<button class="icon-btn" type="button" data-close aria-label="Fermer le panier"><i class="bi bi-x-lg" aria-hidden="true"></i></button></div>' +
    '<div class="drawer__body"></div>' +
    '<div class="drawer__foot"></div>';
  scrim.style.zIndex = '205'; drawer.style.zIndex = '210'; // au-dessus de la fiche produit
  document.body.appendChild(scrim); document.body.appendChild(drawer);
  var dBody = drawer.querySelector('.drawer__body'), dFoot = drawer.querySelector('.drawer__foot');
  bindList(dBody);

  var lastFocus = null, isOpen = false;
  function open() {
    if (isOpen) return;
    // Sur la page panier ou commande, le tiroir ferait doublon : on y reste.
    var page = document.body.dataset.page;
    if (page === 'panier' || page === 'checkout') { var v = document.getElementById('cartView') || document.getElementById('main'); if (v) v.scrollIntoView({ behavior: T.reduced ? 'auto' : 'smooth' }); return; }
    isOpen = true; lastFocus = document.activeElement;
    scrim.classList.add('is-open'); drawer.classList.add('is-open');
    T.lockScroll(true);
    setTimeout(function () { drawer.querySelector('[data-close]').focus({ preventScroll: true }); }, 50);
  }
  function close() {
    if (!isOpen) return;
    isOpen = false;
    scrim.classList.remove('is-open'); drawer.classList.remove('is-open');
    T.lockScroll(false);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  scrim.addEventListener('click', close);
  drawer.querySelector('[data-close]').addEventListener('click', close);
  drawer.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); T.trapFocus(drawer, e); });
  var cartBtn = document.getElementById('cartBtn');
  if (cartBtn) cartBtn.addEventListener('click', open);

  function renderDrawer() {
    renderCart(dBody, dFoot);
    var n = count();
    drawer.querySelector('[data-n]').textContent = n ? '(' + n + ')' : '';
    if (items.length) dFoot.insertAdjacentHTML('beforeend', '<button class="link-u cart-sum__back" type="button" data-close-drawer>Continuer mes achats</button>');
  }
  dFoot.addEventListener('click', function (e) { if (e.target.closest('[data-close-drawer]')) close(); });

  document.addEventListener('cart:change', function () { paintBadge(); renderDrawer(); });
  paintBadge(); renderDrawer();

  // Changement dans un autre onglet, ou retour arrière (cache de page)
  function resync() { items = loadCart(); document.dispatchEvent(new CustomEvent('cart:change')); }
  addEventListener('storage', function (e) { if (e.key === KEY) resync(); });
  addEventListener('pageshow', function (e) { if (e.persisted) { close(); resync(); } });

  /* ============================ API PUBLIQUE ============================ */
  T.cart = {
    MAX: MAX,
    // Le tiroir qui s'ouvre confirme l'ajout ; sur panier/commande (pas de tiroir), un toast le fait.
    add: function (id, ml, qty) {
      var page = document.body.dataset.page, drawerless = page === 'panier' || page === 'checkout';
      if (addToCart(id, ml, qty, !drawerless)) open();
    },
    addToCart: addToCart,
    updateQuantity: updateQuantity,
    removeFromCart: removeFromCart,
    clear: clearCart,
    count: count,
    lines: lines,
    items: function () { return items.slice(); },
    calculateSubtotal: calculateSubtotal,
    renderCart: renderCart,
    bindList: bindList,
    open: open,
    close: close,
    /* Page panier.html : la liste et le récapitulatif, à plat */
    mountPage: function (listEl, sumEl) {
      bindList(listEl);
      var paint = function () { renderCart(listEl, sumEl); };
      document.addEventListener('cart:change', paint);
      paint();
    }
  };
})();
