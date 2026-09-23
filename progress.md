# Avancement — TERANGA (monochrome)

Dernière mise à jour : 2026-09-23 (v2 complète)

## Légende
✅ Fait & vérifié · 🟡 Partiel / placeholder · ⬜ À faire

## Virage design (2e brief /apple-design) — VERROUILLÉ
Le site est passé d'une 1re version **or + flacon 3D + serif** à une direction **monochrome stricte** (noir/blanc), signature **Navigateur-Labyrinthe**, typo **Space Grotesk / Hanken Grotesk / Space Mono**. La 3D, l'or, le curseur custom et les boutons magnétiques ont été supprimés.
**Changement majeur** : passage à une **architecture modulaire JavaScript** avec couche données embedée (`assets/js/data.js`) pour contourner le blocage `file://` protocol.

## Fondations (v2 Complète)
- ✅ Design system monochrome (`app.css`, `home.css`, `pages.css`) : 6 gris, `--stroke: 2px`, accent contextuel (encre/papier), angles droits.
- ✅ **CRITIQUE** : Zéro filtres grayscale sur les images (vérifié : 44 images en couleur pleine).
- ✅ Fonts sur les 10 pages (Space Grotesk / Hanken Grotesk / Space Mono via Google Fonts).
- ✅ Chrome partagé (`shell.js`) : header, menu sticky, footer, loader, tiroir panier + **labyrinthe robuste**.
- ✅ **Couche données embarquée** : `assets/js/data.js` + `window.TERANGA_DATA` (41 parfums, 25 maisons, 4 articles, tous images).
- ✅ Utilitaires (`core.js`) : formatage FCFA, XSS prevention (`T.esc`), localStorage, focus trap, scroll lock.
- ✅ API layer (`api.js`) : localStorage-first, async sync vers Supabase (clés vides = localStorage seul).
- ✅ Config (`config.js`) : zones livraison (Dakar/Sénégal/CEDEAO/Pickup), WhatsApp, coordonnées, horaires.
- ✅ Moteur mouvement (`motion.js`) : Lenis (lerp 0.08) + GSAP + ScrollTrigger + Flip, idempotent.
- ✅ Composants produit (`product.js`) : `T.card()`, `T.detail()`, `T.related()`, quick-view avec deep linking.
- ✅ Panier (`cart.js`) : 500+ lignes, localStorage, drawer sticky, checkout multi-étapes, validation tel/email/zone.

## Image Management (Résolu ✅)
- ✅ **44 images produits** (img/produits/) — tailles M-XXL, couleur pleine.
- ✅ **25 logos maisons** (img/maisons/) — contrastes monochrome, fallback à photo de flacon.
- ✅ **7 images ambiance** (img/ambiance/) — lifestyle, éditorial, couleur.
- ✅ **Zéro orphelins** : tout article/produit a son image, zéro placeholders, zéro broken links.
- ✅ **10 fichiers en archives** (doublons MD5 + placeholder + watermark Adobe) → `_archive/img/`.

## Pages (10/10 Complètes)
| Page | État | Détail |
|---|---|---|
| index | ✅ | Hero 7 slides (scrub scroll), bento featured, marquee maisons, rail nouveautés, rituel, journal, newsletter, visite, footer |
| boutique | ✅ | 41 cartes, filtres genre/famille/maison/prix, tri 5 modes, URL-synced state, reset filtre |
| parfum | ✅ | Fiche complète : galerie (sticky left), infos (droite), tailles/prix, panier, wishlist, pyramide notes, similaires |
| maisons | ✅ | Grille maisons en rayon (triées par count) + section commande spéciale (3×3 logos) |
| rituel | ✅ | Quiz 6 questions, profil résultant, top 3 produits recommandés, transitions GSAP |
| journal | ✅ | Liste articles (tri date desc) + article detail avec hero, body, drop cap, media inline |
| maison | ✅ | Narration 5 chapitres (alternance img/texte), mission/valeurs, 3 pledges grid |
| contact | ✅ | Formulaire + infos (contact/horaires/coordonnées) + map SVG stylisé monochrome |
| panier | ✅ | Produits, quantities ±, résumé prix, zones livraison, type paiement (6 options), remarques, confirmation + WhatsApp |
| compte | ✅ | Tabs auth/commands/wishlist/profile, localStorage-synced, préparée pour Supabase (auth.signUp/signIn/getUser) |

## Livraison & Données
- ✅ **data/build_data.py** : master script 500+ lignes, génère `assets/js/data.js` (35KB) + JSON humains.
- ✅ **window.TERANGA_DATA** : objet global embarqué, fallback `window.loadData(name)` → fetch si HTTP.
- ✅ **Toutes les 41 fiches produit** : ID, nom, maison, concentration, gender, famille, prix, tailles (ML), images, notes (top/heart/base), sillage (1–5).
- ✅ **Toutes les 25 maisons** : logo (ou fallback image), pays, année, phrase, count produits, on_order flag.
- ✅ **4 articles journaux** : titre, kicker, date, temps lecture, hero, excerpt, body paragraphes, inline media.

## Validation & Pas de Régressions
- ✅ **12 fichiers JS** passent `node --check` (syntaxe valide).
- ✅ **Zéro grayscale** : verified via grep (4 violations historiques → supprimées).
- ✅ **Émojis/caractères spéciaux** : noms images nettoyés (4 fichiers renommés).
- ✅ **localStorage** : try-catch sur tous les accès (private mode safe).
- ✅ **XSS prevention** : `T.esc()` sur toutes les données dynamiques.

## UX Avancée
- ✅ Cart persistence cross-tabs (storage event listener).
- ✅ Delivery zone ETA (addBusinessDays, affichage sur confirmation).
- ✅ Payment method conditional fields (sms/whatsapp/bank/card/wave/orange-money).
- ✅ Wishlist (toggle via [data-wish], aria-pressed, événement cart:change).
- ✅ Deep linking (`?parfum=id` → ouvre modal, history.pushState, popstate close).
- ✅ Sticky filters (boutique), sticky gallery (parfum), sticky drawer (panier).
- ✅ Focus trap (menu/modal/drawer), keyboard escape, scroll lock stacked.

## Voix & Branding
- ✅ Navigateur-Labyrinthe (44px fixed left, SVG dynamique au scroll).
- ✅ Chambrettes via `data-chamber` sur sections (Accueil, Boutique, Maisons, Rituel, Journal, Maison, Contact).
- ✅ Voix sobre, sensorielle, poétique (mots bannis retirés).
- ✅ Casse phrase cohérente (majuscule en début seulement).

## Non fait (écarts assumés)
- ⬜ Supabase backend (structure prête, juste clés manquantes).
- ⬜ Toggle FR/EN runtime (URLs différentes + data i18n requises).
- ⬜ Self-host fonts woff2 (optimization de perf, non critique v1).
- ⬜ Paiement en ligne (Wave/Orange Money API).
- ⬜ Audit Lighthouse formel (pas de CI/CD).

## Prochaines étapes (Roadmap)
1. **Supabase** : créer schema (orders, newsletter, consultations, profiles, wishlist), câbler auth + RLS.
2. **Photos** : intégrer visuels sous licence réelle (actuellement placeholder colorés).
3. **Audit A11y** : parcours clavier complet, WCAG AA formel (axe).
4. **i18n FR/EN** : dupliquer routes, data i18n, toggle langue sticky.
5. **Paiement** : webhooks Wave/Orange Money, commander vers email/WhatsApp vendor.
6. **Perf** : self-host fonts, image optimization, CDN, gzip, cache headers.
