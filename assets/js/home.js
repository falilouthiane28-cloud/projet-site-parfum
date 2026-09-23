/* =========================================================================
   home.js — Hydrate les sections de la home (monochrome, sans 3D).
   Module ES. Requiert un serveur HTTP (fetch) — cf. README.
   ========================================================================= */
var fmt = (window.TERANGA && window.TERANGA.fmtXOF) || function (n) { return n + ' FCFA'; };

async function getJSON(path) {
  try { var r = await fetch(path); if (!r.ok) throw 0; return await r.json(); }
  catch (e) { return null; }
}

function priceFrom(p) { return Math.min.apply(null, p.sizes.map(function (s) { return s.price_xof; })); }

function productCard(p) {
  var el = document.createElement('article');
  el.className = 'p-card brackets';
  el.setAttribute('data-conc', p.concentration);
  el.innerHTML =
    '<a class="p-card__media" href="parfum.html?id=' + p.id + '" aria-label="' + p.name + '">' +
      '<img src="' + p.image + '" alt="Flacon ' + p.name + ', ' + p.maison + '" loading="lazy" decoding="async" width="480" height="600" />' +
    '</a>' +
    '<div class="p-card__body">' +
      '<span class="p-card__maison">' + p.maison + '</span>' +
      '<h3 class="p-card__name"><a href="parfum.html?id=' + p.id + '">' + p.name + '</a></h3>' +
      '<p class="p-card__note">' + p.concentration + ' · ' + p.notes.heart.slice(0, 2).join(', ') + '</p>' +
      '<div class="p-card__foot"><span class="price">' + fmt(priceFrom(p)) + '</span>' +
        '<button class="link-u" data-add="' + p.id + '">Ajouter</button></div>' +
    '</div>';
  return el;
}

async function main() {
  var parfums = await getJSON('data/parfums.json') || [];
  var maisons = await getJSON('data/maisons.json') || [];
  var articles = await getJSON('data/articles.json') || [];
  var ingredients = await getJSON('data/ingredients.json') || {};

  /* Bento : 8 en vedette */
  var grid = document.getElementById('featuredGrid');
  if (grid) {
    var feat = parfums.filter(function (p) { return p.featured; });
    (feat.length ? feat : parfums).slice(0, 8).forEach(function (p) { grid.appendChild(productCard(p)); });
    grid.querySelectorAll('[data-add]').forEach(function (b) {
      b.addEventListener('click', function () {
        var p = parfums.find(function (x) { return x.id === b.dataset.add; });
        if (p) window.TERANGA.cart.add({ id: p.id, name: p.name, maison: p.maison, price: priceFrom(p), ml: p.sizes[0].ml, img: p.image });
      });
    });
  }

  /* Mur des maisons : paragraphe sans virgules */
  var wall = document.getElementById('maisonsWall');
  if (wall) {
    wall.innerHTML = maisons.map(function (m) {
      return '<a href="boutique.html" class="wall-name" title="' + (m.phrase || '') + '">' + m.name + '</a>';
    }).join('<span class="wall-gap"> </span>');
  }

  /* Journal : 3 derniers */
  var jg = document.getElementById('journalGrid');
  if (jg) {
    articles.slice(0, 3).forEach(function (a) {
      var d = new Date(a.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
      var card = document.createElement('article');
      card.className = 'j-card'; card.setAttribute('data-reveal', '');
      card.innerHTML =
        '<a class="j-card__media" href="journal.html#' + a.id + '"><img src="' + a.image + '" alt="' + a.title + '" loading="lazy" decoding="async" width="600" height="400" /></a>' +
        '<p class="j-card__kicker">' + a.kicker + '</p>' +
        '<h3><a href="journal.html#' + a.id + '">' + a.title + '</a></h3>' +
        '<p class="j-card__meta">' + d + ' · ' + a.reading + ' min</p>';
      jg.appendChild(card);
    });
  }

  /* Pyramide typographique : lignes = onglets */
  var panel = document.getElementById('pyrPanel');
  var lines = Array.prototype.slice.call(document.querySelectorAll('.pyr-line'));
  function renderLayer(key) {
    var L = ingredients[key]; if (!L || !panel) return;
    panel.innerHTML =
      '<h3 class="pyr-title">' + L.label + '</h3><p class="pyr-desc">' + L.desc + '</p>' +
      '<div class="pyr-ings">' + L.items.map(function (it) {
        return '<div class="pyr-ing"><strong>' + it.name + '</strong><span>' + it.note + '</span></div>';
      }).join('') + '</div>';
    lines.forEach(function (t) { t.setAttribute('aria-selected', String(t.dataset.layer === key)); });
  }
  lines.forEach(function (t) { t.addEventListener('click', function () { renderLayer(t.dataset.layer); }); });
  renderLayer('heart');

  /* Newsletter */
  var form = document.getElementById('nlForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = document.getElementById('nlEmail'), err = document.getElementById('nlErr');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) { input.setAttribute('aria-invalid', 'true'); err.textContent = 'Entrez une adresse valide.'; return; }
      input.removeAttribute('aria-invalid'); err.textContent = '';
      try { var subs = JSON.parse(localStorage.getItem('teranga-nl') || '[]'); subs.push(input.value); localStorage.setItem('teranga-nl', JSON.stringify(subs)); } catch (e2) {}
      form.style.display = 'none';
      document.getElementById('nlSuccess').style.display = 'block';
    });
  }

  /* Le contenu injecté est prêt : (re)scanne le mouvement. */
  if (window.TERANGA && typeof window.TERANGA.motionRefresh === 'function') window.TERANGA.motionRefresh();
}
main();
