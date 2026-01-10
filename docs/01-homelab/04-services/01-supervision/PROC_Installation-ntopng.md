---
sidebar_position: 1
title: Installation Ntopng
description: Procédure pour l'installation et la configuration de Ntopng pour l'analyse de trafic réseau (Flow monitoring).

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
* **Dernière validation technique :** 2025-12-20 (Testé sur v1)
:::

---

## Contexte
Déployer Ntopng sur l'infrastructure Loutik pour analyser le trafic réseau via une interface en mirroring (Port Mirroring).

---

## Prérequis

Avant de commencer, s'assurer de :
* [ ] Avoir cloné le template VM et personnalisé via Cloud-Init.
* [ ] Avoir ajouté 2 cartes réseau à la VM : une pour l'administration (LAN Livebox) et une pour le mirroring (Zyxel).
* [ ] Avoir identifié le nom de l'interface dédiée au mirroring (ex: `ens19`).
* [ ] Avoir les accès `sudo` ou `root` sur la machine.

---

## Étape 1 : Configuration Réseau (Mode Promiscuous)

Configuration de l'interface réseau pour écouter le trafic sans adresse IP.

### 1.1 Exécution
1. Créer le fichier de configuration réseau pour l'interface miroir (remplacer `ens19` par votre interface) :

```bash
# Ouvre l'éditeur nano pour créer le fichier de configuration systemd
sudo nano /etc/systemd/network/10-miroir.network

```

2. Insérer le contenu suivant :

```ini
[Match]
Name=ens19

[Link]
# Active le mode promiscuous pour capturer tout le trafic, pas seulement celui destiné à la VM
Promiscuous=yes

[Network]
# Désactive le DHCP pour rendre l'interface invisible sur le réseau
DHCP=no
# Empêche l'auto-assignation d'une IP link-local (APIPA)
LinkLocalAddressing=no

```

3. Appliquer la configuration :

```bash
# Redémarre le service réseau pour prendre en compte le nouveau fichier .network
sudo systemctl restart systemd-networkd

```

### 1.2 Vérification immédiate

Vérifier l'état de l'interface :

```bash
ip a

```

**Critères de succès :**

* L'interface (ex: `ens19`) est en état `UP`.
* Le flag `PROMISC` est présent.
* Aucune adresse IP (`inet`) n'est attribuée.

---

## Étape 2 : Installation des paquets Ntopng

Installation du dépôt officiel et des outils d'analyse.

### 2.1 Exécution

Exécuter les commandes suivantes :

```bash
# Télécharge le paquet de configuration du dépôt apt officiel de ntop
wget [https://packages.ntop.org/apt/trixie/all/apt-ntop.deb](https://packages.ntop.org/apt/trixie/all/apt-ntop.deb)

# Installe le paquet téléchargé pour ajouter les sources de logiciels
sudo apt install ./apt-ntop.deb

# Nettoie le cache, met à jour la liste des paquets et installe ntopng et ses dépendances
# pfring-dkms : Module kernel pour la capture haute performance
# nprobe/n2disk : Outils complémentaires de collecte/enregistrement
sudo apt-get clean all && sudo apt-get update
sudo apt-get install pfring-dkms nprobe ntopng n2disk cento ntap

```

:::warning Point d'attention
L'installation de `pfring-dkms` compile un module noyau. Assurez-vous que les `linux-headers` sont bien installés si la compilation échoue.
:::

### 2.2 Vérification immédiate

Vérifier que le service est actif :

```bash
systemctl status ntopng
# Doit retourner : Active: active (running)

```

---

## Validation Finale

Vérification du fonctionnement global de la solution.

* [ ] Le service Ntopng écoute sur l'interface miroir (Vérifier avec `sudo ntopng --list-interfaces`).
* [ ] L'interface web est accessible sur `http://<IP_LAN>:3000` (Login par défaut : admin/admin).
* [ ] Le trafic provenant du switch Zyxel (miroir) est visible dans les graphiques du dashboard.

---

## Rollback (Retour arrière)

**En cas d'échec critique ou d'instabilité :**

1. Désinstaller les paquets Ntopng :
```bash
sudo apt-get remove --purge ntopng nprobe pfring-dkms

```

2. Supprimer la configuration réseau miroir :
```bash
sudo rm /etc/systemd/network/10-miroir.network
sudo systemctl restart systemd-networkd

```

---

## Références

* [Documentation officielle d'installation Ntopng](https://www.ntop.org/support/documentation/software-installation/)
