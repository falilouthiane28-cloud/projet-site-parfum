/* parfum.js — Fiche produit dédiée : parfum.html?id=… */
(function () {
  'use strict';
  var T = window.TERANGA;
  var id = new URLSearchParams(location.search).get('id');
  var p = T.byId(id);
  var box = document.getElementById('pd');

  if (!p) {
    box.innerHTML = '<div class="catalog-empty"><p>Ce parfum n\'est plus en rayon ou le lien est incomplet. Retrouvez-le dans la boutique.</p>' +
      '<a class="btn mt-4" href="boutique.html">Voir la boutique</a></div>';
    document.getElementById('related').closest('section').hidden = true;
    return;
  }

  document.title = p.name + ' — ' + p.maison + ' · Teranga';
  var meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute('content', p.name + ' de ' + p.maison + ', ' + p.concentration.toLowerCase() + '. ' + p.description);
  document.getElementById('crumb').textContent = p.name;

  box.innerHTML = T.detail(p, 'page');
  T.bindDetail(box, p);
  document.getElementById('related').innerHTML = T.related(p, 4).map(function (x) { return T.card(x); }).join('');

  /* Entrée : la photo s'ouvre, la colonne de droite se pose dans l'ordre
     de lecture (maison, nom, prix, achat, texte, pyramide, caractéristiques). */
  if (T.motion.on && window.gsap) {
    var tl = gsap.timeline();
    tl.fromTo(box.querySelector('.pd__main'),
      { clipPath: 'inset(8% 0% 8% 0%)', autoAlpha: 0 },
      { clipPath: 'inset(0% 0% 0% 0%)', autoAlpha: 1, duration: 0.8, ease: 'power3.out' }, 0);
    tl.fromTo(box.querySelectorAll('.pd__info > *'),
      { y: 25, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.08, ease: 'expo.out' }, 0.15);
    var th = box.querySelector('.pd__thumbs');
    if (th) tl.fromTo(th, { y: 15, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, ease: 'power3.out' }, 0.5);
    // Filet : onglet en arrière-plan, l'horloge d'animation ne tourne pas —
    // la fiche doit être lisible même si l'entrée n'a jamais joué.
    setTimeout(function () { if (tl.progress() < 1) tl.progress(1).pause(); }, 3000);
  }

  T.motion.refresh();
})();
