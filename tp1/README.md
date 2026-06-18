# Mini-Projet S2 : Fondations HTML & Sémantique Native

Bienvenue dans votre mini-projet de la semaine 2 ! L'objectif de cette semaine est de maîtriser l'architecture d'une page web en utilisant exclusivement du **HTML5 sémantique**, d'apprendre à inspecter votre code et de garantir un web accessible. Ex: Page de profil personnel.

Ce dépôt sert de modèle de départ. Il contient déjà un fichier de style un peu particulier : `semanstyle.css`.

---

## 🎯 Objectifs Pédagogiques
* Comprendre et concevoir l'architecture globale d'une page web.
* Utiliser les balises sémantiques à bon escient (`<main>`, `<article>`, `<nav>`, `<aside>`, etc.).
* Lier un formulaire fonctionnel et accessible sans tricher.
* Valider son code avec le validateur W3C et l'inspecter via les **DevTools** du navigateur.

---

## ⚠️ La Règle du Jeu : Le Défi "Classless"

Pour ce projet, **vous n'avez pas le droit d'écrire de CSS, ni d'utiliser l'attribut `class` ou `id` à des fins de style.** 

Le fichier `semanstyle.css` fourni est un fichier de style *classless*. Cela signifie qu'il applique un design moderne et professionnel **uniquement si vous utilisez la bonne balise HTML au bon endroit**. 
* Si votre structure HTML est parfaite, votre site sera automatiquement magnifique (mode sombre inclus !).
* Si vous utilisez des `<div>` ou des `<span>` partout à la place des balises sémantiques, votre page restera plate, brute et sans mise en page. 

*Votre code HTML doit parler de lui-même !*

---

## 🛠️ Comment démarrer ?

1. **Forkez** ou clonez ce dépôt sur votre machine.
2. Créez un fichier `index.html` à la racine du projet si ce n'est pas déjà fait.
3. Liez le fichier CSS dans le `<head>` de votre document avec la ligne suivante :
```html
   <link rel="stylesheet" href="semanstyle.css">
```
4. Commencez à structurer votre contenu selon les spécifications de votre livrable

## 📋 Critères de Validation & Livrables
Votre projet sera évalué sur la qualité de sa structure, et non sur le design (puisque le CSS est automatisé). Voici votre checklist de validation :

1. Structure Globale
   - [ ] Présence d'un `<header>` principal, d'un `<main>` pour le cœur de la page, et d'un `<footer>`.

   - [ ] Un menu de navigation propre encapsulé dans une balise `<nav>`.

2. Sémantique et Hiérarchie
   - [ ] Utilisation d'au moins un élément `<article>` (qui générera une carte visuelle) et d'un élément `<aside>` (pour vos notes ou informations secondaires).

   - [ ] Une hiérarchie stricte des titres : un seul `<h1>` par page, suivi logiquement de `<h2>`, puis `<h3>`. Aucun saut de niveau (interdit de passer d'un `<h1>` à un `<h3>` !).

3. Accessibilité du Formulaire
   - [ ] Utilisation de `<fieldset>` et `<legend>` pour regrouper les champs.

   - [ ] Chaque élément `<input>` ou `<select>` doit être rigoureusement lié à un `<label>` via l'attribut for correspondant à l' id de l'input.

4. Diagnostics (DevTools & W3C)
   - [ ] Zéro erreur sur le Validateur W3C.

   - [ ] En ouvrant les DevTools (F12) de votre navigateur, l'arborescence dans l'onglet Elements doit refléter des imbrications propres sans balises orphelines.

🚀 Bon code à tous !
Ouvrez vos DevTools, inspectez votre code en temps réel et découvrez la puissance d'un HTML bien pensé.