# Mémoire technique — TERANGA

Notes de contexte, décisions et pièges à ne pas réapprendre. À lire avant toute modification.

Dernière révision : 2026-09-24 (passe bogues visuels : images, logos, hero).

## Emplacement & lancement
- Racine : `C:\Users\fallo\Desktop\projet site parfum`.
- **Le double-clic sur `index.html` (`file://`) fonctionne** : les données sont
  embarquées dans `assets/js/data.js` (`window.TERANGA_DATA`), aucun `fetch`
  n'est requis au démarrage.
- Pour développer, un serveur reste plus confortable (cache, URLs propres) :
  ```bash
  python -m http.server 8000
  ```
- **Piège de test** : le navigateur garde le CSS en cache très agressivement.
  Après une modification de `assets/css/*.css`, forcer un rechargement complet
  (Ctrl+Maj+R) — sinon on croit à tort qu'un correctif n'a pas pris.

## Direction artistique (verrouillée)
- Palette **monochrome stricte** : 6 gris, `--ink #0A0A0A`, `--paper #FAFAF7`.
  **Zéro couleur d'interface.** Toute la couleur vient des images.
- **Zéro filtre `grayscale` / `saturate(0)` sur les images.** Règle absolue.
- **Typographie réelle : `Bodoni Moda` (display, serif) + `Hanken Grotesk`
  (corps).** Les tokens sont `--font-display` et `--font-sans` dans `app.css`.
  *(Une version antérieure utilisait Space Grotesk / Space Mono ; ces polices
  ne sont plus chargées nulle part. Certains anciens documents les citent
  encore — ils ont tort.)*
- `--stroke: 2px` = unité de trait (ADN du logo). Angles droits, zéro rayon.
- Signature : **Navigateur-Labyrinthe**, construit par `shell.js` à partir des
  `<section data-chamber="…">`. C'est un `.labyrinth` `position: fixed`,
  44 px de large, `mix-blend-mode: difference`, masqué sous 1200 px.
  *(Il n'y a ni `--lab-w` ni classe `body.has-labyrinth` : le contenu n'est
  pas décalé, le tracé se superpose.)*

## Architecture (no-build)
- **Chrome partagé injecté par `assets/js/shell.js`** : en-tête, menu, pied de
  page (avec le monogramme), écran de chargement, labyrinthe. **Ne jamais
  dupliquer ce markup dans une page.**
- Ordre des scripts, identique sur les 10 pages — `shell.js` lit `T.config`
  et `T.esc` dès sa première ligne, donc `config.js` et `core.js` doivent le
  précéder :
  ```
  config.js → data.js → core.js → api.js → shell.js
           → product.js → cart.js → motion.js → pages/<page>.js
  ```
- `motion.js` = Lenis + GSAP + ScrollTrigger. **Idempotent** : après toute
  injection de contenu, appeler `window.TERANGA.motion.refresh()`
  *(et non `motionRefresh`, qui n'existe plus)*.
- Styles : `app.css` (système) · `home.css` (accueil) · `pages.css` (pages
  internes). Tout est en `@layer reset, tokens, base, layout, components,
  utilities`. Le bloc `prefers-reduced-motion` est **hors layer**, en fin de
  fichier : il l'emporte sans `!important`.
- **GSAP Flip n'est plus chargé** (plus aucun usage depuis la suppression de
  la modale).

## Pièges connus (déjà corrigés — ne pas régresser)

1. **Ordre d'exécution** : `motion.js` (defer) tourne avant que les pages
   n'injectent leur contenu → appeler `T.motion.refresh()` APRÈS injection.
   Les fonctions sont gardées par `data-*-done` (idempotentes).

2. **`max-width` en `ch` posé sur un CONTENEUR** : `ch` se calcule dans la
   police de l'élément qui porte la règle. `.hs__cap { max-width: 15ch }`
   valait ~143 px (police de corps, 17 px) alors que le titre fait ~106 px :
   le nom du parfum tombait dans une colonne et se brisait mot par mot.
   → Sur un conteneur, utiliser px/vw (`min(88vw, 860px)`). Sur un titre
   lui-même, `ch` reste correct (il se calcule dans SA police).

