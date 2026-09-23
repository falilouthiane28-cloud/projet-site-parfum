# Mémoire technique — TERANGA

Notes de contexte, décisions et pièges à ne pas réapprendre. À lire avant toute modification.

## Emplacement & lancement
- Racine : `C:\Users\fallo\Desktop\projet site parfum`.
- **Serveur HTTP obligatoire** (le site charge ses données via `fetch` — ouverture en `file://` = catalogue vide) :
  ```bash
  python -m http.server 8000
  ```

## Direction : MONOCHROME (noir/blanc, zéro couleur)
6 gris seulement, `--stroke: 2px` (ADN logo), fonts Space Grotesk / Hanken Grotesk / Space Mono. Signature = **Navigateur-Labyrinthe** (marge gauche). Plus de 3D, plus d'or, plus de curseur custom. Voix : casse phrase + mots bannis proscrits. Plan/critique : `docs/`.

## Architecture (no-build)
- Le **chrome partagé** (header, menu, footer, loader, tiroir panier, **labyrinthe**) est **injecté par `assets/js/shell.js`** → ne pas dupliquer ce markup.
- `assets/js/motion.js` = GSAP + Lenis. **Idempotent** : expose `window.TERANGA.motionRefresh()`.
- `assets/js/home.js` (module ES) hydrate la home. Pages internes : `assets/js/pages/<page>.js`.
- **Labyrinthe** : construit dans `shell.js` à partir des `<section data-chamber="...">`. Gouttière `--lab-w: 64px` ; `body.has-labyrinth` décale le contenu. Masqué < 901px et en reduced-motion.
- Données `data/*.json` · Styles `assets/css/app.css` (system) · `home.css` · `pages.css`.

## Pièges connus (déjà corrigés — ne pas régresser)
1. **Ordre d'exécution** : `motion.js` (defer) tourne AVANT que `home.js`/pages n'injectent le contenu. → Appeler `window.TERANGA.motionRefresh()` APRÈS injection. Fonctions gardées par `data-*-done` (idempotentes).
2. **Largeur du panneau = 0 quand caché** → hero et labyrinthe se traitent comme « mobile » et sont sautés. Correctif : réessai au `resize`/`load` + polling court tant que non bâti.
3. **`max-width` en `ch` sur un titre géant** est calculé dans la police de corps (~170px) → le titre se brise lettre par lettre. Utiliser px/vw (`.hero__inner { max-width: min(92vw, 820px) }`).
4. **Le split perd les `<br>`** (via `textContent`) → laisser le titre s'enrouler naturellement dans une largeur correcte.
5. **Révélation du titre hero** : le tween autoplay pouvait ne pas démarrer (onglet masqué). → ScrollTrigger `once` + filet `setTimeout(2500)` qui force `yPercent:0`.
6. **Cache dev** : les rechargements répétés peuvent servir d'anciens JS/CSS ; sur un 1er chargement propre (utilisateur) tout est à jour.

## API panier (`window.TERANGA.cart`)
`add(item)`, `get()`, `setQty(idx, qty)`, `remove(idx)`, `clear()`, `total()`, `open()`, `close()`.
Persistance `localStorage` clé `teranga-cart`. Format prix : `window.TERANGA.fmtXOF(n)` → `197,000 FCFA`.

## Autres clés localStorage
`teranga-nl` (newsletter) · `teranga-consultations` (contact) · `teranga-orders` (commandes) · `teranga-user` (compte) · `teranga-wishlist` (désirs).

## À remplacer pour la prod
- Numéro **WhatsApp** `221000000000` → présent dans `shell.js`, `contact.js`, `panier.js`.
- **Prix FCFA** indicatifs (conversion EUR × 656 arrondie) → tarifs réels.
- **Photos produit** : actuellement `img/placeholder-flacon.svg` (+ 3 photos réelles). Remplacer par les visuels **officiels sous licence** — ne pas scraper les images de marques.
- **Fonts** : self-host + subset woff2 pour le LCP.

## Contraintes machine
- Le shell Windows ne peut pas écrire dans `Documents` (Defender) — travailler ici, sur le Bureau.
- Préférences utilisateur : français, un seul accent (l'or), proposer avant d'implémenter.
