# -*- coding: utf-8 -*-
"""
build_data.py — Source unique des données TERANGA.
Génère data/parfums.json, data/maisons.json, data/articles.json
et assets/js/data.js (données embarquées : le site marche en file:// comme en http).

Relancer après toute modification :  python data/build_data.py
Prix : EUR x 656, arrondis à 500 FCFA (indicatifs, à caler sur vos tarifs).
"""
import json, os, io, re

# Les photos sont servies en WebP (converties depuis les originaux JPEG).
def webp(f):
    return re.sub(r"\.(jpe?g|png)$", ".webp", f) if f else f

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

def P(id, name, maison, year, perfumer, gender, family, famille, conc, top, heart, base,
      sizes, sillage, longevity, images, desc, featured=False):
    return {
        "id": id, "name": name, "maison": maison, "year": year, "perfumer": perfumer,
        "gender": gender, "family": family, "famille": famille, "concentration": conc,
        "notes": {"top": top, "heart": heart, "base": base},
        "sizes": [{"ml": ml, "price_xof": px} for ml, px in sizes],
        "sillage": sillage, "longevity": longevity,
        "images": ["img/produits/" + webp(f) for f in images],
        "description": desc, "featured": featured,
    }

PARFUMS = [
  P("mfk-baccarat-rouge-540-extrait", "Baccarat Rouge 540 Extrait", "Maison Francis Kurkdjian", 2017, "Francis Kurkdjian",
    "mixte", "Ambré floral", "Oriental", "Extrait de Parfum",
    ["Safran", "Amande amère"], ["Jasmin d'Égypte", "Cèdre"], ["Ambre gris", "Notes boisées", "Musc"],
    [(70, 259000), (200, 482000)], 5, 5, ["mfk-baccarat-rouge-540-extrait.jpg"],
    "Le safran cède la place à l'amande amère, puis au bois d'ambre. Le fond de musc tient sur la peau jusqu'au lendemain.", True),
  P("mfk-grand-soir", "Grand Soir", "Maison Francis Kurkdjian", 2016, "Francis Kurkdjian",
    "mixte", "Ambré", "Oriental", "Eau de Parfum",
    ["Ciste labdanum"], ["Benjoin du Siam", "Fève tonka"], ["Ambre", "Vanille"],
    [(70, 154000), (200, 344500)], 4, 5, ["mfk-grand-soir.jpg"],
    "Le benjoin et la fève tonka sur un lit d'ambre. La chaleur monte à mesure que la soirée avance."),
  P("mfk-oud-satin-mood", "Oud Satin Mood", "Maison Francis Kurkdjian", 2015, "Francis Kurkdjian",
    "mixte", "Oriental floral", "Oriental", "Eau de Parfum",
    ["Violette"], ["Rose de Bulgarie", "Rose de Damas", "Oud"], ["Benjoin", "Vanille"],
    [(70, 180500)], 5, 5, ["mfk-oud-satin-mood.jpg"],
    "Deux roses posées sur un oud du Laos, adouci de vanille. La violette ouvre, le benjoin ferme la marche."),
  P("amouage-reflection-man", "Reflection Man", "Amouage", 2007, "Lucas Sieuzac",
    "homme", "Floral boisé", "Floral", "Eau de Parfum",
    ["Romarin", "Poivre rose", "Petit-grain"], ["Jasmin", "Néroli", "Iris"], ["Bois de santal", "Vétiver", "Cèdre"],
    [(100, 216500)], 4, 4, ["amouage-reflection-man.jpg"],
    "Le néroli et le jasmin sur un santal crémeux. Une chemise blanche repassée, en version parfum."),
  P("xerjoff-naxos", "Naxos", "Xerjoff", 2015, "Chris Maurice",
    "mixte", "Aromatique ambré", "Oriental", "Eau de Parfum",
    ["Bergamote", "Lavande", "Citron"], ["Miel", "Cannelle", "Jasmin"], ["Feuille de tabac", "Fève tonka", "Vanille"],
    [(100, 157500)], 5, 5, ["xerjoff-naxos.jpg"],
    "Le miel et la feuille de tabac sur une lavande de Sicile. Il tient la journée et laisse une trace dorée sur l'écharpe."),
  P("xerjoff-erba-pura", "Erba Pura", "Xerjoff", 2019, "Christian Carbonnel",
    "mixte", "Ambré fruité", "Gourmand", "Eau de Parfum",
    ["Orange de Sicile", "Citron", "Bergamote"], ["Fruits mûrs"], ["Musc blanc", "Vanille de Madagascar", "Ambre"],
    [(100, 170500)], 5, 5, ["xerjoff-erba-pura.jpg"],
    "Une corbeille de fruits mûrs posée sur un musc blanc. Le sillage se sent à trois mètres sans jamais saturer."),
  P("pdm-layton", "Layton", "Parfums de Marly", 2016, "Hamid Merati-Kashani",
    "mixte", "Ambré floral", "Oriental", "Eau de Parfum",
    ["Pomme", "Lavande", "Bergamote", "Mandarine"], ["Géranium", "Violette", "Jasmin"], ["Vanille", "Cardamome", "Bois de santal", "Poivre"],
    [(75, 167500), (125, 206500)], 5, 5, ["pdm-layton.jpg"],
    "La pomme verte et la lavande croisent la vanille et la cardamome. Un classique de soirée qui passe aussi le jour."),
  P("pdm-delina-exclusif", "Delina Exclusif", "Parfums de Marly", 2018, "Quentin Bisch",
    "femme", "Floral fruité", "Floral", "Parfum",
    ["Pamplemousse", "Litchi", "Poire", "Bergamote"], ["Rose turque", "Encens"], ["Vanille", "Ambre", "Oud", "Notes boisées"],
    [(75, 223000)], 5, 5, ["pdm-delina-exclusif.jpg", "pdm-delina-exclusif-2.jpg"],
    "La rose turque et le litchi, épaissis d'encens et d'oud. Plus dense que Delina, il se porte le soir.", True),
  P("pdm-herod", "Herod", "Parfums de Marly", 2012, "Olivier Pescheux",
    "homme", "Boisé épicé", "Boisé", "Eau de Parfum",
    ["Cannelle", "Poivre"], ["Feuille de tabac", "Osmanthus", "Encens", "Labdanum"], ["Vanille", "Cypriol", "Cèdre", "Musc"],
    [(125, 197000)], 4, 5, ["pdm-herod.jpg"],
    "Le tabac blond et la cannelle sur une vanille sèche. Un bois d'hiver, rond, qui s'installe près du col."),
  P("nishane-hacivat", "Hacivat", "Nishane", 2017, "Jorge Lee",
    "mixte", "Chypré fruité", "Chypré", "Extrait de Parfum",
    ["Ananas", "Pamplemousse", "Bergamote"], ["Cèdre", "Patchouli", "Jasmin"], ["Mousse de chêne", "Notes boisées"],
    [(50, 128000), (100, 174000)], 4.5, 5, ["nishane-hacivat.jpg"],
    "L'ananas et le pamplemousse sur une mousse de chêne. Un chypré net, né à Istanbul, qui tient deux jours sur un pull."),
  P("initio-oud-for-greatness", "Oud for Greatness", "Initio", 2018, "Initio Parfums Privés",
    "mixte", "Boisé oriental", "Oriental", "Eau de Parfum",
    ["Safran", "Noix de muscade", "Lavande"], ["Bois d'oud"], ["Patchouli", "Musc"],
    [(90, 210000)], 5, 5, ["initio-oud-for-greatness.jpg"],
    "Le safran et la muscade ouvrent sur un oud franc. Deux vaporisations suffisent pour une pièce entière.", True),
  P("byredo-bal-dafrique", "Bal d'Afrique", "Byredo", 2009, "Jérôme Epinette",
    "mixte", "Floral boisé", "Floral", "Eau de Parfum",
    ["Bergamote", "Citron", "Néroli", "Tagète africaine"], ["Violette", "Jasmin", "Cyclamen"], ["Ambre noir", "Musc", "Vétiver", "Cèdre"],
    [(50, 134500), (100, 190000)], 3, 3.5, ["byredo-bal-dafrique.jpg"],
    "Le néroli et le tagète sur un vétiver sec. Un hommage au Paris des années 1920 et à ses musiques d'Afrique de l'Ouest."),
  P("byredo-gypsy-water", "Gypsy Water", "Byredo", 2008, "Jérôme Epinette",
    "mixte", "Boisé aromatique", "Boisé", "Eau de Parfum",
    ["Bergamote", "Citron", "Poivre", "Baies de genièvre"], ["Encens", "Aiguilles de pin", "Iris"], ["Ambre", "Vanille", "Bois de santal"],
    [(50, 134500), (100, 190000)], 3, 3.5, ["byredo-gypsy-water.jpg"],
    "Les aiguilles de pin et l'encens sur une vanille légère. Un feu de camp éteint, le lendemain matin."),
  P("diptyque-philosykos", "Philosykos", "Diptyque", 1996, "Olivia Giacobetti",
    "mixte", "Boisé vert", "Frais", "Eau de Toilette",
    ["Feuille de figuier"], ["Figue", "Noix de coco"], ["Bois de figuier", "Cèdre"],
    [(100, 95000)], 3, 3, ["diptyque-philosykos.jpg"],
    "La feuille, le fruit et le bois du figuier, dans cet ordre. Un après-midi d'été grec, vert et laiteux.", True),
  P("dior-sauvage-edp", "Sauvage", "Dior", 2018, "François Demachy",
    "homme", "Aromatique fougère", "Frais", "Eau de Parfum",
    ["Bergamote de Calabre"], ["Poivre de Sichuan", "Lavande", "Anis étoilé", "Noix de muscade"], ["Ambroxan", "Vanille"],
    [(60, 72000), (100, 95000)], 4, 4, ["dior-sauvage-edp.jpg", "dior-sauvage-edp-2.jpg"],
    "La bergamote et le poivre sur un fond d'ambroxan. Le frais le plus porté au monde, en version plus ronde que l'eau de toilette."),
  P("chanel-bleu-edp", "Bleu de Chanel", "Chanel", 2014, "Jacques Polge",
    "homme", "Boisé aromatique", "Boisé", "Eau de Parfum",
    ["Pamplemousse", "Citron", "Menthe", "Poivre rose"], ["Gingembre", "Noix de muscade", "Jasmin"], ["Encens", "Vétiver", "Cèdre", "Bois de santal"],
    [(100, 98500)], 4, 4, ["chanel-bleu-edp.jpg"],
    "Le pamplemousse et le gingembre sur un encens sec. Un boisé frais qui va du bureau au dîner sans changer de chemise."),
  P("chanel-bleu-parfum", "Bleu de Chanel Parfum", "Chanel", 2018, "Olivier Polge",
    "homme", "Boisé aromatique", "Boisé", "Parfum",
    ["Zeste de citron", "Bergamote"], ["Lavande", "Géranium"], ["Bois de santal", "Cèdre", "Fève tonka", "Ambre"],
    [(100, 115000)], 4, 4.5, ["chanel-bleu-parfum.jpg"],
    "Le santal de Nouvelle-Calédonie domine, le citron reste en retrait. La version la plus boisée et la plus tenace de Bleu."),
  P("guerlain-shalimar-lessence", "Shalimar L'Essence", "Guerlain", 2021, "Thierry Wasser",
    "femme", "Oriental poudré", "Oriental", "Eau de Parfum Intense",
    ["Bergamote"], ["Iris", "Rose"], ["Vanille", "Fève tonka", "Benjoin"],
    [(50, 85500)], 4, 5, ["guerlain-shalimar-lessence.jpg"],
    "La vanille fumée de Shalimar, recentrée sur l'iris. Plus poudrée que l'original, elle garde la bergamote en ouverture."),
  P("hermes-terre-dhermes", "Terre d'Hermès", "Hermès", 2006, "Jean-Claude Ellena",
    "homme", "Boisé minéral", "Boisé", "Eau de Toilette",
    ["Orange", "Pamplemousse"], ["Poivre", "Géranium", "Silex"], ["Vétiver", "Cèdre", "Patchouli", "Benjoin"],
    [(100, 82000)], 3.5, 4, ["hermes-terre-dhermes.jpg"],
    "L'orange et le silex sur un vétiver minéral. Une terre après la pluie, écrite avec très peu de matières."),
  P("tomford-oud-wood", "Oud Wood", "Tom Ford", 2007, "Richard Herpin",
    "mixte", "Boisé oriental", "Boisé", "Eau de Parfum",
    ["Oud", "Palissandre", "Cardamome", "Poivre de Chine"], ["Bois de santal", "Vétiver"], ["Fève tonka", "Vanille", "Ambre"],
    [(50, 183500), (100, 259000)], 3.5, 4, ["tomford-oud-wood.jpg"],
    "Un oud poli par la cardamome et le santal. Le plus facile à porter de la maison, même en plein jour.", True),
  P("tomford-tobacco-vanille", "Tobacco Vanille", "Tom Ford", 2007, "Olivier Gillotin",
    "mixte", "Oriental épicé", "Gourmand", "Eau de Parfum",
    ["Feuille de tabac", "Épices"], ["Vanille", "Cacao", "Fève tonka", "Fleur de tabac"], ["Fruits secs", "Notes boisées"],
    [(50, 183500), (100, 259000)], 5, 5, ["tomford-tobacco-vanille.jpg"],
    "Le tabac à pipe et la vanille, avec une pointe de cacao. Une bibliothèque en hiver, fauteuil en cuir compris."),
  P("creed-aventus", "Aventus", "Creed", 2010, "Olivier Creed",
    "homme", "Chypré fruité", "Chypré", "Eau de Parfum",
    ["Ananas", "Bergamote", "Cassis", "Pomme"], ["Bouleau", "Patchouli", "Jasmin", "Rose"], ["Musc", "Mousse de chêne", "Ambre gris", "Vanille"],
    [(50, 160500), (100, 226500)], 4, 4, ["creed-aventus.jpg"],
    "L'ananas et le bouleau fumé sur une mousse de chêne. La référence du chypré fruité depuis quinze ans.", True),
  P("roja-elysium", "Elysium Pour Homme", "Roja Parfums", 2017, "Roja Dove",
    "homme", "Aromatique boisé", "Frais", "Parfum Cologne",
    ["Pamplemousse", "Citron", "Bergamote", "Citron vert"], ["Genévrier", "Vétiver", "Pomme", "Cyprès"], ["Ambre gris", "Cuir", "Vanille", "Musc"],
    [(100, 193500)], 4, 4, ["roja-elysium.jpg"],
    "Quatre agrumes, puis le vétiver et le cyprès. Le frais le plus construit de la maison, avec un fond de cuir."),
  P("roja-elixir", "Elixir", "Roja Parfums", 2014, "Roja Dove",
    "femme", "Floral ambré", "Floral", "Essence de Parfum",
    ["Bergamote", "Citron", "Mandarine"], ["Rose", "Jasmin", "Muguet", "Fleur d'oranger"], ["Vanille", "Fève tonka", "Ambre", "Bois de santal"],
    [(100, 259000)], 4, 4.5, ["roja-elixir.jpg"],
    "La rose et le jasmin montés sur une vanille ambrée. Un bouquet dense, pensé pour les grandes occasions."),
  P("versace-eros-flame", "Eros Flame", "Versace", 2018, "Olivier Pescheux",
    "homme", "Boisé épicé", "Boisé", "Eau de Parfum",
    ["Citron", "Poivre noir", "Chinotto", "Mandarine", "Romarin"], ["Poivre", "Géranium", "Rose"], ["Fève tonka", "Vanille", "Bois de santal", "Cèdre", "Patchouli"],
    [(100, 62500)], 4, 4, ["versace-eros-flame.jpg"],
    "Le poivre noir et le chinotto sur une vanille boisée. Plus chaud qu'Eros, moins sucré, taillé pour le soir."),
  P("ysl-libre-le-parfum", "Libre Le Parfum", "Yves Saint Laurent", 2022, "Anne Flipo, Carlos Benaïm",
    "femme", "Floral ambré", "Floral", "Parfum",
    ["Gingembre", "Mandarine", "Bergamote", "Cardamome"], ["Lavande", "Fleur d'oranger", "Safran"], ["Vanille", "Miel", "Fève tonka"],
    [(50, 82000), (90, 105000)], 4, 5, ["ysl-libre-le-parfum.jpg"],
    "La lavande et la fleur d'oranger, réchauffées de safran et de miel. La version la plus dense de Libre.", True),
  P("armani-swy-powerfully", "Stronger With You Powerfully", "Emporio Armani", 2024, "Emporio Armani",
    "homme", "Ambré gourmand", "Gourmand", "Eau de Parfum",
    ["Cerise noire", "Cardamome"], ["Lavande", "Rhum"], ["Châtaigne", "Vanille", "Notes boisées"],
    [(100, 75500)], 4, 4, ["armani-swy-powerfully.jpg"],
    "La cerise noire et le rhum, arrondis de châtaigne. Une gourmandise brune qui reste masculine."),
  P("armani-swy-absolutely", "Stronger With You Absolutely", "Emporio Armani", 2021, "Emporio Armani",
    "homme", "Ambré boisé", "Gourmand", "Parfum",
    ["Rhum", "Bergamote"], ["Élémi", "Davana", "Lavande"], ["Châtaigne", "Vanille", "Patchouli", "Cèdre"],
    [(100, 78500)], 4.5, 5, ["armani-swy-absolutely.jpg"],
    "Le rhum et la châtaigne glacée sur un cèdre. La plus tenace des Stronger With You."),
  P("rasasi-hawas-ice", "Hawas Ice", "Rasasi", 2023, "Rasasi",
    "homme", "Aromatique aquatique", "Frais", "Eau de Parfum",
    ["Bergamote", "Pomme", "Citron"], ["Notes marines", "Lavande", "Cardamome"], ["Ambre gris", "Musc", "Bois de santal"],
    [(100, 29500)], 4, 4, ["rasasi-hawas-ice.jpg"],
    "La pomme et la bergamote sur des notes marines glacées. Un frais pensé pour la chaleur de Dakar."),
  P("alharamain-amber-oud-dubai-night", "Amber Oud Dubai Night", "Al Haramain", 2023, "Al Haramain",
    "mixte", "Ambré boisé", "Oriental", "Extrait de Parfum",
    ["Safran", "Bergamote"], ["Oud", "Rose"], ["Ambre", "Vanille", "Musc"],
    [(75, 46000)], 5, 5, ["alharamain-amber-oud-dubai-night.jpg"],
    "Le safran et l'oud sur un ambre profond. Un extrait à porter en petite quantité, tard le soir."),
  P("armaf-cdn-urban-man-elixir", "Club de Nuit Urban Man Elixir", "Armaf", 2021, "Armaf",
    "homme", "Aromatique boisé", "Frais", "Eau de Parfum",
    ["Bergamote", "Poivre noir", "Citron"], ["Lavande", "Menthe", "Genévrier"], ["Ambroxan", "Vétiver", "Cèdre"],
    [(105, 26000)], 5, 5, ["armaf-cdn-urban-man-elixir.jpg"],
    "La bergamote et le poivre noir sur un fond d'ambroxan. Une projection franche pour un prix qui laisse de la marge."),
  P("lattafa-asad", "Asad", "Lattafa", 2021, "Lattafa",
    "homme", "Ambré épicé", "Oriental", "Eau de Parfum",
    ["Poivre noir", "Ananas", "Tabac"], ["Café", "Patchouli", "Iris"], ["Vanille", "Ambre", "Benjoin", "Labdanum"],
    [(100, 18500)], 5, 5, ["lattafa-asad.jpg", "lattafa-asad-2.jpg"],
    "Le poivre noir et le café sur une vanille ambrée. Un oriental épicé qui tient la nuit entière."),
  P("lattafa-asad-bourbon", "Asad Bourbon", "Lattafa", 2024, "Lattafa",
    "homme", "Ambré boisé", "Gourmand", "Eau de Parfum",
    ["Rhum", "Cannelle", "Bergamote"], ["Café", "Praline", "Ambre"], ["Vanille", "Cèdre", "Fève tonka"],
    [(100, 19500)], 5, 5, ["lattafa-asad-bourbon.jpg"],
    "Le rhum et le café sur une vanille dense. La version brune d'Asad, plus sucrée, aussi tenace."),
  P("lattafa-khamrah", "Khamrah", "Lattafa", 2022, "Lattafa",
    "mixte", "Ambré épicé", "Gourmand", "Eau de Parfum",
    ["Cannelle", "Noix de muscade", "Bergamote"], ["Dattes", "Praline", "Tubéreuse"], ["Vanille", "Fève tonka", "Myrrhe", "Benjoin"],
    [(100, 19500)], 5, 5, ["lattafa-khamrah.jpg"],
    "La datte et la cannelle sur une vanille résineuse. Une gourmandise de fête, très demandée à Dakar.", True),
  P("lattafa-khamrah-waha", "Khamrah Waha", "Lattafa", 2025, "Lattafa",
    "mixte", "Aromatique frais", "Frais", "Eau de Parfum",
    ["Bergamote", "Menthe", "Citron"], ["Dattes", "Notes aquatiques"], ["Ambre", "Musc", "Notes boisées"],
    [(100, 23000)], 4, 4, ["lattafa-khamrah-waha.jpg"],
    "Khamrah passé à l'eau : la datte reste, la menthe l'allège. Pensé pour les après-midi chauds."),
  P("lattafa-badee-oud-for-glory", "Bade'e Al Oud Oud for Glory", "Lattafa", 2020, "Lattafa",
    "mixte", "Boisé oriental", "Oriental", "Eau de Parfum",
    ["Safran", "Noix de muscade", "Lavande"], ["Oud", "Patchouli"], ["Musc", "Notes boisées"],
    [(100, 19500)], 5, 5, ["lattafa-badee-oud-for-glory.jpg"],
    "Le safran et la lavande ouvrent sur un oud sec. Un oud fumé et direct, à un prix qui permet de l'essayer sans hésiter."),
  P("lattafa-badee-amethyst", "Bade'e Al Oud Amethyst", "Lattafa", 2023, "Lattafa",
    "mixte", "Floral boisé", "Floral", "Eau de Parfum",
    ["Rose", "Bergamote"], ["Oud", "Jasmin"], ["Ambre", "Musc", "Notes boisées"],
    [(100, 19500)], 4, 4, ["lattafa-badee-amethyst.jpg"],
    "La rose mène, l'oud la soutient sans l'écraser. Le plus floral de la série Bade'e Al Oud."),
  P("lattafa-badee-honor-glory", "Bade'e Al Oud Honor & Glory", "Lattafa", 2023, "Lattafa",
    "mixte", "Gourmand fruité", "Gourmand", "Eau de Parfum",
    ["Ananas", "Crème brûlée"], ["Cannelle", "Poivre"], ["Vanille", "Bois de santal"],
    [(100, 19500)], 5, 5, ["lattafa-badee-honor-glory.jpg"],
    "L'ananas juteux et la crème brûlée sur un santal épicé. Déroutant au premier essai, attachant au troisième."),
  P("lattafa-fakhar", "Fakhar", "Lattafa", 2022, "Lattafa",
    "homme", "Boisé aromatique", "Boisé", "Eau de Parfum",
    ["Pomme", "Bergamote", "Gingembre"], ["Lavande", "Sauge", "Géranium"], ["Fève tonka", "Vétiver", "Cèdre"],
    [(100, 18500)], 4, 4, ["lattafa-fakhar.jpg"],
    "La pomme et la lavande sur un vétiver propre. Un boisé aromatique qu'on porte tous les jours."),
  P("lattafa-eclaire", "Eclaire", "Lattafa", 2024, "Lattafa",
    "femme", "Gourmand", "Gourmand", "Eau de Parfum",
    ["Caramel", "Lait", "Sucre"], ["Miel", "Fleurs blanches"], ["Vanille", "Praline", "Musc"],
    [(100, 21000)], 4.5, 5, ["lattafa-eclaire.jpg"],
    "Le caramel et le lait chaud sur une praline vanillée. Une pâtisserie en flacon, qui assume ce qu'elle est."),
  P("lattafa-yara", "Yara", "Lattafa", 2020, "Lattafa",
    "femme", "Floral gourmand", "Floral", "Eau de Parfum",
    ["Orchidée", "Héliotrope", "Mandarine"], ["Accord gourmand", "Fruits tropicaux"], ["Vanille", "Musc", "Bois de santal"],
    [(100, 16500)], 4, 4, ["lattafa-yara.jpg"],
    "L'orchidée et la mandarine sur une vanille poudrée. Un sillage doux et crémeux qui reste près de la peau."),
]

