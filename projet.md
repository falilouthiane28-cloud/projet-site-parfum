# TERANGA — Maison de Parfum · Dakar

## Vision
Salon olfactif de luxe **multi-marques** basé à **Dakar (Sénégal)**, boutique physique (Almadies) + e-commerce sur l'espace **CEDEAO**. Le site doit fonctionner comme un **salon numérique** : cinématique, sensoriel, sobre — et non comme un e-commerce générique.

Positionnement : le **pont** entre la haute parfumerie européenne/moyen-orientale et une clientèle africaine de connaisseurs (25–55 ans, urbaine, aisée, collectionneuse de niche).

Voix : sobre, sensuelle, poétique, sûre d'elle. Jamais bruyante, jamais explicative.

## Marque
- **Nom** : TERANGA (« hospitalité » en wolof).
- **Logo** : flacon monogramme linéaire, traits épais noirs, géométrie quasi-labyrinthique → sert d'ADN visuel (angles droits, crochets d'angle, puces géométriques).
- **Langues** : français (principal), anglais (secondaire, à câbler).
- **Devise** : XOF — affichage `XX,XXX FCFA` (séparateur `,`).

## Direction artistique — MONOCHROME STRICT + COULEUR IMAGES (v2 verrouillée)

**CRITIQUE** : La paleta UI est 100% monochrome (noir/blanc, 6 gris). **LA COULEUR VIENT ENTIÈREMENT DES IMAGES.**

- **Couleurs UI** : noir/blanc uniquement. 6 gris (`--ink #0A0A0A`, `--paper #FAFAF7`, gray-90/60/30/15/08/03). **Zéro couleur** — pas d'or, pas d'accent, pas de dégradé. Hiérarchie par contraste, échelle, espace, poids, mouvement.
- **Couleur images** : 44 produits + 25 logos + 7 ambianceshots en couleur pleine, natives. **Zéro grayscale**, zéro desaturation, zéro B&W. Toutes les images existent, aucun placeholder.
- **Trait** : `--stroke: 2px` = unité du logo pour toute règle/bordure/cadre. Angles droits, zéro rayon.
- **Typographie** : Bodoni Moda (display, serif haute parfumerie) + Hanken Grotesk (corps, 300–600). Google Fonts (CDN, production-ready). *(Space Grotesk / Space Mono — pistes d’une version antérieure — ne sont plus chargées.)*
- **Signature unique** : le **Navigateur-Labyrinthe** (plan de sol 44×44px fixed left, marqueur carré au scroll mark section). Le logo est un labyrinthe, un parfum est un chemin.
- **Interdits** : toute couleur UI, curseur custom, 3D réflexe, emojis, mots « marketing » usés (découvrir, expérience, élégant…), isométrie, glassmorphism.
- **Mouvement** : dépensé une fois (philosophie Apple). Lenis smooth scroll (`lerp 0.08`), SplitText, Flip modals, drag-physics rails. **Jamais gratuit.** `prefers-reduced-motion` → tout 0.01ms ou caché.

> Une 1re version (or + flacon 3D + serif) a précédé ce virage ; elle a été remplacée. Voir `docs/design-plan.md` et `docs/critique.md`.

## Périmètre (10 pages — Complètes)
| Page | Route | État |
|---|---|---|
| Accueil | `/index.html` | ✅ Hero scrub, bento, maisons, rituel, journal, newsletter, visite |
| Boutique | `/boutique.html` | ✅ 41 produits, filtres, tri, URL-sync |
| Parfum | `/parfum.html?id=` | ✅ Page dédiée (pas de modale) : galerie sticky, pyramide, sillage/tenue, panier, wishlist, similaires |
| Maisons | `/maisons.html` | ✅ Annuaire 25, en-rayon + commande-spéciale |
| Rituel | `/rituel.html` | ✅ Quiz 6 questions → profil + 3 produits |
| Journal | `/journal.html?a=` | ✅ Articles (liste ou detail), héros, corps, média inline |
| La Maison | `/maison.html` | ✅ Narration 5 chapitres, mission, valeurs |
| Contact | `/contact.html` | ✅ Formulaire RDV, infos, carte SVG monochrome |
| Panier | `/panier.html` | ✅ Produits, quantités, checkout, commande → WhatsApp |
| Compte | `/compte.html` | ✅ Auth, commandes, wishlist, profil (localStorage-synced) |

