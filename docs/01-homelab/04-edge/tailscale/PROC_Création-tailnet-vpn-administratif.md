---
sidebar_position: 2
title: Création du Tailnet (Taiscale) pour loutik
description: Cette procédure s'inscrit dans le cadre de mon homelab et du projet d'infrastructure LoutikCLOUD. Elle décrit la mise en place d'un réseau privé virtuel Tailscale (Tailnet) couplé à une authentification unique (SSO) gérée par Authentik.

# -------------------------------------------------------------------------
# 🎯 MODÈLE : ACTION (VIVANT)
# -------------------------------------------------------------------------
# - [PROC] : Procédure / Runbook (Pas à pas)
# -------------------------------------------------------------------------
---

![Logo du projet Loutik](/img/logo_loutik.png)

---

:::info Métadonnées
- **Mainteneur :** MEDO Louis
- **Date de mise à jour :** 2026-02-23
:::

---
## A. Contexte

Cette procédure s'inscrit dans le cadre de mon homelab et du projet d'infrastructure LoutikCLOUD. Elle décrit la mise en place d'un réseau privé virtuel Tailscale (Tailnet) couplé à une authentification unique (SSO) gérée par Authentik.

---
## B. Prérequis réseau : IPv6 et DNS

1. **Configuration de la zone DNS.** Se rendre sur l'interface de gestion de votre nom de domaine (`loutik.fr`). Créer un enregistrement de type `A` (IPv4) et obligatoirement un enregistrement de type `AAAA` (IPv6) pointant vers l'IP publique de votre reverse proxy pour le sous-domaine `sso.loutik.fr`.
2. **Configuration du Reverse Proxy.** S'assurer que le reverse proxy (Nginx, Traefik, etc.) est configuré pour écouter sur le port 443 en IPv6 (ex: `listen [::]:443 ssl http2;` sous Nginx).

:::warning
Tailscale s'appuie massivement sur une architecture réseau IPv6 pour le routage de ses nœuds (allocation d'adresses en `fd7a:115c:a1e0::/48`). Si votre fournisseur d'identité (Authentik) n'est pas joignable en IPv6, les requêtes d'authentification des clients Tailscale risquent d'échouer ou de subir de forts ralentissements.
:::

---
## C. Création de l'identité sur Authentik

1. **Accéder à l'interface d'administration.** Se connecter à `https://sso.loutik.fr` avec un compte super-administrateur et basculer sur l'interface d'administration (Admin Interface).
2. **Utiliser l'assistant de création.** Naviguer dans `Applications > Providers` et cliquer sur le bouton permettant de créer simultanément l'application et le fournisseur (`Create with Provider`).
3. **Configurer le fournisseur (Provider).** Choisir le type `OAuth2/OpenID Provider`. Nommer le fournisseur (ex: `Tailscale Provider`). Sélectionner le type de flux d'autorisation (Authorization flow) standard et définir les URIs de redirection (Redirect URIs) fournies par Tailscale (généralement `https://login.tailscale.com/a/oauth_response`).
4. **Configurer l'application (Application).** Lier le fournisseur fraîchement créé à une nouvelle application nommée `Tailscale`. Copier le `Client ID` et le `Client Secret` générés, ils seront nécessaires pour la configuration côté Tailscale.

:::info
Dans Authentik, le "Provider" gère le protocole de communication (ici OIDC/OAuth2) et les secrets cryptographiques, tandis que l'"Application" représente le service visible par l'utilisateur final et gère les politiques d'accès (qui a le droit de s'y connecter). OpenID Connect (OIDC) est une couche d'identité par-dessus OAuth 2.0 permettant de vérifier l'identité de l'utilisateur.
:::

[Procédure de configuration d'Authentik pour Tailscale](https://integrations.goauthentik.io/networking/tailscale/)

---
## D. Vérification du domaine via Webfinger

1. **Préparer l'endpoint Webfinger.** Sur le serveur hébergeant le domaine racine `loutik.fr`, créer un dossier `.well-known` à la racine web.
2. **Créer le fichier de configuration.** Créer un fichier nommé `webfinger` (ou configurer une route d'API) qui répond aux requêtes GET sur `https://loutik.fr/.well-known/webfinger?resource=acct:admin@loutik.fr`.
3. **Définir la réponse JSON.** Le fichier ou la route doit retourner une réponse JSON valide pointant vers l'URL de votre instance Authentik (`https://sso.loutik.fr`) pour indiquer à Tailscale où rediriger l'utilisateur "admin".

:::info
Webfinger (RFC 7033) est un protocole de découverte. Il permet à un service (Tailscale) d'interroger un nom de domaine (`loutik.fr`) pour y trouver des métadonnées (ici, l'URL de l'Identity Provider) à partir d'une simple adresse email, facilitant ainsi le routage dynamique du SSO sans configuration manuelle complexe côté client.
:::

---
## E. Création du Tailnet et liaison SSO

1. **S'inscrire sur Tailscale.** Se rendre sur le portail d'administration Tailscale et choisir l'option de configuration avec un fournisseur d'identité personnalisé (Custom OIDC).
2. **Saisir les paramètres OIDC.** Entrer l'URL de l'Issuer (`https://sso.loutik.fr/application/o/tailscale/`), le `Client ID` et le `Client Secret` obtenus à l'étape C.
3. **Initier la connexion.** Tailscale va interroger Webfinger sur `loutik.fr` avec votre adresse email, puis vous rediriger vers Authentik pour valider la création du réseau privé (Tailnet).

:::tip
Le "Tailnet" est le nom donné au réseau maillé privé et isolé généré par Tailscale. Il regroupe l'ensemble des machines authentifiées via votre domaine loutik.fr.
:::

---
## F. Désactivation de l'essai gratuit

1. **Accéder aux paramètres.** Depuis le dashboard Tailscale, naviguer dans le menu `Settings`.
2. **Aller dans la facturation.** Cliquer sur la section `Billing`.
3. **Choisir le plan personnel.** Cliquer sur le bouton `Choose a plan`, faire défiler tout en bas de la page et cliquer sur lien pour passer en mode personnel (gratuit).

:::info
Par défaut, Tailscale inclut souvent les nouveaux réseaux dans un essai gratuit (Trial) du plan Premium/Enterprise. Rétrograder manuellement vers le plan "Personal" permet d'éviter la suspension du service à la fin de l'essai ou une facturation non désirée, ce plan étant largement suffisant pour les besoins d'un homelab.
:::