def M(name, pays, annee, phrase, logo=None, logo2=None, on_order=False):
    return {"name": name, "pays": pays, "annee": annee, "phrase": phrase,
            "logo": ("img/maisons/" + webp(logo)) if logo else None,
            "logo2": ("img/maisons/" + webp(logo2)) if logo2 else None,
            "on_order": on_order}

MAISONS = [
  M("Maison Francis Kurkdjian", "France", 2009, "Des formules courtes, des sillages longs.", "maison-francis-kurkdjian.jpg"),
  M("Parfums de Marly", "France", 2009, "Les ambres du XVIIIe siècle, relus aujourd'hui.", "parfums-de-marly.jpg"),
  M("Amouage", "Oman", 1983, "Les encens de Mascate.", "amouage.jpg"),
  M("Xerjoff", "Italie", 2007, "Turin, le miel et le tabac.", "xerjoff.jpg"),
  M("Nishane", "Turquie", 2012, "Istanbul, en extraits concentrés.", "nishane.jpg"),
  M("Initio", "France", 2015, "Des matières choisies pour leur effet sur la peau.", "initio.jpg"),
  M("Byredo", "Suède", 2006, "Stockholm, des souvenirs mis en flacon.", "byredo.jpg"),
  M("Diptyque", "France", 1961, "34, boulevard Saint-Germain.", "diptyque.jpg"),
  M("Creed", "Royaume-Uni", 1760, "Une maison familiale depuis le XVIIIe siècle.", "creed.jpg"),
  M("Roja Parfums", "Royaume-Uni", 2011, "Londres, des formules longues."),
  M("Tom Ford", "États-Unis", 2006, "L'oud rendu lisible pour l'Occident.", "tom-ford.jpg"),
  M("Dior", "France", 1947, "L'avenue Montaigne.", "dior.jpg"),
  M("Chanel", "France", 1921, "Le bois et le bleu.", "chanel.jpg"),
  M("Guerlain", "France", 1828, "Deux siècles de vanille.", "guerlain.jpg"),
  M("Hermès", "France", 1837, "Le faubourg Saint-Honoré.", "hermes.jpg"),
  M("Yves Saint Laurent", "France", 1961, "La lavande, le monogramme.", "saint-laurent.jpg"),
  M("Versace", "Italie", 1978, "La Méduse et le poivre.", "versace.jpg"),
  M("Emporio Armani", "Italie", 1981, "Milan, le rhum et la châtaigne.", "emporio-armani.jpg"),
  M("Lattafa", "Émirats arabes unis", 1980, "L'Orient qui se porte tous les jours.", "lattafa-pride.jpg"),
  M("Al Haramain", "Émirats arabes unis", 1970, "L'ambre et l'oud depuis 1970.", "al-haramain.jpg"),
  M("Rasasi", "Émirats arabes unis", 1979, "La fraîcheur du Golfe.", "rasasi.jpg"),
  M("Armaf", "Émirats arabes unis", 2015, "La projection à petit prix.", "armaf.jpg"),
  # Maisons sans référence en rayon : commandées à la demande
  M("Frédéric Malle", "France", 2000, "L'éditeur de parfums.", "frederic-malle.jpg", on_order=True),
  M("Givenchy", "France", 1957, "L'avenue George-V.", "givenchy.jpg", on_order=True),
  M("Arabian Oud", "Arabie saoudite", 1982, "La maison de l'oud de Riyad.", "arabian-oud.jpg", on_order=True),
]

