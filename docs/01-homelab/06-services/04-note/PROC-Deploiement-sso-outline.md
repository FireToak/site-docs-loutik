---
sidebar_position: 1
title: Configuration SSO Authentik (Outline)
description: Configuration de l'Identity Provider Authentik pour l'application Outline via OIDC.

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
* **Dernière validation technique :** 2025-12-28
:::

---

## Contexte
Configurer le fournisseur d'identité (IdP) pour sécuriser l'accès à Outline via le protocole OIDC.

---

## Prérequis

Avant de commencer, s'assurer de :
* [ ] Avoir un accès administrateur à l'interface Authentik (`https://sso.loutik.fr`).
* [ ] Connaître l'URL de destination du service (`https://note.loutik.fr`).

---

## Étape 1 : Création de l'application

Définition de l'application logique dans Authentik.

### 1.1 Exécution
Dans l'interface administrateur (`Applications` > `Applications` > `Create with Provider`) :

1.  **Name :** `Outline`
2.  **Slug :** `outline`
3.  **Policy engine mode :** `ANY`
4.  **UI Settings :**
    * **Launch URL :** `https://note.loutik.fr`
    * **Open in new tab :** Sélectionné

---

## Étape 2 : Configuration du Provider OIDC

Configuration du protocole d'authentification.

### 2.1 Exécution
Sélectionner `OAuth2/OpenID Provider` et configurer :

1.  **Authorization flow :** `default-provider-authorization-implicit-consent`
2.  **Client type :** `Confidential`
3.  **Redirect URIs :** `https://sso.loutik.fr/auth/oidc.callback`
4.  **Subject mode :** `Based on the User's username`

### 2.2 Vérification immédiate
Récupérer les secrets générés :

* [ ] Noter le **Client ID**.
* [ ] Noter le **Client Secret**.

---

## Validation Finale

Comment s'assurer que tout fonctionne globalement ?

* [ ] L'application apparaît dans le dashboard Authentik.
* [ ] Le Provider est lié à l'application avec le statut OK.

---

## Références
* [Documentation Authentik - Outline](https://integrations.goauthentik.io/documentation/outline/)