3. **Forme courte `padding` qui écrase `.wrap`** : `.page-head { padding: X 0 Y }`
   remettait le retrait horizontal à zéro et neutralisait le `padding-inline`
   de `.wrap` → les titres se collaient au bord de l'écran sur boutique,
   maisons, rituel, maison et contact. → Utiliser `padding-block`.

4. **Deux animations GSAP sur la même propriété du même élément** : l'entrée
   du hero et la sortie de la timeline scrubbée visaient les mêmes `<span>`.
   La timeline relevait l'état courant (masqué par l'entrée) comme état de
   départ et le re-posait à chaque rendu → la légende restait invisible.
   → **Une propriété, un seul propriétaire.** Aujourd'hui : l'entrée anime les
   enveloppes internes (`.hs__cap .w`), la sortie anime les lignes qui les
   portent (`.hs__cap > *`).

5. **Tween posé à l'instant 0 d'une timeline scrubbée** : il s'initialise dès
   la création (et pendant `ScrollTrigger.refresh()`, qui balaie la timeline)
   et fige un état de départ faux. → Amorce `LEAD` de 0,4 unité au début de la
   timeline + `immediateRender: false` + états de départ explicites (`fromTo`).

6. **Onglet en arrière-plan : l'horloge d'animation ne tourne pas.** Tout ce
   qui part d'`autoAlpha: 0` resterait invisible. → **Filets de sécurité** :
   `rescue()` dans `motion.js` (4 s, + au retour sur l'onglet), et
   `timeline.progress(1).pause()` dans `home.js` et `pages/parfum.js`.
   **Toute nouvelle animation qui masque du contenu doit avoir son filet.**

7. **Dossier d'images renommé** : `img/ambiance/` est devenu
   `img/HERO-SECTION/`. Quatre chemins pointaient encore vers l'ancien nom
   (index.html ×2, data.js ×2, articles.json ×2, build_data.py ×2).
   → `data/build_data.py` régénère `data.js` : corriger les DEUX.

8. **Markup resté en retard sur le CSS** : maison, contact, panier et compte
   étaient encore en balisage v2 (polices Space Grotesk, classes `h-serif`,
   `grid12`, `page-hero`… absentes du CSS, scripts manquants) alors que le CSS
   v3 pour ces pages existait déjà, inutilisé. → En cas de page « cassée »,
   vérifier d'abord que ses classes existent bien dans `assets/css/`.

9. **`autoAlpha` sur une grille de cartes empêche les images de se charger.**
   `autoAlpha: 0` pose `visibility: hidden`. Une image `loading="lazy"` dans un
   sous-arbre invisible peut ne jamais être demandée — et si la révélation ne
   part pas, la carte reste vide *et* muette pour les lecteurs d'écran.
   → `batchCards()` anime `opacity` seule ; `.is-rv` rend la carte inerte à la
   souris le temps de la révélation. **Ne pas y remettre `autoAlpha`.**

10. **Deux `flex: 1` frères se partagent la hauteur restante.** Dans la tuile
    bento à deux rangées, `.p-card__media` et `.p-card__body` étaient tous
    deux en `flex: 1` : l'image n'occupait que la moitié et une grande zone
    vide s'ouvrait avant le prix. → `.p-card__body { flex: 0 0 auto }` sur
    cette tuile, et la première image du bento est chargée en `eager`.

11. **Tuile de logo : borner, ne jamais étirer.** Les logos vont de 0,75 à 1,91
    de ratio. `.m-card__logo img` est en `max-width`/`max-height` + `contain`,
    jamais `width/height: 100%`, et **jamais `cover`** (qui rognerait un
    mot-symbole). Sans mot-symbole, on compose le nom (`.m-card__logo--word`) —
    on ne glisse pas une photo de flacon au milieu d'une grille de logos.

12. **Un logo blanc sur noir devient un rectangle noir** sur une tuile blanche
    (c'était le cas de Saint Laurent, et de Byredo avant remplacement).
    → Inversé avec Pillow ; l'original est dans `_archive/img/logos-originaux/`.

13. **Renommer un fichier de `img/maisons/` casse trois endroits à la fois** :
    `data/maisons.json`, `assets/js/data.js` (généré) et `data/build_data.py`
    (la source). Corriger les trois, sinon le prochain build ramène le bogue.

14. **Le voile du hero se mesure, il ne s'estime pas.** Le texte est blanc ;
    selon l'image, le coin le plus clair de la légende tombait à 3,4:1.
    Les dégradés actuels (et la variante `[data-tone="light"]` pour une image
    crème) tiennent 4,9:1 au pire sur les six images. Toute nouvelle image du
    hero doit être re-mesurée.

15. **Flacon au centre de la photo = collision avec la légende.** La légende
    est en bas à gauche ; un nom long (« Stronger With You », « Club de Nuit »)
    traversait le flacon. → `data-subject="center"` sur la diapositive :
    en paysage, image ancrée à gauche (le recadrage pousse le flacon à droite)
    et légende bornée à `min(36vw, 560px)` ; en portrait, la photo occupe le
    haut (`min(80%, 100% - 230px)`) et se fond dans le noir, la légende se pose
    dessous. Sans cela, sur téléphone, le titre tombait sur l'étiquette même
    du flacon (texte sur texte). Mesuré de 375×667 à 1920×1080.

16. **Section « Almadies, Dakar » : même logique.** Image Lattafa Asad ancrée à
    gauche, carte bornée à `min(620px, 44vw)` ; en portrait, disposition
    empilée (photo carrée cadrée sur le flacon, carte sur fond encre).

17. **Parallaxe du hero : décalage < marge d'agrandissement.** La nouvelle image
    glisse de ±5 % avec une échelle de 1,14 (7 % de marge), l'ancienne de ±2 %
    à l'échelle 1,05 (2,5 %), même courbe et même durée : aucun bord n'est
    jamais découvert (vérifié sur 400 positions de la timeline). Toucher à
    l'un sans l'autre fait apparaître une bande noire.

## API panier (`window.TERANGA.cart`)
`add(id, ml, qty)`, `count()`, `items()`, `open()`, `close()`,
`mountPage(el)` (rend le parcours complet dans une page, cf. `panier.html`).
Persistance `localStorage`, clé `teranga-cart`.
Format prix : `T.fmt(n)` → `197,000 FCFA` *(et non `fmtXOF`, qui n'existe plus)*.

## API données & persistance
- `T.products` / `T.maisons` / `T.articles`, `T.byId(id)`, `T.maison(nom)`,
  `T.priceFrom(p)`, `T.productsOf(maison)`.
- `T.api` : `saveOrder`, `saveNewsletter`, `saveConsultation`, `localOrders`,
  `getProfile` / `saveProfile`, `wishlist.{all,has,toggle}`, `auth.*`.
  Tout est localStorage d'abord, Supabase en plus si `config.js` a ses clés.

## Autres clés localStorage
`teranga-nl` · `teranga-newsletter` · `teranga-consultations` ·
`teranga-orders` · `teranga-profile` · `teranga-wishlist` · `teranga-cart`.

## Performance (septembre 2026)
- **Zéro CDN au chargement** : GSAP 3.12.5, ScrollTrigger et Lenis 1.1.13 dans
  `assets/vendor/` ; polices Bodoni Moda + Hanken Grotesk (variables, latin) dans
  `assets/fonts/` avec `@font-face` en tête de `app.css`. PAS de preload des
  polices : sur réseau lent il volait la bande passante du CSS (+0,25 s).
- **Icônes** : plus de police bootstrap-icons (130 Ko). Les 15 icônes utilisées
  sont des SVG en masque CSS (`.bi-xxx { --bi: url(...) }` dans `app.css`).
  Nouvelle icône = copier son SVG depuis bootstrap-icons et ajouter une règle.
- **Images en WebP** (−50 %), originaux JPEG conservés à côté. `build_data.py`
  convertit les noms via `webp()`. Toute nouvelle photo : la convertir en WebP.
- **Hero** : `srcset` 800/1280/1920. En portrait la photo est recadrée sur la
  hauteur (~1,8 × la hauteur d'écran) → `sizes="(max-aspect-ratio: 1/1) 180svh, 100vw"`.
  Photos 2 à 5 en `data-src`, chargées après `load` ou au 1er défilement (`home.js`).
- **Rideau d'intro** : une fois par session (`sessionStorage teranga-intro`),
  0,35–0,7 s. Classe `intro-seen` posée dans le `<head>` pour éviter le flash.
- `main { min-height: 100svh }` + `#pd/#checkout/#cartView:empty` : hauteur
  réservée au contenu rendu en JS (sinon le pied de page saute, CLS 0,5–0,8).
- `ScrollTrigger.config({ ignoreMobileResize: true })` : pas d'à-coup du hero
  épinglé quand la barre de Safari bouge. Lenis `lerp 0.12`. Marquee en pause hors écran.
- Pré-rendu au survol (`<script type="speculationrules">`, Chrome/Edge).

## Parcours d'achat (panier ≠ commande)
- **Panier** (`assets/js/cart.js`) : tiroir + `panier.html`. AUCUNE saisie client.
  Stockage `teranga-cart` = `[{ id, ml, qty }]` seulement ; nom, image et prix
  sont relus dans le catalogue (jamais de prix faux ou NaN). Doublons fusionnés,
  quantité bornée 1–10. API : `T.cart.add / addToCart / updateQuantity /
  removeFromCart / clear / lines / count / calculateSubtotal / renderCart`.
- **Commande** (`checkout.html` + `assets/js/pages/checkout.js`) : coordonnées →
  livraison (zones de `config.delivery`) → paiement (`config.payments`) →
  remarques → vérification → confirmation. Saisie gardée dans
  `teranga-checkout-draft` (retour au panier sans rien perdre).
- **Aucun paiement en ligne.** La commande est enregistrée (`T.api.saveOrder`)
  puis transmise par un message WhatsApp pré-rempli vers `config.whatsapp` —
  c'est ce message qui la fait arriver à la boutique. `gateway` dans
  `config.payments` est prévu pour brancher un vrai prestataire plus tard.
- Double envoi bloqué (drapeau `submitting` + bouton désactivé).

## Fiche produit
- **Page dédiée `parfum.html?id=…`**, jamais une modale. La quick-view a été
  supprimée de `product.js` (≈115 lignes). Une carte produit EST un lien.
- Les anciens liens `?parfum=ID` sont redirigés vers `parfum.html?id=ID`.

## À remplacer pour la prod
- Numéro de la boutique `784277229` (WhatsApp `221784277229`) → défini dans `assets/js/config.js` **uniquement**
  (contact.js et cart.js le lisent depuis là).
- **Prix FCFA** indicatifs (conversion EUR × 656 arrondie) → tarifs réels via
  `data/build_data.py`.
- **Images** : toutes réelles et en couleur. Les originaux 2K du hero sont
  conservés dans `_archive/img/hero-2k/` ; `img/HERO-IMG/` sert des versions
  1920 px optimisées (~250 Ko au lieu de ~2,5 Mo).
- **Fonts** : self-host + subset woff2 pour le LCP.

## Contraintes machine
- Le shell Windows ne peut pas écrire dans `Documents` (Defender) — travailler
  ici, sur le Bureau.
- Préférences utilisateur : français, proposer avant d'implémenter.
