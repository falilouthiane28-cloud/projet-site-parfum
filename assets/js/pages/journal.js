/* journal.js — Liste d'articles (extraits développés en corps de lecture) */
var BODIES = {
  "oud-langage-dakar": ["L'oud n'est pas une mode à Dakar : c'est une mémoire. Bien avant que les maisons occidentales n'en fassent leur matière-signature, les foyers sénégalais brûlaient le bois d'agar lors des grandes occasions.", "De la résine sauvage à l'accord contemporain, l'oud a appris à se faire plus lisible — crémeux chez Tom Ford, safrané chez Initio, floral chez Maison Francis Kurkdjian. Autant de dialectes d'une même langue que notre clientèle comprend d'instinct.", "Notre conseil : commencez par un oud « habillé » (Oud Wood) avant d'aller vers les interprétations les plus brutes. Le nez s'éduque, le goût s'affirme."],
  "construire-garde-robe": ["Trois flacons suffisent à couvrir une vie olfactive : un parfum de jour, discret et net ; un parfum de nuit, plus dense ; et une signature, celle qu'on porte quand on veut être reconnu.", "Le jour appelle la fraîcheur boisée ou florale ; la nuit, l'ambre, le tabac, l'oud. La signature, elle, ne se raisonne pas — c'est le flacon vers lequel votre main revient sans y penser.", "Venez les composer avec nous : une consultation privée en boutique vaut mille descriptions."],
  "sillage-chaleur": ["Sous le climat de Dakar, la chaleur amplifie et accélère l'évaporation. Un même parfum y projette davantage, mais tient parfois moins longtemps.", "Privilégiez les extraits et eaux de parfum aux concentrations plus fragiles. Appliquez sur peau hydratée, aux points de pulsation, et gardez vos flacons à l'abri de la lumière et de la chaleur.", "Une brume légère sur les vêtements prolonge le sillage sans agresser la peau."],
  "rose-mille-visages": ["La rose n'est jamais une seule fleur. Confiturée et sombre chez Frédéric Malle, poivrée et nue chez Le Labo, orientale et vanillée chez Maison Francis Kurkdjian.", "Sa richesse tient à ses centaines de molécules naturelles, que chaque parfumeur éclaire différemment. C'est la matière la plus universelle et pourtant la plus personnelle.", "Essayez trois roses côte à côte : vous ne les confondrez plus jamais."]
};

async function main() {
  var articles;
  try { articles = await (await fetch('data/articles.json')).json(); }
  catch (e) { document.getElementById('journalList').innerHTML = '<p class="empty-state">Lancez le site via un serveur local (voir README).</p>'; return; }

  document.getElementById('journalList').innerHTML = articles.map(function (a) {
    var d = new Date(a.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    var body = (BODIES[a.id] || [a.excerpt]).map(function (para) { return '<p>' + para + '</p>'; }).join('');
    return '<article class="article" id="' + a.id + '" data-reveal>' +
      '<p class="j-card__kicker">' + a.kicker + '</p>' +
      '<h2>' + a.title + '</h2>' +
      '<p class="article__meta">' + d + ' · ' + a.reading + ' min de lecture</p>' +
      '<img src="' + a.image + '" alt="' + a.title + '" loading="lazy" width="760" height="428" />' +
      '<div class="article__body">' + body + '</div></article>';
  }).join('');

  if (location.hash) { var t = document.querySelector(location.hash); if (t) t.scrollIntoView(); }
  if (window.TERANGA && window.TERANGA.motionRefresh) window.TERANGA.motionRefresh();
}
main();
