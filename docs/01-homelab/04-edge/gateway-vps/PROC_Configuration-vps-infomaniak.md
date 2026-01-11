---
sidebar_position: 1
title: Initialisation VPS (Infomaniak)
description: Première connexion, sécurisation utilisateur et ouverture des ports.

# -------------------------------------------------------------------------
# 🎯 MODÈLE : ACTION (VIVANT)
# -------------------------------------------------------------------------
---

![Logo Loutik](/img/logo_loutik.png)

---

:::info Métadonnées
* **Mainteneur(s) :** MEDO Louis
* **Dernière validation technique :** 2026-01-11
* **Cible :** `gateway01-infomaniak`
:::

---

## Contexte
Cette procédure couvre la mise en route initiale du VPS qui servira de passerelle (Gateway). Nous allons sécuriser l'accès SSH en remplaçant l'utilisateur par défaut et configurer le pare-feu externe d'Infomaniak.

**Impact :** Aucun impact production (nouvelle machine).

---

## Prérequis

Avant de commencer, s'assurer de :
* [ ] Avoir reçu l'email d'Infomaniak avec l'IP du VPS.
* [ ] Avoir sa clé SSH privée (`id_rsa` ou `id_ed25519`) sur son poste local.
* [ ] Avoir accès au Manager Infomaniak (Web).

---

## Étape 1 : Connexion & Mise à jour

### 1.1 Connexion SSH initiale
Depuis le terminal local, connectez-vous avec l'utilisateur par défaut (`debian` ou `root` selon l'image).

```bash
# -i : Spécifie le chemin vers ta clé privée si elle n'est pas par défaut
ssh -i ~/.ssh/id_rsa debian@<IP_u_VPS>

```

### 1.2 Mise à jour du système

Avant toute installation, on met à jour la liste des paquets et les binaires.

```bash
sudo apt update && sudo apt upgrade -y

```

* `update` : Récupère la liste des dernières versions disponibles.
* `upgrade -y` : Installe les mises à jour en répondant "Oui" (`-y`) automatiquement.

---

## Étape 2 : Configuration de l'Utilisateur (Louis)

Nous créons un nouvel administrateur.

### 2.1 Création du compte

```bash
sudo adduser louis

```

* Commande interactive : renseigne un mot de passe fort et valide avec `Entrée`.

### 2.2 Attribution des droits Admin (Sudo)

On ajoute `louis` au groupe `sudo` pour qu'il puisse exécuter des commandes administratives.

```bash
sudo usermod -aG sudo louis

```

* `-aG` : Append to Group (Ajoute au groupe sans supprimer les autres).

### 2.3 Transfert de la clé SSH

Pour que `louis` puisse se connecter sans mot de passe (comme `debian`), on copie le dossier `.ssh` existant.

```bash
# Copie du dossier des clés avec les bons droits
sudo rsync --archive --chown=louis:louis /home/debian/.ssh /home/louis

```

* `rsync` : Outil de copie.
* `--chown` : Change le propriétaire des fichiers copiés pour que `louis` puisse les lire.

### 2.4 Vérification (Crucial)

1. **Ouvrir un nouveau terminal** sur ton PC.
2. Tenter la connexion : `ssh louis@<IP_DU_VPS>`.
3. Si ça fonctionne, tu peux fermer la session `debian`.

---

## Étape 3 : Configuration Firewall (Infomaniak)

Le VPS possède un pare-feu en amont (dans l'infrastructure Infomaniak) qu'il faut ouvrir pour le Web.

### 3.1 Accès au Manager

1. Se connecter sur [manager.infomaniak.com](https://manager.infomaniak.com).
2. Aller dans **Service Cloud (VPS)** > Sélectionner le VPS.
3. Cliquer sur l'onglet **Pare-feu**.

### 3.2 Ouverture des Ports

Par défaut, seul le port 22 (SSH) est ouvert. Ajouter les règles suivantes :

| Port | Protocole | Source | Description |
| --- | --- | --- | --- |
| **80** | TCP | 0.0.0.0/0 (Tous) | HTTP (Nginx) |
| **443** | TCP | 0.0.0.0/0 (Tous) | HTTPS (Nginx) |

Cliquer sur **Valider** ou **Sauvegarder**.

---

## Validation Finale

* [ ] La connexion SSH avec `louis` fonctionne.
* [ ] La commande `sudo apt update` fonctionne avec le mot de passe de `louis`.
* [ ] Les ports 80/443 apparaissent comme "ouverts" dans le tableau de bord Infomaniak.

---

## Rollback

Si vous avez perdu l'accès SSH :

1. Aller sur le Manager Infomaniak.
2. Utiliser la **Console VNC** (Accès écran/clavier virtuel).
3. Se loguer avec `louis` et le mot de passe défini à l'étape 2.1 pour corriger la configuration SSH.