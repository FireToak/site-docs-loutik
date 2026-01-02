---
slug: Le meilleur ami de la doc-as-code
title: Le meilleur ami de la doc-as-code
authors: louismedo
tags: [docusaurus, devops, veille]
---

Salut ! Aujourd'hui, je vais te parler de **Docusaurus**, un outil qui m'a carrément sauvé la vie pour mes projets de dev. Si tu en as marre de galérer avec la documentation ou que tu cherches un moyen simple de créer un site pour ton projet, tu es au bon endroit.

<!-- truncate -->

## C'est quoi Docusaurus exactement ?

Docusaurus, c'est un générateur de sites statiques créé par Meta (ouais, les mêmes qui ont fait React). En gros, c'est un framework qui te permet de créer des sites de documentation super propres sans avoir à tout coder from scratch. Le meilleur ? Tu écris juste en Markdown et hop, t'as un site professionnel.

## Pourquoi j'ai craqué pour cet outil

Franchement, au début j'étais sceptique. Encore un nouvel outil à apprendre ? Mais après l'avoir testé pour mon projet de fin d'année, je peux te dire que ça vaut vraiment le coup. Voilà pourquoi :

### C'est super rapide à mettre en place

Littéralement, en 5 minutes tu peux avoir un site fonctionnel. Tu fais un `npx create-docusaurus@latest mon-site classic` et bam, t'es prêt. Pas besoin de passer des heures à configurer des trucs compliqués.

### Le Markdown, c'est la vie

Si t'es étudiant en info, tu connais déjà le Markdown (README.md, ça te parle ?). Avec Docusaurus, tu écris ta doc exactement comme tu écrirais un fichier Markdown normal. Pas de HTML à se taper, pas de syntaxe bizarre à apprendre.

### Le mode sombre inclus

Ok, c'est peut-être pas l'argument le plus sérieux, mais avoir le dark mode par défaut, c'est quand même stylé. Et puis, on code souvent la nuit, donc c'est pratique pour nos yeux fatigués.

### La recherche intégrée

Docusaurus propose une barre de recherche qui marche super bien. Plus besoin de faire défiler des pages pendant 10 minutes pour retrouver cette fonction que tu avais documentée il y a 3 semaines.

## Comment ça marche concrètement ?

Le principe est assez simple. Tu as une structure de dossiers claire :

- `docs/` : c'est là que tu mets toute ta documentation
- `blog/` : pour tes articles de blog (comme celui-ci)
- `src/pages/` : pour créer des pages custom
- `static/` : pour tes images et fichiers statiques

Tu crées un fichier Markdown, tu ajoutes un petit header en haut avec quelques infos, et c'est bon. Docusaurus se charge de tout le reste : la navigation, le sidebar, le design, tout.

## Mon expérience perso

J'ai utilisé Docusaurus pour documenter mon projet de machine learning du dernier semestre. Avant, j'avais juste un gros README.md qui devenait ingérable. Avec Docusaurus, j'ai pu séparer ma doc en plusieurs parties : installation, utilisation, API reference, exemples, etc.

Le truc cool, c'est que mes profs ont trouvé ça super pro. Alors que derrière, ça m'a pris genre une après-midi à mettre en place et quelques heures pour migrer ma doc existante.

## Quelques tips si tu veux te lancer

**Commence petit** : pas besoin de tout documenter d'un coup. Crée d'abord les pages essentielles et tu complètes au fur et à mesure.

**Utilise les versions** : Si ton projet évolue, Docusaurus gère le versioning. Ça permet de garder la doc des anciennes versions accessibles.

**Personnalise progressivement** : Le thème par défaut est déjà très bien, mais tu peux customiser les couleurs et le logo facilement dans le fichier de config.

**Déploie sur GitHub Pages** : C'est gratuit et Docusaurus s'intègre parfaitement. En plus, ça fait un lien de plus pour ton portfolio.

## Les petits inconvénients (soyons honnêtes)

Bon, c'est pas parfait non plus. Si t'as jamais touché à React ou Node.js, la courbe d'apprentissage peut être un peu raide au début. Et puis, pour des sites super simples, c'est peut-être un peu overkill.

Mais franchement, pour documenter un projet de dev, c'est vraiment le meilleur compromis entre simplicité et résultat pro que j'ai trouvé.

## Conclusion

Si tu dois documenter un projet pour un cours, un stage, ou même un side project perso, fonce sur Docusaurus. C'est gratuit, c'est open source, et ça te fait gagner un temps fou.

En plus, avoir un site de doc bien fait, ça montre que tu prends ton projet au sérieux. Et ça, que ce soit pour impressionner un prof ou un recruteur, c'est toujours un plus.

Allez, maintenant tu n'as plus d'excuse pour ne pas documenter tes projets correctement ! 😉

---

*PS : Si tu testes Docusaurus, n'hésite pas à me faire un retour. Je suis toujours curieux de voir comment les autres l'utilisent !*