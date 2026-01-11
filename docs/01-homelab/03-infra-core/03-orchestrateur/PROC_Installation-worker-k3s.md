---
sidebar_position: 2
title: Installation Workers K3s
description: Ajout de nœuds agents au cluster Kubernetes existant.

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
Cette procédure détaille l'ajout d'un nœud **Worker** (Agent) au cluster. Ces nœuds sont chargés d'exécuter les conteneurs (Pods) et de fournir la puissance de calcul.

**Impact :** Aucun impact sur le Controle plane. Le nouveau nœud sera disponible dès la fin de l'installation.

---

## Prérequis

Avant de commencer, s'assurer de :
* [ ] Avoir une VM installée avec IP statique.
* [ ] Avoir accès au **Token** du cluster (récupéré sur le Controle Plane : `/var/lib/rancher/k3s/server/node-token`).
* [ ] Connaître l'IP du Control Plane.

---

## Étape 1 : Préparation Système (Obligatoire)

Comme pour le Controle Plane, le système doit être préparé pour supporter Kubernetes.

### 1.1 Désactivation du Swap
```bash
# Désactivation immédiate
sudo swapoff -a

# Désactivation permanente
sudo sed -i '/ swap / s/^/#/' /etc/fstab

```

**Vérification :** `free -h` (Swap doit être à 0).

### 1.2 IP Forwarding & Modules

```bash
cat <<EOF | sudo tee /etc/sysctl.d/k3s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF

# Appliquer
sudo sysctl --system

```

---

## Étape 2 : Installation de l'Agent

> Cette étape connecte la machine au Controle Plane.

### 2.1 Définition des variables

Pour simplifier la commande d'installation, on définit l'URL et le Token.

*Remplacer les valeurs par les vôtres :*

```bash
export K3S_URL="https://192.168.1.201:6443"
export K3S_TOKEN="K10..."

```

### 2.2 Installation du binaire

La commande détecte automatiquement les variables d'environnement définies ci-dessus.

```bash
curl -sfL [https://get.k3s.io](https://get.k3s.io) | K3S_URL=$K3S_URL K3S_TOKEN=$K3S_TOKEN sh -

```

### 2.3 Vérification locale

Vérifier que le service agent tourne bien :

```bash
systemctl status k3s-agent
# Attendu : Active: active (running)

```

---

## Étape 3 : Finalisation (Sur le Master)

Une fois le worker installé, il faut lui attribuer son rôle officiellement via `kubectl`.

### 3.1 Labellisation "Worker"

Par défaut, K3s n'affiche pas le rôle "Worker" dans la colonne ROLES. On l'ajoute manuellement pour la clarté.

**Depuis le Master ou ton PC admin :**

1. Lister les nœuds pour obtenir le nom exact :
```bash
kubectl get nodes

```


2. Appliquer le label (Remplacer `<nom-du-worker>` par le nom réel, ex: `k3s-w-prod-01`) :
```bash
kubectl label node <nom-du-worker> node-role.kubernetes.io/worker=true
```

---

## Validation Finale

Depuis le poste d'administration :

```bash
kubectl get nodes

```

**Résultat attendu :**

* Le nouveau nœud apparaît.
* Statut : `Ready`.
* Rôle : `worker`.

---

## Références

* [Documentation K3s Agent](https://www.google.com/search?q=https://docs.k3s.io/installation/configuration%23agent-configuration)