---
title: Installation du Worker Kubernetes
description: Procédure d'installation et de configuration du Worker Kubernetes dans le cluster k3s.
---

# Procédure – Installation de Kubernetes Workers (K3s)

**Phase 3 – Cluster Kubernetes**

![Logo Loutik](https://raw.github.com/firetoak/firetoak/master/00-logo-loutik.png)

---
## Informations générales

- **Date de création :** 20/12/2025
- **Dernière modification :** 03/01/2026
- **Auteur :** MEDO Louis
- **Version :** 1

---
## Objectif

Installation et ajout d’un nœud Worker au cluster Kubernetes existant.

---
## Sommaire

A. Préparation système  
B. Connexion au cluster  
C. Vérification

---
## A. Préparation Système

> Obligatoire avant installation K3s.

1. **Désactivation du Swap**
```bash
sudo swapoff -a
sudo sed -i '/ swap / s/^/#/' /etc/fstab
```

Vérification :
```bash
free -h
```

La colonne "Swap" doit afficher **0**.

 2. **Activation IP forwarding et modules Kernel**
```bash
cat <<EOF | sudo tee /etc/sysctl.d/k3s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF

sudo sysctl --system
```

---
## B. Installation du Worker

> Actions à réaliser sur chaque VM Worker  
> Exemple : `k8s-w-prod-01`

1. **Export des variables cluster**
```bash
export K3S_URL="https://IP_MASTER:6443"
export K3S_TOKEN="TOKEN_RECUPERE_MASTER"
```

	exemple :
```bash
export K3S_URL="https://192.168.1.201:6443"
export K3S_TOKEN="K103f5d...."
```

 2. **Installation Agent K3s**
```bash
curl -sfL https://get.k3s.io | K3S_URL=$K3S_URL K3S_TOKEN=$K3S_TOKEN sh -
```

 3. **Vérification service**
```bash
systemctl status k3s-agent
```

4. Sur le controle plane, ajouter le label "worker" sur tous les nœuds workers :
   ```bash
   sudo kubectl label node k3s-w-prod-<numéro> node-role.kubernetes.io/worker=true
   ```

---
## C. Vérification du cluster

À exécuter depuis le controle plane ou un poste administrateur:
```bash
kubectl get nodes
```

Résultat attendu :
- Worker visible
- statut : `Ready`

---
## Bibliographie
- [K3s Documentation](https://rancher.com/docs/k3s/latest/en/)