ARTICLES = [
  {"id": "oud-langage-dakar", "kicker": "Matières", "title": "L'oud, ce langage que Dakar comprend",
   "date": "2026-09-02", "reading": 6, "image": "img/produits/alharamain-amber-oud-dubai-night.webp",
   "alt": "Flacon Amber Oud d'Al Haramain posé sur des copeaux de bois d'oud, fumée et safran",
   "excerpt": "Du bois d'agar brûlé dans les maisons de Dakar aux extraits contemporains : un même mot, plusieurs dialectes.",
   "inline": {"image": "img/HERO-SECTION/calligraphie-oud.webp", "alt": "Calligraphie arabe dorée : « parfum d'oud »",
              "caption": "عطر العود — « parfum d'oud », en calligraphie arabe."},
   "body": [
     "À Dakar, l'oud n'a pas attendu les maisons occidentales. On le brûlait en copeaux pour les baptêmes, les mariages, la prière du vendredi. Le mot désigne d'abord un bois : l'aquilaria, infecté par un champignon, qui fabrique une résine sombre pour se défendre.",
     "Les parfumeurs l'ont ensuite apprivoisé. Tom Ford le polit à la cardamome dans Oud Wood. Initio le laisse brut, safrané, dans Oud for Greatness. Lattafa le rend accessible avec Bade'e Al Oud, à moins de vingt mille francs.",
     "Notre conseil : commencez par un oud « habillé », puis allez vers les versions plus brutes. Le nez s'habitue vite, et l'on revient rarement en arrière."]},
  {"id": "garde-robe-olfactive", "kicker": "Le Rituel", "title": "Construire sa garde-robe olfactive",
   "date": "2026-08-18", "reading": 5, "image": "img/produits/lattafa-fakhar.webp",
   "alt": "Quatre flacons Fakhar de Lattafa sur des socles orange",
   "excerpt": "Un parfum de jour, un parfum de soir, une signature. Trois flacons suffisent si on les choisit bien.",
   "body": [
     "Trois flacons couvrent une année : un parfum de jour, net et discret ; un parfum de soir, plus dense ; et une signature, celle vers laquelle la main revient sans réfléchir.",
     "Le jour appelle les agrumes, le vétiver, les notes marines. Le soir, l'ambre, le tabac, l'oud. La signature, elle, se trouve à l'essai, sur la peau, jamais sur une mouillette.",
     "Venez les composer avec nous en boutique : vingt minutes et trois essais valent mieux que toutes les descriptions."]},
  {"id": "sillage-chaleur", "kicker": "Conseils", "title": "Tenir le sillage sous la chaleur",
   "date": "2026-07-30", "reading": 4, "image": "img/HERO-SECTION/flacon-serpent-or.webp",
   "alt": "Flacon doré entouré d'un serpent en métal, devant son étui blanc texturé",
   "excerpt": "Sous le climat de Dakar, un parfum projette plus fort et s'évapore plus vite. Quatre gestes pour le faire durer.",
   "body": [
     "La chaleur amplifie un parfum pendant la première heure, puis l'épuise. Un extrait ou une eau de parfum résistent mieux qu'une eau de toilette.",
     "Appliquez sur une peau hydratée, sans parfum dans la crème : le gras retient les molécules. Visez les points chauds, cou et creux des coudes, sans frotter.",
     "Une vaporisation sur les vêtements prolonge le sillage d'une demi-journée. Et gardez vos flacons loin de la voiture et du soleil : la lumière abîme le jus en quelques semaines."]},
  {"id": "rose-mille-visages", "kicker": "Matières", "title": "La rose et ses mille visages",
   "date": "2026-07-08", "reading": 7, "image": "img/produits/pdm-delina-exclusif-2.webp",
   "alt": "Flacon rose Delina Exclusif de Parfums de Marly entouré de diamants",
   "excerpt": "Litchi chez Delina, oud chez Oud Satin Mood, fleur principale chez Amethyst : trois roses que tout oppose.",
   "body": [
     "La rose contient plusieurs centaines de molécules. Chaque parfumeur en éclaire une partie, et le résultat change du tout au tout.",
     "Chez Parfums de Marly, Delina Exclusif l'associe au litchi et à l'encens. Chez Maison Francis Kurkdjian, Oud Satin Mood la pose sur un oud vanillé. Chez Lattafa, Bade'e Al Oud Amethyst la met devant l'oud au lieu de derrière.",
     "Essayez-les côte à côte en boutique : après ce test, on ne dit plus « je n'aime pas la rose »."]},
]

