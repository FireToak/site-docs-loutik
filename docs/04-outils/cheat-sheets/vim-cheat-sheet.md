---
id: vim-cheat-sheet
title: 📝 Cheat Sheet VIM
sidebar_label: VIM (Éditeur)
description: Les commandes essentielles, la substitution et les raccourcis pro pour VIM.
tags: [linux, cli, editeur]
---

# 📝 Cheat Sheet VIM

:::info Concept Clé : La Modalité
Contrairement aux éditeurs classiques, VIM fonctionne par **MODES**.
* **Normal (Echap) :** Pour naviguer et manipuler (mode par défaut).
* **Insertion (i) :** Pour écrire du texte.
* **Visuel (v) :** Pour sélectionner du texte.
* **Commande (:) :** Pour sauvegarder, quitter, chercher, remplacer.
:::

## 💾 Sauvegarder et Quitter
En **Mode Normal** (touche `Echap`).

| Commande | Action | Explication |
| :--- | :--- | :--- |
| `:w` | **W**rite | Sauvegarde le fichier. |
| `:wq` | **W**rite & **Q**uit | Sauvegarde et quitte (ou raccourci `ZZ`). |
| `:q!` | Force **Q**uit | Quitte **sans sauvegarder** (ignore les changements). |
| `:x` | E**x**it | Sauvegarde et quitte (similaire à `:wq`). |

## 🚀 Navigation Rapide

| Touche | Déplacement | Détail |
| :--- | :--- | :--- |
| `gg` | Go Go | Va au **début** du fichier (ligne 1). |
| `G` (maj) | Ground | Va à la **fin** du fichier. |
| `:15` | Ligne X | Va directement à la ligne 15. |
| `$` | Fin ligne | Va à la fin de la ligne courante. |
| `0` | Début ligne | Va au début de la ligne courante. |

## ✏️ Édition et Insertion

| Touche | Action | Nuance importante |
| :--- | :--- | :--- |
| `i` | **I**nsert | Insère avant le curseur. |
| `a` | **A**ppend | Insère après le curseur. |
| `o` | **O**pen | Ouvre une ligne **en dessous** et insère. |
| `u` | **U**ndo | Annule la dernière action (Ctrl+Z). |
| `Ctrl` + `r` | **R**edo | Rétablit l'action annulée. |

## 🔄 Rechercher et Remplacer (Substitution)
Ces commandes sont très puissantes pour modifier des fichiers de configuration rapidement.

| Commande | Action | Explication |
| :--- | :--- | :--- |
| `/mot` | Recherche | Cherche "mot". (`n` = suivant, `N` = précédent). |
| `:s/vieux/neuf` | Remplacer (Ligne) | Remplace la **première** occurrence sur la ligne **courante**. |
| `:s/vieux/neuf/g` | Remplacer (Ligne Tout) | Remplace **toutes** les occurrences sur la ligne **courante**. |
| `:%s/vieux/neuf/g` | Remplacer (Fichier) | Remplace **tout** dans **tout le fichier**. |
| `:%s/vieux/neuf/gc` | Remplacer (Confirm) | Idem, mais **demande confirmation** pour chaque changement. |

:::tip Astuce : Le slash `/`
Si ton texte contient des slashes (ex: un chemin `/var/www`), utilise un autre séparateur pour plus de clarté, comme `#`.
Exemple : `:%s#/var/www#/opt/web#g`
:::

## ⚡ Fonctions Avancées "Pro"

Voici les commandes qui font gagner un temps précieux en administration système.

### Vider / Supprimer
| Commande | Action | Mémotechnique |
| :--- | :--- | :--- |
| `dd` | Couper ligne | Supprime la ligne entière. |
| `5dd` | Couper X lignes | Supprime 5 lignes d'un coup. |
| `dw` | Delete Word | Supprime le mot sous le curseur. |
| `D` | Delete End | Supprime du curseur jusqu'à la fin de la ligne. |
| `gg` + `dG` | **Vider Fichier** | Va au début (`gg`) et supprime tout jusqu'à la fin (`dG`). |

### Objets Textuels (Text Objects)
Très utile pour modifier du contenu entre guillemets ou parenthèses sans viser précisément.

| Commande | Action | Exemple d'usage |
| :--- | :--- | :--- |
| `ci"` | **C**hange **I**nside `"` | Efface le texte entre les `""` et passe en insertion. |
| `ci(` | **C**hange **I**nside `(` | Efface le texte entre les `()` et passe en insertion. |
| `cit` | **C**hange **I**nside **T**ag | Efface le contenu entre deux balises HTML/XML (`<div>...</div>`). |

### Sélection Visuelle (Visual Mode)
| Touche | Mode | Usage |
| :--- | :--- | :--- |
| `v` | Visuel (Caractère) | Sélectionne caractère par caractère. |
| `V` (maj) | Visuel (Ligne) | Sélectionne des lignes entières. |
| `Ctrl` + `v` | Visuel (Bloc) | Sélectionne une colonne verticale (Top pour décommenter). |

:::warning Commenter plusieurs lignes (Bloc)
1. Fais `Ctrl` + `v` pour sélectionner le début des lignes.
2. Appuie sur `I` (i majuscule).
3. Tape `#`.
4. Appuie sur `Echap` **deux fois**. VIM va appliquer le `#` sur toutes les lignes.
:::