---
sidebar_position: 1
title: Installation CrowdSec
description: Installation de l'agent, du pare-feu et connexion à la console web.

# -------------------------------------------------------------------------
# 🎯 MODÈLE : ACTION (VIVANT)
# -------------------------------------------------------------------------
---

![Logo Loutik](/img/logo_loutik.png)

---

:::info Métadonnées
* **Mainteneur(s) :** MEDO Louis
* **Dernière validation technique :** 2026-01-11
* **Cible :** `gateway01-infomaniak` (VPS)
:::

---

## Contexte
Cette procédure décrit l'installation et la configuration de **CrowdSec** sur le serveur passerelle.
Le déploiement se compose de trois phases :
1.  **L'Agent :** Analyse les logs pour détecter les comportements suspects.
2.  **Le Bouncer :** Bloque les adresses IP malveillantes via le pare-feu (iptables).
3.  **La Console :** Permet la visualisation des menaces via l'interface web SaaS.

**Impact :** Installation à chaud, aucune interruption de service n'est à prévoir.

---

## Prérequis

Avant de commencer, veuillez vous assurer de :
* [ ] Être connecté en SSH sur le VPS (`gateway01`).
* [ ] Disposer des privilèges `sudo`.
* [ ] Avoir un compte actif sur [app.crowdsec.net](https://app.crowdsec.net) (Console Web).
* [ ] Avoir vérifié que le port SSH (22) est bien autorisé dans vos règles actuelles (pour éviter un auto-bannissement accidentel).

---

## Étape 1 : Installation de l'Agent CrowdSec

L'agent est le service responsable de la lecture des logs et de la détection des attaques.

### 1.1 Ajout des dépôts
Exécutez la commande suivante pour ajouter les dépôts officiels et les clés de signature :

```bash
curl -s https://packagecloud.io/install/repositories/crowdsec/crowdsec/script.deb.sh | sudo bash

```

### 1.2 Installation du paquet

Installez l'agent via le gestionnaire de paquets :

```bash
sudo apt install crowdsec

```

* Durant l'installation, CrowdSec détectera automatiquement les services présents (SSH, Nginx, etc.) et appliquera les configurations nécessaires.

---

## Étape 2 : Installation du Bouncer (Pare-feu)

L'agent détecte, mais ne bloque pas par défaut. Il est nécessaire d'installer un "Bouncer" pour interagir avec le pare-feu du système (iptables).

### 2.1 Installation

```bash
sudo apt install crowdsec-firewall-bouncer-iptables

```

### 2.2 Vérification du service

Vérifiez que le bouncer est actif :

```bash
sudo systemctl status crowdsec-firewall-bouncer
# Résultat attendu : Active: active (running)

```

:::info 🧠 Fiche Notion : Agent vs Bouncer

* **Agent :** Le "Cerveau". Il lit les logs, décide si une IP est dangereuse.
* **Bouncer :** Le "Videur". Il interroge l'agent et applique physiquement le blocage sur le réseau.
:::

---

## Étape 3 : Connexion à la Console Web (Dashboard)

CrowdSec ne disposant pas d'interface graphique locale, il est nécessaire d'enrôler l'instance sur la console SaaS pour visualiser les attaques.

### 3.1 Récupération de la clé d'enrôlement

1. Connectez-vous sur [app.crowdsec.net](https://app.crowdsec.net).
2. Cliquez sur **"Enroll my first instance"** (ou le bouton **+ Add instance**).
3. Copiez la commande affichée (format : `sudo cscli console enroll ...`).

### 3.2 Enrôlement du serveur

Sur le terminal du VPS, collez et exécutez la commande récupérée :

```bash
sudo cscli console enroll <VOTRE_CLE_UNIQUE>

```

### 3.3 Application

Pour finaliser la liaison et synchroniser les tags, redémarrez le service :

```bash
sudo systemctl restart crowdsec

```

Veuillez retourner sur l'interface web pour **accepter/valider** la nouvelle instance qui doit apparaître en demande d'approbation.

---

## Étape 4 : Vérification du fonctionnement

Utilisez l'outil en ligne de commande `cscli` pour valider l'installation.

### 4.1 Vérifier la détection

```bash
sudo cscli metrics

```

* Observez la section **Acquisition Metrics**. La colonne `Lines read` doit s'incrémenter, prouvant que les logs sont bien lus.

### 4.2 Simulation d'un blocage

Pour tester la réactivité du pare-feu, bannissez manuellement une IP fictive :

```bash
# 1. Bannir manuellement une IP test
sudo cscli decisions add --ip 1.2.3.4 --duration 1h --reason "Test manuel"

# 2. Vérifier qu'elle est bien dans la liste locale
sudo cscli decisions list

# 3. Supprimer le bannissement de test
sudo cscli decisions delete --ip 1.2.3.4

```

---

## Validation Finale

* [ ] Le service est actif : `systemctl status crowdsec`.
* [ ] La commande `sudo cscli lapi status` renvoie une coche verte (Communication interne OK).
* [ ] L'instance apparaît **"Online"** sur le dashboard [app.crowdsec.net](https://app.crowdsec.net).

---

## Rollback

En cas de problème majeur, voici la procédure de désinstallation complète :

```bash
sudo apt purge crowdsec crowdsec-firewall-bouncer-iptables

```

---

## Références

* [Documentation Officielle - Installation](https://doc.crowdsec.net/docs/getting_started/install_crowdsec)