---
sidebar_position: 1
title: Installation Proxmox VE (Bare Metal)
description: Installation de l'hyperviseur sur le SSD NVMe et configuration du stockage secondaire.

# -------------------------------------------------------------------------
# 🎯 MODÈLE : ACTION (VIVANT)
# -------------------------------------------------------------------------
---

![Logo du projet Loutik](/img/logo_loutik.png)

---

:::info Métadonnées
* **Mainteneur(s) :** MEDO Louis
* **Dernière validation technique :** 2026-01-11
* **Version PVE :** 9.x
:::

---

## Contexte
Cette procédure couvre l'installation "Bare Metal" (directement sur le matériel) de l'hyperviseur Proxmox VE. L'OS sera installé sur le disque rapide (NVMe) et le stockage des VMs sera étendu sur le second disque mécanique/SSD.

**Impact :** Écrasement total et irréversible de toutes les données présentes sur les disques de la machine cible.

---

## Prérequis

Avant de commencer, s'assurer de :
* [ ] Une clé USB bootable avec l'ISO de Proxmox VE (via Ventoy ou Etcher).
* [ ] Clavier et écran connectés physiquement au serveur.
* [ ] Câble réseau connecté (Indispensable pour l'installation).
* [ ] Connaître l'IP statique à attribuer (ex: `192.168.1.100`).

---

## Étape 1 : Vérifications BIOS & Pilotes

Avant d'installer, il faut préparer le terrain matériel.

### 1.1 Activation de la Virtualisation
Accéder au BIOS/UEFI (Touches `Del`, `F2` ou `F12` au démarrage).
1.  Chercher le menu **CPU Configuration** ou **Chipset**.
2.  Activer **Intel VT-x** (Intel) ou **AMD-V / SVM** (AMD).
3.  Activer **IOMMU** (ou VT-d) si disponible (nécessaire pour le passthrough PCI).
4.  Désactiver le **Secure Boot** (Proxmox ne le supporte pas toujours nativement).

### 1.2 Compatibilité Matérielle (Pilotes)
Proxmox est basé sur **Debian**.
* Si le matériel est très récent (carte réseau 2.5Gbe récente), s'assurer d'utiliser la dernière version de l'ISO Proxmox (le noyau Linux sera plus récent).
* Pas d'installation manuelle de pilotes nécessaire en amont : si le réseau est détecté à l'installation, tout est bon.

---

## Étape 2 : Installation de l'OS (Sur NVMe)

Installation du système d'exploitation.

### 2.1 Boot et Cible
1.  Démarrer sur la clé USB.
2.  Sélectionner **Install Proxmox VE (Graphical)**.
3.  Accepter la licence (EULA).
4.  **Target Harddisk :** Sélectionner le disque **NVMe** (souvent `/dev/nvme0n1`).
    * *Optionnel :* Cliquer sur `Options` pour ajuster la taille du swap si besoin.

### 2.2 Configuration Réseau & Admin
1.  **Country/Timezone :** France / Paris.
2.  **Password :** Définir le mot de passe `root` (à sauvegarder dans Bitwarden).
3.  **Network Configuration :**
    * **Management Interface :** Choisir la carte connectée.
    * **Hostname :** `pve-01.loutik.local` (exemple).
    * **IP Address :** Fixer l'IP statique.
    * **DNS Server :** `1.1.1.1` ou IP du routeur.

Lancer l'installation et retirer la clé USB au redémarrage.

---

## Étape 3 : Configuration du Stockage Secondaire (LVM-Thin)

Une fois redémarré, nous allons utiliser le second disque pour stocker les disques des futures VMs.

### 3.1 Accès à l'interface
Se connecter via `https://<IP_PROXMOX>:8006` (Ignorer l'alerte SSL).

### 3.2 Initialisation du disque
1.  Aller dans **Datacenter** > **Nom-du-Nœud** (pve-01) > **Disks**.
2.  Repérer le second disque (ex: `/dev/sda` ou `/dev/sdb`).
3.  Si le disque contient des partitions : cliquer sur **Wipe Disk** pour tout effacer.

### 3.3 Création du LVM-Thin
Toujours dans le menu **Disks**, cliquer sur l'onglet **LVM-Thin**.
1.  Cliquer sur **Create: Thinpool**.
2.  **Disk :** Sélectionner le second disque vide.
3.  **Name :** `data-hdd` (ou un nom explicite).
4.  Cliquer sur **Create**.

:::info 🧠 Fiche Notion : LVM-Thin vs LVM Standard

* **Thin Provisioning (Allocation fine) :** Créer une VM avec un disque de 100 Go, mais qui n'utilise que 5 Go, elle ne prendra que 5 Go de place réelle sur ton disque physique.
* **Snapshots :** Le LVM-Thin permet de faire des instantanés (Snapshots) de des VMs. C'est indispensable pour faire des tests et revenir en arrière.
* *A contrario*, le LVM "Thick" (Standard) réserve tout l'espace immédiatement et ne supporte pas les snapshots nativement sur Proxmox.
:::

---

## Validation Finale

* [ ] L'interface web est accessible.
* [ ] Dans le menu gauche, le stockage `local-lvm` (sur NVMe) et `data-hdd` (sur 2nd disque) sont visibles.
* [ ] La commande `ip a` dans le shell du nœud confirme la bonne configuration IP.

---

## Rollback

En cas de plantage total ou d'erreur de disque :
1.  Relancer l'installation depuis la clé USB.
2.  Au moment du choix du disque, sélectionner à nouveau le NVMe pour écraser l'installation défectueuse.

---

## Références
* [Documentation Officielle Proxmox (Install)](https://pve.proxmox.com/wiki/Installation)
* [Documentation Storage LVM-Thin](https://pve.proxmox.com/wiki/Storage:_LVM_Thin)