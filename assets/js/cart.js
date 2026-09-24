/* =========================================================================
   cart.js — Panier (localStorage + Supabase si connecté) et commande
   complète dans le tiroir : lignes, récapitulatif, livraison, paiement,
   remarques, confirmation. Le même rendu sert la page panier.html.
   ========================================================================= */
(function () {
  'use strict';
  var T = window.TERANGA;
  var cfg = T.config;
  var KEY = 'teranga-cart';
  var MAX = 10;

  var PAY = [
    { id: 'wave', label: 'Wave', mobile: true },
    { id: 'orange-money', label: 'Orange Money', mobile: true },
    { id: 'free-money', label: 'Free Money', mobile: true },
    { id: 'livraison', label: 'Paiement à la livraison' },
    { id: 'carte', label: 'Carte bancaire' },
    { id: 'virement', label: 'Virement bancaire' }
  ];

  /* ============================ STORE ============================ */
  var items = T.ls.get(KEY, []).filter(function (i) { return T.byId(i.id); });
  var syncTimer;
  function save() {
    T.ls.set(KEY, items);
    clearTimeout(syncTimer);
    syncTimer = setTimeout(function () { T.api.syncCart(items); }, 800);
    document.dispatchEvent(new CustomEvent('cart:change'));
  }
  function line(i) {
    var p = T.byId(i.id);
    var s = p.sizes.find(function (x) { return x.ml === i.ml; }) || p.sizes[0];
    return { p: p, ml: s.ml, price: s.price_xof, qty: i.qty, total: s.price_xof * i.qty };
  }
  function count() { return items.reduce(function (n, i) { return n + i.qty; }, 0); }
  function subtotal() { return items.reduce(function (n, i) { return n + line(i).total; }, 0); }
  function find(id, ml) { return items.find(function (i) { return i.id === id && i.ml === ml; }); }

  /* ============================ ZONES ============================ */
  function zoneOf(city) {
    return cfg.delivery.find(function (z) { return z.cities.indexOf(city) !== -1; }) || null;
  }
  function addBusinessDays(n) {
    var d = new Date();
    while (n > 0) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0) n--; }
    return d;
  }
  function eta(zone) {
    if (!zone) return '';
    var o = { weekday: 'long', day: 'numeric', month: 'long' };
    if (zone.pickup) return 'Disponible en boutique ' + (zone.days[1] <= 1 ? 'dès demain' : '');
    var a = addBusinessDays(zone.days[0]), b = addBusinessDays(zone.days[1]);
    return 'Entre le ' + a.toLocaleDateString('fr-FR', o) + ' et le ' + b.toLocaleDateString('fr-FR', o);
  }

  /* ============================ BADGE ============================ */
  function paintBadge() {
    var n = count();
    var badge = document.getElementById('cartCount');
    var btn = document.getElementById('cartBtn');
    if (badge) { badge.hidden = n === 0; badge.firstChild.textContent = n; }
    if (btn) btn.setAttribute('aria-label', n ? 'Ouvrir le panier, ' + n + ' article' + (n > 1 ? 's' : '') : 'Ouvrir le panier, vide');
  }

  /* ======================= INSTANCE DE COMMANDE ======================= */
  function Checkout(body, foot, prefix, onClose) {
    var form = null;
    var state = { done: null };
    var P = function (n) { return prefix + '-' + n; };

    function itemsHTML() {
      return items.map(function (i, idx) {
        var l = line(i);
        return '<div class="ci" data-idx="' + idx + '">' +
          '<img class="ci__img' + (l.p.pack ? ' is-pack' : '') + '" src="' + T.esc(l.p.images[0]) + '" alt="" width="64" height="64" loading="lazy">' +
          '<div><p class="ci__maison">' + T.esc(l.p.maison) + '</p><p class="ci__name">' + T.esc(l.p.name) + '</p>' +
            '<p class="ci__meta">' + l.ml + ' ml · ' + T.fmt(l.price) + '</p>' +
            '<div class="ci__qty" role="group" aria-label="Quantité de ' + T.esc(l.p.name) + '">' +
              '<button type="button" data-dec aria-label="Retirer un exemplaire"' + (l.qty <= 1 ? ' disabled' : '') + '><i class="bi bi-dash" aria-hidden="true"></i></button>' +
              '<output aria-live="polite">' + l.qty + '</output>' +
              '<button type="button" data-inc aria-label="Ajouter un exemplaire"' + (l.qty >= MAX ? ' disabled' : '') + '><i class="bi bi-plus" aria-hidden="true"></i></button>' +
            '</div></div>' +
          '<div class="ci__side"><span class="price">' + T.fmt(l.total) + '</span>' +
            '<button class="ci__remove" type="button" data-remove aria-label="Supprimer ' + T.esc(l.p.name) + ' du panier"><i class="bi bi-trash3" aria-hidden="true"></i></button></div>' +
        '</div>';
      }).join('');
    }

    function totals() {
      var sub = subtotal();
      var z = form ? zoneOf(form.elements.ville.value) : null;
      var fee = z ? z.fee : undefined;
      var feeText = !z ? 'Calculée selon la ville' : (fee === null ? 'Sur devis' : (fee === 0 ? 'Offerte' : T.fmt(fee)));
      return { sub: sub, zone: z, fee: fee, feeText: feeText, total: sub + (typeof fee === 'number' ? fee : 0) };
    }

    function summaryHTML() {
      var t = totals();
      return '<div class="summary__row"><span>Sous-total</span><span class="price">' + T.fmt(t.sub) + '</span></div>' +
        '<div class="summary__row"><span>Livraison</span><span>' + t.feeText + '</span></div>' +
        '<div class="summary__row summary__row--total"><span>Total' + (t.fee === null ? ' hors livraison' : '') + '</span><span class="price">' + T.fmt(t.total) + '</span></div>';
    }

    function cityOptions() {
      return '<option value="">Choisir…</option>' + cfg.delivery.map(function (z) {
        return '<optgroup label="' + T.esc(z.group) + '">' + z.cities.map(function (c) {
          return '<option>' + T.esc(c) + '</option>';
        }).join('') + '</optgroup>';
      }).join('');
    }

    function field(name, label, attrs, full) {
      return '<div class="field"' + (full ? ' style="grid-column:1/-1"' : '') + ' data-f="' + name + '">' +
        '<label for="' + P(name) + '">' + label + '</label>' +
        '<input id="' + P(name) + '" name="' + name + '" aria-describedby="' + P(name) + '-err" ' + (attrs || '') + '>' +
        '<span class="err" id="' + P(name) + '-err"></span></div>';
    }

    function formHTML() {
      return '<form id="' + P('form') + '" novalidate>' +
        '<details class="step" data-step="delivery" open><summary><i class="bi bi-geo-alt" aria-hidden="true"></i>Lieu de livraison<span class="step__state"></span></summary>' +
          '<div class="step__body"><div class="form-row">' +
            field('prenom', 'Prénom', 'autocomplete="given-name" required') +
            field('nom', 'Nom', 'autocomplete="family-name" required') +
            field('telephone', 'Téléphone', 'type="tel" inputmode="tel" autocomplete="tel" placeholder="+221 77 000 00 00" required') +
            field('email', 'E-mail (reçu)', 'type="email" autocomplete="email" placeholder="facultatif"') +
          '</div>' +
          '<div class="field" data-f="ville"><label for="' + P('ville') + '">Ville</label>' +
            '<select id="' + P('ville') + '" name="ville" required aria-describedby="' + P('ville') + '-err">' + cityOptions() + '</select>' +
            '<span class="err" id="' + P('ville') + '-err"></span></div>' +
          '<div data-address>' +
            field('adresse', 'Adresse complète', 'autocomplete="street-address" placeholder="Rue, immeuble, repère" required', true) +
            field('quartier', 'Quartier / zone', 'placeholder="Almadies, Plateau, Point E…" required', true) +
          '</div></div></details>' +

        '<details class="step" data-step="payment"><summary><i class="bi bi-credit-card" aria-hidden="true"></i>Moyen de paiement<span class="step__state"></span></summary>' +
          '<div class="step__body"><fieldset><legend class="visually-hidden">Moyen de paiement</legend><div style="display:grid;gap:8px">' +
            PAY.map(function (m) {
              return '<label class="choice"><input type="radio" name="paiement" value="' + m.id + '"><span class="choice__dot" aria-hidden="true"></span><span class="choice__label">' + m.label + '</span></label>';
            }).join('') +
          '</div></fieldset><span class="err" id="' + P('paiement') + '-err" style="color:var(--error);font-size:12px"></span>' +
          '<div data-pay-extra></div></div></details>' +

        '<details class="step" data-step="remarks"><summary><i class="bi bi-chat-left-text" aria-hidden="true"></i>Remarques<span class="step__state">Facultatif</span></summary>' +
          '<div class="step__body"><div class="field"><label for="' + P('remarques') + '">Remarques</label>' +
            '<textarea id="' + P('remarques') + '" name="remarques" rows="3" maxlength="500" placeholder="Instructions de livraison, emballage cadeau, message personnel…"></textarea></div></div></details>' +
      '</form>';
    }

    function payExtra(method) {
      var m = PAY.find(function (x) { return x.id === method; });
      var box = form.querySelector('[data-pay-extra]');
      if (!m) { box.innerHTML = ''; return; }
      var z = zoneOf(form.elements.ville.value);
      if (m.mobile) {
        box.innerHTML = field('payphone', 'Numéro ' + m.label, 'type="tel" inputmode="tel" required placeholder="77 000 00 00" value="' + T.esc(form.elements.telephone.value) + '"') +
          '<p class="note">Nous envoyons la demande de paiement ' + m.label + ' sur ce numéro dès la confirmation. La commande part à réception.</p>';
      } else if (m.id === 'livraison') {
        box.innerHTML = '<p class="note">' + (z && z.pickup ? 'Vous réglez en boutique, au retrait, en espèces ou par Wave.' : 'Vous réglez au livreur, en espèces ou par Wave, à la réception. Disponible au Sénégal uniquement.') + '</p>';
      } else if (m.id === 'carte') {
        box.innerHTML = '<p class="note">Vous recevez un lien de paiement sécurisé par e-mail et WhatsApp après confirmation. Aucune donnée de carte n\'est saisie sur ce site. Renseignez votre e-mail dans « Lieu de livraison ».</p>';
      } else if (m.id === 'virement') {
        box.innerHTML = '<p class="note">Nos coordonnées bancaires vous sont envoyées avec la confirmation. La commande part à réception du virement.</p>';
      }
    }

    /* ---------- Validation ---------- */
    function phoneOk(v, abroad) {
      var d = v.replace(/\D/g, '');
      if (abroad) return d.length >= 8 && d.length <= 15;
      if (d.indexOf('221') === 0 && d.length === 12) d = d.slice(3);
      return /^(7[05-8]\d{7}|3[03]\d{7})$/.test(d);
    }
    function setErr(name, msg) {
      var wrap = form.querySelector('[data-f="' + name + '"]');
      var input = form.elements[name];
      var err = body.querySelector('#' + P(name) + '-err');
      if (input && input.setAttribute) { if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid'); }
      if (err) err.textContent = msg || '';
      return !msg;
    }
    function validate() {
      var f = form.elements, ok = true, first = null;
      var z = zoneOf(f.ville.value);
      var abroad = z && z.group === 'CEDEAO';
      var need = function (name, msg) {
        var v = (f[name] && f[name].value || '').trim();
        var good = setErr(name, v ? '' : msg);
        if (!good) { ok = false; first = first || f[name]; }
        return good;
      };
      need('prenom', 'Indiquez votre prénom.');
      need('nom', 'Indiquez votre nom.');
      if (need('telephone', 'Indiquez un numéro pour le livreur.') && !phoneOk(f.telephone.value, abroad)) {
        setErr('telephone', abroad ? 'Numéro incomplet : indiquez l\'indicatif du pays.' : 'Numéro sénégalais attendu, par exemple 77 123 45 67.');
        ok = false; first = first || f.telephone;
      }
      var method = (form.querySelector('input[name="paiement"]:checked') || {}).value;
      var em = f.email.value.trim();
      if (em && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) { setErr('email', 'Adresse e-mail incomplète, par exemple nom@domaine.sn.'); ok = false; first = first || f.email; }
      else if (method === 'carte' && !em) { setErr('email', 'Le lien de paiement par carte est envoyé à cette adresse.'); ok = false; first = first || f.email; }
      else setErr('email', '');
      need('ville', 'Choisissez une ville ou le retrait en boutique.');
      if (!(z && z.pickup)) { need('adresse', 'Indiquez l\'adresse de livraison.'); need('quartier', 'Indiquez le quartier.'); }
      else { setErr('adresse', ''); setErr('quartier', ''); }

      var perr = body.querySelector('#' + P('paiement') + '-err');
      perr.textContent = '';
      if (!method) { perr.textContent = 'Choisissez un moyen de paiement.'; ok = false; first = first || form.querySelector('input[name="paiement"]'); }
      else if (method === 'livraison' && abroad) { perr.textContent = 'Le paiement à la livraison n\'est possible qu\'au Sénégal.'; ok = false; first = first || form.querySelector('input[value="livraison"]'); }
      var m = PAY.find(function (x) { return x.id === method; });
      if (m && m.mobile) {
        if (need('payphone', 'Indiquez le numéro ' + m.label + '.') && !phoneOk(f.payphone.value, false)) {
          setErr('payphone', 'Numéro ' + m.label + ' sénégalais attendu.'); ok = false; first = first || f.payphone;
        }
      }
      // ouvrir les sections en erreur
      form.querySelectorAll('.step').forEach(function (st) {
        var bad = !!st.querySelector('[aria-invalid="true"]') || (st.dataset.step === 'payment' && !!perr.textContent);
        st.classList.toggle('has-error', bad);
        if (bad) st.open = true;
      });
      if (first) first.focus();
      return ok;
    }

    function paintStates() {
      if (!form) return;
      var f = form.elements;
      var d = form.querySelector('[data-step="delivery"] .step__state');
      var p = form.querySelector('[data-step="payment"] .step__state');
      var r = form.querySelector('[data-step="remarks"] .step__state');
      var who = [f.prenom.value, f.nom.value].join(' ').trim();
      d.textContent = [who, f.ville.value].filter(Boolean).join(' · ');
      var m = PAY.find(function (x) { return x.id === (form.querySelector('input[name="paiement"]:checked') || {}).value; });
      p.textContent = m ? m.label : '';
      r.textContent = f.remarques.value.trim() ? f.remarques.value.trim() : 'Facultatif';
    }

    function paintFoot() {
      var t = totals();
      foot.innerHTML = '<button class="btn btn--block" type="submit" form="' + P('form') + '" data-confirm>Confirmer la commande · ' + T.fmt(t.total) + '</button>' +
        '<p class="muted" style="font-size:12px;margin-top:10px;text-align:center">Aucun prélèvement en ligne : nous confirmons chaque commande par téléphone.</p>';
    }

    /* ---------- Rendus ---------- */
    function render() {
      if (state.done) return renderDone();
      if (!items.length) {
        form = null;
        body.innerHTML = '<div class="empty"><p>Votre panier est vide. Ajoutez un parfum depuis la boutique ou une fiche produit.</p>' +
          '<a class="btn" href="boutique.html">Voir la boutique</a></div>';
        foot.innerHTML = ''; foot.hidden = true;
        return;
      }
      foot.hidden = false;
      if (!form) {
        body.innerHTML = '<div data-items>' + itemsHTML() + '</div><div class="summary" data-summary>' + summaryHTML() + '</div>' + formHTML();
        form = body.querySelector('form');
        bindForm();
      } else {
        body.querySelector('[data-items]').innerHTML = itemsHTML();
        body.querySelector('[data-summary]').innerHTML = summaryHTML();
      }
      paintFoot();
    }

    function renderDone() {
      var o = state.done;
      var m = PAY.find(function (x) { return x.id === o.payment.method; });
      var next = {
        'wave': 'Surveillez votre téléphone : la demande de paiement Wave arrive au ' + o.payment.phone + '.',
        'orange-money': 'Surveillez votre téléphone : la demande Orange Money arrive au ' + o.payment.phone + '.',
        'free-money': 'Surveillez votre téléphone : la demande Free Money arrive au ' + o.payment.phone + '.',
        'livraison': o.zone.pickup ? 'Vous réglez en boutique, au retrait.' : 'Vous réglez au livreur, à la réception.',
        'carte': 'Le lien de paiement sécurisé arrive par e-mail et WhatsApp.',
        'virement': 'Nos coordonnées bancaires arrivent avec la confirmation.'
      }[o.payment.method];
      var addr = o.zone.pickup ? 'Retrait en boutique, ' + cfg.address : [o.delivery.adresse, o.delivery.quartier, o.delivery.ville].join(', ');
      var msg = 'Bonjour TERANGA, je viens de passer la commande ' + o.id + ' (' + T.fmt(o.total) + ').\n' +
        o.items.map(function (i) { return '- ' + i.name + ' ' + i.ml + ' ml x' + i.qty; }).join('\n');
      body.innerHTML = '<div class="done" tabindex="-1">' +
        '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30"/><path class="check" d="M20 33 l8 8 l16 -18"/></svg>' +
        '<p class="eyebrow">Commande enregistrée</p><p class="done__ref">' + o.id + '</p>' +
        '<p>Merci ' + T.esc(o.delivery.prenom) + '. ' + T.esc(next) + '</p>' +
        '<dl><div><dt>Livraison estimée</dt><dd>' + T.esc(eta(o.zone)) + '</dd></div>' +
        '<div><dt>Adresse</dt><dd>' + T.esc(addr) + '</dd></div>' +
        '<div><dt>Paiement</dt><dd>' + T.esc(m.label) + '</dd></div>' +
        '<div><dt>Total</dt><dd class="price">' + T.fmt(o.total) + (o.deliveryFee === null ? ' + livraison sur devis' : '') + '</dd></div></dl>' +
        '<a class="btn btn--block" href="https://wa.me/' + cfg.whatsapp + '?text=' + encodeURIComponent(msg) + '" rel="noopener" target="_blank">Suivre ma commande sur WhatsApp</a>' +
        '<button class="link-u mt-3" type="button" data-continue>Continuer mes achats</button></div>';
      foot.innerHTML = ''; foot.hidden = true;
      body.querySelector('[data-continue]').addEventListener('click', function () {
        state.done = null; render();
        if (onClose) onClose(); else location.href = 'boutique.html';
      });
      var d = body.querySelector('.done'); if (d) d.focus();
    }

    /* ---------- Événements ---------- */
    body.addEventListener('click', function (e) {
      var row = e.target.closest('.ci'); if (!row) return;
      var it = items[+row.dataset.idx]; if (!it) return;
      if (e.target.closest('[data-inc]')) { it.qty = Math.min(MAX, it.qty + 1); save(); }
      else if (e.target.closest('[data-dec]')) { it.qty = Math.max(1, it.qty - 1); save(); }
      else if (e.target.closest('[data-remove]')) {
        var name = T.byId(it.id).name;
        items.splice(+row.dataset.idx, 1); save();
        T.toast(name + ' est retiré du panier.');
      }
    });

    function bindForm() {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!validate()) return;
        var f = form.elements, t = totals();
        var method = form.querySelector('input[name="paiement"]:checked').value;
        var order = {
          id: 'TRG-' + Date.now().toString(36).slice(-5).toUpperCase() + Math.random().toString(36).slice(2, 4).toUpperCase(),
          at: new Date().toISOString(),
          items: items.map(function (i) { var l = line(i); return { id: l.p.id, name: l.p.name, maison: l.p.maison, ml: l.ml, qty: l.qty, price: l.price, image: l.p.images[0] }; }),
          subtotal: t.sub, deliveryFee: t.fee, total: t.total,
          delivery: { prenom: f.prenom.value.trim(), nom: f.nom.value.trim(), telephone: f.telephone.value.trim(), email: f.email.value.trim(),
            adresse: f.adresse.value.trim(), quartier: f.quartier.value.trim(), ville: f.ville.value },
          payment: { method: method, phone: f.payphone ? f.payphone.value.trim() : '' },
          remarks: f.remarques.value.trim(),
          status: 'En attente de paiement'
        };
        var btn = foot.querySelector('[data-confirm]');
        if (btn) { btn.disabled = true; btn.textContent = 'Enregistrement…'; }
        T.api.saveOrder(order).then(function () {
          order.zone = t.zone;
          state.done = order;
          items = []; save();
        });
      });
      form.addEventListener('change', function (e) {
        if (e.target.name === 'paiement') payExtra(e.target.value);
        if (e.target.name === 'ville') {
          var z = zoneOf(e.target.value);
          form.querySelector('[data-address]').hidden = !!(z && z.pickup);
          var checked = form.querySelector('input[name="paiement"]:checked');
          if (checked) payExtra(checked.value);
          body.querySelector('[data-summary]').innerHTML = summaryHTML();
          paintFoot();
        }
        paintStates();
      });
      form.addEventListener('input', function (e) {
        if (e.target.getAttribute('aria-invalid') === 'true') setErr(e.target.name, '');
        paintStates();
      });
    }

    document.addEventListener('cart:change', render);
    render();
    return { render: render };
  }

  /* ============================ TIROIR ============================ */
  var scrim = document.createElement('div');
  scrim.className = 'scrim';
  var drawer = document.createElement('aside');
  drawer.className = 'drawer';
  drawer.setAttribute('role', 'dialog'); drawer.setAttribute('aria-modal', 'true'); drawer.setAttribute('aria-labelledby', 'drawerTitle');
  drawer.innerHTML = '<div class="drawer__head"><h2 class="drawer__title" id="drawerTitle">Votre panier <small data-n></small></h2>' +
    '<button class="icon-btn" type="button" data-close aria-label="Fermer le panier"><i class="bi bi-x-lg" aria-hidden="true"></i></button></div>' +
    '<div class="drawer__body"></div><div class="drawer__foot"></div>';
  scrim.style.zIndex = '205'; drawer.style.zIndex = '210'; // au-dessus de la fiche produit
  document.body.appendChild(scrim); document.body.appendChild(drawer);

  var lastFocus = null, isOpen = false;
  function open() {
    if (isOpen) return;
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

  Checkout(drawer.querySelector('.drawer__body'), drawer.querySelector('.drawer__foot'), 'd', close);
  function paintHead() { var n = count(); drawer.querySelector('[data-n]').textContent = n ? '(' + n + ')' : ''; }

  document.addEventListener('cart:change', function () { paintBadge(); paintHead(); });
  paintBadge(); paintHead();

  /* ============================ API PUBLIQUE ============================ */
  T.cart = {
    add: function (id, ml, qty) {
      var p = T.byId(id); if (!p) return;
      ml = ml || p.sizes[0].ml;
      var it = find(id, ml);
      if (it) it.qty = Math.min(MAX, it.qty + (qty || 1));
      else items.unshift({ id: id, ml: ml, qty: qty || 1 });
      save();
      T.toast(p.name + ' ' + ml + ' ml est dans votre panier.');
      open();
    },
    count: count,
    items: function () { return items.slice(); },
    open: open,
    close: close,
    mountPage: function (el) {
      el.innerHTML = '<div class="checkout-body"></div><div class="drawer__foot"></div>';
      Checkout(el.querySelector('.checkout-body'), el.querySelector('.drawer__foot'), 'p', null);
    }
  };

  // Changement dans un autre onglet
  addEventListener('storage', function (e) {
    if (e.key !== KEY) return;
    items = T.ls.get(KEY, []).filter(function (i) { return T.byId(i.id); });
    document.dispatchEvent(new CustomEvent('cart:change'));
  });
})();
