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
* **Dernière validation technique :** 2026-02-24
* **Version PVE :** 9.x
:::

---

## Contexte

Cette procédure détaille le déploiement de l'hyperviseur Proxmox VE au sein du Homelab LoutikCLOUD. L'architecture matérielle standard des nœuds repose sur un partitionnement physique strict : un SSD NVMe est dédié au système hôte (OS Proxmox) pour des performances d'E/S optimales, et un second disque (SSD/HDD) est alloué exclusivement au Datastore (stockage des disques virtuels des VMs et conteneurs).

---

## Prérequis

Avant de commencer, s'assurer de :
- [ ] Disposer d'une clé USB d'installation flashée avec l'ISO de Proxmox VE 9.x.
- [ ] Connecter le serveur cible au réseau d'administration LoutikCLOUD (lien physique actif).
- [ ] Avoir défini les paramètres réseau cibles (IP statique, passerelle, masque, DNS).
- [ ] Disposer d'un accès au serveur (physique avec clavier/écran ou distant via iDRAC/iLO).

---

## A. Vérifications BIOS & Pilotes

1. **Activation de la virtualisation matérielle.** Accéder au BIOS/UEFI du serveur et activer les instructions processeurs requises : `VT-x` (Intel) ou `AMD-V` (AMD).
2. **Configuration du Secure Boot.** Bien que supporté, il est recommandé de désactiver le Secure Boot pour faciliter l'installation de modules noyau tiers si nécessaire à l'avenir.
3. **Modification de l'ordre de démarrage.** Placer le périphérique USB contenant l'ISO Proxmox en première position dans la séquence de boot UEFI.

---

## B. Installation de l'OS (Sur NVMe)

1. **Lancement du programme d'installation.** Démarrer sur la clé USB et choisir `Install Proxmox VE (Graphical)` dans le menu GRUB.
2. **Sélection du support de destination.** À l'étape `Target Harddisk`, sélectionner impérativement le **disque SSD NVMe**. Ne pas modifier le second disque.
3. **Configuration du système et réseau.** Renseigner le mot de passe `root`, l'email d'administration, et assigner l'adresse IP statique, le masque, la passerelle et le serveur DNS local selon le plan d'adressage.
4. **Finalisation.** Cliquer sur `Install`, retirer le support USB lors de la demande de redémarrage automatique.

---

## C. Configuration du stockage pour les machines virtuelles (LVM-Thin)

Une fois redémarré, nous allons utiliser le second disque pour stocker les disques des futures VMs.

1. **Nettoyage du second disque.** Accéder à l'interface web (`https://<IP>:8006`). Aller dans `<NomDuNoeud> -> Disks`. Sélectionner le disque secondaire et cliquer sur `Wipe Disk` pour supprimer toute partition existante.
2. **Création du pool LVM-Thin.** Naviguer dans `<NomDuNoeud> -> Disks -> LVM-Thin`. Cliquer sur `Create: Thinpool`. Sélectionner le disque secondaire, nommer le pool (utiliser `DATA_VM` sur le cluster LoutikCLOUD), et valider. Cette technologie permet le provisionnement dynamique (thin provisioning), optimisant ainsi la consommation d'espace de stockage.

---
## D. Configuration post-installation

### Port de l'interface

Au sein de l'infrastructure LoutikCLOUD, le routeur OPNsense assure la résolution DNS locale via Unbound. Pour garantir une expérience utilisateur fluide avec des accès transparents aux interfaces d'administration via les noms de domaine, sans avoir à spécifier le port par défaut (8006), nous mettons en place une redirection locale (Port Forwarding) du flux HTTPS standard (443) vers le port d'écoute natif de Proxmox.

1. **Application des règles de routage interne.** Ouvrir le Shell Proxmox et exécuter les commandes suivantes pour dévier le trafic et rendre la règle persistante aux redémarrages.

```bash
iptables -t nat -A PREROUTING -p tcp --dport 443 -j REDIRECT --to-ports 8006
apt update && apt install iptables-persistent -y
netfilter-persistent save

```

*Explication des commandes :*

* `iptables` : Outil en ligne de commande permettant de configurer les règles du pare-feu du noyau Linux (Netfilter).
* `-t nat` : Spécifie que l'on manipule la table NAT (Network Address Translation).
* `-A PREROUTING` : Ajoute la règle à la chaîne PREROUTING, interceptant les paquets entrants avant la décision de routage.
* `-p tcp --dport 443` : Cible exclusivement le protocole TCP à destination du port 443.
* `-j REDIRECT --to-ports 8006` : Action à appliquer : redirige le paquet vers la machine locale sur le port 8006.
* `apt update && apt install iptables-persistent -y` : Met à jour le cache des paquets `apt` et installe le service `iptables-persistent` automatiquement (`-y`), nécessaire pour sauvegarder l'état du pare-feu.
* `netfilter-persistent save` : Script qui fige la configuration iptables actuelle en mémoire dans le fichier de configuration statique `/etc/iptables/rules.v4`, garantissant son application à chaque démarrage.

### Configuration de l'authentification avec Authentik

1. **Préparation côté Authentik.** Sur le serveur Authentik, créer un `Provider` de type OIDC et une `Application` associée pour Proxmox. Conserver le `Client ID`, le `Client Secret` et l'URL `Issuer`.
2. **Intégration côté Proxmox.** Dans l'interface Proxmox, naviguer vers `Datacenter -> Permissions -> Realms`. Ajouter un royaume `OpenID Connect`, remplir les informations fournies par Authentik et définir l'attribut `autocreate` à `1` pour provisionner automatiquement les utilisateurs.

---

## Références

* [Documentation officielle Proxmox VE](https://pve.proxmox.com/pve-docs/)
* [Manpage d'Iptables](https://linux.die.net/man/8/iptables)
* [Authentik - Proxmox Integration](https://docs.goauthentik.io/integrations/services/proxmox-ve/)