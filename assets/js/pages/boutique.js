/* boutique.js — Catalogue : pastilles Genre / Famille / Maison, prix max, tri.
   L'état des filtres est reflété dans l'URL (lien partageable). */
(function () {
  'use strict';
  var T = window.TERANGA;
  var GENRES = [['homme', 'Homme'], ['femme', 'Femme'], ['mixte', 'Mixte']];
  var FAMILLES = ['Boisé', 'Oriental', 'Floral', 'Frais', 'Gourmand', 'Chypré'];
  var prices = T.products.map(T.priceFrom);
  var PMIN = Math.floor(Math.min.apply(null, prices) / 500) * 500;
  var PMAX = Math.ceil(Math.max.apply(null, prices) / 500) * 500;

  var q = new URLSearchParams(location.search);
  var state = {
    genre: q.get('genre') || '',
    famille: q.get('famille') || '',
    maison: q.get('maison') && T.maison(q.get('maison')) ? q.get('maison') : '',
    prix: Math.min(PMAX, +q.get('prix') || PMAX),
    tri: q.get('tri') || 'selection'
  };

  var row = document.getElementById('pillRow');
  var grid = document.getElementById('catalog');
  var range = document.getElementById('price');
  var out = document.getElementById('priceOut');
  var sort = document.getElementById('sort');
  range.min = PMIN; range.max = PMAX; range.value = state.prix;
  sort.value = state.tri;

  function pill(group, val, label) {
    var on = group === 'all' ? (!state.genre && !state.famille && !state.maison && state.prix >= PMAX) : state[group] === val;
    return '<button class="pill" type="button" data-g="' + group + '" data-v="' + T.esc(val) + '" aria-pressed="' + on + '">' + label + '</button>';
  }
  function paintPills() {
    row.innerHTML = pill('all', '', 'Tout') +
      '<span class="filters__sep" aria-hidden="true"></span><span class="filters__label">Genre</span>' +
      GENRES.map(function (g) { return pill('genre', g[0], g[1]); }).join('') +
      '<span class="filters__sep" aria-hidden="true"></span><span class="filters__label">Famille</span>' +
      FAMILLES.map(function (f) { return pill('famille', f, f); }).join('') +
      (state.maison ? '<span class="filters__sep" aria-hidden="true"></span><button class="pill is-on" type="button" data-g="maison" data-v="" aria-label="Retirer le filtre ' + T.esc(state.maison) + '">' + T.esc(state.maison) + ' <i class="bi bi-x" aria-hidden="true"></i></button>' : '');
  }

  function list() {
    var l = T.products.filter(function (p) {
      return (!state.genre || p.gender === state.genre) &&
        (!state.famille || p.famille === state.famille) &&
        (!state.maison || p.maison === state.maison) &&
        T.priceFrom(p) <= state.prix;
    });
    var by = {
      'selection': function (a, b) { return (b.featured - a.featured) || a.maison.localeCompare(b.maison); },
      'nouveautes': function (a, b) { return b.year - a.year; },
      'prix-asc': function (a, b) { return T.priceFrom(a) - T.priceFrom(b); },
      'prix-desc': function (a, b) { return T.priceFrom(b) - T.priceFrom(a); },
      'nom': function (a, b) { return a.name.localeCompare(b.name, 'fr'); }
    }[state.tri] || function () { return 0; };
    return l.sort(by);
  }

  function syncUrl() {
    var u = new URLSearchParams();
    if (state.genre) u.set('genre', state.genre);
    if (state.famille) u.set('famille', state.famille);
    if (state.maison) u.set('maison', state.maison);
    if (state.prix < PMAX) u.set('prix', state.prix);
    if (state.tri !== 'selection') u.set('tri', state.tri);
    var p = new URLSearchParams(location.search).get('parfum');
    if (p) u.set('parfum', p);
    history.replaceState(history.state, '', 'boutique.html' + (u.toString() ? '?' + u : ''));
  }

  function render() {
    var l = list();
    out.textContent = state.prix >= PMAX ? 'Tous les prix' : 'Jusqu\'à ' + T.fmt(state.prix);
    document.getElementById('count').textContent = l.length;
    document.getElementById('countLabel').textContent = l.length > 1 ? 'parfums' : 'parfum';
    document.getElementById('shopTitle').textContent = state.maison || 'Le catalogue';
    var m = state.maison && T.maison(state.maison);
    document.getElementById('shopIntro').textContent = m ? m.phrase + ' ' + T.productsOf(m.name).length + ' parfum' + (T.productsOf(m.name).length > 1 ? 's' : '') + ' en rayon.' : 'Tous les parfums en rayon à Dakar. Touchez un flacon pour lire sa pyramide, ses notes et son sillage.';
    grid.innerHTML = l.length ? l.map(function (p) { return T.card(p); }).join('')
      : '<div class="catalog-empty"><p>Aucun parfum ne correspond à ces critères. Essayez d\'élargir votre recherche.</p>' +
        '<button class="btn btn--ghost" type="button" data-reset>Retirer tous les filtres</button></div>';
    paintPills();
    syncUrl();
    T.motion.refresh();
  }

  row.addEventListener('click', function (e) {
    var b = e.target.closest('.pill'); if (!b) return;
    var g = b.dataset.g, v = b.dataset.v;
    if (g === 'all') { state.genre = state.famille = state.maison = ''; state.prix = PMAX; range.value = PMAX; }
    else state[g] = state[g] === v ? '' : v;
    render();
    var again = row.querySelector('[data-g="' + g + '"][data-v="' + v + '"]') || row.querySelector('[data-g="all"]');
    if (again) again.focus({ preventScroll: true });
  });
  grid.addEventListener('click', function (e) {
    if (!e.target.closest('[data-reset]')) return;
    state.genre = state.famille = state.maison = ''; state.prix = PMAX; range.value = PMAX; render();
  });
  range.addEventListener('input', function () { state.prix = +range.value; render(); });
  sort.addEventListener('change', function () { state.tri = sort.value; render(); });

  render();
})();
