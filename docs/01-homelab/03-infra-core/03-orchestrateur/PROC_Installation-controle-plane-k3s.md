---
sidebar_position: 1
title: Installation Controle Plane K3s
description: Déploiement du Control Plane, préparation système, Helm et Keel.

# -------------------------------------------------------------------------
# 🎯 MODÈLE : ACTION (VIVANT)
# -------------------------------------------------------------------------
---

![Logo Loutik](/img/logo_loutik.png)

---

:::info Métadonnées
* **Mainteneur(s) :** MEDO Louis
* **Dernière validation technique :** 2026-01-11
* **Version K3s :** Stable
:::

---

## Contexte
Cette procédure détaille l'installation complète du nœud Master (Control Plane) pour l'infrastructure **LoutikCloud**. Elle inclut la préparation du noyau Linux, l'installation de K3s, la sécurisation du nœud (Taints), l'installation du gestionnaire de paquets HELM et de l'outil de mise à jour Keel.

---

## Prérequis

Avant de commencer, s'assurer de :
* [ ] Avoir une VM Debian/Ubuntu fraîchement installée avec IP statique.
* [ ] Être connecté en `sudo`.
* [ ] Avoir défini les noms d'hôtes (ex: `k3s-m-prod-01`).

---

## Étape 1 : Préparation Système (Obligatoire)

K3s nécessite une configuration spécifique du noyau et la désactivation du Swap pour fonctionner correctement.

### 1.1 Désactivation du Swap
Kubernetes ne gère pas la mémoire swap. Il faut la désactiver.

```bash
# Désactivation immédiate
sudo swapoff -a

# Désactivation permanente (au redémarrage)
sudo sed -i '/ swap / s/^/#/' /etc/fstab

```

**Vérification :**
Exécuter `free -h`. La colonne **Swap** doit afficher **0**.

### 1.2 IP Forwarding & Modules Kernel

Autoriser les communications réseaux entre les conteneurs (Bridges).

```bash
cat <<EOF | sudo tee /etc/sysctl.d/k3s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF

# Appliquer les changements
sudo sysctl --system

```

### 1.3 Installation des outils de base

Installation de `git` pour récupérer les configurations futures.

```bash
sudo apt update && sudo apt install git -y

```

---

## Étape 2 : Installation du Master (Control Plane)

### 2.1 Installation du service K3s

```bash
curl -sfL https://get.k3s.io | sh -

```

*Ce script installe l'API Kubernetes, la base de données SQLite et Traefik par défaut.*

### 2.2 Sauvegarde du Token

Ce jeton est indispensable pour joindre les Workers au cluster.

```bash
sudo cat /var/lib/rancher/k3s/server/node-token

```

> **Action :** Copier la chaîne affichée et la stocker dans **Bitwarden**.

### 2.3 Configuration des droits Kubectl (Local)

Pour utiliser `kubectl` et `helm` sans `sudo` avec l'utilisateur courant :

```bash
# 1. Créer le dossier de config
mkdir -p ~/.kube

# 2. Copier la config admin
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config

# 3. Donner les droits à l'utilisateur courant
sudo chown $(id -u):$(id -g) ~/.kube/config

# 4. Sécuriser le fichier (lecture seule pour le propriétaire)
chmod 600 ~/.kube/config

```

---

## Étape 3 : Configuration & Sécurisation du Nœud

### 3.1 Protection du Master (Taint)

Pour éviter que des applications utilisateurs (Pods) ne se lancent sur le serveur maître (réservé aux services critiques).

```bash
# Syntaxe : kubectl taint nodes <NOM_NODE> Key=Value:Effect
sudo kubectl taint nodes k3s-m-prod-01 CriticalAddonsOnly=true:NoExecute

```

### 3.2 Étiquetage pour le stockage (Label)

Définir les nœuds qui accueilleront les volumes persistants (Longhorn/Local). Cela empêche un pod avec des données de se déplacer sur un nœud qui n'a pas le disque.

*À faire une fois les workers connectés, ou préventivement :*

```bash
kubectl label nodes k3s-w-prod-01 stockage=persistant01
kubectl label nodes k3s-w-prod-02 stockage=persistant02

```

---

## Étape 4 : Installation de HELM

Helm est le gestionnaire de paquets pour Kubernetes (équivalent d'APT).

### 4.1 Installation des dépôts et du paquet

```bash
sudo apt-get install curl gpg apt-transport-https --yes

# Ajout de la clé GPG
curl -fsSL https://packages.buildkite.com/helm-linux/helm-debian/gpgkey | gpg --dearmor | sudo tee /usr/share/keyrings/helm.gpg > /dev/null

# Ajout du dépôt
echo "deb [signed-by=/usr/share/keyrings/helm.gpg] https://packages.buildkite.com/helm-linux/helm-debian/any/ any main" | sudo tee /etc/apt/sources.list.d/helm-stable-debian.list

# Installation
sudo apt-get update
sudo apt-get install helm

```

---

## Étape 5 : Installation de Keel

Keel est un "Watcher" qui met à jour automatiquement les conteneurs quand une nouvelle image Docker est disponible.

### 5.1 Préparation Helm

```bash
# Ajout du repo Keel
helm repo add keel https://charts.keel.sh
helm repo update
```

### 5.2 Configuration (Values)

Créer le fichier de configuration spécifique :

```bash
mkdir -p ~/k3s/keel && cd ~/k3s/keel
nano keel-values.yaml

```

Coller le contenu suivant :

```yaml
# Configuration Keel pour LoutikCloud
helmProvider:
  enabled: false # On gère via fichiers YAML natifs
service:
  enabled: false # Pas d'interface web exposée
polling:
  enabled: true  # Vérifie régulièrement les nouvelles images

```

### 5.3 Déploiement

```bash
# 1. Création du namespace système
sudo kubectl create namespace keel-system

# 2. Installation via Helm
helm upgrade --install keel keel/keel --namespace keel-system -f keel-values.yaml

```

**Vérification :**

```bash
sudo kubectl get pods -n keel-system -o wide

```

---

## Annexe : Accès Distant (Optionnel)

Si vous souhaitez piloter le cluster depuis votre PC personnel.

1. Sur le serveur : `sudo cat /etc/rancher/k3s/k3s.yaml`
2. Copier le contenu.
3. Sur ton PC : Coller dans `~/.kube/config`.
4. Remplacer `server: https://127.0.0.1:6443` par l'IP du Master (ex: `https://192.168.1.201:6443`).

---

## Références

* [Documentation K3s](https://docs.k3s.io)
* [Documentation Keel](https://keel.sh)