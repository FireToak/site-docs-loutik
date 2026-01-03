---
title: Mise en place de Tailscale sur les gateways
description: Procédure de configuration d'un réseau VPN maillé Tailscale entre les passerelles du homelab.
---

# Mise en place de Tailscale sur les gateways

**Phase 1 – Socle physique et réseau**

![Logo Loutik](./img/00-logo-loutik.png)

---
## Informations générales

- **Date de création :** 07/12/2025
- **Dernière modification :** 02/01/2026
- **Auteur :** MEDO Louis
- **Version :** 1.1

---
## Objectif

Cette procédure décrit la mise en place du réseau **VPN maillé Tailscale** entre deux machines jouant le rôle de passerelles :

- **gateway01-loutik** : passerelle locale du homelab (LAN)
- **gateway01-infomaniak** : passerelle VPS exposée sur Internet

Objectifs principaux :

- Relier de manière sécurisée le **LAN du homelab** au **VPS**
- Permettre au VPS d’accéder aux services internes (192.168.1.0/24)
- Utiliser Tailscale comme **Subnet Router**
- Préparer l’infrastructure à une exposition publique via reverse-proxy

---
## Sommaire

A. Installation de Tailscale sur les deux machines  
B. Configuration de Tailscale sur gateway01-loutik (Subnet Router)  
C. Configuration de Tailscale sur gateway01-infomaniak  
D. Vérification du fonctionnement

---

## A. Installation de Tailscale sur les deux machines

> Ces étapes doivent être réalisées sur **gateway01-loutik** et **gateway01-infomaniak**.

 1. **Installation via le script officiel**
```bash
curl -fsSL https://tailscale.com/install.sh | sh
```

> ⚠️ Si la commande échoue, vérifier que le paquet `curl` est installé :

```bash
sudo apt install curl -y
```

 2. **Démarrage et authentification**
 
Après l’installation, Tailscale affiche une URL d’authentification :
```text
To authenticate, visit:
https://login.tailscale.com/a/XXXXXXXXXXXX
```

- Ouvrir l’URL dans un navigateur
- Se connecter avec le compte Tailscale
- Autoriser la machine

 3. **Vérification de la connexion**

Un message de succès doit apparaître :
```text
Success.
```

Vous pouvez également vérifier l’état du service :

```bash
tailscale status
```

---
## B. Configuration de Tailscale sur gateway01-loutik

Cette machine agit comme **Subnet Router** afin d’annoncer le réseau local du homelab au réseau Tailscale.

 1. **Annonce du réseau LAN**
```bash
tailscale up --advertise-routes=192.168.1.0/24
```

> Cette commande indique à Tailscale que la machine est capable de router le réseau local `192.168.1.0/24`.

2. **Validation de la route dans le Dashboard Tailscale**

- Se rendre sur : [https://login.tailscale.com/admin/machines](https://login.tailscale.com/admin/machines)
- Repérer la machine **gateway01-loutik**
- Cliquer sur **⋮** → **Edit route settings**
- **Approuver** la route annoncée

Sans cette validation, la route ne sera pas utilisable.

 3. **Activation de l’IP forwarding (temporaire)**

Par défaut, Debian ne route pas les paquets entre interfaces.
```bash
sudo sh -c 'echo 1 > /proc/sys/net/ipv4/ip_forward'
```

 4. **Activation persistante de l’IP forwarding**
```bash
sudo sysctl -w net.ipv4.ip_forward=1
sudo nano /etc/sysctl.d/99-ip-forward.conf
```

Ajouter la ligne suivante :
```text
net.ipv4.ip_forward = 1
```

Appliquer la configuration :
```bash
sudo sysctl --system
```

> 🔎 Cette étape est indispensable pour garantir le routage après un redémarrage.

---
## C. Configuration de Tailscale sur gateway01-infomaniak

Sur le VPS, il est nécessaire d’**accepter les routes** annoncées par gateway01-loutik afin d’accéder au LAN.

 1. **Acceptation des routes**
```bash
tailscale up --accept-routes
```

 2. **Vérification des routes actives**
```bash
tailscale status
ip route
```

> Vous devriez voir une route vers `192.168.1.0/24` via l’interface Tailscale (`tailscale0`).

---
## D. Vérification du fonctionnement

 1. **Test de connectivité vers un hôte du LAN**

Depuis **gateway01-infomaniak** :

```bash
ping 192.168.1.209
```

> Les paquets doivent être reçus sans perte.

 2. **Test applicatif (recommandé)**

Tester un service exposé sur le LAN :

```bash
curl http://192.168.1.209
```

Cela confirme que le routage IP et les flux applicatifs fonctionnent correctement.

---
## Bonnes pratiques et recommandations

- Ne déclarer que les **réseaux strictement nécessaires**
- Surveiller l’état des routes après chaque redémarrage
- Documenter les IP exposées via Tailscale
- Coupler Tailscale avec un firewall local (nftables / iptables)
- Utiliser les ACL Tailscale pour limiter les accès

---
## Bibliographie

- Subnet Routers – Documentation officielle Tailscale
- Installation Debian (Trixie) – Documentation Tailscale