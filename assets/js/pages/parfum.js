/* parfum.js — Fiche produit : image collante, sélecteur de taille, similaires */
var fmt = (window.TERANGA && window.TERANGA.fmtXOF) || function (n) { return n + ' FCFA'; };

function meter(v) {
  var s = '';
  for (var i = 1; i <= 5; i++) s += '<i class="' + (i <= v ? 'on' : '') + '"></i>';
  return '<span class="meter" aria-label="' + v + ' sur 5">' + s + '</span>';
}
function priceFrom(p) { return Math.min.apply(null, p.sizes.map(function (s) { return s.price_xof; })); }

function relatedCard(p) {
  return '<article class="p-card brackets"><a class="p-card__media" href="parfum.html?id=' + p.id + '">' +
    '<img src="' + p.image + '" alt="' + p.name + '" loading="lazy" width="480" height="600" /></a>' +
    '<div class="p-card__body"><span class="p-card__maison">' + p.maison + '</span>' +
    '<h3 class="p-card__name"><a href="parfum.html?id=' + p.id + '">' + p.name + '</a></h3>' +
    '<div class="p-card__foot"><span class="price">' + fmt(priceFrom(p)) + '</span></div></div></article>';
}

async function main() {
  var all;
  try { all = await (await fetch('data/parfums.json')).json(); }
  catch (e) { document.getElementById('pdp').innerHTML = '<p class="empty-state">Lancez le site via un serveur local (voir README).</p>'; return; }

  var id = new URLSearchParams(location.search).get('id');
  var p = all.find(function (x) { return x.id === id; }) || all[0];
  document.title = p.name + ' — ' + p.maison + ' · Teranga';
  document.getElementById('crumb').textContent = p.name;

  var selected = 0; // index taille
  function currentPrice() { return p.sizes[selected].price_xof; }

  var pdp = document.getElementById('pdp');
  pdp.innerHTML =
    '<figure class="pdp__media" id="pdpMedia" aria-label="Flacon ' + p.name + '">' +
      '<img id="pdpImg" src="' + p.image + '" alt="Flacon ' + p.name + ', ' + p.maison + '" width="600" height="750" />' +
    '</figure>' +
    '<div class="pdp__info">' +
      '<span class="pdp__maison">' + p.maison + '</span>' +
      '<h1 data-split="word">' + p.name + '</h1>' +
      '<p class="pdp__meta">' + p.family + ' · ' + p.concentration + ' · ' + p.gender + ' · ' + p.year + '</p>' +
      '<p class="pdp__desc">' + p.description + '</p>' +
      '<p class="pdp__price" id="pdpPrice">' + fmt(currentPrice()) + '</p>' +
      '<div class="sizes" id="sizes" role="group" aria-label="Contenance">' +
        p.sizes.map(function (s, i) { return '<button class="size-btn" data-i="' + i + '" aria-pressed="' + (i === 0) + '">' + s.ml + ' ml</button>'; }).join('') +
      '</div>' +
      '<div class="pdp__actions">' +
        '<button class="btn" id="addBtn"' + (p.stock ? '' : ' disabled') + '>' + (p.stock ? 'Ajouter au panier' : 'Épuisé') + '</button>' +
        '<a class="btn btn--ghost" href="contact.html">Voir en boutique</a>' +
      '</div>' +
      '<div class="spec-grid">' +
        '<div class="spec"><span>Parfumeur</span><strong>' + p.perfumer + '</strong></div>' +
        '<div class="spec"><span>Année</span><strong>' + p.year + '</strong></div>' +
        '<div class="spec"><span>Sillage</span>' + meter(p.sillage) + '</div>' +
        '<div class="spec"><span>Tenue</span>' + meter(p.longevity) + '</div>' +
      '</div>' +
      '<div class="notes-pyramid">' +
        '<div class="note-row"><h4>Notes de tête</h4><p>' + p.notes.top.join(' · ') + '</p></div>' +
        '<div class="note-row"><h4>Notes de cœur</h4><p>' + p.notes.heart.join(' · ') + '</p></div>' +
        '<div class="note-row"><h4>Notes de fond</h4><p>' + p.notes.base.join(' · ') + '</p></div>' +
      '</div>' +
    '</div>';

  // Sélecteur de taille
  document.getElementById('sizes').querySelectorAll('.size-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      selected = +b.dataset.i;
      document.querySelectorAll('#sizes .size-btn').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
      b.setAttribute('aria-pressed', 'true');
      document.getElementById('pdpPrice').textContent = fmt(currentPrice());
    });
  });

  // Ajout au panier
  var addBtn = document.getElementById('addBtn');
  if (p.stock) addBtn.addEventListener('click', function () {
    window.TERANGA.cart.add({ id: p.id, name: p.name, maison: p.maison, price: currentPrice(), ml: p.sizes[selected].ml, img: p.image });
  });

  // Similaires (même famille ou maison)
  var rel = all.filter(function (x) { return x.id !== p.id && (x.family === p.family || x.maison === p.maison); }).slice(0, 4);
  if (rel.length < 4) rel = rel.concat(all.filter(function (x) { return x.id !== p.id && rel.indexOf(x) < 0; })).slice(0, 4);
  document.getElementById('related').innerHTML = rel.map(relatedCard).join('');

  if (window.TERANGA && window.TERANGA.motionRefresh) window.TERANGA.motionRefresh();
}
main();
