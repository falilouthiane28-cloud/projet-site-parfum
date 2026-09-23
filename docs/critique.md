# Critique — avant construction (brief §6)

Passage honnête au crible du plan, puis ce que j'ai changé.

1. **Un designer lambda arriverait-il au même résultat ?**
   - Palette : le brief l'impose (monochrome) → identique par force, pas par paresse. OK.
   - Typo : le défaut « luxe » aurait été un serif haute-couture (Cormorant/Playfair). J'ai pris un **grotesque équarri** (Space Grotesk) parce que le logo n'a *aucune courbe* — choix dérivé du sujet, pas du réflexe. **Changé** vs mon build précédent (qui était en plein défaut serif).
   - Signature : le labyrinthe vient directement de *ce* logo → non transposable. OK.

2. **Signature décorative ou structurelle ?** Structurelle : c'est le système de **wayfinding** du site (où suis-je / où aller). Elle répond à une vraie question d'usage, elle ne décore pas.

3. **Ai-je copié Aesop / Byredo / Diptyque / NYT ?**
   - Emprunté : la retenue éditoriale et l'espace négatif (vocabulaire commun du secteur).
   - Nouveau : le plan-de-sol navigable et l'encodage densité=concentration. Aucun de ces sites n'a de navigation-labyrinthe liée à son propre logo.

4. **Une couleur, même ténue ?** Non. Suppression de **tout** l'or (`--color-gold`), du halo ambré, du liquide ambré. Feedback (erreur/succès) exprimé par poids/soulignement/position, pas par teinte. **Changé.**

5. **Pairing typo trop sûr ?** Space Grotesk + Hanken Grotesk + Space Mono ne figurent pas dans les listes « polices de luxe ». Passe. (Bodoni Moda proposé en alternative assumée si serif voulu.)

6. **Symétrie de confort ?** Hero aligné à gauche (pas centré), mur des maisons en paragraphe asymétrique, panneau de survol décalé à droite. Au moins une section porte du sens par l'asymétrie.

7. **Copie « marketing IA » ?** Réécriture selon §9 : suppression des mots bannis, casse phrase, verbes exacts (« Ajouter au panier », « Prendre rendez-vous », « Envoyer »). Descriptions parfum en présent, noms concrets d'abord.

8. **Sur-animation pour « faire premium » ?** Coupé : flacon 3D hero, pyramide 3D interactive, particules, curseur custom, boutons magnétiques, parallaxe multiple. Reste : le tracé du labyrinthe (une fois), reveals de titres, soulignements. Moitié du mouvement en moins.

## Ce que je change concrètement par rapport au site actuel (TERANGA or + 3D)
- Tokens : remplacer or/ivoire/ambre par les 6 gris. `--stroke: 2px` comme unité de trait.
- Fonts : Cormorant/Playfair/Italiana/Inter → Space Grotesk / Hanken Grotesk / Space Mono.
- Supprimer : `hero-flacon.js`, `pyramide.js` (Three.js), curseur, halo, particules, boutons magnétiques.
- Ajouter : `labyrinth.js` (tracé + marqueur de progression au scroll).
- Réécrire toute la copie FR selon §9 (retirer les mots bannis).
- Conserver l'architecture réutilisable : `shell.js`, `motion.js` (allégé), pages, `data/*.json`, panier, quiz, checkout.

## Risque assumé (l'unique)
Le **Navigateur-Labyrinthe** : une navigation non conventionnelle. Garde-fous : reste une aide (jamais le seul moyen de naviguer — le menu classique demeure), entièrement au clavier, masquée sous 768px et en `prefers-reduced-motion`, `aria-hidden` sur le tracé décoratif avec libellés de section accessibles à côté.
