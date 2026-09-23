/* maisons.js — Annuaire des maisons + nombre de parfums référencés */
async function main() {
  var maisons, parfums;
  try {
    maisons = await (await fetch('data/maisons.json')).json();
    parfums = await (await fetch('data/parfums.json')).json();
  } catch (e) {
    document.getElementById('maisonsGrid').innerHTML = '<p class="empty-state">Lancez le site via un serveur local (voir README).</p>';
    return;
  }
  var counts = {};
  parfums.forEach(function (p) { counts[p.maison] = (counts[p.maison] || 0) + 1; });

  document.getElementById('maisonsGrid').innerHTML = maisons.map(function (m) {
    var n = counts[m.name] || 0;
    var link = n ? '<a class="link-u" href="boutique.html">Voir ' + n + ' parfum' + (n > 1 ? 's' : '') + ' <span class="arrow">&rarr;</span></a>' : '<span class="muted" style="font-size:13px">Sur commande</span>';
    return '<article class="maison-card" data-reveal>' +
      '<span class="m-country">' + m.pays + ' · ' + m.annee + '</span>' +
      '<h3>' + m.name + '</h3>' +
      '<p>' + m.phrase + '</p>' +
      '<div class="m-count">' + link + '</div></article>';
  }).join('');

  if (window.TERANGA && window.TERANGA.motionRefresh) window.TERANGA.motionRefresh();
}
main();
