/* boutique.js — Catalogue filtrable / triable, hydraté depuis parfums.json */
var fmt = (window.TERANGA && window.TERANGA.fmtXOF) || function (n) { return n + ' FCFA'; };

var state = { family: 'all', maison: 'all', sort: 'featured' };
var PARFUMS = [];
var COLLECTIONS = [];

function priceFrom(p) { return Math.min.apply(null, p.sizes.map(function (s) { return s.price_xof; })); }

function card(p) {
  var out = p.stock ? '' : '<span class="p-card__out">Épuisé</span>';
  return '<article class="p-card brackets" data-family="' + p.family + '" data-maison="' + p.maison + '">' +
    '<a class="p-card__media" href="parfum.html?id=' + p.id + '" aria-label="' + p.name + '">' + out +
      '<img src="' + p.image + '" alt="Flacon ' + p.name + ' — ' + p.maison + '" loading="lazy" decoding="async" width="480" height="600" /></a>' +
    '<div class="p-card__body">' +
      '<span class="p-card__maison">' + p.maison + '</span>' +
      '<h3 class="p-card__name"><a href="parfum.html?id=' + p.id + '">' + p.name + '</a></h3>' +
      '<p class="p-card__note">' + p.family + ' · ' + p.notes.heart.slice(0, 2).join(', ') + '</p>' +
      '<div class="p-card__foot"><span class="price">' + fmt(priceFrom(p)) + '</span>' +
        '<button class="link-u" data-add="' + p.id + '">Ajouter <span class="arrow">&rarr;</span></button></div>' +
    '</div></article>';
}

function familyOf(p) { return p.family; }

function render() {
  var list = PARFUMS.filter(function (p) {
    return (state.family === 'all' || p.family === state.family) &&
           (state.maison === 'all' || p.maison === state.maison);
  });
  if (state.sort === 'price-asc') list.sort(function (a, b) { return priceFrom(a) - priceFrom(b); });
  else if (state.sort === 'price-desc') list.sort(function (a, b) { return priceFrom(b) - priceFrom(a); });
  else if (state.sort === 'name') list.sort(function (a, b) { return a.name.localeCompare(b.name); });
  else list.sort(function (a, b) { return (b.featured ? 1 : 0) - (a.featured ? 1 : 0); });

  var cat = document.getElementById('catalog');
  cat.innerHTML = list.length ? list.map(card).join('') : '<p class="empty-state">Aucun parfum ne correspond à ces critères.</p>';
  document.getElementById('resultCount').textContent = list.length + ' parfum' + (list.length > 1 ? 's' : '');

  cat.querySelectorAll('[data-add]').forEach(function (b) {
    b.addEventListener('click', function () {
      var p = PARFUMS.find(function (x) { return x.id === b.dataset.add; });
      if (p) window.TERANGA.cart.add({ id: p.id, name: p.name, maison: p.maison, price: priceFrom(p), ml: p.sizes[0].ml, img: p.image });
    });
  });
  if (window.TERANGA && window.TERANGA.motionRefresh) window.TERANGA.motionRefresh();
}

function chips(containerId, values, key, allLabel) {
  var c = document.getElementById(containerId);
  var html = '<button class="chip" data-val="all" aria-pressed="true">' + allLabel + '</button>';
  html += values.map(function (v) { return '<button class="chip" data-val="' + v + '" aria-pressed="false">' + v + '</button>'; }).join('');
  c.innerHTML = html;
  c.querySelectorAll('.chip').forEach(function (btn) {
    btn.addEventListener('click', function () {
      c.querySelectorAll('.chip').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
      btn.setAttribute('aria-pressed', 'true');
      state[key] = btn.dataset.val;
      render();
    });
  });
}

async function main() {
  try {
    PARFUMS = await (await fetch('data/parfums.json')).json();
    COLLECTIONS = await (await fetch('data/collections.json')).json();
  } catch (e) {
    document.getElementById('catalog').innerHTML = '<p class="empty-state">Lancez le site via un serveur local (voir README) pour charger le catalogue.</p>';
    return;
  }

  var families = Array.from(new Set(PARFUMS.map(familyOf))).sort();
  var maisons = Array.from(new Set(PARFUMS.map(function (p) { return p.maison; }))).sort();
  chips('familyFilters', families, 'family', 'Toutes familles');
  chips('maisonFilters', maisons, 'maison', 'Toutes maisons');

  document.getElementById('sortSelect').addEventListener('change', function (e) { state.sort = e.target.value; render(); });

  // Filtre initial par collection (?collection=)
  var coll = new URLSearchParams(location.search).get('collection');
  if (coll) {
    var c = COLLECTIONS.find(function (x) { return x.id === coll; });
    if (c) {
      var ids = PARFUMS.filter(function (p) { return p.collection === coll; });
      PARFUMS = ids.length ? ids : PARFUMS;
      document.querySelector('.page-hero h1').textContent = c.name;
      document.getElementById('shopIntro').textContent = c.desc;
      // recalcule les puces sur le sous-ensemble
      families = Array.from(new Set(PARFUMS.map(familyOf))).sort();
      maisons = Array.from(new Set(PARFUMS.map(function (p) { return p.maison; }))).sort();
      chips('familyFilters', families, 'family', 'Toutes familles');
      chips('maisonFilters', maisons, 'maison', 'Toutes maisons');
    }
  }
  render();
}
main();
