# Avancement — TERANGA (monochrome)

Dernière mise à jour : 2026-09-23

## Légende
✅ Fait & vérifié · 🟡 Partiel / placeholder · ⬜ À faire

## Virage design (2e brief /apple-design)
Le site est passé d'une 1re version **or + flacon 3D + serif** à une direction **monochrome stricte** (noir/blanc), signature **Navigateur-Labyrinthe**, typo **Space Grotesk / Hanken Grotesk / Space Mono**. La 3D, l'or, le curseur custom et les boutons magnétiques ont été supprimés. Plan & critique : `docs/`.

## Fondations
- ✅ Design system monochrome (`app.css`) : 6 gris, `--stroke: 2px`, accent contextuel (encre/papier), angles droits.
- ✅ Fonts basculées sur les 10 pages (Space Grotesk / Hanken Grotesk / Space Mono).
- ✅ Chrome partagé (`shell.js`) : header, menu, footer, loader, tiroir panier + **labyrinthe** (robuste au resize / panneau caché).
- ✅ Moteur mouvement (`motion.js`) allégé, idempotent ; hero split fiabilisé (ScrollTrigger + filet 2,5s).
- ✅ Données `data/*.json` inchangées (30 parfums, 20 maisons, 6 collections, 4 articles, ingrédients).

## Pages
| Page | État | Détail |
|---|---|---|
| index | ✅ | Hero + labyrinthe, thèse, sélection bento, **pyramide typographique**, mur des maisons, note sur le choix, rituel, journal, boutique, lettre |
| boutique | ✅ | 30 cartes, filtres famille + maison, tri (tokens → monochrome auto) |
| parfum | ✅ | `?id=`, image collante (3D retirée), tailles, notes, ajout panier, similaires |
| maisons | ✅ | Annuaire 20 maisons |
| rituel | ✅ | Quiz 6 questions → recommandations |
| journal | ✅ | 4 articles + ancres |
| maison | ✅ | À-propos (numéros retirés, mot banni corrigé) |
| contact | ✅ | RDV privé, carte SVG monochrome |
| panier | ✅ | Panier + checkout → commande locale + WhatsApp |
| compte | ✅ | Identification locale, commandes, désirs, profil |

## Signature & voix
- ✅ Navigateur-Labyrinthe (plan de sol, marqueur au scroll, chambres via `data-chamber`).
- ✅ Densité = concentration (tracking des cartes selon EDT/EDP/Extrait) — détail secondaire.
- 🟡 Voix : mots bannis retirés des zones visibles ; passer les descriptions produit en revue fine.

## Placeholders / à finaliser
- 🟡 Photos produit (`placeholder-flacon.svg`, rendu grayscale) → visuels licenciés.
- 🟡 Prix FCFA indicatifs · 🟡 WhatsApp `221000000000` · 🟡 catalogue 30 (brief : 40+).

## Non fait (écarts assumés)
- ⬜ Vite + Supabase · ⬜ toggle FR/EN câblé · ⬜ self-host fonts (woff2) · ⬜ vraie carte · ⬜ paiement en ligne.
- ⬜ Audit Lighthouse/axe formel.

## Prochaines étapes suggérées
1. Photos réelles + catalogue 40+.
2. Supabase (panier/commandes/newsletter/RDV, RLS).
3. Audit Lighthouse + parcours clavier.
4. Bilingue FR/EN.
