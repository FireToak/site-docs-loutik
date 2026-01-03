---
title: Installation du Controle Plane Kubernetes
description: Procédure d'installation et de configuration du Controle Plane Kubernetes dans le cluster k3s.
---

**Phase 3 – Cluster Kubernetes**

![Logo Loutik](https://raw.github.com/firetoak/firetoak/master/00-logo-loutik.png)

---
## Informations générales

- **Date de création :** 20/12/2025
- **Dernière modification :** 20/12/2025
- **Auteur :** MEDO Louis
- **Version :** 1

---
## Objectif

Installer et configurer un controle plane Kubernetes (K3s) pour l’infrastructure LoutikCloud, incluant Traefik, keel et le kubeconfig distant.

---
## Sommaire

- A. Préparation système  
- B. Installation du Control Plane K3s  
- C. Récupération kubeconfig (poste d'administration)
- D. Installation de HELM
- E. Installation de Keel

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
## B. Installation du Control Plane

 1. **Installation serveur K3s**
```bash
curl -sfL https://get.k3s.io | sh -
```

Ce script installe :

- API Kubernetes
- Service K3s serveur
- SQLite intégré
- Traefik actif par défaut

 2. **Récupération du token du cluster**
```bash
sudo cat /var/lib/rancher/k3s/server/node-token
```

> Copier la valeur et coller la valeur dans le Bitwarden – elle sera utilisée par les nœuds Workers.

3. **Vérification Master**
```bash
sudo kubectl get nodes
```

Résultat attendu :

- nœud Master affiché
- statut : `Ready`
- rôle : `control-plane,master`

4. **Installation de git.** Cela nous permet de récupérer nos configuration plus facilement depuis nos dépôts GitHub.
```bash
sudo apt update && sudo apt install git -y
```

5. **Empêcher les pods d'aller sur le controle node.**
   ```bash
   sudo kubectl taint nodes k3s-m-prod-01 CriticalAddonsOnly=true:NoExecute
   ```

6. Ajouter l'étiquette pour le stockage persistant des nodes
```bash
kubectl label nodes k3s-w-prod-01 stockage=persistant01
```

```
kubectl label nodes k3s-w-prod-02 stockage=persistant02
```

> Cela permet d'éviter que les nodes ayant des volumes persistant se déplace sur un autre worker perdant ainsi son volume.
---
## C. Configuration de l’accès administrateur

Objectif : piloter le cluster sans SSH.

 1. **Récupération du kubeconfig**
	 Copier le contenu
```bash
sudo cat /etc/rancher/k3s/k3s.yaml
```

 2. **Installation sur le poste d’administration**
 
	Coller dans le fichier :
```
~/.kube/config
```

	Modifier la ligne :
```
server: https://127.0.0.1:6443
```

	par :
```
server: https://IP_MASTER:6443
```

	exemple :
```
server: https://192.168.1.201:6443
```

 3. **Vérification client distant**
```bash
kubectl get nodes
```

> Vous devez voir la liste des noeuds du cluster.

---
## D. Installation de HELM

Objectif : simplifier l'installation de service via des templates. (équivalent à APT, mais pour Kubernetes)

 1. Installation du mirroir helm dans les sources sur Debian et installation du paquets.
```bash
sudo apt-get install curl gpg apt-transport-https --yes
curl -fsSL https://packages.buildkite.com/helm-linux/helm-debian/gpgkey | gpg --dearmor | sudo tee /usr/share/keyrings/helm.gpg > /dev/null
echo "deb [signed-by=/usr/share/keyrings/helm.gpg] https://packages.buildkite.com/helm-linux/helm-debian/any/ any main" | sudo tee /etc/apt/sources.list.d/helm-stable-debian.list
sudo apt-get update
sudo apt-get install helm
```

2. Créer le dossier de configuration qui va contenir la configuration de Kubernetes
   ```bash
   mkdir -p ~/.kube
   ```

3. Copier le fichier de configuration de K3s vers le dossier personnel
   ```bash
   sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
   ```
   
4. Donner les droits à l'utilisateur sur le fichier de configuration
   ```bash
   sudo chown $(id -u):$(id -g) ~/.kube/config
   ```

> id -u > permet d'ajouter l'id de l'utilisateur qui éxecute la commande
> id -p > permet d'ajouter l'id du groupe qui éxecute la commande

5. Restreindre l'accès au fichier
   ```bash
   chmod 600 ~/.kube/config
   ```

---
## E. Installation de Keel

> Permet de mettre à jours automatiquement les images de Loutik

1. Ajout dépôt keel à Helm
   ```bash
   helm repo add keel https://charts.keel.sh
   helm repo update
   ```

2. Création du fichier `keel-values.yaml` dans le répertoire `k3s/keel`
   ```bash
   mkdir -p ~/k3s/keel && cd ~/k3s/keel
   vi keel-values.yaml
   ```

3. Copier le contenue suivant :
```YAML
# Configuration Keel pour Portfolio (Mode Watcher léger)

# On désactive le provider Helm car on gère des déploiements Kubernetes natifs (fichiers .yaml)
helmProvider:
  enabled: false

# On désactive le Service (interface web interne) car on n'en a pas besoin
service:
  enabled: false

# On active le polling (sondage)
polling:
  enabled: true
```

4. Créer le namespace `keel-system`
```bash
sudo kubectl create namespace keel-system
```

5. Installation de keel
```bash
helm upgrade --install keel keel/keel --namespace keel-system -f keel-values.yaml
```

6. Vérifier le fonctionnement de keel
```bash
sudo kubectl get pods -n keel-system -o wide
```

> Le pod `keel-xxxx` doit être en statut `Running`.

---
## Bibliographie
- [K3s Documentation](https://rancher.com/docs/k3s/latest/en/)
- [Helm Documentation](https://helm.sh/docs/)
- [Keel Documentation](https://keel.sh/docs/)
