/* panier.js — Page panier : le même parcours de commande que le tiroir
   (lignes, livraison, paiement, remarques, confirmation), monté à plat. */
(function () {
  'use strict';
  var T = window.TERANGA;
  var view = document.getElementById('cartView');
  if (!view || !T || !T.cart) return;

  T.cart.mountPage(view);
  T.motion.refresh();
})();
