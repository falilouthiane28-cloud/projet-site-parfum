/* panier.js — Vue panier + checkout (localStorage). Aucun paiement en ligne. */
(function () {
  'use strict';
  var fmt = (window.TERANGA && window.TERANGA.fmtXOF) || function (n) { return n + ' FCFA'; };
  var view = document.getElementById('cartView');
  var SHIP = 3000; // livraison Dakar

  function api() { return window.TERANGA && window.TERANGA.cart; }

  function render() {
    var cart = api() ? api().get() : [];
    if (!cart.length) {
      view.innerHTML = '<div class="empty-state" style="padding:120px 0">Votre panier est vide.<div style="margin-top:24px"><a class="btn" href="boutique.html">Voir la boutique</a></div></div>';
      return;
    }
    var sub = cart.reduce(function (s, i) { return s + i.qty * i.price; }, 0);
    var lines = cart.map(function (i, idx) {
      return '<div class="cart-line">' +
        '<img src="' + i.img + '" alt="' + i.name + '" width="90" height="112" />' +
        '<div><div class="ci-name" style="font-family:var(--font-serif);font-size:20px">' + i.name + '</div>' +
        '<div class="ci-meta muted">' + (i.maison || '') + (i.ml ? ' · ' + i.ml + ' ml' : '') + '</div>' +
        '<div class="ci-qty" style="margin-top:8px"><button data-dec="' + idx + '" aria-label="Diminuer">−</button><span>' + i.qty + '</span><button data-inc="' + idx + '" aria-label="Augmenter">+</button>' +
        '<button data-rm="' + idx + '" class="link-u" style="margin-left:16px">Retirer</button></div></div>' +
        '<div class="price">' + fmt(i.qty * i.price) + '</div></div>';
    }).join('');

    view.innerHTML =
      '<div class="cart-layout"><div>' + lines + '</div>' +
      '<aside class="summary">' +
        '<h2>Récapitulatif</h2>' +
        '<div class="summary-row"><span>Sous-total</span><span class="price">' + fmt(sub) + '</span></div>' +
        '<div class="summary-row"><span>Livraison (Dakar)</span><span class="price">' + fmt(SHIP) + '</span></div>' +
        '<div class="summary-row total"><span>Total</span><span class="price">' + fmt(sub + SHIP) + '</span></div>' +
        '<form class="form-grid" id="checkout" style="margin-top:24px" novalidate>' +
          '<div class="field"><label for="oName">Nom complet</label><input id="oName" required autocomplete="name" /></div>' +
          '<div class="field"><label for="oPhone">Téléphone / WhatsApp</label><input id="oPhone" type="tel" required autocomplete="tel" /></div>' +
          '<div class="field"><label for="oAddr">Adresse de livraison</label><input id="oAddr" autocomplete="street-address" placeholder="Quartier, rue, repère" /></div>' +
          '<div class="field"><label for="oMode">Mode</label><select id="oMode"><option value="Livraison">Livraison</option><option value="Retrait boutique">Retrait en boutique</option></select></div>' +
          '<p class="muted" style="font-size:13px">Paiement à la livraison, en boutique, ou via Wave / Orange Money après confirmation. Aucun paiement en ligne sur ce site.</p>' +
          '<button class="btn btn--wide" type="submit">Confirmer la commande</button>' +
          '<p class="err" id="coMsg" aria-live="polite"></p>' +
        '</form>' +
      '</aside></div>';

    view.querySelectorAll('[data-inc]').forEach(function (b) { b.onclick = function () { var i = +b.dataset.inc; api().setQty(i, api().get()[i].qty + 1); render(); }; });
    view.querySelectorAll('[data-dec]').forEach(function (b) { b.onclick = function () { var i = +b.dataset.dec; var q = api().get()[i].qty - 1; if (q < 1) api().remove(i); else api().setQty(i, q); render(); }; });
    view.querySelectorAll('[data-rm]').forEach(function (b) { b.onclick = function () { api().remove(+b.dataset.rm); render(); }; });

    var co = document.getElementById('checkout');
    co.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('oName'), phone = document.getElementById('oPhone');
      var msg = document.getElementById('coMsg');
      if (!name.value.trim() || !phone.value.trim()) { msg.style.color = 'var(--color-error)'; msg.textContent = 'Nom et téléphone requis.'; return; }
      var order = { id: 'TRG-' + Date.now().toString(36).toUpperCase(), items: api().get(), total: sub + SHIP, name: name.value.trim(), phone: phone.value.trim(), addr: document.getElementById('oAddr').value.trim(), mode: document.getElementById('oMode').value, status: 'En attente', at: Date.now() };
      try { var orders = JSON.parse(localStorage.getItem('teranga-orders') || '[]'); orders.unshift(order); localStorage.setItem('teranga-orders', JSON.stringify(orders)); } catch (e2) {}
      api().clear();
      var waTxt = 'Bonjour Teranga, commande ' + order.id + ' :\n' + order.items.map(function (i) { return '- ' + i.name + ' (' + i.ml + 'ml) x' + i.qty; }).join('\n') + '\nTotal : ' + fmt(order.total) + '\nNom : ' + order.name + '\nMode : ' + order.mode;
      view.innerHTML = '<div class="empty-state" style="padding:96px 0;color:var(--text)"><i class="bi bi-check-circle" style="font-size:48px;color:var(--color-gold)"></i>' +
        '<p style="margin-top:16px">Commande <strong>' + order.id + '</strong> enregistrée.</p>' +
        '<p class="muted" style="font-size:16px;max-width:44ch;margin:12px auto 0">Merci ' + order.name + '. Nous vous contactons pour confirmer la livraison et le paiement.</p>' +
        '<div style="margin-top:28px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap">' +
        '<a class="btn" href="https://wa.me/221000000000?text=' + encodeURIComponent(waTxt) + '" rel="noopener">Confirmer sur WhatsApp</a>' +
        '<a class="btn btn--ghost" href="compte.html">Voir mes commandes</a></div></div>';
    });
  }

  function boot() { if (api()) render(); else setTimeout(boot, 60); }
  boot();
})();
