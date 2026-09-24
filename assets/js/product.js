/* =========================================================================
   product.js — Carte produit, fiche complète (page), liste de désirs.
   Une carte est un lien : elle mène à parfum.html?id=… Pas de modale.
   ========================================================================= */
(function () {
  'use strict';
  var T = window.TERANGA;

  function alt(p, i) {
    return 'Flacon ' + p.name + ' de ' + p.maison + (i ? ', autre vue' : '') + (p.pack ? ', sur fond blanc' : '');
  }
  function priceLabel(p) {
    return (p.sizes.length > 1 ? 'Dès ' : '') + T.fmt(T.priceFrom(p));
  }
  function wishIcon(on) { return '<i class="bi ' + (on ? 'bi-heart-fill' : 'bi-heart') + '" aria-hidden="true"></i>'; }

  /* ---------- Carte ---------- */
  T.card = function (p, opts) {
    opts = opts || {};
    var on = T.api.wishlist.has(p.id);
    return '<article class="p-card' + (opts.row ? ' p-card--row' : '') + '" data-conc="' + T.esc(p.concentration) + '" data-id="' + p.id + '">' +
      '<a class="p-card__link" href="parfum.html?id=' + p.id + '">' +
        '<figure class="p-card__media' + (p.pack ? ' is-pack' : '') + '">' +
          '<img src="' + T.esc(p.images[0]) + '" alt="' + T.esc(alt(p, 0)) + '" width="600" height="800" loading="' + (opts.eager ? 'eager' : 'lazy') + '" decoding="async">' +
          '<span class="p-card__cta" aria-hidden="true">Voir le parfum</span>' +
        '</figure>' +
        '<div class="p-card__body">' +
          '<p class="p-card__maison">' + T.esc(p.maison) + '</p>' +
          '<h3 class="p-card__name">' + T.esc(p.name) + '</h3>' +
          '<p class="p-card__notes">' + T.esc(p.family) + ' · ' + T.esc(p.notes.heart.slice(0, 2).join(', ')) + '</p>' +
          '<p class="p-card__price price">' + priceLabel(p) + '</p>' +
        '</div>' +
      '</a>' +
      '<button class="p-card__wish" type="button" data-wish="' + p.id + '" aria-pressed="' + on + '" aria-label="' +
        (on ? 'Retirer ' : 'Ajouter ') + T.esc(p.name) + (on ? ' de' : ' à') + ' ma liste de désirs">' + wishIcon(on) + '</button>' +
    '</article>';
  };

  T.related = function (p, n) {
    var pool = T.products.filter(function (x) { return x.id !== p.id; });
    var same = pool.filter(function (x) { return x.maison === p.maison || x.famille === p.famille; });
    var rest = pool.filter(function (x) { return same.indexOf(x) === -1; });
    return same.concat(rest).slice(0, n || 4);
  };

  /* ---------- Fiche complète ---------- */
  T.detail = function (p, ctx) {
    var m = T.maison(p.maison) || {};
    var logo = m.logo2 || m.logo;
    var H = ctx === 'page' ? 'h1' : 'h2';
    var multi = p.sizes.length > 1;
    var on = T.api.wishlist.has(p.id);
    var thumbs = p.images.length > 1
      ? '<div class="pd__thumbs" role="group" aria-label="Photos du flacon">' + p.images.map(function (src, i) {
          return '<button class="pd__thumb" type="button" data-thumb="' + i + '" aria-pressed="' + (i === 0) + '" aria-label="Photo ' + (i + 1) + '">' +
            '<img src="' + T.esc(src) + '" alt="" width="72" height="88" loading="lazy"></button>';
        }).join('') + '</div>'
      : '';
    var sizes = multi
      ? '<div class="pd__sizes" role="group" aria-label="Contenance">' + p.sizes.map(function (s, i) {
          return '<button class="pill" type="button" data-size="' + i + '" aria-pressed="' + (i === 0) + '">' + s.ml + ' ml</button>';
        }).join('') + '</div>'
      : '<p class="muted">' + p.sizes[0].ml + ' ml</p>';

    return '<div class="pd" data-pd="' + p.id + '">' +
      '<div class="pd__gallery">' +
        '<figure class="pd__main' + (p.pack ? ' is-pack' : '') + '"><img src="' + T.esc(p.images[0]) + '" alt="' + T.esc(alt(p, 0)) + '" width="800" height="1000" decoding="async"></figure>' +
        thumbs +
      '</div>' +
      '<div class="pd__info">' +
        '<a class="pd__maison" href="boutique.html?maison=' + encodeURIComponent(p.maison) + '">' +
          (logo ? '<img src="' + T.esc(logo) + '" alt="" width="40" height="40" loading="lazy">' : '') + T.esc(p.maison) + '</a>' +
        '<' + H + ' class="pd__name" id="pd-title-' + p.id + '">' + T.esc(p.name) + '</' + H + '>' +
        '<p class="pd__conc">' + T.esc(p.concentration) + ' · ' + T.genderLabel(p.gender) + '</p>' +
        '<p class="pd__price" data-price>' + T.fmt(p.sizes[0].price_xof) + '</p>' +
        sizes +
        '<button class="btn btn--block" type="button" data-add>Ajouter au panier</button>' +
        '<button class="link-u" type="button" data-wish="' + p.id + '" aria-pressed="' + on + '">' + wishIcon(on) +
          '<span data-wish-label>' + (on ? 'Dans ma liste de désirs' : 'Ajouter à ma liste de désirs') + '</span></button>' +
        '<p class="pd__desc">' + T.esc(p.description) + '</p>' +
        '<section><h3 class="pd__h">Pyramide olfactive</h3><dl class="pyr">' +
          '<div class="pyr__row"><dt>Notes de tête</dt><dd>' + T.esc(p.notes.top.join(' · ')) + '</dd></div>' +
          '<div class="pyr__row"><dt>Notes de cœur</dt><dd>' + T.esc(p.notes.heart.join(' · ')) + '</dd></div>' +
          '<div class="pyr__row"><dt>Notes de fond</dt><dd>' + T.esc(p.notes.base.join(' · ')) + '</dd></div>' +
        '</dl></section>' +
        '<section><h3 class="pd__h">Caractéristiques</h3><table class="specs"><tbody>' +
          '<tr><th scope="row">Famille</th><td>' + T.esc(p.family) + '</td></tr>' +
          '<tr><th scope="row">Sillage</th><td>' + T.meter(p.sillage) + '</td></tr>' +
          '<tr><th scope="row">Tenue</th><td>' + T.meter(p.longevity) + '</td></tr>' +
          '<tr><th scope="row">Genre</th><td>' + T.genderLabel(p.gender) + '</td></tr>' +
          '<tr><th scope="row">Année</th><td>' + p.year + '</td></tr>' +
          '<tr><th scope="row">Nez</th><td>' + T.esc(p.perfumer) + '</td></tr>' +
        '</tbody></table></section>' +
      '</div>' +
      '<div class="pd__sticky"><span class="price" data-price>' + T.fmt(p.sizes[0].price_xof) + '</span>' +
        '<button class="btn" type="button" data-add>Ajouter au panier</button></div>' +
    '</div>';
  };

  T.bindDetail = function (root, p) {
    var size = 0;
    var mainImg = root.querySelector('.pd__main img');
    root.querySelectorAll('[data-size]').forEach(function (b) {
      b.addEventListener('click', function () {
        size = +b.dataset.size;
        root.querySelectorAll('[data-size]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        root.querySelectorAll('[data-price]').forEach(function (el) { el.textContent = T.fmt(p.sizes[size].price_xof); });
      });
    });
    root.querySelectorAll('[data-thumb]').forEach(function (b) {
      b.addEventListener('click', function () {
        var i = +b.dataset.thumb;
        mainImg.src = p.images[i]; mainImg.alt = alt(p, i);
        root.querySelectorAll('[data-thumb]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      });
    });
    root.querySelectorAll('[data-add]').forEach(function (b) {
      b.addEventListener('click', function () {
        T.cart.add(p.id, p.sizes[size].ml, 1);
        // Confirmation brève sur le bouton lui-même, puis retour au libellé
        if (b.dataset.busy) return;
        var label = b.textContent;
        b.dataset.busy = '1';
        b.textContent = '✓ Ajouté';
        setTimeout(function () { b.textContent = label; delete b.dataset.busy; }, 1400);
      });
    });

    /* Survol de la photo : loupe qui suit le curseur. Pointeur fin seulement —
       au doigt, le geste servirait à faire défiler la page. */
    var main = root.querySelector('.pd__main');
    if (main && mainImg && matchMedia('(pointer: fine)').matches && !T.reduced) {
      main.addEventListener('pointermove', function (e) {
        var r = main.getBoundingClientRect();
        mainImg.style.transformOrigin =
          ((e.clientX - r.left) / r.width * 100).toFixed(1) + '% ' +
          ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%';
        mainImg.style.transform = 'scale(1.4)';
      });
      main.addEventListener('pointerleave', function () {
        mainImg.style.transform = '';
        mainImg.style.transformOrigin = '';
      });
    }
  };

  /* ---------- Liste de désirs (délégation) ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-wish]');
    if (!b) return;
    e.preventDefault();
    var p = T.byId(b.dataset.wish);
    T.api.wishlist.toggle(b.dataset.wish).then(function (on) {
      T.toast(on ? p.name + ' est dans votre liste de désirs.' : p.name + ' est retiré de votre liste de désirs.');
    });
  });
  document.addEventListener('wishlist:change', function (e) {
    var p = T.byId(e.detail.id), on = e.detail.on;
    document.querySelectorAll('[data-wish="' + e.detail.id + '"]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(on));
      var i = b.querySelector('.bi'); if (i) i.className = 'bi ' + (on ? 'bi-heart-fill' : 'bi-heart');
      var l = b.querySelector('[data-wish-label]');
      if (l) l.textContent = on ? 'Dans ma liste de désirs' : 'Ajouter à ma liste de désirs';
      else b.setAttribute('aria-label', (on ? 'Retirer ' : 'Ajouter ') + p.name + (on ? ' de' : ' à') + ' ma liste de désirs');
    });
  });

  /* ---------- Compatibilite des anciens liens ----------
     Les fiches s'ouvraient autrefois en modale via ?parfum=ID sur la boutique.
     Ces liens continuent de fonctionner : ils menent a la page dediee. */
  var legacy = new URLSearchParams(location.search).get('parfum');
  if (legacy && T.byId(legacy) && document.body.dataset.page !== 'parfum') {
    location.replace('parfum.html?id=' + encodeURIComponent(legacy));
  }
})();
