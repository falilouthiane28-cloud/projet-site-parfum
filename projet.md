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

## Direction artistique — MONOCHROME (verrouillée)
- **Couleurs** : noir/blanc uniquement. 6 gris (`--ink #0A0A0A`, `--paper #FAFAF7`, gray-90/60/30/10). **Zéro couleur** — pas d'or, pas d'accent. Hiérarchie par contraste, échelle, espace, poids, mouvement.
- **Trait** : `--stroke: 2px` = unité du logo pour toute règle/bordure/cadre. Angles droits, zéro rayon.
- **Typographie** : Space Grotesk (display, capitales) + Hanken Grotesk (corps) + Space Mono (méta/prix).
- **Signature unique** : le Navigateur-Labyrinthe (plan de sol dans la marge gauche, marqueur au scroll).
- **Interdits** : toute couleur, curseur custom, 3D réflexe, emojis, mots « marketing » usés, isométrie/glassmorphism.
- **Mouvement** : dépensé une fois (principes Apple). `prefers-reduced-motion` coupe tout.

> Une 1re version (or + flacon 3D + serif) a précédé ce virage ; elle a été remplacée. Voir `docs/design-plan.md` et `docs/critique.md`.

## Périmètre (10 pages)
`index` · `boutique` · `parfum` · `maisons` · `rituel` · `journal` · `maison` · `contact` · `panier` · `compte`.

## Stack (verrouillée)
Vanilla HTML/CSS/JS **no-build** · GSAP 3.12 + ScrollTrigger + MotionPathPlugin · Lenis · Three.js r160 (import-map) · Bootstrap Icons · Google Fonts. **Pas** de framework JS, **pas** de framework CSS, **pas** de Vite/Supabase à ce stade.

## Public & marché
Clientèle Dakar + CEDEAO. Fort intérêt pour l'**oud** et les parfums moyen-orientaux (Lattafa, Al Haramain, Rasasi) en plus de la niche/prestige occidentale.

## Décisions structurantes (2026-09-23)
1. **Monochrome strict** (2e brief `/apple-design`) — remplace la 1re version colorée/3D.
2. Signature **Navigateur-Labyrinthe** ; typo **grotesque équarri** (Space Grotesk).
3. **Vanilla no-build** : panier/formulaires en `localStorage`, prêts à brancher un back.
4. Ossature des **10 pages**, home aboutie.

## Références d'inspiration
parfumsdemarly.com · maisonfranciskurkdjian.com · byredo.com · diptyqueparis.com · jovoyparis.com · aesop.com.

Voir `memory.md` (contexte technique & pièges) et `progress.md` (état d'avancement).
