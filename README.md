# TERANGA — Maison de Parfum · Dakar

Salon olfactif de luxe **multi-marques** basé à Dakar (Sénégal). Site **vanilla, no-build** (HTML/CSS/JS), **monochrome strict** (noir/blanc, couleur images uniquement), animé au GSAP + Lenis. Français principal, prix en **FCFA**. 

**v2 Complète** (2026-09-23) : 10 pages achevées, 44 images couleur, panier/checkout persistant, architecture modulaire JavaScript avec données embedées.

Direction design : `docs/design-plan.md` et `docs/critique.md`.

## Lancer le site

### Mode HTTP (développement + file:// support)
Le site fonctionne **par double-clic** (`file://`) car les données sont embedées dans `assets/js/data.js`. Pour le développement avec hot-reload, un serveur reste recommandé :

```bash
cd "projet site parfum"
python -m http.server 8000
```

Puis <http://localhost:8000>.

### Mode file:// (double-clic direct)
Ouvrez simplement `index.html` en double-clic. Aucune dépendance HTTP, aucun CORS, aucun build requis.

## Parti pris

- **Monochrome** : 6 gris uniquement (`--ink #0A0A0A`, `--paper #FAFAF7`, `--gray-90/60/30/15/08/03`). Hiérarchie par contraste, échelle, espace, poids — **jamais par couleur**.
- **Couleur = images uniquement** : 44 photos produits + 25 logos + 7 ambianceshots en couleur pleine. Zéro filtre grayscale, zéro desaturation, zéro B&W — toutes les images existent, zéro placeholder.
- **Trait du logo** : `--stroke: 2px` unité de base pour toutes les règles, bordures, cadres (angles droits, zéro rayon).
- **Typographie** : Bodoni Moda (display, serif haute parfumerie) + Hanken Grotesk (corps, 300–600). Google Fonts (production-ready).
- **Signature unique — Navigateur-Labyrinthe** : plan de sol 44×44px fixed left (angles droits); marqueur carré avance au scroll et mark section courante. Le logo est un labyrinthe, un parfum est un chemin.
- **Voix** : casse phrase, verbes exacts, aucun mot « marketing » usé (découvrir, expérience, élégant…).

## Les 10 pages

| Page | Route | Rôle |
|---|---|---|
| **Accueil** | `/index.html` | Hero 7 slides scrubbed, sélection bento, maisons, quiz, journal, newsletter, visite |
| **Boutique** | `/boutique.html` | Grille 41 parfums, filtres (genre/famille/maison/prix), tri 5 modes, URL-synced |
| **Parfum** | `/parfum.html?id=` | Page dédiée (jamais une modale) : galerie sticky, pyramide, sillage/tenue, tailles, panier, wishlist, similaires |
| **Maisons** | `/maisons.html` | Annuaire 25 maisons, en-rayon + commande-spéciale |
| **Rituel** | `/rituel.html` | Quiz 6 questions → profil + 3 produits recommandés |
| **Journal** | `/journal.html?a=` | Articles (liste ou détail), héros, corps, drop-cap, média inline |
| **La Maison** | `/maison.html` | Narration 5 chapitres (alternance img/texte), mission, valeurs |
| **Contact** | `/contact.html` | Formulaire RDV, infos (tel/horaires/coordonnées), carte SVG monochrome |
| **Panier** | `/panier.html` | Produits, quantités, checkout (livraison + paiement), commande → WhatsApp |
| **Compte** | `/compte.html` | Authentification, commandes, wishlist, profil (localStorage-synced) |

## Stack & Architecture

