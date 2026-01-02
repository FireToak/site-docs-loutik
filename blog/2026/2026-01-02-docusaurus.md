---
slug: Le meilleur ami de la doc-as-code
title: Le meilleur ami de la doc-as-code
authors: louismedo
tags: [docusaurus, devops, veille]
---

Docusaurus est un générateur de site statique open-source conçu pour faciliter la création, la gestion et le déploiement de documentation technique. Il est particulièrement apprécié dans les communautés de développeurs et les projets open-source pour sa simplicité d'utilisation et ses fonctionnalités robustes.

<!-- truncate -->

Avoir une infrastructure sans documentation est comme avoir un vaiseau spatial sans carte stellaire : on peut s'y aventurer, mais on risque de se perdre rapidement. C'est pourquoi j'ai choisi Docusaurus pour documenter mon projet LoutikCLOUD.

## Pourquoi Docusaurus ?

1. **Facilité d'utilisation** : Docusaurus offre une configuration simple et une interface conviviale, permettant aux développeurs de se concentrer sur le contenu plutôt que sur la mise en place technique.
2. **Intégration avec Markdown** : Docusaurus utilise Markdown, un format de texte léger, ce qui facilite la rédaction et la maintenance de la documentation.
3. **Thèmes et plugins** : Il propose une variété de thèmes et de plugins qui permettent de personnaliser l'apparence et les fonctionnalités du site.
4. **Versioning** : Docusaurus prend en charge la gestion des versions, ce qui est essentiel pour les projets en évolution constante.

## Mise en place dans LoutikCLOUD

J'ai structuré la documentation de LoutikCLOUD en plusieurs sections claires, couvrant tous les aspects du projet, de l'infrastructure physique aux services déployés. Chaque section est organisée de manière logique, avec des guides pas à pas, des explications techniques et des références utiles.

Je l'utilise en local pour rédiger mes documentations, puis je réalise un git push vers le dépôt GitHub, ensuite avec un GitHub Action, le site est automatiquement généré et déployé sur mon infrastructure kubernetes.