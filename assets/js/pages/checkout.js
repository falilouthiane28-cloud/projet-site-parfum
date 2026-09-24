/* =========================================================================
   checkout.js — Page de commande : coordonnées → livraison → paiement →
   remarques → vérification → confirmation.
   Aucun paiement n'est encaissé sur le site. La commande est enregistrée
   (localement, et dans Supabase si configuré) puis transmise à la boutique
   par un message WhatsApp pré-rempli : c'est ce message qui la fait partir.
   ========================================================================= */
(function () {
  'use strict';
  var T = window.TERANGA;
  var cfg = T.config;
  var root = document.getElementById('checkout');
  if (!root || !T.cart) return;

  var DRAFT = 'teranga-checkout-draft';   // saisie conservée si l'on revient au panier
  var LAST = 'teranga-last-order';        // dernière commande, pour survivre à un rechargement
  var PAY = cfg.payments || [];
  var steps = document.querySelectorAll('.flow-steps li');

  /* ============================ OUTILS ============================ */
  function zoneOf(city) {
    return (cfg.delivery || []).find(function (z) { return z.cities.indexOf(city) !== -1; }) || null;
  }
  function payOf(id) { return PAY.find(function (m) { return m.id === id; }) || null; }
  function payLabel(m, zone) { return m ? (zone && zone.pickup && m.pickupLabel ? m.pickupLabel : m.label) : ''; }
  function totals(city) {
    var sub = T.cart.calculateSubtotal();
    var z = zoneOf(city);
    var fee = z ? z.fee : undefined;              // undefined = ville pas encore choisie, null = sur devis
    var feeText = !z ? 'Selon la ville' : (fee === null ? 'Sur devis' : (fee === 0 ? 'Offerte' : T.fmt(fee)));
    return { sub: sub, zone: z, fee: fee, feeText: feeText, total: sub + (typeof fee === 'number' ? fee : 0) };
  }
  /* Numéro sénégalais : 70, 75, 76, 77, 78 (mobiles) ou 33 (fixe), avec ou sans 221 */
  function phoneOk(v, abroad) {
    var d = String(v).replace(/\D/g, '');
    if (abroad) return d.length >= 8 && d.length <= 15;
    if (d.indexOf('00221') === 0) d = d.slice(5);
    else if (d.indexOf('221') === 0 && d.length === 12) d = d.slice(3);
    return /^(7[05-8]\d{7}|33\d{7})$/.test(d);
  }
  var h1 = document.querySelector('main h1');
  var H1 = ['Votre panier', 'Finaliser la commande', 'Confirmation'];
  function setStep(k) {
    if (h1) h1.textContent = H1[k];
    steps.forEach(function (li, i) {
      li.classList.toggle('is-done', i < k);
      if (i === k) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
    });
  }
  function scrollTop() { window.scrollTo({ top: 0, behavior: T.reduced ? 'auto' : 'smooth' }); }

  /* ============================ GABARITS ============================ */
  function cityOptions(sel) {
    return '<option value="">Choisir une ville…</option>' + (cfg.delivery || []).map(function (z) {
      return '<optgroup label="' + T.esc(z.group) + '">' + z.cities.map(function (c) {
        return '<option' + (c === sel ? ' selected' : '') + '>' + T.esc(c) + '</option>';
      }).join('') + '</optgroup>';
    }).join('');
  }
  function field(name, label, attrs, hint) {
    return '<div class="co-field" data-f="' + name + '">' +
      '<label for="co-' + name + '">' + label + '</label>' +
      '<input id="co-' + name + '" name="' + name + '" aria-describedby="co-' + name + '-err' + (hint ? ' co-' + name + '-hint' : '') + '" ' + attrs + '>' +
      (hint ? '<p class="co-hint" id="co-' + name + '-hint">' + hint + '</p>' : '') +
      '<p class="co-err" id="co-' + name + '-err" aria-live="polite"></p></div>';
  }

  function formHTML(d) {
    return '<form class="co-form" id="coForm" novalidate>' +
      '<fieldset class="co-sec"><legend><span class="co-sec__n">1</span>Vos coordonnées</legend>' +
        '<div class="co-grid">' +
          field('nom', 'Nom complet', 'autocomplete="name" placeholder="Votre nom complet" required') +
          field('telephone', 'Téléphone', 'type="tel" inputmode="tel" autocomplete="tel" placeholder="Ex. 77 123 45 67" required', 'Le livreur et la boutique vous joignent sur ce numéro.') +
        '</div></fieldset>' +

      '<fieldset class="co-sec"><legend><span class="co-sec__n">2</span>Livraison</legend>' +
        '<div class="co-grid">' +
          '<div class="co-field" data-f="ville"><label for="co-ville">Ville</label>' +
            '<select id="co-ville" name="ville" required aria-describedby="co-ville-err co-ville-hint">' + cityOptions(d.ville) + '</select>' +
            '<p class="co-hint" id="co-ville-hint" data-eta></p>' +
            '<p class="co-err" id="co-ville-err" aria-live="polite"></p></div>' +
          '<div data-address class="co-grid co-grid--full">' +
            field('quartier', 'Quartier', 'autocomplete="address-level3" placeholder="Almadies, Plateau, Point E…" required') +
            field('adresse', 'Adresse de livraison', 'autocomplete="street-address" placeholder="Quartier, rue, numéro ou repère" required') +
          '</div>' +
        '</div></fieldset>' +

      '<fieldset class="co-sec" aria-describedby="co-paiement-err"><legend><span class="co-sec__n">3</span>Paiement</legend>' +
        '<div class="co-pay" role="radiogroup" aria-label="Moyen de paiement">' +
          PAY.map(function (m) {
            return '<label class="co-choice" data-pay="' + m.id + '"><input type="radio" name="paiement" value="' + m.id + '"' + (d.paiement === m.id ? ' checked' : '') + '>' +
              '<span class="co-choice__dot" aria-hidden="true"></span>' +
              '<span class="co-choice__txt"><span class="co-choice__label">' + T.esc(m.label) + '</span><span class="co-choice__hint">' + T.esc(m.hint || '') + '</span></span></label>';
          }).join('') +
        '</div>' +
        '<p class="co-err" id="co-paiement-err" aria-live="polite"></p>' +
        '<p class="co-note">Aucun paiement n\'est prélevé sur ce site. Après votre commande, la boutique vous confirme la disponibilité et vous indique comment régler.</p>' +
      '</fieldset>' +

      '<fieldset class="co-sec"><legend><span class="co-sec__n">4</span>Remarques <span class="co-opt">Facultatif</span></legend>' +
        '<div class="co-field" data-f="remarques"><label for="co-remarques" class="visually-hidden">Remarques</label>' +
          '<textarea id="co-remarques" name="remarques" rows="3" maxlength="500" placeholder="Instructions particulières pour la livraison, emballage cadeau…"></textarea></div>' +
      '</fieldset>' +

      '<div class="co-actions"><button class="btn btn--block" type="submit">Vérifier ma commande</button>' +
        '<a class="link-u" href="panier.html">Modifier le panier</a></div>' +
    '</form>';
  }

  function linesHTML(compact) {
    return '<ul class="co-lines">' + T.cart.lines().map(function (l) {
      return '<li class="co-line">' +
        '<img src="' + T.esc(l.image) + '" alt="" width="56" height="70" loading="lazy" decoding="async" class="' + (l.pack ? 'is-pack' : '') + '" onerror="this.onerror=null;this.removeAttribute(\'src\')">' +
        '<div class="co-line__info"><p class="co-line__name">' + T.esc(l.name) + '</p>' +
          '<p class="co-line__meta">' + l.ml + ' ml · ' + l.qty + ' × ' + T.fmt(l.price) + '</p></div>' +
        '<p class="price">' + T.fmt(l.total) + '</p></li>';
    }).join('') + '</ul>';
  }
  function totalsHTML(t) {
    return '<dl class="co-totals">' +
      '<div><dt>Sous-total</dt><dd class="price">' + T.fmt(t.sub) + '</dd></div>' +
      '<div><dt>Livraison</dt><dd>' + t.feeText + '</dd></div>' +
      '<div class="co-totals__total"><dt>Total' + (t.fee === null ? ' <span class="muted">hors livraison</span>' : '') + '</dt><dd class="price">' + T.fmt(t.total) + '</dd></div>' +
    '</dl>';
  }

  /* ============================ ÉTAT ============================ */
  var draft = T.ls.get(DRAFT, {}) || {};
  var form = null, sumEl = null, submitting = false;

  function saveDraft() {
    if (!form) return;
    var f = form.elements;
    draft = {
      nom: f.nom.value, telephone: f.telephone.value, ville: f.ville.value,
      quartier: f.quartier.value, adresse: f.adresse.value,
      paiement: (form.querySelector('input[name="paiement"]:checked') || {}).value || '',
      remarques: f.remarques.value
    };
    T.ls.set(DRAFT, draft);
  }

  /* ============================ ÉCRANS ============================ */
  function renderEmpty() {
    setStep(0);
    root.innerHTML = '<div class="cart-empty">' +
      '<p class="eyebrow">Commande</p><p class="cart-empty__title">Votre panier est vide.</p>' +
      '<p class="cart-empty__text">Ajoutez un parfum pour passer commande.</p>' +
      '<a class="btn" href="boutique.html">Découvrir les parfums</a></div>';
  }

  function paintSummary() {
    if (!sumEl) return;
    var t = totals(form ? form.elements.ville.value : draft.ville);
    var n = T.cart.count();
    sumEl.innerHTML = '<details class="co-sum" ' + (matchMedia('(min-width: 960px)').matches ? 'open' : '') + '>' +
      '<summary><span>Récapitulatif <span class="muted">· ' + n + ' article' + (n > 1 ? 's' : '') + '</span></span><span class="price">' + T.fmt(t.total) + '</span></summary>' +
      '<div class="co-sum__body">' + linesHTML() + totalsHTML(t) +
        '<a class="link-u co-sum__edit" href="panier.html">Modifier le panier</a></div></details>';
  }

  function renderForm() {
    setStep(1);
    root.innerHTML = '<div class="co">' + '<div class="co__main">' + formHTML(draft) + '</div>' + '<aside class="co__side" aria-label="Récapitulatif de commande"></aside></div>';
    form = root.querySelector('#coForm');
    sumEl = root.querySelector('.co__side');
    var f = form.elements;
    ['nom', 'telephone', 'quartier', 'adresse', 'remarques'].forEach(function (k) { if (draft[k]) f[k].value = draft[k]; });
    onCity(false);
    paintSummary();

    form.addEventListener('input', function (e) {
      if (e.target.getAttribute('aria-invalid') === 'true') setErr(e.target.name, '');
      saveDraft();
    });
    form.addEventListener('change', function (e) {
      if (e.target.name === 'ville') { onCity(true); paintSummary(); }
      if (e.target.name === 'paiement') setErr('paiement', '');
      saveDraft();
    });
    // Validation douce : à la sortie d'un champ déjà rempli, pas pendant la frappe
    form.addEventListener('focusout', function (e) {
      var n = e.target.name;
      if (n === 'telephone' && e.target.value.trim()) checkPhone();
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (validateCheckout()) renderReview();
    });
  }

  function onCity(fromUser) {
    var z = zoneOf(form.elements.ville.value);
    var pickup = !!(z && z.pickup), abroad = !!(z && z.group === 'CEDEAO');
    form.querySelector('[data-address]').hidden = pickup;
    var eta = form.querySelector('[data-eta]');
    eta.textContent = !z ? (cfg.delivery || []).map(function (g) {
        return g.pickup ? 'retrait en boutique offert' : g.group + ' ' + (g.fee === null ? 'sur devis' : T.fmt(g.fee));
      }).join(' · ') + '.'
      : z.pickup ? 'Retrait offert, ' + cfg.address + '.'
      : (z.fee === null ? 'Frais de livraison sur devis' : 'Livraison ' + T.fmt(z.fee)) + ' · ' + z.days[0] + ' à ' + z.days[1] + ' jours ouvrés.';
    // Libellés et disponibilité des moyens de paiement selon la zone
    PAY.forEach(function (m) {
      var lab = form.querySelector('[data-pay="' + m.id + '"]');
      lab.querySelector('.co-choice__label').textContent = payLabel(m, z);
      var off = !!(m.senegalOnly && abroad);
      lab.classList.toggle('is-off', off);
      var input = lab.querySelector('input');
      input.disabled = off;
      if (off && input.checked) input.checked = false;
    });
    if (fromUser) setErr('ville', '');
  }

  /* ============================ VALIDATION ============================ */
  function setErr(name, msg) {
    var err = root.querySelector('#co-' + name + '-err');
    var input = form && form.elements[name];
    if (input && input.setAttribute && !(input instanceof RadioNodeList)) {
      if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
    }
    var wrap = root.querySelector('[data-f="' + name + '"]');
    if (wrap) wrap.classList.toggle('has-error', !!msg);
    if (err) err.textContent = msg || '';
    return !msg;
  }
  function checkPhone() {
    var f = form.elements, z = zoneOf(f.ville.value);
    var v = f.telephone.value.trim();
    if (!v) return setErr('telephone', 'Veuillez renseigner votre numéro de téléphone.');
    if (!phoneOk(v, z && z.group === 'CEDEAO')) {
      return setErr('telephone', z && z.group === 'CEDEAO' ? 'Numéro incomplet : ajoutez l\'indicatif du pays.' : 'Numéro sénégalais attendu, par exemple 77 123 45 67.');
    }
    return setErr('telephone', '');
  }
  function validateCheckout() {
    var f = form.elements, first = null;
    var z = zoneOf(f.ville.value);
    var mark = function (ok, el) { if (!ok && !first) first = el; };
    mark(setErr('nom', f.nom.value.trim().length >= 2 ? '' : 'Veuillez renseigner votre nom complet.'), f.nom);
    mark(checkPhone(), f.telephone);
    mark(setErr('ville', z ? '' : 'Veuillez choisir une ville ou le retrait en boutique.'), f.ville);
    if (!(z && z.pickup)) {
      mark(setErr('quartier', f.quartier.value.trim() ? '' : 'Veuillez indiquer votre quartier.'), f.quartier);
      mark(setErr('adresse', f.adresse.value.trim().length >= 4 ? '' : 'Veuillez indiquer l\'adresse de livraison.'), f.adresse);
    } else { setErr('quartier', ''); setErr('adresse', ''); }
    var pay = form.querySelector('input[name="paiement"]:checked');
    mark(setErr('paiement', pay ? '' : 'Veuillez choisir un moyen de paiement.'), form.querySelector('input[name="paiement"]:not([disabled])'));
    if (first) { first.focus(); first.scrollIntoView({ block: 'center', behavior: T.reduced ? 'auto' : 'smooth' }); return false; }
    return true;
  }

  /* ============================ VÉRIFICATION ============================ */
  function snapshot() {
    saveDraft();
    var t = totals(draft.ville), z = t.zone, m = payOf(draft.paiement);
    return {
      t: t, zone: z, pay: m,
      address: z && z.pickup ? 'Retrait en boutique — ' + cfg.address : draft.adresse.trim(),
      ville: z && z.pickup ? 'Almadies, Dakar' : draft.ville
    };
  }

  function renderReview() {
    var s = snapshot();
    setStep(1);
    var row = function (label, value, target) {
      return '<div><dt>' + label + '</dt><dd>' + T.esc(value) + '</dd>' +
        (target ? '<dd class="co-review__edit"><button class="link-u" type="button" data-edit="' + target + '">Modifier<span class="visually-hidden"> ' + label + '</span></button></dd>' : '') + '</div>';
    };
    root.innerHTML = '<div class="co co--review">' +
      '<div class="co__main"><section class="co-review" aria-labelledby="coReviewTitle" tabindex="-1">' +
        '<p class="eyebrow">Dernière étape</p><h2 class="co-review__title" id="coReviewTitle">Vérifiez votre commande</h2>' +
        '<h3 class="co-review__h">Articles <a class="link-u" href="panier.html">Modifier</a></h3>' + linesHTML() + totalsHTML(s.t) +
        '<h3 class="co-review__h">Livraison et paiement</h3><dl class="co-review__dl">' +
          row('Nom', draft.nom.trim(), 'nom') +
          row('Téléphone', draft.telephone.trim(), 'telephone') +
          row('Adresse', s.address, s.zone && s.zone.pickup ? 'ville' : 'adresse') +
          row('Ville / quartier', s.ville + (s.zone && !s.zone.pickup && draft.quartier ? ' — ' + draft.quartier.trim() : ''), 'ville') +
          row('Paiement', payLabel(s.pay, s.zone), 'paiement') +
          row('Remarque', draft.remarques.trim() || 'Aucune', 'remarques') +
        '</dl>' +
        '<div class="co-confirm">' +
          '<p class="co-note">En confirmant, votre commande est enregistrée puis envoyée à la boutique sur WhatsApp (' + T.esc(cfg.phoneDisplay) + '). Nous vous rappelons pour la valider et organiser le paiement.</p>' +
          '<button class="btn btn--block" type="button" data-confirm>Confirmer la commande</button>' +
          '<button class="link-u" type="button" data-back>Revenir aux informations</button>' +
        '</div>' +
      '</section></div></div>';
    var sec = root.querySelector('.co-review');
    sec.focus({ preventScroll: true }); scrollTop();

    root.querySelector('[data-back]').addEventListener('click', function () { renderForm(); scrollTop(); });
    root.querySelectorAll('[data-edit]').forEach(function (b) {
      b.addEventListener('click', function () {
        renderForm();
        var el = b.dataset.edit === 'paiement' ? form.querySelector('input[name="paiement"]:checked') : form.elements[b.dataset.edit];
        if (el) { el.focus(); el.scrollIntoView({ block: 'center' }); }
      });
    });
    root.querySelector('[data-confirm]').addEventListener('click', function (e) { submitOrder(e.currentTarget, s); });
  }

  /* ============================ ENVOI ============================ */
  function whatsappText(o) {
    var L = ['Bonjour TERANGA,', '', 'Je souhaite passer la commande suivante (réf. ' + o.id + ') :', ''];
    o.items.forEach(function (i) {
      L.push('- ' + i.name + ' (' + i.maison + ', ' + i.ml + ' ml) x ' + i.qty);
      L.push('  Prix : ' + T.fmt(i.price) + (i.qty > 1 ? ' l\'unité, ' + T.fmt(i.price * i.qty) + ' au total' : ''));
    });
    L.push('', 'Sous-total : ' + T.fmt(o.subtotal));
    L.push('Livraison : ' + (o.deliveryFee === null ? 'sur devis' : o.deliveryFee === 0 ? 'offerte' : T.fmt(o.deliveryFee)));
    L.push('Total : ' + T.fmt(o.total) + (o.deliveryFee === null ? ' (hors livraison)' : ''));
    L.push('', 'Informations client :', '');
    L.push('Nom : ' + o.delivery.nom);
    L.push('Téléphone : ' + o.delivery.telephone);
    L.push('Adresse : ' + o.delivery.adresse);
    L.push('Ville / Quartier : ' + o.delivery.ville + (o.delivery.quartier ? ' — ' + o.delivery.quartier : ''));
    L.push('Moyen de paiement : ' + o.payment.label);
    L.push('', 'Remarque :', o.remarks || 'Aucune', '', 'Merci.');
    return L.join('\n');
  }
  function waLink(o) { return 'https://wa.me/' + cfg.whatsapp + '?text=' + encodeURIComponent(whatsappText(o)); }

  function submitOrder(btn, s) {
    if (submitting) return;                 // double clic, double tap
    if (!T.cart.count()) { renderEmpty(); return; }
    submitting = true;
    btn.disabled = true; btn.classList.add('is-busy');
    btn.innerHTML = '<span class="spin" aria-hidden="true"></span>Envoi de la commande…';

    var lines = T.cart.lines();
    var order = {
      id: 'TRG-' + Date.now().toString(36).slice(-5).toUpperCase() + Math.random().toString(36).slice(2, 4).toUpperCase(),
      at: new Date().toISOString(),
      items: lines.map(function (l) { return { id: l.id, name: l.name, maison: l.maison, ml: l.ml, qty: l.qty, price: l.price, image: l.image }; }),
      subtotal: s.t.sub, deliveryFee: s.t.fee === undefined ? null : s.t.fee, total: s.t.total,
      delivery: { nom: draft.nom.trim(), telephone: draft.telephone.trim(), email: '',
        adresse: s.address, quartier: s.zone && s.zone.pickup ? '' : draft.quartier.trim(), ville: s.ville },
      payment: { method: s.pay.id, label: payLabel(s.pay, s.zone), phone: draft.telephone.trim() },
      remarks: draft.remarques.trim(),
      status: 'Envoyée sur WhatsApp — en attente de confirmation'
    };

    /* WhatsApp s'ouvre dans le geste de l'utilisateur (sinon le navigateur
       bloque la fenêtre). Si c'est bloqué, l'écran suivant propose le lien. */
    var link = waLink(order);
    var win = null;
    try { win = window.open(link, '_blank'); if (win) win.opener = null; } catch (err) { win = null; }

    Promise.resolve(T.api && T.api.saveOrder ? T.api.saveOrder(order) : null)
      .catch(function () { /* l'envoi WhatsApp reste la voie principale */ })
      .then(function () {
        order.whatsapp = link;
        try { sessionStorage.setItem(LAST, JSON.stringify(order)); } catch (err) { /* navigation privée */ }
        T.cart.clear();
        try { localStorage.removeItem(DRAFT); } catch (err) { /* idem */ }
        draft = {};
        submitting = false;
        renderDone(order, !!win);
      });
  }

  function renderDone(o, opened) {
    setStep(2);
    var n = o.items.reduce(function (k, i) { return k + i.qty; }, 0);
    root.innerHTML = '<section class="co-done" tabindex="-1" aria-labelledby="coDoneTitle">' +
      '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30"/><path class="check" d="M20 33 l8 8 l16 -18"/></svg>' +
      '<p class="eyebrow">Commande ' + T.esc(o.id) + '</p>' +
      '<h2 class="co-done__title" id="coDoneTitle">Merci ' + T.esc(o.delivery.nom.split(' ')[0]) + ', votre commande est prête.</h2>' +
      '<p class="co-done__text">' + (opened
        ? 'WhatsApp s\'est ouvert avec le détail de votre commande : envoyez le message pour la transmettre à la boutique. Nous vous rappelons au ' + T.esc(o.delivery.telephone) + ' pour la confirmer.'
        : 'Dernière étape : envoyez-la à la boutique sur WhatsApp. Le message est déjà rédigé ; nous vous rappelons ensuite au ' + T.esc(o.delivery.telephone) + ' pour la confirmer.') + '</p>' +
      '<a class="btn" href="' + T.esc(o.whatsapp) + '" target="_blank" rel="noopener"><i class="bi bi-whatsapp" aria-hidden="true"></i>' + (opened ? 'Rouvrir WhatsApp' : 'Envoyer sur WhatsApp') + '</a>' +
      '<dl class="co-done__dl">' +
        '<div><dt>Articles</dt><dd>' + n + '</dd></div>' +
        '<div><dt>' + (o.delivery.quartier ? 'Livraison' : 'Retrait') + '</dt><dd>' + T.esc(o.delivery.adresse) + '</dd></div>' +
        '<div><dt>Paiement</dt><dd>' + T.esc(o.payment.label) + '</dd></div>' +
        '<div><dt>Total</dt><dd class="price">' + T.fmt(o.total) + (o.deliveryFee === null ? ' + livraison' : '') + '</dd></div>' +
      '</dl>' +
      '<p class="co-done__more"><a class="link-u" href="boutique.html">Continuer mes achats</a> <span aria-hidden="true">·</span> <a class="link-u" href="compte.html#commandes">Mes commandes</a></p>' +
    '</section>';
    var d = root.querySelector('.co-done'); d.focus({ preventScroll: true }); scrollTop();
  }

  /* ============================ DÉMARRAGE ============================ */
  function boot() {
    var last = null;
    try { last = JSON.parse(sessionStorage.getItem(LAST) || 'null'); } catch (e) { last = null; }
    if (!T.cart.count()) { if (last) renderDone(last, true); else renderEmpty(); return; }
    renderForm();
  }
  // Si le panier change ailleurs (autre onglet), l'écran suit
  document.addEventListener('cart:change', function () {
    if (submitting) return;
    if (!T.cart.count()) { if (!root.querySelector('.co-done')) renderEmpty(); return; }
    if (form && root.contains(form)) paintSummary();
  });
  boot();
})();