def write_json(name, obj):
    with io.open(os.path.join(HERE, name), "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)
        f.write("\n")

# Contrôles : chaque image référencée doit exister
missing = []
for p in PARFUMS:
    for im in p["images"]:
        if not os.path.exists(os.path.join(ROOT, im)): missing.append(im)
for m in MAISONS:
    for k in ("logo", "logo2"):
        if m[k] and not os.path.exists(os.path.join(ROOT, m[k])): missing.append(m[k])
for a in ARTICLES:
    for im in [a["image"]] + ([a["inline"]["image"]] if a.get("inline") else []):
        if not os.path.exists(os.path.join(ROOT, im)): missing.append(im)
if missing:
    raise SystemExit("Images introuvables : %s" % missing)
names = {m["name"] for m in MAISONS}
orphans = {p["maison"] for p in PARFUMS} - names
if orphans:
    raise SystemExit("Maisons sans fiche : %s" % orphans)

# Packshot sur fond clair ? (coins quasi blancs) -> affiché en entier, sans recadrage
try:
    from PIL import Image
    def is_pack(path):
        with Image.open(os.path.join(ROOT, path)) as im:
            im = im.convert("L"); w, h = im.size
            pts = [(2, 2), (w - 3, 2), (2, h - 3), (w - 3, h - 3), (w // 2, 2), (w // 2, h - 3)]
            return sum(im.getpixel(p) for p in pts) / len(pts) > 232
    for p in PARFUMS:
        p["pack"] = is_pack(p["images"][0])
except ImportError:
    for p in PARFUMS:
        p["pack"] = False

write_json("parfums.json", PARFUMS)
write_json("maisons.json", MAISONS)
write_json("articles.json", ARTICLES)

js = ["/* data.js — GÉNÉRÉ par data/build_data.py. Ne pas modifier à la main. */",
      "window.TERANGA_DATA = {",
      "  parfums: %s," % json.dumps(PARFUMS, ensure_ascii=False),
      "  maisons: %s," % json.dumps(MAISONS, ensure_ascii=False),
      "  articles: %s" % json.dumps(ARTICLES, ensure_ascii=False),
      "};",
      "window.loadData = async function (name) { return (window.TERANGA_DATA || {})[name] || null; };"]
with io.open(os.path.join(ROOT, "assets", "js", "data.js"), "w", encoding="utf-8") as f:
    f.write("\n".join(js) + "\n")

print("parfums: %d | maisons: %d (%d sur commande) | articles: %d"
      % (len(PARFUMS), len(MAISONS), sum(m["on_order"] for m in MAISONS), len(ARTICLES)))