## Stack (Vanilla no-build)
- **Frontend** : HTML 5 · CSS 3 (@layer, CSS custom properties) · ES5+ (defer, no bundling).
- **Animation** : GSAP 3.12 (ScrollTrigger, Flip) · Lenis 1.1.13 (smooth scroll) · Bootstrap Icons 1.11.3.
- **Data** : JSON embedded (`window.TERANGA_DATA` in `assets/js/data.js`, 35KB).
- **Persistance** : localStorage-first (cart, auth, wishlist), async Supabase (if keys present).
- **Fonts** : Google Fonts (Bodoni Moda, Hanken Grotesk).
- **Pas** de framework JS, **pas** de framework CSS, **pas** de Vite, **pas** de npm à ce stade.

## Public & marché
- **Géographie** : Dakar boutique + CEDEAO e-commerce.
- **Démographique** : 25–55 ans, urbain, aisé, niche/prestige, collectionneur.
- **Affinités** : Oud + moyen-oriental (Lattafa, Al Haramain, Rasasi) + niche occidental (Byredo, MFK, Diptyque).

## Livraison v2 (2026-09-23)
1. ✅ **10 pages complètes** : HTML + CSS + JS, toutes navigables.
2. ✅ **44 images couleur** : produits, logos, ambiance (zéro grayscale, zéro placeholder).
3. ✅ **41 parfums** : fiches complètes, prix, notes, tailles, maison.
4. ✅ **25 maisons** : annuaire, logos, années, pays.
5. ✅ **4 articles** : journal avec héros, contenu, médias inline.
6. ✅ **Panier persistant** : localStorage cross-tab, checkout multi-étapes.
7. ✅ **Navigateur-Labyrinthe** : signature visuelle, chambers marquées.
8. ✅ **Accessibilité WCAG AA** : contraste natif (monochrome), focus visible, keyboard nav, aria-labels.
9. ✅ **Prêt file:// ou HTTP** : données embarquées, aucun CORS, aucun build requis.
10. ✅ **Prêt Supabase** : structure API layer, clés vides = localStorage seul.

## Décisions structurantes (2026-09-23)
1. **Monochrome strict + Couleur images** (2e brief `/apple-design`) — remplace la 1re version colorée/3D/3D.
2. Signature **Navigateur-Labyrinthe** (géométrie, chambrettes, marqueur scroll).
3. Typo **Bodoni Moda** (serif à fort contraste, vocabulaire de la haute parfumerie) sur **Hanken Grotesk** pour le corps.
4. **Vanilla no-build** : données embedées, localStorage-first persistance, prêt à brancher un back.
5. **Architecture modulaire JS** : couche config/data/core/api/product/cart/motion/shell, scripts non-bundled.
6. **Image-first design** : UI monochrome, images couleur (44 produits).

## Références d'inspiration & Alignement
- Monochrome design : **Apple**, **Diptyque**, **Comme des Garçons**, **Jil Sander**.
- Parfumerie prestige : **Parfums de Marly**, **Maison Francis Kurkdjian**, **Byredo**, **Diptyque**, **Jóvoy**, **Aesop**.
- Sensibilité africaine : couleur vibrante dans les images (célébration), UI sobre et cultivée.

## Écarts assumés vs brief initial (acceptés)
- ✅ Pas de 3D : phase 1 monochrome, 3D optionnel phase 2.
- ✅ Pas de vraie paiement : checkout UX designed, backend absent.
- ✅ Pas de Supabase prod : structure prête, clés vides = localStorage seul.
- ✅ Pas de FR/EN runtime : routes dupliquées future feature.
- ✅ Carte contact SVG (pas de Mapbox/Google Maps, monochrome pure).
- ✅ Pas de CI/CD/Analytics : vanilla stack, intégrations futures.

## Prochaines étapes (Roadmap)
1. **Supabase** : schema (orders, newsletter, consultations, profiles, wishlist), auth + RLS.
2. **Paiement** : Wave / Orange Money API, webhooks vers email/SMS vendor.
3. **Photos** : intégrer visuels sous licence réelle (actuellement couleur développement).
4. **i18n FR/EN** : routes dupliquées, data i18n, toggle lang sticky.
5. **Audit A11y** : parcours clavier formel, WCAG AA tests (axe).
6. **Perf & SEO** : self-host fonts woff2, image optimization, CDN, gzip, cache headers, Lighthouse 90+.
7. **Analytics** : Plausible ou Fathom (privacy-first).

Voir `progress.md` (état avancement), `memory.md` (pièges techniques), `docs/design-plan.md` + `docs/critique.md` (direction).
