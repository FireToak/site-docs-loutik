---
sidebar_position: 1
title: Configuration SSO Authentik (Homepage)
description: Configuration de l'Identity Provider Authentik pour le service Homepage.

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
Configurer le fournisseur d'identité (IdP) pour sécuriser l'accès au Launcher Administrateur de LoutikCLOUD.

---

## Prérequis

Avant de commencer, s'assurer de :
* [ ] Avoir un accès administrateur à l'interface Authentik (`https://sso.loutik.fr`).
* [ ] Connaître l'URL de destination du service (`https://launcher-admin.loutik.fr`).

---

## Étape 1 : Création de l'application

Définition de l'application logique dans Authentik.

### 1.1 Exécution
Dans l'interface administrateur (`Applications` > `Applications` > `Create with Provider`) :

1.  **Name :** `Launcher Administrateur`
2.  **Slug :** `launcher-administrateur`
3.  **Policy engine mode :** `ANY`
4.  **UI Settings :**
    * **Launch URL :** `https://launcher-admin.loutik.fr`
    * **Open in new tab :** Sélectionné

---

## Étape 2 : Configuration du Provider OIDC

Configuration du protocole d'authentification.

### 2.1 Configuration de Proxy Provider
Sélectionner `Proxy Provider` et configurer :

1.  **Authorization flow :** `default-provider-authorization-implicit-consent`
2.  **Forward auth (single application) : :** `activé` (cliquer sur l'onglet)
3.  **External host :** `https://launcher-admin.loutik.fr`

### 2.2 Règles de sécurité
Pour le moment aucun groupe de sécurité, ni de règles de sécurité n'est configuré.

### 2.3 Configuration de l'Outposts
Dans l'interface administrateur (`Applications` > `Outposts` > `Edit (carré dans Action)`) :

![Capture d'écran - Edition du Outpost Authentik](/img/docs/homelab/authentik-homepage-dashboard/capture-ecran-edition-outpost-authentik.png)

1. Dans `Applications` ajouter `Launcher Administrateur` dans `Selected Applications`.

![Capture d'écran - Edition du Outpost Authentik](/img/docs/homelab/authentik-homepage-dashboard/capture-ecran-applications-outpost-authentik.png)

---

## Validation Finale

Comment s'assurer que tout fonctionne globalement ?

* [ ] L'application apparaît dans le dashboard Authentik.
* [ ] Le Provider est lié à l'application avec le statut OK.

---

## Références
* [Documentation Authentik - Proxy Provider](https://docs.goauthentik.io/add-secure-apps/providers/proxy/)