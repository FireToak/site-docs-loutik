---
title: Introduction
description: Architecture du cluster Kubernetes (K3s), orchestration et gestion des identités.
---

# Introduction au Moteur Applicatif (Kubernetes)

Maintenant que le socle physique et réseau est stabilisé (VPS & Virtualisation), nous passons à la couche supérieure : **l'Orchestration de Conteneurs**.

Cette section détaille le déploiement de **Kubernetes**, le cœur applicatif de l'infrastructure **LoutikCloud**. C'est ici que tourneront les services finaux (Portfolio, Applications, Dashboards).

**Ce que nous allons voir ici :**
1.  **Le Cluster K3s** : Installation d'une distribution Kubernetes légère et performante.
2.  **L'Outillage DevOps** : Gestion des paquets avec HELM et mises à jour automatiques avec Keel.
3.  **L'Identité (SSO)** : Centralisation de l'authentification avec Authentik.

---

## 1. K3s : Kubernetes allégé

Pour cette infrastructure, j'ai choisi la distribution **K3s**. C'est une version certifiée de Kubernetes, mais allégée (binaire unique < 100Mo), idéale pour le Homelab et l'Edge Computing.

L'architecture se divise en deux rôles distincts :

* **Control Plane** : C'est le cerveau du cluster. Il gère l'API Server, la base de données (SQLite intégrée) et le répartiteur de charge (Traefik inclus par défaut).
* **Les Workers** : Les bras du cluster. Ce sont les nœuds qui exécutent réellement les charges de travail (Pods/Conteneurs).

:::info Pourquoi K3s ?
Contrairement à un Kubernetes classique ("K8s") qui demande beaucoup de ressources, K3s est optimisé pour consommer peu de RAM tout en fournissant toutes les fonctionnalités essentielles comme l'Ingress Controller (Traefik) prêt à l'emploi.
:::

---

## 2. Partie "Ops"

Un cluster Kubernetes nu ne suffit pas. Pour le maintenir efficacement, j'ai intégré une suite d'outils standards du marché :

* **HELM** : C'est le "APT" de Kubernetes. Il me permet de déployer des applications complexes (comme Authentik) via des *Charts* (modèles) configurables, plutôt que de gérer des centaines de fichiers YAML à la main.
* **Keel** : Un opérateur qui surveille mes dépôts de conteneurs. Si une nouvelle version d'image est disponible, Keel met à jour le service automatiquement. C'est du "CD" (Continuous Delivery) simplifié.
* **Git** : La configuration est stockée sur GitHub, permettant de versionner l'état désiré de l'infrastructure.

---

## 3. Sécurité et Identité (Authentik)

La sécurité des applications ne doit pas être gérée individuellement par chaque service. J'ai déployé **Authentik** pour centraliser la gestion des utilisateurs et des accès.

* **Rôle** : Fournir une authentification unique (SSO) pour tous les services (ex: Proxmox, Grafana, etc.).
* **Architecture** : Déployé via Helm dans un namespace dédié, Authentik s'appuie sur une base PostgreSQL persistante pour stocker les utilisateurs et Redis pour le cache.
* **Fonctionnalités** : Il gère la récupération de mot de passe par email et protège les applications via l'Ingress Traefik.