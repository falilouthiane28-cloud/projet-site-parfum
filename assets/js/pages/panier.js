/* panier.js — Page panier : la liste et le récapitulatif, à plat.
   Aucune saisie ici : « Passer la commande » mène à checkout.html. */
(function () {
  'use strict';
  var T = window.TERANGA;
  var view = document.getElementById('cartView');
  if (!view || !T || !T.cart) return;

  T.cart.mountPage(view, document.getElementById('cartSum'));
  T.motion.refresh();
})();