```
assets/
  css/
    app.css         (1200+ lignes) — design system : tokens, base, layout, components, utilities
                    @layer reset, tokens, base, layout, components, utilities
                    6 gris + spacing scale + ombres + transitions standard
    home.css        (400 lignes) — hero scrub, bento, marquee, rail, ritual, journal, footer
    pages.css       (500 lignes) — internal pages (filters, catalog, quiz, articles, contact, account, checkout)
  
  js/
    config.js       (60 lignes) — Supabase keys (empty = localStorage only), WhatsApp, coords, delivery zones
    data.js         (35KB, généré) — window.TERANGA_DATA (parfums, maisons, articles), fallback fetch
    core.js         (100 lignes) — T.fmt (FCFA), T.esc (XSS), T.ls (localStorage safe), T.toast, T.trapFocus
    api.js          (200 lignes) — T.api.saveOrder, .saveNewsletter, .auth.*, .wishlist.*, localStorage-first
    product.js      (150 lignes) — T.card (la carte EST un lien), T.detail, T.related, liste de désirs
    cart.js         (500+ lignes) — panier (add/remove/qty), drawer, checkout form, validation, confirmation
    motion.js       (200 lignes) — Lenis init, GSAP plugins, splitTitles, batchCards, clips, marquees
    shell.js        (300 lignes) — header/menu/footer/loader/labyrinthe injectés sur 10 pages
    home.js         (300 lignes) — hero timeline, featured bento, marquee, rail momentum, newsletter
    
    pages/
      boutique.js   (100 lignes) — filtres, tri, URL-sync state
      parfum.js     (30 lignes) — charge ?id, rend detail + related
      maisons.js    (40 lignes) — en-rayon (triées par count) + commande-spéciale
      rituel.js     (350 lignes) — 6 questions, scoring, lexicon matching, recommandations
      journal.js    (50 lignes) — liste articles ou article detail (?a=id)
      contact.js    (150 lignes) — formulaire, validation, Leaflet map
      panier.js     (100 lignes) — T.cart.mountPage()
      compte.js     (150 lignes) — tabs auth/commandes/souhaits/profil, localStorage sync

data/
  build_data.py     (500+ lignes) — master script, génère data.js + JSON humains
  parfums.json      (généré) — 41 parfums avec images, notes, prix
  maisons.json      (généré) — 25 maisons avec logos, pays, années, phrases
  articles.json     (généré) — 4 articles avec héros, contenu, médias inline

img/
  produits/         (44 images) — flacons couleur, 3:4 ratio
  maisons/          (25 images) — logos (ou fallback photo de flacon)
  HERO-IMG/         (4 images 1920px) — séquence du hero, originaux 2K dans _archive/img/hero-2k/
  HERO-SECTION/     (9 images) — ambiance, chapitres de La Maison, médias du journal
  _archive/         (10 fichiers) — doublons, placeholder, maquettes (conservés)

*.html (10 pages)
  <script defer src="assets/js/config.js"></script>  <!-- charge avant data.js -->
  <script defer src="assets/js/data.js"></script>    <!-- loads window.TERANGA_DATA -->
  <script defer src="assets/js/core.js"></script>    <!-- T.fmt, T.esc, T.ls -->
  <script defer src="assets/js/api.js"></script>     <!-- T.api.* -->
  <script defer src="assets/js/shell.js"></script>   <!-- chrome injection -->
  <script defer src="assets/js/product.js"></script> <!-- T.card, T.detail -->
  <script defer src="assets/js/cart.js"></script>    <!-- T.cart.* -->
  <script defer src="assets/js/motion.js"></script>  <!-- Lenis, GSAP setup -->
  <script defer src="assets/js/home.js"></script>    <!-- ou pages/*.js pour autres pages -->

docs/
  design-plan.md    — direction artistique & décisions
  critique.md       — rétrospective du virage design
```

### Flux de données

1. **Page charge** → `config.js` → `data.js` (ou fetch si HTTP) → `window.TERANGA_DATA` global.
2. **Script module** (boutique.js, rituel.js, etc.) récupère `T` et accède aux parfums/maisons/articles.
3. **Panier** : `T.cart.add(id, ml, qty)` → `localStorage('teranga-cart')` → persiste cross-tab (storage event).
4. **Formulaires** : localStorage-first (`T.api.saveOrder`), async vers Supabase si clés présentes.
5. **Chrome** : `shell.js` injecte header/menu/footer/loader/labyrinthe sur toutes les pages.

## UX Avancée

- ✅ **Panier persistant** : localStorage cross-tab (storage event listener).
- ✅ **Page produit dédiée** : `parfum.html?id=…` ; les anciens liens `?parfum=id` y sont redirigés.
- ✅ **Wishlist** : toggle [data-wish], aria-pressed, événement cart:change.
- ✅ **Sticky filters** (boutique), **sticky gallery** (parfum), **sticky drawer** (panier).
- ✅ **Focus trap** (menu/modal/drawer), **keyboard escape**, **scroll lock stacked**.
- ✅ **Delivery ETA** : calcul jours ouvrés, affichage sur confirmation.
- ✅ **Payment conditional UX** : champs différents par méthode (SMS, virement, carte, etc.).
- ✅ **Newsletter** : validation email, save `localStorage`, async Supabase.

