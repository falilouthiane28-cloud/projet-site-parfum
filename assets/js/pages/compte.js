/* compte.js — Espace client : commandes, liste de désirs, coordonnées.
   Tout passe par T.api, donc localStorage aujourd'hui et Supabase le jour
   où config.js reçoit ses clés — sans toucher à cette page. */
(function () {
  'use strict';
  var T = window.TERANGA;
  var view = document.getElementById('accountView');
  if (!view) return;

  var TABS = [
    ['commandes', 'Commandes'],
    ['envies', 'Liste de désirs'],
    ['profil', 'Coordonnées']
  ];
  function fromHash() {
    var h = (location.hash || '').replace('#', '');
    return TABS.some(function (t) { return t[0] === h; }) ? h : 'commandes';
  }
  var tab = fromHash();

  function date(iso) {
    var d = new Date(iso);
    return isNaN(d) ? '' : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  /* ---------- Commandes ---------- */
  function ordersHTML() {
    var list = T.api.localOrders();
    if (!list.length) {
      return '<div class="empty"><p>Aucune commande pour le moment.</p>' +
        '<a class="btn" href="boutique.html">Voir la boutique</a></div>';
    }
    return list.map(function (o) {
      var n = (o.items || []).reduce(function (s, i) { return s + i.qty; }, 0);
      var thumbs = (o.items || []).slice(0, 5).map(function (i) {
        return '<img src="' + T.esc(i.image) + '" alt="" width="44" height="44" loading="lazy">';
      }).join('');
      var ville = o.delivery && o.delivery.ville ? ' · ' + T.esc(o.delivery.ville) : '';
      return '<article class="order">' +
        '<div><p class="order__ref">' + T.esc(o.id) + '</p>' +
          '<p class="order__meta">' + date(o.at) + ' · ' + n + ' article' + (n > 1 ? 's' : '') + ville + '</p>' +
          '<div class="order__thumbs">' + thumbs + '</div></div>' +
        '<div style="text-align:right">' +
          '<p class="price">' + T.fmt(o.total) + '</p>' +
          '<p class="order__meta">' + T.esc(o.status || 'En attente') + '</p></div>' +
      '</article>';
    }).join('');
  }

  /* ---------- Liste de désirs ---------- */
  function wishHTML() {
    var items = T.api.wishlist.all().map(T.byId).filter(Boolean);
    if (!items.length) {
      return '<div class="empty"><p>Votre liste de désirs est vide. Le cœur, sur une carte, la remplit.</p>' +
        '<a class="btn" href="boutique.html">Voir la boutique</a></div>';
    }
    return '<div class="catalog" style="padding-top:0">' + items.map(function (p) { return T.card(p); }).join('') + '</div>';
  }

  /* ---------- Coordonnées ---------- */
  function profileHTML(profile) {
    return '<form class="form-grid" id="profileForm" novalidate style="max-width:560px">' +
      '<div class="form-row">' +
        '<div class="field"><label for="pName">Nom complet</label>' +
          '<input id="pName" name="full_name" autocomplete="name" value="' + T.esc(profile.full_name || '') + '"></div>' +
        '<div class="field"><label for="pPhone">Téléphone</label>' +
          '<input id="pPhone" name="phone" type="tel" autocomplete="tel" value="' + T.esc(profile.phone || '') + '"></div>' +
      '</div>' +
      '<div class="field"><label for="pAddr">Adresse de livraison</label>' +
        '<input id="pAddr" name="address" autocomplete="street-address" placeholder="Quartier, rue, repère" value="' + T.esc(profile.address || '') + '"></div>' +
      '<div style="display:flex;gap:12px;flex-wrap:wrap">' +
        '<button class="btn" type="submit">Enregistrer</button>' +
        '<button class="btn btn--ghost" type="button" id="wipe">Effacer mes données</button>' +
      '</div>' +
      '<p class="form-msg" id="profileMsg" role="status" aria-live="polite"></p>' +
      '<p class="muted" style="font-size:13px">Ces coordonnées pré-remplissent le formulaire de commande. Elles ne quittent pas cet appareil.</p>' +
    '</form>';
  }

  /* ---------- Rendu ---------- */
  function render(profile) {
    var body = tab === 'commandes' ? ordersHTML()
      : tab === 'envies' ? wishHTML()
      : profileHTML(profile);

    view.innerHTML =
      '<div class="tabs" role="tablist" aria-label="Sections du compte">' +
        TABS.map(function (t) {
          return '<button class="tab" type="button" role="tab" id="tab-' + t[0] + '" data-tab="' + t[0] + '" ' +
            'aria-selected="' + (t[0] === tab) + '" aria-controls="panel-compte" ' +
            'tabindex="' + (t[0] === tab ? '0' : '-1') + '">' + t[1] + '</button>';
        }).join('') +
      '</div>' +
      '<div id="panel-compte" role="tabpanel" aria-labelledby="tab-' + tab + '">' + body + '</div>';

    view.querySelectorAll('[data-tab]').forEach(function (b) {
      b.addEventListener('click', function () {
        tab = b.dataset.tab;
        history.replaceState(null, '', '#' + tab);
        render(profile);
        view.querySelector('[data-tab="' + tab + '"]').focus();
      });
    });

    var pf = document.getElementById('profileForm');
    if (pf) {
      pf.addEventListener('submit', function (e) {
        e.preventDefault();
        var next = {
          full_name: pf.elements.full_name.value.trim(),
          phone: pf.elements.phone.value.trim(),
          address: pf.elements.address.value.trim()
        };
        T.api.saveProfile(next).then(function () {
          profile = next;
          var m = document.getElementById('profileMsg');
          m.className = 'form-msg is-ok';
          m.textContent = 'Coordonnées enregistrées.';
        });
      });
      document.getElementById('wipe').addEventListener('click', function () {
        T.api.saveProfile({ full_name: '', phone: '', address: '' }).then(function () {
          profile = { full_name: '', phone: '', address: '' };
          render(profile);
          T.toast('Vos coordonnées sont effacées.');
        });
      });
    }

    T.motion.refresh();
  }

  addEventListener('hashchange', function () {
    var next = fromHash();
    if (next !== tab) { tab = next; T.api.getProfile().then(render); }
  });
  document.addEventListener('wishlist:change', function () { if (tab === 'envies') T.api.getProfile().then(render); });

  T.api.getProfile().then(render);
})();
