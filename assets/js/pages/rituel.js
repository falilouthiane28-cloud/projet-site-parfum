/* rituel.js — 6 questions, une par écran. Le score se calcule sur les notes
   réelles de chaque parfum ; la matière à éviter retire des points. */
(function () {
  'use strict';
  var T = window.TERANGA;
  var gsap = window.gsap;

  /* Étiquettes déduites des notes de chaque parfum */
  var LEX = {
    oud: /oud|agar/i,
    vanille: /vanille|tonka|praline|caramel|miel|crème|lait|sucre|châtaigne/i,
    ambre: /ambre|benjoin|labdanum|myrrhe|ciste/i,
    epice: /safran|cannelle|poivre|cardamome|muscade|épices|gingembre|anis/i,
    agrume: /bergamote|citron|pamplemousse|orange|mandarine|chinotto|zeste/i,
    fleur: /rose|jasmin|iris|néroli|fleur|tubéreuse|orchidée|violette|géranium|muguet|osmanthus|cyclamen|héliotrope/i,
    bois: /cèdre|santal|vétiver|bois|patchouli|cypriol|bouleau|palissandre|gaïac/i,
    frais: /menthe|marines|aquatiques|lavande|figuier|genévrier|romarin|sauge|pin|silex|petit-grain/i,
    fruit: /ananas|pomme|litchi|poire|cassis|fruits|cerise|dattes|figue/i,
    tabac: /tabac|café|cacao|rhum|cuir/i
  };
  function tagsOf(p) {
    var all = p.notes.top.concat(p.notes.heart, p.notes.base).join(' | ');
    var t = {};
    Object.keys(LEX).forEach(function (k) { var m = all.match(new RegExp(LEX[k].source, 'gi')); if (m) t[k] = m.length; });
    return t;
  }

  var Q = [
    { q: 'À quel moment le portez-vous le plus ?', o: [
      ['Le matin, avant le bureau', 'Net et discret', { frais: 2, agrume: 2, fleur: 1 }],
      ['L\'après-midi, en plein soleil', 'Léger, qui respire', { frais: 2, fruit: 1, agrume: 1 }],
      ['Le soir, à table', 'Chaud, enveloppant', { ambre: 2, vanille: 1, epice: 1 }],
      ['La nuit, tard', 'Dense, qui reste', { oud: 2, tabac: 2, ambre: 1 }]] },
    { q: 'Quel souvenir vous ressemble ?', o: [
      ['Le thiouraye qui brûle à la maison', 'Résine, fumée, encens', { oud: 2, ambre: 2, epice: 1 }],
      ['Une pâtisserie qui sort du four', 'Sucre, beurre, vanille', { vanille: 3, fruit: 1 }],
      ['Le linge qui sèche au vent', 'Propre, lumineux', { frais: 2, fleur: 1, agrume: 1 }],
      ['Un jasmin le soir, dans une cour', 'Fleur blanche, peau chaude', { fleur: 3 }]] },
    { q: 'Quelle impression voulez-vous laisser ?', o: [
      ['Qu\'on se retourne sur votre passage', 'Un sillage qui porte', { fort: 3 }],
      ['Une présence pour les intimes', 'Près de la peau', { doux: 3 }],
      ['De la chaleur, de la douceur', 'On a envie de s\'approcher', { vanille: 2, ambre: 1 }],
      ['De la netteté, de l\'assurance', 'Tenue impeccable', { bois: 2, agrume: 1 }]] },
    { q: 'Quelle matière aimez-vous le plus ?', o: [
      ['L\'oud et l\'encens', 'Le bois qui fume', { oud: 3 }],
      ['La vanille et le caramel', 'Le gourmand assumé', { vanille: 3 }],
      ['Les agrumes et la menthe', 'Le frais qui réveille', { agrume: 2, frais: 1 }],
      ['La rose et le jasmin', 'Les grandes fleurs', { fleur: 3 }]] },
    { q: 'Une matière à éviter ?', hint: 'Les parfums qui la mettent en avant descendent dans le classement.', o: [
      ['Aucune', 'Je veux tout essayer', {}],
      ['Le sucré', 'Pas de vanille ni de caramel', { vanille: -4, fruit: -1 }],
      ['L\'oud', 'Pas de bois fumé', { oud: -4 }],
      ['Les fleurs', 'Pas de rose ni de jasmin', { fleur: -4 }]] },
    { q: 'Pour quelle occasion ?', o: [
      ['Tous les jours', 'Au bureau comme le week-end', { frais: 1, bois: 1, quotidien: 2 }],
      ['Un mariage, une cérémonie', 'Il doit tenir jusqu\'au bout', { ambre: 2, oud: 1, fort: 2 }],
      ['Un rendez-vous', 'Pour quelqu\'un en particulier', { vanille: 1, fleur: 1, epice: 1 }],
      ['Un cadeau', 'Pour quelqu\'un d\'autre', { cadeau: 2, fleur: 1, vanille: 1 }]] }
  ];

  var PROFILES = {
    oud: ['L\'oud et la résine', 'Vous aimez ce qui fume et ce qui dure. Les ouds safranés et les ambres résineux vous vont.'],
    vanille: ['La gourmandise chaude', 'Vanille, caramel, praline : vous cherchez la chaleur qui donne envie de s\'approcher.'],
    fleur: ['Les grandes fleurs', 'Rose, jasmin, fleur d\'oranger : des bouquets francs, qui se portent de jour comme de nuit.'],
    frais: ['La fraîcheur nette', 'Menthe, notes marines, lavande : des parfums qui respirent sous la chaleur de Dakar.'],
    agrume: ['Les agrumes', 'Bergamote, citron, pamplemousse : l\'éclat du matin, sur un fond propre.'],
    bois: ['Les bois secs', 'Cèdre, santal, vétiver : la structure avant tout, sans sucre inutile.'],
    ambre: ['L\'ambre', 'Benjoin, labdanum, ambre : une chaleur ronde qui s\'installe lentement.'],
    epice: ['Les épices', 'Safran, poivre, cannelle : du relief, de la chaleur, du caractère.'],
    tabac: ['Le tabac et le café', 'Tabac blond, café, rhum : des parfums bruns, pour le soir.'],
    fruit: ['Le fruit mûr', 'Ananas, pomme, litchi : de l\'éclat et de la gourmandise, sans lourdeur.']
  };

  var box = document.getElementById('quiz');
  var answers = [];
  var step = 0;

  function score() {
    var w = {};
    answers.forEach(function (a) { Object.keys(a).forEach(function (k) { w[k] = (w[k] || 0) + a[k]; }); });
    var ranked = T.products.map(function (p) {
      var t = tagsOf(p), s = 0;
      Object.keys(LEX).forEach(function (k) { if (t[k] && w[k]) s += w[k] * Math.min(2, t[k]); });
      if (w.fort) s += w.fort * (p.sillage >= 4.5 ? 1 : p.sillage >= 4 ? 0.4 : -0.5);
      if (w.doux) s += w.doux * (p.sillage <= 3.5 ? 1 : p.sillage <= 4 ? 0.3 : -0.6);
      if (w.quotidien) s += w.quotidien * (T.priceFrom(p) <= 100000 ? 0.8 : 0);
      if (w.cadeau) s += w.cadeau * (p.featured ? 0.8 : 0);
      if (p.featured) s += 0.2;
      return { p: p, s: s };
    }).sort(function (a, b) { return b.s - a.s; });
    var picks = [], per = {};
    ranked.forEach(function (r) {
      if (picks.length < 3 && (per[r.p.maison] || 0) < 2) { picks.push(r.p); per[r.p.maison] = (per[r.p.maison] || 0) + 1; }
    });
    var dom = Object.keys(LEX).sort(function (a, b) { return (w[b] || 0) - (w[a] || 0); })[0];
    return { picks: picks, profile: PROFILES[dom] || PROFILES.bois };
  }

  function transition(render) {
    if (!T.motion.on) { render(); focusTitle(); return; }
    gsap.to(box, { x: -40, autoAlpha: 0, duration: 0.25, ease: 'power2.in', onComplete: function () {
      render();
      gsap.fromTo(box, { x: 40, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.5, ease: 'expo.out' });
      focusTitle();
    } });
  }
  function focusTitle() { var h = box.querySelector('[data-focus]'); if (h) h.focus({ preventScroll: true }); }

  function renderQ() {
    var item = Q[step];
    box.innerHTML =
      '<div class="quiz__top"><span class="quiz__progress" aria-hidden="true"><i style="transform:scaleX(' + (step / Q.length) + ')"></i></span>' +
      '<span class="quiz__step">Question ' + (step + 1) + ' / ' + Q.length + '</span></div>' +
      '<h2 class="quiz__q" tabindex="-1" data-focus>' + item.q + '</h2>' +
      (item.hint ? '<p class="quiz__hint">' + item.hint + '</p>' : '') +
      '<div class="quiz__opts" role="group" aria-label="' + T.esc(item.q) + '">' + item.o.map(function (o, i) {
        var picked = answers[step] === item.o[i][2];
        return '<button class="quiz__opt" type="button" data-i="' + i + '" aria-pressed="' + picked + '"><strong>' + o[0] + '</strong><span>' + o[1] + '</span></button>';
      }).join('') + '</div>' +
      '<div class="quiz__nav">' + (step ? '<button class="link-u" type="button" data-back><span aria-hidden="true">←</span> Question précédente</button>' : '<span></span>') + '</div>';
  }

  function renderResult() {
    var r = score();
    box.innerHTML =
      '<div class="quiz__top"><span class="quiz__progress" aria-hidden="true"><i style="transform:scaleX(1)"></i></span><span class="quiz__step">Terminé</span></div>' +
      '<div class="quiz__result"><p class="eyebrow">Votre profil</p>' +
      '<h2 class="quiz__profile mt-2" tabindex="-1" data-focus>' + r.profile[0] + '</h2>' +
      '<p class="mt-3 muted" style="max-width:52ch">' + r.profile[1] + '</p>' +
      '<div class="catalog">' + r.picks.map(function (p) {
        return '<div>' + T.card(p) + '<button class="btn btn--block mt-2" type="button" data-add="' + p.id + '">Ajouter au panier</button></div>';
      }).join('') + '</div>' +
      '<div class="quiz__nav"><button class="link-u" type="button" data-restart>Recommencer le rituel</button>' +
      '<a class="link-u" href="contact.html">Les essayer en boutique <span aria-hidden="true">→</span></a></div></div>';
  }

  box.addEventListener('click', function (e) {
    var opt = e.target.closest('.quiz__opt');
    if (opt) {
      answers[step] = Q[step].o[+opt.dataset.i][2];
      opt.setAttribute('aria-pressed', 'true');
      step++;
      transition(step < Q.length ? renderQ : renderResult);
      return;
    }
    if (e.target.closest('[data-back]')) { step = Math.max(0, step - 1); transition(renderQ); return; }
    if (e.target.closest('[data-restart]')) { step = 0; answers = []; transition(renderQ); return; }
    var add = e.target.closest('[data-add]');
    if (add) { var p = T.byId(add.dataset.add); T.cart.add(p.id, p.sizes[0].ml, 1); }
  });

  renderQ();
})();
