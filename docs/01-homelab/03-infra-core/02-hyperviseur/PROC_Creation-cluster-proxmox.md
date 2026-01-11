---
sidebar_position: 2
title: Création Cluster Proxmox
description: Regroupement des nœuds hyperviseurs au sein du cluster "LoutikCLOUD".

# -------------------------------------------------------------------------
# 🎯 MODÈLE : ACTION (VIVANT)
# -------------------------------------------------------------------------
---

![Logo du projet Loutik](/img/logo_loutik.png)

---

:::info Métadonnées
* **Mainteneur(s) :** MEDO Louis
* **Dernière validation technique :** 2026-01-11
* **Nom du Cluster :** `LoutikCLOUD`
:::

---

## Contexte
Cette procédure décrit les étapes pour fusionner plusieurs serveurs Proxmox VE indépendants en un cluster unique nommé **LoutikCLOUD**. Cela permet la gestion centralisée via une seule interface web et la migration de VMs.

**Impact :** Aucune interruption de service n'est attendue, mais il est recommandé d'avoir des VMs éteintes lors de la jonction d'un nœud.

---

## Prérequis

Avant de commencer, s'assurer de :
* [ ] Avoir au moins 2 nœuds Proxmox installés et accessibles.
* [ ] **Important :** Tous les nœuds doivent avoir des noms d'hôtes (hostname) différents.
* [ ] Les nœuds doivent être à la même heure (NTP synchronisé).
* [ ] Le nœud qui va *rejoindre* le cluster ne doit contenir **aucune VM** (il doit être vide).

---

## Étape 1 : Création du Cluster (Sur le Nœud Maître)

On choisit le serveur principal (ex: `pve-01`) pour initier le cluster.

### 1.1 Exécution
1.  Se connecter à l'interface Web de `pve-01`.
2.  Aller dans **Datacenter** > **Cluster**.
3.  Cliquer sur **Create Cluster**.
4.  Remplir les champs :
    * **Cluster Name :** `LoutikCLOUD`
    * **Cluster Network :** Sélectionner l'interface réseau principale (LAN).
5.  Cliquer sur **Create**.

### 1.2 Récupération des infos de jonction
Une fois le cluster créé :
1.  Dans la même fenêtre, cliquer sur **Join Information**.
2.  Cliquer sur **Copy Information** (Cela copie la clé de jonction encodée en Base64).

---

## Étape 2 : Jonction d'un Nœud (Sur le Nœud Esclave)

On va maintenant dire au deuxième serveur (ex: `pve-02`) de rejoindre `LoutikCLOUD`.

### 2.1 Exécution
1.  Se connecter à l'interface Web de `pve-02`.
2.  Aller dans **Datacenter** > **Cluster**.
3.  Cliquer sur **Join Cluster**.
4.  Dans le champ **Information**, coller le texte copié depuis le nœud maître.
    * *Les champs "Peer Address" et "Fingerprint" se remplissent automatiquement.*
5.  Saisir le **mot de passe root** du nœud **Maître** (`pve-01`).
6.  Cliquer sur **Join 'LoutikCLOUD'**.

:::warning Attention
La connexion va se couper immédiatement sur `pve-02`. C'est normal : les certificats SSL sont régénérés pour correspondre à ceux du cluster.
:::

---

## Étape 3 : Vérification et Finalisation

### 3.1 Vérification
1.  Retourner sur l'interface de **`pve-01`**.
2.  Rafraîchir la page.
3.  Dans le menu de gauche (Server View), tu dois maintenant voir **Datacenter** avec tes deux nœuds en dessous (ex: `pve-01` et `pve-02`) avec une icône verte ✅.

:::info 🧠 Fiche Notion : Le Quorum (Corosync)

Un cluster a besoin d'un "Quorum" (majorité de votes) pour fonctionner.
* Si nous avons 2 nœuds : Il faut 2 votes. Si un nœud tombe, le cluster passe en lecture seule (plus possible de démarrer de VM).
* **Astuce 2 nœuds :** Pour un cluster de 2 nœuds uniquement, il est conseillé d'ajouter un "QDevice" (un petit arbitre externe, comme un Raspberry Pi) pour garder la majorité si un serveur plante, ou de désactiver temporairement le quorum attendu via la commande `pvecm expected 1`.
:::

---

## Rollback (En cas d'échec de jonction)

Si la jonction échoue et que le nœud est bloqué dans un état "bizarre" :

1.  Se connecter en SSH sur le nœud bloqué.
2.  Arrêter le service cluster :
    ```bash
    systemctl stop pve-cluster corosync
    ```
3.  Forcer le mode local :
    ```bash
    pmxcfs -l
    ```
4.  Supprimer les fichiers de config corrompus :
    ```bash
    rm /etc/pve/corosync.conf
    rm -r /etc/corosync/*
    ```
5.  Redémarrer le nœud : `reboot`.

---

## Références
* [Documentation Officielle Cluster](https://pve.proxmox.com/wiki/Cluster_Manager)