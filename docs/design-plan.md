# Design Plan — Maison monochrome, Dakar

> **Note du 2026-09-23.** Ce document date d’avant la mise en œuvre. La décision typographique a ensuite été revue : le site tourne sur **Bodoni Moda** (display) + **Hanken Grotesk** (corps) — l’« alternative si serif souhaité » envisagée plus bas a été retenue. Space Grotesk et Space Mono ne sont chargés par aucune page. Le reste du plan (monochrome, trait de 2 px, labyrinthe) est appliqué tel quel.

> Plan avant code (brief §5). Direction : monochrome strict, discipline, une seule signature structurelle tirée du logo-labyrinthe.

## Palette (verrouillée — 6 valeurs, zéro couleur)

| Token | Valeur | Usage |
|---|---|---|
| `--ink` | `#0A0A0A` | Texte principal ; fond des sections inversées |
| `--paper` | `#FAFAF7` | Fond principal |
| `--gray-90` | `#1A1A1A` | Aplats sombres secondaires, survols sur ink |
| `--gray-60` | `#6B6B6B` | Texte discret, méta, légendes |
| `--gray-30` | `#C4C4C4` | Désactivé, bordures sur ink |
| `--gray-10` | `#EDEDED` | Séparateurs sur paper, surfaces de repos |
| `--stroke` | `2px` | **Unité de trait** du logo — toute règle/bordure/diviseur du site |

Hiérarchie, chaleur et emphase viennent uniquement du **contraste, de l'échelle, de l'espace, du poids, de la texture et du mouvement**.

## Typographie (pairing non-défaut, auto-hébergeable)

Le logo n'a **aucune courbe** : traits uniformes, angles droits. La typo doit dialoguer avec cette géométrie plutôt que la contredire → on écarte le serif haute-couture attendu.

- **Display — `Space Grotesk`** (grotesque légèrement équarri, forte personnalité aux grandes tailles ; libre, self-host woff2). Aux dimensions hero, tracking serré → lecture *architecturale*, proche du monogramme.
- **Corps — `Hanken Grotesk`** (grotesque neutre et chaleureux ; libre). Donne de l'air au display sans lui voler la vedette.
- **Méta / prix — `Space Mono`** (chiffres tabulaires, esprit plan/plan technique ; libre). Renforce le registre « relevé d'architecte ».

Aucune de ces familles n'est dans la liste bannie (Cormorant, Playfair, EB Garamond, Libre Baskerville, Inter). Toutes libres → self-host + subset Latin, `font-display: swap`.

**Alternative si serif souhaité** : `Bodoni Moda` (Didone haute-contraste, registre musée) en display, contre `Space Grotesk` en corps — tension serif/grotesque, plus dramatique.

### Échelle
- Hero : `clamp(4rem, 11vw, 12rem)`, `line-height 0.9`, tracking `-0.03em`
- Titre section : `clamp(2.5rem, 5vw, 5rem)`, `-0.02em`
- Sous-titre : `1.5rem`
- Corps : `17px / 1.6`
- Méta : `12px / 1.4`, tracking `+0.16em`, capitales (Space Mono)

## Layout

Grille éditoriale asymétrique 12 col (6 tablette, 4 mobile), le trait `--stroke` du logo servant d'unité pour toutes les règles et cadres.

### Hero — option 1 (RETENUE) : le plan comme page
```
┌───────────────────────────────────────────────┐
│ ▓ navigateur-labyrinthe (bord gauche, vertical) │
│ ▓                                               │
│ ▓        TERANGA                     [FR/EN][≡] │  ← wordmark discret
│ ▓                                               │
│ ▓   LA MÉMOIRE                                   │  ← display géant, aligné à gauche
│ ▓   D'UN DÉSIR.                                  │     (asymétrie : pas centré)
│ ▓                                               │
│ ▓                         Parfumerie — Dakar    │  ← méta mono, bas-droite
│ ▓   ────────────────────────────  (trait 2px)   │
└───────────────────────────────────────────────┘
```

### Hero — option 2 (écartée) : pyramide typographique
```
┌───────────────────────────────────────────────┐
│            T Ê T E                              │  ← display, très espacé
│          C  Œ  U  R                             │  ← plus resserré
│         F O N D.                                │  ← resserré, dense
└───────────────────────────────────────────────┘
```
Écartée comme hero (elle deviendra un motif sur la fiche produit), car elle n'ouvre pas sur le labyrinthe — la signature retenue.

### Section éditoriale (mur des maisons)
```
┌───────────────────────────────────────────────┐
│ ▓  Les maisons                                  │
│ ▓                                               │
│ ▓  Amouage  Byredo  Creed  Diptyque  Le Labo    │  ← paragraphe sans virgules,
│ ▓  Kurkdjian  Nishane  Roja  Tom Ford  Xerjoff  │     display, effet letterpress
│ ▓                          ┌──────────────────┐ │
│ ▓                          │ panneau au survol│ │  ← liste des parfums de la maison
│ ▓                          └──────────────────┘ │
└───────────────────────────────────────────────┘
```

## Signature (une seule) — **A. Le Navigateur-Labyrinthe** *(recommandée)*

Une ligne noire continue (trait `--stroke`, angles droits, comme le monogramme) court le long du bord gauche sur toute la hauteur du site. Au scroll, un **petit carré plein** avance le long du chemin et marque la « chambre » (section) où l'on se trouve ; chaque coude du tracé = une section. Ce n'est pas une scrollbar, c'est un **plan de sol**.

**Pourquoi cette Maison précisément** : le logo *est* un labyrinthe, et un parfum *est* un chemin (tête → cœur → fond) ; faire de la navigation un tracé à parcourir transforme le principe de la marque en geste d'interface. Aucune autre Maison de luxe n'a ce logo — la signature ne serait donc transposable à aucune autre.

Détail secondaire discret (facultatif, ne remplace pas la signature) : **densité = concentration** — le tracking des cartes se resserre de EDT → EDP → Extrait, encodant la métadonnée dans la forme.

## Mouvement (dépensé une fois)
- Lenis `lerp 0.08` (feutré ambiant).
- **Un** moment au chargement : le tracé du labyrinthe se dessine (stroke-dashoffset) une fois, puis le marqueur prend le relais au scroll. Jamais répété comme gadget.
- Reveals : `SplitText` mot-à-mot sur les **titres de section uniquement**, `0.9s expo.out`. Le corps *apparaît*, ne s'anime pas.
- Survols : soulignement filaire tiré depuis la gauche, 250ms. Rien d'autre (aucune couleur à transitionner).
- **Pas de curseur custom.** Pas de transition 3D. `prefers-reduced-motion` : tout coupé, y compris le tracé au chargement.

## Voix (extrait)
Casse phrase partout sauf wordmark et mur des maisons. Verbes exacts. Mots bannis proscrits (« découvrir », « expérience », « voyage », « curated », « élégant »…). Descriptions parfum : 2–3 phrases, présent, noms concrets avant adjectifs.
Hero FR : *« La mémoire d'un désir. »* — Thèse FR : *« Un parfum n'est pas un produit. C'est une décision que l'on porte sur la peau. »*