## Images & Contenu

- ✅ **44 images produits** : couleur pleine, ratio 3:4, lazy-loading + dimensions déclarées.
- ✅ **25 logos maisons** : contraste monochrome, ou fallback à photo de flacon si manquant.
- ✅ **9 images d’ambiance** (`img/HERO-SECTION/`) + **4 images de hero** (`img/HERO-IMG/`), toutes en couleur.
- ✅ **Zéro orphelins** : chaque produit/article a son image, zéro placeholder, zéro broken links.
- ✅ **Zéro grayscale** : vérifié via grep, toutes les images en couleur native.

## Accessibilité & Performance

- **WCAG AA** : contraste ≥ 15:1 par construction monochrome (noir/blanc).
- **Focus visibles** : `2px` inversé selon fond (noir → white outline, blanc → black outline).
- **Navigation clavier** : tous les boutons, inputs, liens tabulables; menu/modal trap focus.
- **Labyrinthe** : `aria-hidden` (aide visuelle, pas unique moyen — menu accessible au clavier).
- **Images** : lazy-loading, dimensions déclarées, `decoding="async"`.
- **Réduction mouvement** : `prefers-reduced-motion:reduce` → tous anims 0.01ms ou cachées.
- **Motion** : dépensé une fois (philosophie Apple) — Lenis smooth scroll, pas de parallaxe gratuit.

## Données & Modèles

### Parfum (41 totaux)
```javascript
{
  id, name, maison, gender (homme/femme/mixte), famille, concentration,
  price (FCFA), sizes: [{ ml, price }],
  images: ["img/produits/..."],
  notes: { top, heart, base },
  sillage (1–5 scale), longevity (1–5 scale),
  featured (bool), year
}
```

### Maison (25 totaux)
```javascript
{
  name, logo ("img/maisons/..."), pays, annee, phrase,
  on_order (bool)
}
```

### Article (4 totaux)
```javascript
{
  id, title, kicker, date, reading (min), excerpt,
  image ("img/produits/..." ou "img/HERO-SECTION/..."), alt,
  body: ["paragraphe 1", ...],
  inline: { image, alt, caption }
}
```

## À remplacer pour la prod

- **Numéro WhatsApp** : `221000000000` → votre vrai numéro (dans config.js, contact.js, cart.js).
- **Prix FCFA** : indicatifs (EUR × 656 arrondi) → tarifs réels via `build_data.py`.
- **Images produit** : actuellement couleur, de qualité. Remplacer par visuels sous licence réelle si besoin.
- **Supabase** : créer schema (orders, newsletter, consultations, profiles, wishlist), câbler clés dans config.js.
- **Fonts** : actuellement Google Fonts (CDN). Self-host woff2 + subset pour perf prod.
- **Paiement** : Wave / Orange Money API à câbler, webhooks vers email/SMS vendor.
- **Bilingue FR/EN** : routes dupliquées (`/en/index.html`) + data i18n + toggle lang.

## Écarts assumés vs brief initial

- ✅ Pas de Vite/bundler : vanilla, code prêt à brancher un back sans refactor.
- ✅ Pas de Supabase à ce stade : structure prête, clés vides = localStorage seul.
- ✅ Pas de vraie paiement : checkout UX designed, backend absent (formulaires en localStorage).
- ✅ Carte contact en SVG stylisé monochrome (pas de Mapbox/Google Maps).

## Ouverture & Pérennité

Le site est **autonome** : données embarquées, zéro dépendance réseau au-delà du CDN Google Fonts (fallback local possible). Tous les scripts passent `node --check` (syntaxe valide). Prêt pour :
- ✅ Supabase (auth + RLS).
- ✅ Paiement (Wave / Orange Money).
- ✅ i18n FR/EN.
- ✅ Self-host (fonts woff2, asset CDN).
- ✅ Analytics (Plausible / Fathom).

**Prochains pas** (roadmap) : schema Supabase, photos sous licence, audit A11y formel, CI/CD, analytics.
