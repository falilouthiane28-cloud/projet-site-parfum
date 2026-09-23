/* rituel.js — Quiz olfactif : 6 questions pondérées par collection, puis reco */
var fmt = (window.TERANGA && window.TERANGA.fmtXOF) || function (n) { return n + ' FCFA'; };

// Chaque option pointe vers une collection (voir collections.json / parfums.collection)
var Q = [
  { q: "Quel moment vous ressemble le plus ?", opts: [
    { t: "Un dîner tardif, lumière tamisée", s: "Chaleur et sensualité", c: "ambres-sensuels" },
    { t: "Une marche au bord de l'océan", s: "Fraîcheur et grand air", c: "aquatiques-iodes" },
    { t: "Une bibliothèque, un vieux bois ciré", s: "Bois et profondeur", c: "bois-rares" },
    { t: "Un jardin en fleurs au matin", s: "Fleurs et lumière", c: "fleurs-blanches" } ] },
  { q: "Une matière vous attire irrésistiblement :", opts: [
    { t: "L'oud et l'encens", s: "L'Orient précieux", c: "orientaux-precieux" },
    { t: "La vanille et le tabac", s: "Le gourmand chaud", c: "ambres-sensuels" },
    { t: "Le vétiver et le cèdre", s: "Le sec et racé", c: "bois-rares" },
    { t: "La bergamote et la mousse", s: "Le classique net", c: "chypres-modernes" } ] },
  { q: "Votre sillage idéal :", opts: [
    { t: "On vous suit dans la pièce", s: "Puissant, enveloppant", c: "orientaux-precieux" },
    { t: "Une aura discrète et propre", s: "Proche de la peau", c: "aquatiques-iodes" },
    { t: "Une signature reconnaissable", s: "Affirmée, sans hausser le ton", c: "chypres-modernes" },
    { t: "Une douceur qu'on veut respirer", s: "Câline et sucrée", c: "ambres-sensuels" } ] },
  { q: "Une couleur pour votre parfum :", opts: [
    { t: "Or sombre et ambre", s: "", c: "ambres-sensuels" },
    { t: "Bleu profond et argent", s: "", c: "aquatiques-iodes" },
    { t: "Brun boisé et vert", s: "", c: "bois-rares" },
    { t: "Blanc nacré et rose", s: "", c: "fleurs-blanches" } ] },
  { q: "Le climat de Dakar, vous le portez :", opts: [
    { t: "Comme une invitation à l'ambre", s: "J'assume la chaleur", c: "orientaux-precieux" },
    { t: "Avec des agrumes vivifiants", s: "Je cherche la fraîcheur", c: "aquatiques-iodes" },
    { t: "Avec des chypres nets", s: "Je vise l'intemporel", c: "chypres-modernes" },
    { t: "Avec des fleurs solaires", s: "Je veux de la lumière", c: "fleurs-blanches" } ] },
  { q: "Ce que vous attendez d'un parfum :", opts: [
    { t: "Qu'il raconte une histoire", s: "Émotion et mémoire", c: "orientaux-precieux" },
    { t: "Qu'il tienne toute la journée", s: "Performance", c: "ambres-sensuels" },
    { t: "Qu'il soit rare et pointu", s: "Distinction", c: "bois-rares" },
    { t: "Qu'il plaise et rassemble", s: "Universalité", c: "chypres-modernes" } ] }
];

var step = 0, scores = {};
var stage = document.getElementById('quizStage');
var bar = document.getElementById('progressBar');
var PARFUMS = [], COLLECTIONS = [];

function priceFrom(p) { return Math.min.apply(null, p.sizes.map(function (s) { return s.price_xof; })); }

function renderQ() {
  bar.style.width = (step / Q.length * 100) + '%';
  var item = Q[step];
  stage.innerHTML =
    '<p class="eyebrow">Question ' + (step + 1) + ' / ' + Q.length + '</p>' +
    '<h2 class="quiz__q" data-split="word">' + item.q + '</h2>' +
    '<div class="quiz__opts">' + item.opts.map(function (o, i) {
      return '<button class="quiz__opt" data-c="' + o.c + '"><strong>' + o.t + '</strong>' + (o.s ? '<span>' + o.s + '</span>' : '') + '</button>';
    }).join('') + '</div>' +
    (step > 0 ? '<div class="quiz__nav"><button class="link-u" id="backBtn">&larr; Précédent</button></div>' : '');
  stage.querySelectorAll('.quiz__opt').forEach(function (b) {
    b.addEventListener('click', function () {
      scores[b.dataset.c] = (scores[b.dataset.c] || 0) + 1;
      step++;
      if (step < Q.length) renderQ(); else renderResult();
    });
  });
  var back = document.getElementById('backBtn');
  if (back) back.addEventListener('click', function () { step = Math.max(0, step - 1); renderQ(); });
  if (window.TERANGA && window.TERANGA.motionRefresh) window.TERANGA.motionRefresh();
}

function renderResult() {
  bar.style.width = '100%';
  var top = Object.keys(scores).sort(function (a, b) { return scores[b] - scores[a]; })[0] || 'ambres-sensuels';
  var coll = COLLECTIONS.find(function (c) { return c.id === top; }) || { name: top, desc: '' };
  var recos = PARFUMS.filter(function (p) { return p.collection === top; });
  if (recos.length < 3) recos = recos.concat(PARFUMS.filter(function (p) { return recos.indexOf(p) < 0; }));
  recos = recos.slice(0, 3);

  stage.innerHTML =
    '<p class="eyebrow">Votre profil</p>' +
    '<h2 class="quiz__q">' + coll.name + '</h2>' +
    '<p class="muted mt-3" style="max-width:52ch">' + coll.desc + '</p>' +
    '<div class="catalog" style="margin-top:40px">' + recos.map(function (p) {
      return '<article class="p-card brackets"><a class="p-card__media" href="parfum.html?id=' + p.id + '"><img src="' + p.image + '" alt="' + p.name + '" loading="lazy" width="480" height="600" /></a>' +
        '<div class="p-card__body"><span class="p-card__maison">' + p.maison + '</span>' +
        '<h3 class="p-card__name"><a href="parfum.html?id=' + p.id + '">' + p.name + '</a></h3>' +
        '<div class="p-card__foot"><span class="price">' + fmt(priceFrom(p)) + '</span>' +
        '<button class="link-u" data-add="' + p.id + '">Ajouter <span class="arrow">&rarr;</span></button></div></div></article>';
    }).join('') + '</div>' +
    '<div class="quiz__nav" style="justify-content:center;margin-top:48px"><button class="btn btn--ghost" id="restart">Recommencer le rituel</button></div>';

  stage.querySelectorAll('[data-add]').forEach(function (b) {
    b.addEventListener('click', function () {
      var p = PARFUMS.find(function (x) { return x.id === b.dataset.add; });
      if (p) window.TERANGA.cart.add({ id: p.id, name: p.name, maison: p.maison, price: priceFrom(p), ml: p.sizes[0].ml, img: p.image });
    });
  });
  document.getElementById('restart').addEventListener('click', function () { step = 0; scores = {}; renderQ(); });
  if (window.TERANGA && window.TERANGA.motionRefresh) window.TERANGA.motionRefresh();
}

async function main() {
  try {
    PARFUMS = await (await fetch('data/parfums.json')).json();
    COLLECTIONS = await (await fetch('data/collections.json')).json();
  } catch (e) { stage.innerHTML = '<p class="empty-state">Lancez le site via un serveur local (voir README).</p>'; return; }
  renderQ();
}
main();
