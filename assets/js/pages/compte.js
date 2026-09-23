/* compte.js — Espace client local (sans mot de passe). Profil, commandes, désirs. */
(function () {
  'use strict';
  var fmt = (window.TERANGA && window.TERANGA.fmtXOF) || function (n) { return n + ' FCFA'; };
  var view = document.getElementById('accountView');
  var tab = 'orders';

  function getUser() { try { return JSON.parse(localStorage.getItem('teranga-user') || 'null'); } catch (e) { return null; } }
  function setUser(u) { try { localStorage.setItem('teranga-user', JSON.stringify(u)); } catch (e) {} }
  function getOrders() { try { return JSON.parse(localStorage.getItem('teranga-orders') || '[]'); } catch (e) { return []; } }
  function getWish() { try { return JSON.parse(localStorage.getItem('teranga-wishlist') || '[]'); } catch (e) { return []; } }

  function renderAuth() {
    view.innerHTML =
      '<div class="auth-box" data-reveal>' +
        '<p class="muted">Identifiez-vous pour retrouver vos commandes et votre liste de désirs. Aucun mot de passe : votre espace reste sur cet appareil.</p>' +
        '<form class="form-grid mt-4" id="authForm" novalidate>' +
          '<div class="field"><label for="aName">Nom</label><input id="aName" required autocomplete="name" /></div>' +
          '<div class="field"><label for="aEmail">E-mail</label><input id="aEmail" type="email" required autocomplete="email" /><span class="err" id="aErr"></span></div>' +
          '<button class="btn" type="submit">Accéder à mon espace</button>' +
        '</form></div>';
    document.getElementById('authForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var n = document.getElementById('aName').value.trim(), em = document.getElementById('aEmail').value.trim();
      if (!n || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) { document.getElementById('aErr').textContent = 'Nom et e-mail valides requis.'; return; }
      setUser({ name: n, email: em });
      renderDash();
    });
    if (window.TERANGA && window.TERANGA.motionRefresh) window.TERANGA.motionRefresh();
  }

  function renderDash() {
    var u = getUser();
    var tabs = [['orders', 'Commandes'], ['wishlist', 'Liste de désirs'], ['profile', 'Profil']];
    var body = '';
    if (tab === 'orders') {
      var orders = getOrders();
      body = orders.length ? orders.map(function (o) {
        return '<article class="maison-card" style="margin-bottom:16px"><div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px">' +
          '<strong style="font-family:var(--font-serif);font-size:18px">' + o.id + '</strong>' +
          '<span class="chip" aria-pressed="false" style="pointer-events:none">' + o.status + '</span></div>' +
          '<p class="muted" style="margin-top:8px">' + new Date(o.at).toLocaleDateString('fr-FR') + ' · ' + o.mode + ' · ' + o.items.reduce(function (s, i) { return s + i.qty; }, 0) + ' article(s)</p>' +
          '<p class="price" style="margin-top:8px">' + fmt(o.total) + '</p></article>';
      }).join('') : '<p class="empty-state">Aucune commande pour l\'instant. <a class="link-u" href="boutique.html">Explorer la boutique</a></p>';
    } else if (tab === 'wishlist') {
      var w = getWish();
      body = w.length ? '<div class="catalog">' + w.map(function (i) {
        return '<article class="p-card"><a class="p-card__media" href="parfum.html?id=' + i.id + '"><img src="' + i.img + '" alt="' + i.name + '" width="480" height="600" /></a>' +
          '<div class="p-card__body"><span class="p-card__maison">' + (i.maison || '') + '</span><h3 class="p-card__name">' + i.name + '</h3></div></article>';
      }).join('') + '</div>' : '<p class="empty-state">Votre liste de désirs est vide.</p>';
    } else {
      body = '<div class="auth-box"><div class="field"><label>Nom</label><input value="' + u.name + '" id="pName" /></div>' +
        '<div class="field mt-3"><label>E-mail</label><input value="' + u.email + '" id="pEmail" /></div>' +
        '<div style="display:flex;gap:12px;margin-top:24px"><button class="btn" id="saveProfile">Enregistrer</button>' +
        '<button class="btn btn--ghost" id="logout">Se déconnecter</button></div></div>';
    }

    view.innerHTML =
      '<p class="muted">Bonjour, <strong>' + u.name + '</strong>.</p>' +
      '<div class="account-tabs" role="tablist">' + tabs.map(function (t) {
        return '<button class="account-tab" role="tab" data-tab="' + t[0] + '" aria-selected="' + (t[0] === tab) + '">' + t[1] + '</button>';
      }).join('') + '</div>' +
      '<div role="tabpanel">' + body + '</div>';

    view.querySelectorAll('.account-tab').forEach(function (b) { b.addEventListener('click', function () { tab = b.dataset.tab; renderDash(); }); });
    var sp = document.getElementById('saveProfile');
    if (sp) sp.addEventListener('click', function () { setUser({ name: document.getElementById('pName').value.trim(), email: document.getElementById('pEmail').value.trim() }); renderDash(); });
    var lo = document.getElementById('logout');
    if (lo) lo.addEventListener('click', function () { try { localStorage.removeItem('teranga-user'); } catch (e) {} tab = 'orders'; renderAuth(); });
  }

  function boot() { getUser() ? renderDash() : renderAuth(); }
  boot();
})();
