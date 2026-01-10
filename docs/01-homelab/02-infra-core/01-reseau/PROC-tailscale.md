---
sidebar_position: 1
title: Mise en place de Tailscale et ACL
description: Procédure pour l'installation du maillage VPN Tailscale, la configuration du Subnet Router et la restriction des flux via ACL.

# -------------------------------------------------------------------------
# 🎯 MODÈLE : ACTION (VIVANT)
# -------------------------------------------------------------------------
# - [PROC] : Procédure / Runbook (Pas à pas)
# -------------------------------------------------------------------------
---

![Logo Loutik](https://raw.github.com/firetoak/firetoak/master/00-logo-loutik.png)

---

:::info Métadonnées
* **Mainteneur(s) :** MEDO Louis
* **Dernière validation technique :** 2026-01-10
:::

---

## Contexte
Mettre en place un réseau VPN maillé (Mesh) sécurisé entre le homelab et le VPS, permettant au VPS d'accéder à une plage IP restreinte du réseau local via un Subnet Router.

---

## Prérequis

Avant de commencer, s'assurer de :
* [ ] Avoir les accès SSH `root` ou `sudo` sur `gateway01-loutik` et `gateway01-infomaniak`.
* [ ] Avoir un compte actif sur la console d'administration Tailscale.
* [ ] Avoir identifié la plage IP cible (192.168.1.200 à 192.168.1.230).

---

## Étape 1 : Installation de Tailscale

Installation du service sur les deux passerelles (`gateway01-loutik` et `gateway01-infomaniak`).

### 1.1 Exécution
Exécuter la commande suivante pour télécharger et installer le binaire :

```bash
# curl : outil de transfert de données
# -f : échoue silencieusement si erreur serveur (HTTP 400+)
# -s : mode silencieux (pas de barre de progression)
# -S : affiche les erreurs si -s échoue
# -L : suit les redirections
# | sh : transmet le script téléchargé à l'interpréteur shell pour exécution
curl -fsSL https://tailscale.com/install.sh | sh
```

### 1.2 Authentification
Lancer l'authentification machine :

```bash
# up : monte l'interface réseau tailscale0 et connecte au control plane
tailscale up
```
Suivre l'URL générée pour lier la machine au compte (SSO).

### 1.3 Vérification immédiate
Vérifier l'état du service :

```bash
# status : affiche l'état des connexions et des pairs (peers)
tailscale status
# Doit retourner les autres machines du mesh ou "Log in to..."
```

---

## Étape 2 : Configuration du Subnet Router

Configuration de `gateway01-loutik` pour exposer le réseau local.

### 2.1 Activation du routage IPv4
Modifier le noyau Linux pour autoriser le passage de paquets d'une interface à l'autre.

1.  Créer/Modifier le fichier de configuration :
    ```bash
    # nano : éditeur de texte en ligne de commande
    nano /etc/sysctl.d/99-tailscale.conf
    ```
2.  Ajouter la ligne :
    ```ini
    net.ipv4.ip_forward = 1
    ```
3.  Appliquer la modification :
    ```bash
    # sysctl : configure les paramètres du noyau
    # --system : charge les configurations de tous les fichiers système
    sysctl --system
    ```

### 2.2 Annonce de la route
Sur `gateway01-loutik`, annoncer le réseau LAN complet :

```bash
# --advertise-routes : déclare les sous-réseaux accessibles via ce nœud
# 192.168.1.0/24 : CIDR du réseau local complet
tailscale up --advertise-routes=192.168.1.0/24
```

:::warning Point d'attention
Aller dans la console d'administration Tailscale (Web), localiser la machine, cliquer sur les 3 points > **Edit route settings** et activer le switch devant la route `192.168.1.0/24`.
:::

---

## Étape 3 : Configuration du Client VPS

Configuration de `gateway01-infomaniak` pour recevoir les routes.

### 3.1 Acceptation des routes
Exécuter sur le VPS :

```bash
# --accept-routes : autorise la machine à installer les routes annoncées par d'autres pairs dans sa table de routage locale
tailscale up --accept-routes
```

---

## Étape 4 : Mise en place des ACL

> Restriction du trafic pour n'autoriser que la plage `192.168.1.200` à `192.168.1.230`.

### 4.1 Édition de la politique
Se rendre sur la console Tailscale > **Access Controls**.

### 4.2 Code ACL
Remplacer ou modifier le bloc `acls` avec la configuration suivante :

```json
// Définition des règles de contrôle d'accès (JSON)
{
  "acls": [
    {
      // action : "accept" autorise le flux (le défaut est "deny")
      "action": "accept",
      // src : source du trafic ("*" = tous les utilisateurs du VPN)
      "src": ["*"],
      // dst : destination au format IP ou CIDR : Port
      // Syntaxe de plage : StartIP-EndIP:Ports
      // :* signifie tous les ports TCP/UDP
      "dst": ["192.168.1.200-192.168.1.230:*"]
    }
  ]
}
```

> **Note :** Cette configuration remplace la règle par défaut "allow all". Tout trafic vers une IP en dehors de la plage 200-230 (par exemple 192.168.1.50) sera bloqué par le pare-feu Tailscale.

---

## Validation Finale

Comment s'assurer que le filtrage fonctionne ?

* [ ] **Test positif :** Depuis le VPS, `ping 192.168.1.209` (si IP dans la plage) fonctionne.
* [ ] **Test négatif :** Depuis le VPS, `ping 192.168.1.1` (Gateway physique, hors plage) échoue (Time out ou Destination Unreachable).
* [ ] **Vérification routes :** `ip route` sur le VPS montre bien le passage par `tailscale0` pour `192.168.1.0/24`.

---

## Rollback (Retour arrière)

**Si la connectivité est perdue :**

1.  Restaurer les ACL par défaut dans la console Web (bouton "Reset to default").
2.  Désactiver l'acceptation des routes sur le VPS :
    ```bash
    # Relance tailscale sans l'argument --accept-routes (remet la conf par défaut)
    tailscale up --reset
    ```

---

## Références
* [Documentation Tailscale ACL](https://tailscale.com/kb/1018/acls/)
* [Documentation Subnet Router](https://tailscale.com/kb/1019/subnets/)