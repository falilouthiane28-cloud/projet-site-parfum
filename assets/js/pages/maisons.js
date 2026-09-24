/* maisons.js — Maisons en rayon (avec parfums photographiés) + maisons sur commande */
(function () {
  'use strict';
  var T = window.TERANGA;
  var inStock = T.maisons.filter(function (m) { return !m.on_order && T.productsOf(m.name).length; })
    .sort(function (a, b) { return T.productsOf(b.name).length - T.productsOf(a.name).length || a.name.localeCompare(b.name, 'fr'); });

  document.getElementById('maisonsIntro').textContent =
    inStock.length + ' maisons, ' + T.products.length + ' parfums en rayon. Touchez une maison pour voir ses flacons.';

  document.getElementById('maisonsGrid').innerHTML = inStock.map(function (m) {
    var list = T.productsOf(m.name);
    var n = list.length;
    /* Sans logo, on compose le nom dans la police d'affichage plutôt que de
       glisser une photo de flacon au milieu d'une grille de logos : la lecture
       reste uniforme, et rien n'est emprunté à une autre marque. */
    var img = m.logo
      ? '<figure class="m-card__logo"><img src="' + T.esc(m.logo) + '" alt="Logo ' + T.esc(m.name) + '" width="600" height="375" loading="lazy" decoding="async"></figure>'
      : '<figure class="m-card__logo m-card__logo--word"><span>' + T.esc(m.name) + '</span></figure>';
    return '<a class="m-card" href="boutique.html?maison=' + encodeURIComponent(m.name) + '">' + img +
      '<div class="m-card__body"><h2 class="m-card__name">' + T.esc(m.name) + '</h2>' +
      '<p class="m-card__phrase">' + T.esc(m.pays) + ' · ' + m.annee + '. ' + T.esc(m.phrase) + '</p>' +
      '<p class="m-card__count">' + n + ' parfum' + (n > 1 ? 's' : '') + ' <span aria-hidden="true">→</span></p></div></a>';
  }).join('');

  document.getElementById('onOrder').innerHTML = T.maisons.filter(function (m) { return m.on_order; }).map(function (m) {
    return '<div><figure><img src="' + T.esc(m.logo) + '" alt="Logo ' + T.esc(m.name) + '" width="300" height="300" loading="lazy" decoding="async"></figure>' +
      '<p class="on-order__cap">' + T.esc(m.name) + '</p></div>';
  }).join('');

  T.motion.refresh();
})();
