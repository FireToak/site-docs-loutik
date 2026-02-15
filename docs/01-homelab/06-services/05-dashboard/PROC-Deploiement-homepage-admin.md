---
sidebar_position: 2
title: Déploiement Kubernetes Launcher Admin
description: Déploiement du Dashboard Administrateur de LoutikCLOUD.

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
* **Dernière validation technique :** 2026-02-15
:::

---

## Contexte
Déployer le service de centralisation des liens vers les interfaces de management des services de LoutikCLOUD.

---

## Prérequis

Avant de commencer, s'assurer de :
* [ ] Avoir les accès SSH sur le nœud maître (`k3s-m-prod-01`).
* [ ] Avoir configuré le proxy SSO sur Authentik. [procédure]()

---

## Étape 1 : Préparation des sources

Récupération des manifestes kubernetes depuis le dépôt github.

### 1.1 Exécution
Sur le nœud maître :

```bash
# Création du dossier et clonage
mkdir -p ~/kubernetes/launcher-admin && cd ~/kubernetes/launcher-admin
git clone https://github.com/FireToak/loutik-cloud_launcher-admin.git .
```

---

## Étape 2 : Déploiement

Application des manifestes sur le cluster.

### 2.1 Exécution
Lancer le déploiement dans le namespace dédié :

```bash
sudo kubectl apply -f . -n site-internet
```

:::warning
Pensez à créer le namespace avant d'appliquer les manifests.
:::

### 2.2 Vérification immédiate
Vérifier le statut des pods :

```bash
sudo kubectl get pods -n site-internet
# Attendre le statut Running
```

---

## Validation Finale

Comment s'assurer que tout fonctionne globalement ?

* [ ] Le pod launcher-admin est `Running`.
* [ ] Les logs ne montrent pas d'erreur critique.
* [ ] L'authentification Authentik fonctionne.

---

## Rollback (Retour arrière)

1.  Supprimer les ressources :
    ```bash
    sudo kubectl delete -f ./outline -n outline
    ```

---

## Références
* [Dépôt GitHub Manifestes](https://github.com/FireToak/loutik-cloud_launcher-admin.git)