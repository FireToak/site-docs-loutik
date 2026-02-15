---
sidebar_position: 2
title: Déploiement Kubernetes Outline
description: Déploiement des workloads Outline (App, Redis, Postgres) sur le cluster K3s.

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

![Logo Loutik](/img/logo_loutik.png)

---

:::info Métadonnées
* **Mainteneur(s) :** MEDO Louis
* **Dernière validation technique :** 2025-12-28
:::

---

## Contexte
Déployer l'application de prise de note Outline et ses dépendances étatiques sur le cluster de production.

---

## Prérequis

Avant de commencer, s'assurer de :
* [ ] Avoir les accès SSH sur le nœud maître (`k3s-m-prod-01`).
* [ ] Avoir récupéré le `Client ID` et `Client Secret` depuis Authentik.
* [ ] Avoir généré les mots de passe forts dans Bitwarden.

---

## Étape 1 : Préparation des sources

Récupération des manifestes et configuration des secrets.

### 1.1 Exécution
Sur le nœud maître :

```bash
# Création du dossier et clonage
mkdir -p ~/kubernetes/outline && cd ~/kubernetes/outline
git clone https://github.com/FireToak/k3s-deployment-outline.git .
```

### 1.2 Configuration des secrets
Éditer le fichier `outline-secret.yaml` :

1.  Remplacer les valeurs `*-bitwarden` par les mots de passe générés.
2.  Insérer le `Client ID` et `Client Secret` Authentik.

---

## Étape 2 : Déploiement

Application des manifestes sur le cluster.

### 2.1 Exécution
Lancer le déploiement dans le namespace dédié :

```bash
sudo kubectl apply -f ./outline -n outline
```

### 2.2 Vérification immédiate
Vérifier le statut des pods :

```bash
sudo kubectl get pods -n outline
# Attendre le statut Running (peut prendre quelques minutes pour la DB)
```

---

## Validation Finale

Comment s'assurer que tout fonctionne globalement ?

* [ ] Tous les pods (outline, redis, postgres) sont `Running`.
* [ ] Les logs ne montrent pas d'erreur critique de connexion à la base de données.

---

## Rollback (Retour arrière)

**Si le déploiement échoue :**

1.  Supprimer les ressources :
    ```bash
    sudo kubectl delete -f ./outline -n outline
    ```

---

## Références
* [Dépôt GitHub Manifestes](https://github.com/FireToak/k3s-deployment-outline)
* [Documentation Officielle Docker Outline](https://docs.getoutline.com/s/hosting/doc/docker-7pfeLP5a8t)