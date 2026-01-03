---
title: Déploiement du portfolio sur K3s
description: Procédure de déploiement du portfolio dans le cluster k3s.
---
# Procédure - Déploiement du portfolio

**Phase 3 – Cluster Kubernetes**

![Logo Loutik](https://raw.github.com/firetoak/firetoak/master/00-logo-loutik.png)

---
## Informations générales

* **Date de création :** 31/12/2025
* **Dernière modification :** 31/12/2025
* **Auteur :** MEDO Louis
* **Version :** 1

---
## Objectif

Déployer le portfolio sur l’infrastructure Kubernetes.

:::info
Le portfolio est conçu dans une démarche **DevOps**.
Le code source est hébergé dans un dépôt Git et relié à une chaîne **CI/CD automatisée**.
À chaque `git push` sur le dépôt, une pipeline CI/CD est déclenchée afin de **builder une nouvelle image Docker** du portfolio et de la publier dans un registre d’images.

Le déploiement sur Kubernetes est ensuite **géré automatiquement** par l’outil **Keel**, qui vérifie périodiquement (toutes les 5 semaines) si une nouvelle image Docker est disponible.
Si une nouvelle version est détectée, Keel procède automatiquement au **redéploiement des pods** avec la nouvelle image, sans intervention manuelle.
:::

---
## Prérequis

* Cluster Kubernetes (k3s) fonctionnel.
* Traefik installé et configuré (Ingress Controller).
* Accès au dépôt Git contenant les manifests Kubernetes du portfolio.

---
## Sommaire

- A. Déploiement du portfolio

---
## A. Déploiement du portfolio

1. **Connectez-vous au cluster Kubernetes.** Aller dans le répertoire `kubernetes/portfolio`, puis récupérer le dépôt Git du déploiement du portfolio.

   ```bash
   # Créer le répertoire s'il n'existe pas et se positionner dedans
   mkdir -p ~/kubernetes/portfolio && cd ~/kubernetes/portfolio

   # Cloner le dépôt Git
   git clone https://github.com/FireToak/k3s-deployment-portfolio.git
   ```

2. **Créer le namespace.** Entrer la commande suivante afin de créer l’espace de nom dédié au portfolio :

   ```bash
   sudo kubectl apply -f namespace.yaml
   ```

3. **Appliquer les autres fichiers de déploiement.** Déployer l’ensemble des ressources Kubernetes (Deployment, Service, Ingress, annotations Keel, etc.) présentes dans le répertoire :

   ```bash
   sudo kubectl apply -f . -n site-internet
   ```

4. **Vérifier le déploiement.** Vérifier que le déploiement s’est bien déroulé en contrôlant l’état des pods :

   ```bash
   sudo kubectl get pods -n site-internet
   ```

**Résultat attendu :**

    ```bash
    NAME                         READY   STATUS    RESTARTS   AGE
    portfolio-54cd8f5969-rxdnt   1/1     Running   0          4h5m
    ```

---
## Bibliographie
- [K3s Documentation](https://rancher.com/docs/k3s/latest/en/)
