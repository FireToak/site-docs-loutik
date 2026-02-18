---
sidebar_position: 2
title: Administration au quotidien et débogage (FluxCD)
description: Comment administrer et deboguer FluxCD

# -------------------------------------------------------------------------
# 🎯 MODÈLE : ACTION (VIVANT)
# -------------------------------------------------------------------------
---

![Logo Loutik](/img/logo_loutik.png)

---
## Informations générales

* **Mainteneur :** Louis MEDO
* **Dernière validation technique :** 18/02/2026

---
## Contexte

Ce document sert d'aide-mémoire pour l'exploitation courante de l'infrastructure GitOps. Il centralise les commandes CLI essentielles pour vérifier l'état des synchronisations en temps normal, et répertorie les commandes de diagnostic pour identifier et résoudre rapidement un blocage de déploiement.

---
## Prérequis

- [ ] Un accès `kubectl` configuré et authentifié vers le cluster Kubernetes.
- [ ] L'utilitaire en ligne de commande `flux` installé sur le poste d'administration.
- [ ] Disposer des droits de lecture sur le namespace `flux-system`.

---
## Sommaire

1. Commandes d'exploitation au quotidien
2. Commandes de diagnostic et de débogage

---
## 1. Commandes d'exploitation au quotidien

### Visualiser l'état global de l'infrastructure.
> Obtenir une vue d'ensemble des succès ou des échecs de synchronisation sur tous les composants FluxCD.

```bash
flux get all -A
````

- **`get all` :** Demande à Flux de lister toutes les ressources qu'il gère (GitRepositories, Kustomizations, HelmReleases, etc.).
- **`-A` (All namespaces) :** Étend la recherche à la totalité des espaces de noms du cluster, et pas seulement au namespace par défaut.

### Forcer une synchronisation (Réconciliation). 
> Ordonner à Flux d'appliquer immédiatement le code Git sans attendre la fin du compte à rebours de l'intervalle configuré.

```Bash
flux reconcile kustomization flux-system --with-source
```

- **`reconcile` :** Notion clé de GitOps. Force la comparaison entre l'état attendu (Git) et l'état réel (Cluster) et applique les corrections.
- **`kustomization flux-system` :** Cible l'objet de synchronisation racine de l'infrastructure.
- **`--with-source` :** Force Flux à retélécharger d'abord le dernier commit sur GitHub avant de lancer l'application du code.

### Suspendre une automatisation. 
> Mettre en pause le GitOps sur une application spécifique pour permettre une intervention manuelle d'urgence sur le cluster sans que Flux n'écrase les modifications.

```Bash
flux suspend kustomization nom-de-l-app
```

- **`suspend` :** Désactive temporairement la boucle de surveillance du composant.
- _(Note : La commande inverse pour réactiver le GitOps est `flux resume kustomization nom-de-l-app`)._

---
## 2. Commandes de diagnostic et de débogage

### Filtrer les journaux (Logs) d'erreurs. 
> Inspecter les processus internes des contrôleurs FluxCD pour comprendre pourquoi un objet refuse de se synchroniser.

```Bash
flux logs --all-namespaces --level=error
```

- **`logs` :** Interroge les journaux de conteneurs des pods composant le système FluxCD.
- **`--all-namespaces` :** Capture les logs concernant toutes les applications du cluster.
- **`--level=error` :** Notion de filtrage. Masque les messages de routine (Info/Debug) pour n'afficher que les anomalies bloquantes (ex: erreurs de syntaxe YAML ou problèmes de connexion à GitHub).

### Inspecter un composant en échec. 
> Afficher les événements détaillés d'un objet Kubernetes spécifique pour identifier la cause exacte d'une panne (ex: un Secret manquant).

```Bash
kubectl describe kustomization nom-de-l-app -n flux-system
```

- **`describe kustomization` :** Commande native Kubernetes qui affiche la configuration complète et l'historique de l'objet de déploiement Flux.
- **`-n flux-system` :** Spécifie l'espace de noms où se trouve l'objet de synchronisation Flux.
- **Notion (Events) :** La partie la plus importante du résultat se trouve tout en bas de l'affichage. La section "Events" listera les messages d'erreur de compilation (ex: `Secret not found`).

### Vérifier les événements système liés aux images. 
> Déboguer les pannes de l'Image Update Automation lorsqu'un tag n'est pas mis à jour automatiquement.

```Bash
flux get image policy -A
```

- **`get image policy` :** Liste les règles de filtrage de versions configurées sur le cluster.
- **Notion (Latest image) :** La sortie de cette commande affiche la colonne `LATEST IMAGE`. Si cette colonne est vide ou affiche une mauvaise version, cela signifie que le problème vient du registre Docker (inaccessible) ou de la règle SemVer (mal rédigée), et non du dépôt Git.

---
## Ressources

- [FluxCD - Commandes CLI (Cheat Sheet)](https://fluxcd.io/flux/cmd/)
- [Kubernetes](https://kubernetes.io/docs/home/)