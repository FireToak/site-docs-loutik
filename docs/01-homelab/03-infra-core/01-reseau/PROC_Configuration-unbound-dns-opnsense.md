---
sidebar_position: 3
title: Procédure de configuration d'Unbound DNS sur OPNsense
description: Configuration du service Unbound DNS sur le pare-feu OPNsense pour le homelab LoutikCLOUD. L'objectif est de mettre en place une résolution locale pour accéder aux différentes interfaces d'administration via des noms de domaine personnalisés et lisibles, sans avoir à retenir les adresses IP.

# -------------------------------------------------------------------------
# 🎯 MODÈLE : ACTION (VIVANT)
# -------------------------------------------------------------------------
---

![Logo du projet Loutik](/img/logo_loutik.png)

---

:::info Métadonnées
* **Mainteneur :** MEDO Louis
* **Dernière validation technique :** 2026-02-25
:::

---
## A. Contexte

Cette procédure détaille l'activation et la configuration du service Unbound DNS sur le pare-feu OPNsense pour le homelab LoutikCLOUD. L'objectif est de mettre en place une résolution locale pour accéder aux différentes interfaces d'administration via des noms de domaine personnalisés et lisibles, sans avoir à retenir les adresses IP.

Un résolveur DNS est un serveur chargé de traduire les noms de domaine demandés par les clients en adresses IP routables sur le réseau. Pour approfondir la théorie et les mécanismes de cette traduction, je vous invite vivement à consulter ma fiche Notion sur le DNS : [A faire](#).

---
## B. Activation du service Unbound

1. **Accès à la configuration générale.** Naviguez dans l'interface OPNsense via `Services` > `Unbound DNS` > `General`.

2. **Activation du service.** Cochez la case `Enable Unbound`. Cette option démarre le processus du serveur DNS local sur le pare-feu.

3. **Sélection des interfaces.** Dans le champ `Network Interfaces`, sélectionnez les interfaces internes (ex: LAN, VLAN_Admin) sur lesquelles Unbound doit écouter les requêtes des clients.

4. **Application.** Cliquez sur `Save` puis `Apply changes` pour valider la configuration.

---
## C. Création des enregistrements locaux

1. **Accès aux surcharges (Overrides).** Allez dans `Services` > `Unbound DNS` > `Overrides`.

2. **Création d'une entrée.** Cliquez sur le bouton `+` dans la section `Host Overrides`.

3. **Définition de la résolution.** Renseignez le nom de la machine dans `Host` (ex: _pfsense_), le domaine de LoutikCLOUD dans `Domain` (ex: _lab.local_), et l'adresse IP cible dans `IP Address`.

4. **Sauvegarde.** Cliquez sur `Save` puis `Apply changes`. Unbound interceptera désormais cette requête locale pour renvoyer l'IP sans interroger les serveurs publics.

---
## D. Validation de la configuration

1. **Exécution du test de résolution.** Sur un poste client connecté au réseau, ouvrez un terminal et tapez la commande suivante :

    `nslookup nom_interface.domaine_local`
    
    - **nslookup :** Utilitaire réseau en ligne de commande permettant d'interroger directement le serveur DNS configuré sur la machine. Il affiche l'adresse IP associée au nom de domaine fourni, confirmant ainsi que la résolution locale d'Unbound fonctionne correctement.