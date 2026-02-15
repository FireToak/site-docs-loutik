---
sidebar_position: 3
title: Configuration du poste Administrateur (WSL & Kubectl)
description: Comment installer WSL2 et configurer le poste client pour un accès distant sécurisé à l'API du cluster K3s

# -------------------------------------------------------------------------
# 🎯 MODÈLE : ACTION (VIVANT)
# -------------------------------------------------------------------------
---

![Logo Loutik](/img/logo_loutik.png)

---

:::info Métadonnées
* **Mainteneur(s) :** MEDO Louis
* **Dernière validation technique :** 2026-02-15
:::

---

## Contexte

Cette procédure détaille la mise en place d'un environnement Linux natif sous Windows (WSL2) et la configuration du client `kubectl`. L'objectif est de supprimer l'utilisation de SSH pour l'administration et de dialoguer directement de manière sécurisée avec l'API du cluster K3s.

---
## Prérequis

Avant de commencer, s'assurer de :

* [ ] Avoir un PC sous Windows 10/11 avec les privilèges administrateur.
* [ ] Connaître l'adresse IP de l'interface réseau du nœud Master K3s.
* [ ] Avoir un accès SSH fonctionnel (une dernière fois) vers le nœud Master.

---
## Étape 1 : Installation de l'environnement Linux (WSL2)

WSL2 permet d'exécuter un noyau Linux complet directement sous Windows, indispensable pour les outils DevOps.

### 1.1 Activation et installation

Ouvrir un terminal **PowerShell** en tant qu'administrateur.

```powershell
wsl --install

```

* `wsl` : Appelle l'exécutable du Windows Subsystem for Linux.
* `--install` : Active les composants virtuels Windows requis et télécharge la distribution Ubuntu par défaut.

> **Action :** Redémarrer le PC si Windows le demande. À la réouverture, une fenêtre Ubuntu s'ouvre pour créer un identifiant UNIX et un mot de passe.

---

## Étape 2 : Installation du client Kubernetes

Les commandes suivantes sont à exécuter dans le nouveau terminal **Ubuntu (WSL)**.

### 2.1 Téléchargement du binaire kubectl

```bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
```

* `curl -LO` : Télécharge le fichier distant et conserve son nom d'origine localement.
* `$(...)` : Exécute une sous-commande pour lire la dernière version stable publiée par Kubernetes et l'insère dans l'URL.

### 2.2 Installation et droits

```bash
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
```

* `sudo install` : Déplace un fichier et configure ses permissions simultanément.
* `-o root -g root` : Assigne le propriétaire et le groupe `root` au fichier.
* `-m 0755` : Rend le fichier exécutable pour tous, mais modifiable uniquement par root.
* `/usr/local/bin/kubectl` : Chemin standard pour les exécutables locaux sous Linux.

---

## Étape 3 : Configuration de l'accès distant (Kubeconfig)

Pour s'authentifier, `kubectl` a besoin du certificat généré par le serveur K3s.

### 3.1 Rapatriement du certificat

Remplacer `utilisateur` et `ip-serveur` par les bonnes valeurs.

```bash
# 1. Créer le répertoire caché attendu par l'outil
mkdir -p ~/.kube

# 2. Copier le fichier distant vers le PC local via SSH
scp utilisateur@ip-serveur:/etc/rancher/k3s/k3s.yaml ~/.kube/config
```

* `mkdir -p` : Crée le dossier parent s'il n'existe pas, sans retourner d'erreur s'il est déjà présent.
* `scp` : Secure Copy. Transfère un fichier via le protocole chiffré SSH.

*(Note : Si une erreur de permission survient, copier d'abord le fichier dans le `/home` de l'utilisateur sur le serveur K3s avec un `sudo cp`, lui donner les droits avec `chown`, puis relancer le `scp`).*

### 3.2 Modification de l'adresse de l'API

Le fichier copié pointe par défaut vers localhost. Il faut indiquer l'IP publique ou locale du serveur.

```bash
nano ~/.kube/config

```

* `nano` : Éditeur de texte simple en ligne de commande.

> **Action :** Chercher la ligne `server: https://127.0.0.1:6443` et remplacer `127.0.0.1` par l'IP du Master. Sauvegarder (`Ctrl+O` -> Entrée) et quitter (`Ctrl+X`).

**Vérification :**
Exécuter `kubectl get nodes`. Le terminal doit afficher l'état du cluster K3s.

---

## Étape 4 : Utilisation Quotidienne du Poste Administrateur

Maintenant que le poste est configuré, voici comment l'utiliser tous les jours.

### 4.1 Lancer son environnement de travail

Pour ouvrir ton terminal Linux depuis Windows, tu as deux options :

1. Chercher **Ubuntu** dans le menu Démarrer de Windows.
2. Ouvrir n'importe quel terminal PowerShell/CMD et taper simplement la commande `wsl`.

### 4.2 Commandes d'administration courantes

Voici les commandes `kubectl` indispensables pour auditer ton cluster en lecture seule.

```bash
# Voir l'état des serveurs (nœuds)
kubectl get nodes

# Lister tous les conteneurs (Pods) de tous les projets
kubectl get pods -A

# Voir les détails d'un pod spécifique (pour le debug)
kubectl describe pod <nom-du-pod> -n <nom-du-namespace>

# Lire les logs en direct d'un conteneur
kubectl logs -f <nom-du-pod> -n <nom-du-namespace>
```

* `get` : Affiche une liste basique des ressources demandées.
* `-A` : Raccourci pour `--all-namespaces`. Cherche dans tous les environnements isolés.
* `describe` : Fournit un rapport détaillé (événements, erreurs de démarrage, configuration IP) d'une ressource.
* `logs -f` : Affiche la sortie standard du conteneur. Le `-f` (follow) garde le flux ouvert pour voir les nouveaux logs en temps réel.

---

## Références

* [Documentation Microsoft WSL](https://learn.microsoft.com/fr-fr/windows/wsl/basic-commands)