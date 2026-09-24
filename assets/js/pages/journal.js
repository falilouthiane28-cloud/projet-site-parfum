/* journal.js — Liste des articles, ou un article : journal.html?a=… */
(function () {
  'use strict';
  var T = window.TERANGA;
  var main = document.getElementById('main');
  var list = T.articles.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; });
  var id = new URLSearchParams(location.search).get('a');
  var art = id && list.find(function (a) { return a.id === id; });
  function date(a) { return new Date(a.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }); }

  if (art) {
    var i = list.indexOf(art), next = list[(i + 1) % list.length];
    document.title = art.title + ' — Journal · Teranga';
    var meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', art.excerpt);
    main.innerHTML =
      '<figure class="article-hero"><img src="' + T.esc(art.image) + '" alt="' + T.esc(art.alt) + '" width="1400" height="900" fetchpriority="high"></figure>' +
      '<article class="article">' +
        '<nav class="crumbs" aria-label="Fil d\'Ariane"><a href="index.html">Accueil</a><span aria-hidden="true">/</span><a href="journal.html">Journal</a></nav>' +
        '<p class="eyebrow">' + T.esc(art.kicker) + '</p>' +
        '<h1>' + T.esc(art.title) + '</h1>' +
        '<p class="article__meta">' + date(art) + ' · ' + art.reading + ' min de lecture</p>' +
        '<div class="article__body">' + art.body.map(function (p, k) {
          var html = '<p>' + T.esc(p) + '</p>';
          if (k === 0 && art.inline) {
            html += '<figure><img src="' + T.esc(art.inline.image) + '" alt="' + T.esc(art.inline.alt) + '" width="736" height="736" loading="lazy" decoding="async">' +
              '<figcaption>' + T.esc(art.inline.caption) + '</figcaption></figure>';
          }
          return html;
        }).join('') + '</div>' +
        '<div class="article__next"><p class="eyebrow">Article suivant</p>' +
          '<a class="link-u" href="journal.html?a=' + next.id + '" style="text-transform:none;font-family:var(--font-display);font-size:26px;letter-spacing:0">' + T.esc(next.title) + ' <span aria-hidden="true">→</span></a></div>' +
      '</article>';
    return;
  }

  main.innerHTML =
    '<header class="page-head wrap"><p class="eyebrow">Le journal</p><h1 class="mt-2">Lectures</h1>' +
    '<p>Matières, conseils, culture du parfum. De courts textes pour affiner le nez.</p></header>' +
    '<section class="wrap section--tight"><div class="j-list">' + list.map(function (a) {
      return '<article class="j-row"><a class="j-row__media" href="journal.html?a=' + a.id + '" tabindex="-1" aria-hidden="true">' +
        '<img src="' + T.esc(a.image) + '" alt="" width="900" height="720" loading="lazy" decoding="async"></a>' +
        '<div><p class="eyebrow">' + T.esc(a.kicker) + '</p>' +
        '<h2><a href="journal.html?a=' + a.id + '">' + T.esc(a.title) + '</a></h2>' +
        '<p>' + T.esc(a.excerpt) + '</p>' +
        '<p class="mt-3 muted" style="font-size:13px">' + date(a) + ' · ' + a.reading + ' min de lecture</p>' +
        '<a class="link-u mt-2" href="journal.html?a=' + a.id + '">Lire l\'article <span aria-hidden="true">→</span></a></div></article>';
    }).join('') + '</div></section>';
  T.motion.refresh();
})();
