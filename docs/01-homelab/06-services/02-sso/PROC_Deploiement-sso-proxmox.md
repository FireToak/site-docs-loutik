---
sidebar_position: 1
title: Configuration SSO Authentik sur Proxmox
description: Procédure pour la mise en place de l'authentification SSO via Authentik sur Proxmox VE.

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
* **Dernière validation technique :** 2025-12-27
:::

---

## Contexte
Mettre en place l'authentification unique (SSO) pour sécuriser et centraliser l'accès à l'interface de gestion Proxmox via le protocole OpenID Connect (OIDC) fourni par Authentik.

---

## Prérequis

Avant de commencer, s'assurer de :
* [ ] Avoir un accès administrateur à l'interface Authentik (`https://sso.loutik.fr`).
* [ ] Avoir un accès administrateur (root/pam) à l'interface Proxmox (`https://pve-gideon.loutik.fr`).
* [ ] Avoir le `Client ID` et la `Client Secret` (ou Key) générés prêts à être copiés.

---

## Étape 1 : Configuration du Provider Authentik

Création de l'application et du fournisseur d'identité dans Authentik.

### 1.1 Exécution
Effectuer les actions suivantes dans l'interface d'administration Authentik :

1.  Accéder à **Applications > Applications** et cliquer sur `Create with Provider`.
2.  Remplir les informations de base :
    * **Name :** `Proxmox`
    * **Slug :** `proxmox`
    * **Policy engine mode :** `ANY`
3.  Sélectionner le type de provider : `OAuth2/OpenID Connect`.
4.  Configurer le Provider :
    * **Provider Name :** `Provider for Proxmox`
    * **Authorization flow :** `default-provider-authorization-implicit-consent`
    * **Client type :** `Confidential`
    * **Redirect URis :** `https://pve-gideon.loutik.fr`
    * **Signing Key :** `authentik Self-signed Certificate`
    * **Subject mode** (Advanced settings) : `Based on the User's Email`
5.  Cliquer sur `Submit` (Laisser les Bindings par défaut).
6.  **Noter le Client ID et le Client Secret** affichés dans le provider créé.

### 1.2 Vérification immédiate
Vérifier que l'application est active :

* L'application `Proxmox` apparaît dans la liste des applications Authentik avec un statut vert (Healthy).

---

## Étape 2 : Configuration du Realm sur Proxmox

Ajout du serveur OpenID Connect dans la configuration Proxmox.

### 2.1 Exécution
Effectuer les actions suivantes sur l'interface Proxmox :

1.  Aller dans **Datacenter > Permissions > Realms**.
2.  Cliquer sur `Add` et sélectionner `OpenID Connect Server`.
3.  Remplir le formulaire :
    * **Issuer URL :** `https://sso.loutik.fr/application/o/proxmox/`
    * **Realm :** `authentik`
    * **Client ID :** *(Coller l'ID récupéré à l'étape 1)*
    * **Client Key :** *(Coller la clé/secret récupéré à l'étape 1)*
    * **Scopes :** `email profile openid`
    * **Autocreate Users :** `Coché`
    * **Username claim :** `username`
4.  Valider avec `Add`.

### 2.2 Vérification immédiate
Vérifier la disponibilité de l'option de connexion :

1.  Se déconnecter de Proxmox.
2.  Sur la mire de login, le champ "Realm" doit proposer `authentik`.

---

## Étape 3 : Gestion des permissions utilisateurs

Attribution des droits administrateurs aux utilisateurs SSO.

### 3.1 Exécution
Par défaut, les utilisateurs créés via SSO n'ont aucun droit.

1.  Créer le groupe d'administration :
    * Aller dans **Datacenter > Permissions > Groups**.
    * Cliquer sur `Create`.
    * **Name :** `Administrateurs`.
    * **Comment :** `Groupe administrateur (tout privilège)`.
2.  Attribuer les permissions au groupe :
    * Aller dans **Datacenter > Permissions**.
    * Cliquer sur `Add` > `Group Permission`.
    * **Path :** `/`
    * **Group :** `Administrateurs`
    * **Role :** `Administrator`
    * **Propagate :** `Coché`.
3.  Lier les utilisateurs (Une fois qu'ils se sont connectés une première fois ou en les pré-créant) :
    * Aller dans **Datacenter > Permissions > Users**.
    * Double-cliquer sur l'utilisateur concerné.
    * L'ajouter au groupe `Administrateurs`.

:::warning Point d'attention
Pour des raisons de sécurité, les droits sont appliqués manuellement. L'utilisateur doit souvent tenter une première connexion (qui échouera par manque de droits mais créera le compte) avant de pouvoir être ajouté au groupe.
:::

---

## Validation Finale

Comment s'assurer que tout fonctionne globalement ?

* [ ] Ouvrir une fenêtre de navigation privée.
* [ ] Accéder à `https://pve-gideon.loutik.fr`.
* [ ] Sélectionner le Realm `authentik`.
* [ ] S'authentifier via le portail Authentik.
* [ ] L'utilisateur est redirigé vers Proxmox et dispose des droits d'administration complets.

---

## Rollback (Retour arrière)

**Si l'authentification SSO pose problème, voici comment la désactiver :**

1.  Se connecter en `root` via le Realm `Linux PAM standard authentication`.
2.  Supprimer le Realm Authentik via l'interface ou en ligne de commande :
    ```bash
    pveum realm delete authentik
    ```
3.  (Optionnel) Nettoyer les utilisateurs créés automatiquement :
    ```bash
    pveum user delete <username>@authentik
    ```

---

## Références
* [Documentation Intégration Authentik / Proxmox](https://integrations.goauthentik.io/hypervisors-orchestrators/proxmox-ve/)