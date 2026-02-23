---
sidebar_position: 3
title: Mise en place du VPN Tailscale sur OPNsense
description: Cette procédure détaille l'intégration de Tailscale sur le routeur OPNsense. Ce VPN de type "mesh" (basé sur WireGuard) permet de configurer un accès distant sécurisé au homelab

# -------------------------------------------------------------------------
# 🎯 MODÈLE : ACTION (VIVANT)
# -------------------------------------------------------------------------
# - [PROC] : Procédure / Runbook (Pas à pas)
# -------------------------------------------------------------------------
---

![Logo du projet Loutik](/img/logo_loutik.png)

---

:::info Métadonnées
* **Mainteneur :** MEDO Louis
* **Dernière validation technique :** 2026-02-23
:::

---
## A. Contexte

Dans le cadre de mon projet d'infrastructure LoutikCLOUD, cette procédure détaille l'intégration de Tailscale sur le routeur OPNsense. Ce VPN de type "mesh" (basé sur WireGuard) permet de configurer un accès distant sécurisé au homelab. L'objectif est de pouvoir administrer les ressources internes et les paramètres réseaux depuis l'extérieur, sans exposer directement les interfaces d'administration sur Internet.

---
## B. Installation du module os-tailscale

1. **Accéder à la gestion des plugins.** Se rendre dans `System > Firmware > Plugins`.
2. **Installer le paquet.** Rechercher `os-tailscale` dans la barre de recherche, puis cliquer sur l'icône `+` à droite pour lancer l'installation.
3. **Forcer le rafraîchissement de l'interface.** Une fois l'installation terminée, recharger la page avec le raccourci `Ctrl + F5`. 

:::tip
Le rafraîchissement forcé du cache du navigateur (Ctrl + F5) est indispensable pour que le nouveau menu de navigation "Tailscale" apparaisse dans la section VPN du menu latéral gauche.
:::

---
## C. Configuration de Tailscale

1. **Ouvrir les paramètres généraux.** Se rendre dans `VPN > Tailscale > Settings`.
2. **Activer le service.** Cocher la case `Enable`.
3. **Configurer les options réseau.** Définir le `Listen Port` sur `41641`. Cocher `Accept DNS`.
4. **Configurer le routage de sous-réseau (Subnet Router).** Dans la section `Subnets`, ajouter le réseau `192.168.1.0/24` avec la description `VLAN Management`.
5. **Sauvegarder et lier le compte.** Cliquer sur `Save`. Il faudra ensuite authentifier le routeur sur la console Tailscale, soit en générant une clé d'authentification (Pre-auth key), soit en récupérant l'URL de connexion dans `VPN > Tailscale > Status`.

:::info
Le port 41641 est le port d'écoute standard de Tailscale. L'option `Accept DNS` permet d'utiliser le serveur DNS magique de Tailscale (MagicDNS). La déclaration du `Subnet` est l'étape clé : elle indique au réseau Tailscale que ce routeur agit comme une passerelle pour joindre le réseau physique de Management (192.168.1.0/24).
:::

---
## D. Approbation des routes sur la console Tailscale

1. **Connexion à la console.** Se connecter à l'interface d'administration web sur `login.tailscale.com`.
2. **Accéder aux paramètres de la machine.** Naviguer dans l'onglet `Machines`, localiser l'équipement OPNsense, cliquer sur l'icône des options (les trois points à droite) et sélectionner `Edit route settings`.
3. **Approuver le sous-réseau.** Dans la section `Subnet routes`, cocher la case correspondant au réseau `192.168.1.0/24` pour l'activer.

:::tip
Par mesure de sécurité (principe de confiance zéro ou Zero Trust), Tailscale n'accepte pas automatiquement les routes annoncées par un nœud. L'administrateur doit explicitement les approuver dans la console cloud pour éviter qu'une machine compromise ne détourne (hijack) le trafic d'un sous-réseau légitime.
:::

---
## E. Création de la règle pare-feu pour l'accès au Management

1. **Accéder aux règles de l'interface VPN.** Se rendre dans `Firewall > Rules > Tailscale_VPN`.
2. **Ajouter une nouvelle règle d'autorisation.** Cliquer sur l'icône `+` (Add) en haut à droite.
3. **Paramétrer la source.** `Source` : Sélectionner `Tailscale_VPN net`.
4. **Paramétrer la destination.** `Destination` : Sélectionner le réseau de management, ici `re0_vlan99_management net` (qui correspond à l'interface opt5).
5. **Finaliser la règle.** Mettre une description explicite (ex: `Accès VLAN Management`), sauvegarder, puis cliquer sur `Apply Changes`.

:::tip
**Note :** Par défaut, OPNsense bloque tout le trafic entrant. Cette règle applique le principe de moindre privilège : elle autorise les appareils connectés au VPN Tailscale à communiquer uniquement avec les équipements du réseau de Management (VLAN 99), isolant ainsi les autres réseaux (Utilisateurs, Services, etc.) d'un accès externe direct.
:::