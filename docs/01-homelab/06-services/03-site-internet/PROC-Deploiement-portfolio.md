---
sidebar_position: 1
title: Déploiement du portfolio
description: Procédure pour le déploiement de l'application Portfolio sur le cluster Kubernetes.

# -------------------------------------------------------------------------
# 🎯 MODÈLE : ACTION (VIVANT)
# -------------------------------------------------------------------------
# Utilisez ce modèle pour les fichiers "Vivants" (sans date dans le nom) :
#
# - [PROC] : Procédure / Runbook (Pas à pas)
# - [CONF] : Fichier de configuration commenté
# - [INV]  : Inventaire (Tableaux d'IP, Matériel)
# -------------------------------------------------------------------------
---

![Logo Loutik](https://raw.github.com/firetoak/firetoak/master/00-logo-loutik.png)

---

:::info Métadonnées
* **Mainteneur(s) :** MEDO Louis
* **Dernière validation technique :** 2025-12-31
:::

---

## Contexte
Déployer le portfolio personnel sur l'infrastructure Kubernetes existante.

---

## Prérequis

Avant de commencer, s'assurer de :
* [ ] Avoir un cluster Kubernetes (K3s) fonctionnel.
* [ ] Avoir Traefik installé et configuré comme Ingress Controller.
* [ ] Avoir les accès SSH sur le nœud maître.

---

## Étape 1 : Récupération des sources

Téléchargement des manifestes Kubernetes depuis le dépôt Git.

### 1.1 Exécution
Créer le répertoire de travail et cloner le projet :

```bash
# mkdir -p : crée le dossier et les parents si nécessaire
# cd : se déplace dans le dossier
mkdir -p ~/kubernetes/portfolio && cd ~/kubernetes/portfolio

# git clone : télécharge le code source depuis le dépôt distant
git clone https://github.com/FireToak/k3s-deployment-portfolio.git .
```

### 1.2 Vérification immédiate
Vérifier la présence des fichiers YAML :

```bash
ls -l *.yaml
# Doit lister namespace.yaml et les autres fichiers de déploiement
```

---

## Étape 2 : Déploiement sur le cluster

Application des configurations Kubernetes.

1.  Créer le namespace :
    ```bash
    # apply -f : applique la configuration contenue dans le fichier
    sudo kubectl apply -f namespace.yaml
    ```
2.  Appliquer l'ensemble des manifestes :
    ```bash
    # -f . : cible tous les fichiers du dossier courant
    # -n : spécifie le namespace cible 'site-internet'
    sudo kubectl apply -f . -n site-internet
    ```

---

## Validation Finale

* [ ] Les pods sont en statut `Running` :
    ```bash
    sudo kubectl get pods -n site-internet
    # Attendu : portfolio-xxx 1/1 Running
    ```
* [ ] L'application est accessible via l'URL configurée dans l'Ingress.

---

## Rollback (Retour arrière)

**Si le déploiement échoue, voici comment nettoyer l'environnement :**

1.  Supprimer les ressources déployées :
    ```bash
    # delete : supprime les ressources définies dans les fichiers du dossier courant
    sudo kubectl delete -f . -n site-internet
    ```
2.  (Optionnel) Supprimer le namespace si nécessaire :
    ```bash
    sudo kubectl delete namespace site-internet
    ```

---

## Références
* [Dépôt Git du projet](https://github.com/FireToak/k3s-deployment-portfolio.git)