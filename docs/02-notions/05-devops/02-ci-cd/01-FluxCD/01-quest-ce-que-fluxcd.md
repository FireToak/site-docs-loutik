---
title: Qu'est-ce que FluxCD
description: Présentation de FluxCD
---

## A. Présentation

FluxCD est un outil de déploiement continu (Continuous Delivery) open source spécialement conçu pour Kubernetes.

Créé en 2016 par l'entreprise Weaveworks (qui a par la même occasion inventé le terme "GitOps"), le projet a été donné à la Cloud Native Computing Foundation (CNCF) en 2019 et a atteint le statut de projet "gradué" en 2022. La version actuelle, Flux v2, a été entièrement réécrite pour reposer sur le _GitOps Toolkit_, un ensemble de composants spécialisés qui améliorent ses performances, sa sécurité et son extensibilité.

## B. Quelle problématique FluxCD résout-il ?

Historiquement, le déploiement sur un cluster Kubernetes se fait en mode **Push** (pousser) : un pipeline d'intégration continue ou un administrateur envoie directement les configurations vers le cluster.

Cette méthode classique pose trois problèmes majeurs :

- **La dérive de configuration (Configuration Drift) :** Si une personne modifie manuellement une ressource directement sur le cluster, l'état réel de l'infrastructure ne correspond plus aux fichiers de configuration d'origine.
- **Le manque de traçabilité :** Il est complexe d'auditer avec précision qui a modifié l'environnement de production et quand.
- **Les failles de sécurité :** Les outils externes (comme les serveurs CI/CD) doivent détenir des accès administrateurs très sensibles pour pouvoir interagir avec le cluster Kubernetes.

## C. Comment résout-il cette problématique ? (GitOps)

FluxCD élimine ces vulnérabilités en inversant le processus. Il implémente le paradigme **GitOps** et fonctionne en mode **Pull** (tirer).

- **Git comme unique source de vérité :** L'intégralité de l'infrastructure et des applications doit être déclarée sous forme de code dans un dépôt Git.
- **Déploiement de l'intérieur :** L'outil s'installe directement à l'intérieur du cluster Kubernetes. Il n'attend pas de recevoir des ordres de l'extérieur ; c'est lui qui va interroger le dépôt Git à intervalles réguliers.
- **Sécurité renforcée :** Puisque le cluster "tire" lui-même sa configuration, aucun système externe n'a besoin des clés d'administration du cluster.

## D. Comment raisonne-t-il en arrière-plan ?

L'architecture de FluxCD est basée sur des microservices appelés **Controllers** (contrôleurs), qui exécutent en permanence un algorithme appelé **boucle de réconciliation** (Reconciliation Loop).

Le raisonnement s'effectue en trois temps continus :

1. **Observation :** Le contrôleur source (Source Controller) télécharge la dernière version des fichiers depuis le dépôt Git.
2. **Comparaison :** L'outil compare l'état désiré (le code dans Git) avec l'état actuel (les ressources actives dans Kubernetes).
3. **Réconciliation :** S'il détecte une différence (suite à un nouveau "commit" ou à une modification manuelle non autorisée sur le cluster), FluxCD applique automatiquement la configuration de Git pour écraser la dérive.

**Le concept fondamental :** Avec FluxCD, l'équation `État du Cluster = État de Git` est maintenue de force et en permanence.