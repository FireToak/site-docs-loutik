---
sidebar_position: 1
title: Installation et structuration de FluxCD
description: Comment installer et structurer les dépôts git de FluxCD.

# -------------------------------------------------------------------------
# 🎯 MODÈLE : ACTION (VIVANT)
# -------------------------------------------------------------------------
---

![Logo Loutik](/img/logo_loutik.png)

---
## Informations générales

* **Mainteneur :** Louis MEDO
* **Dernière validation technique :** 18/02/2026

---
## Contexte

À l'issue de cette procédure, un environnement GitOps professionnel sera opérationnel sur le cluster. L'outil FluxCD sera installé dans sa dernière version et synchronisé avec une architecture multi-dépôts (Applicatif, Infrastructure, et FluxCD) respectant le principe de séparation des responsabilités.

---
## Prérequis

- [ ] Avoir un cluster Kubernetes opérationnel.
- [ ] Avoir un accès au cluster Kubernetes depuis le poste d'administration [Procédure de configuration du poste administrateur](https://docs.loutik.fr/docs/homelab/infra-core/orchestrateur/PROC_Configuration-k3s-poste-administrateur).
- [ ] Disposer d'un compte sur une plateforme Git (GitHub, GitLab, etc.).
- [ ] Avoir généré un jeton d'accès personnel (Personal Access Token - PAT) avec les droits de création et modification de dépôts.

---
## Sommaire

- A. Préparation de l'architecture des dépôts Git
- B. Installation de l'utilitaire en ligne de commande (CLI)
- C. Amorçage (Bootstrap) de FluxCD sur le cluster
- E. Annexes

---
## A. Préparation de l'architecture des dépôts Git

> Sur l'infrastructure LoutikCLOUD les dépôts sont créés et possèdent déjà les configurations des services ainsi que la configuration de FluxCD.

1. **Création du dépôt des Manifestes d'Infrastructure.** Ce dépôt centralise les fichiers YAML qui décrivent les ressources communes du cluster et les applications.

* *À créer via l'interface web.*

**Template de dépôt (`loutik-cloud_k3s-manifests`) :**

> [Dépôt git - loutik-cloud_k3s-manifests](https://github.com/FireToak/loutik-cloud_k3s-manifests)

```text
.
loutik-cloud_k3s-manifests/
├── apps/
│   ├── homepage-utilisateur/
│   │   ├── deployment.yaml
│   │   ├── ingress.yaml
│   │   ├── namespace.yaml
│   │   └── kustomization.yaml
│   └── discord-bot-plc/
│       ├── deployment.yaml
│       └── namespace.yaml
└── infrastructure/
    └── traefik/
        ├── traefik-config.yaml
        └── kustomization.yaml
```

* **`apps/`** : Ce répertoire regroupe toutes les applications métiers. La séparation par sous-dossiers garantit l'isolation de chaque service.
* **`apps/homepage-utilisateur/`** et **`apps/discord-bot-plc/`** : Dossiers dédiés contenant exclusivement les ressources Kubernetes propres à chaque application.
* **`kustomization.yaml`** : Fichier natif à Kubernetes assemblant et configurant dynamiquement les manifests du dossier avant leur déploiement.
* **`deployment.yaml`** : Fichier définissant la création des Pods de l'application. C'est ici que l'on déclare les conteneurs et leurs variables.
* **`ingress.yaml`** : Fichier de routage permettant de rendre l'application accessible depuis l'extérieur.
* **`namespace.yaml`** : Fichier créant l'espace de travail isolé dédié à l'application.
* **`infrastructure/`** : Dossier réservé aux configurations transverses (comme Traefik) nécessaires au réseau et à la sécurité du cluster, indépendamment des applications métiers.

2. **Création du dépôt FluxCD.** Ce dépôt est le chef d'orchestre. Il utilise le modèle "App of Apps" pour lier et déployer les différents dossiers de l'infrastructure.

* *À créer via l'interface web.*

**Template de dépôt (`loutik-cloud_k3s-flux-system`) :**

> [Dépôt git - loutik-cloud_k3s-flux-system](https://github.com/FireToak/loutik-cloud_k3s-flux-system)

```text
.
loutik-cloud_k3s-flux-system/
├── apps/
│   ├── k3s-manifests-source.yaml
│   ├── homepage-utilisateur-kustomization.yaml
│   └── site-vitrine-loutik-imageupdate.yaml
├── clusters/
│   └── production/
│       ├── apps-sync.yaml
│       ├── infrastructure-sync.yaml
│       └── flux-system/
└── infrastructure/
    └── traefik-kustomization.yaml
```

* **`clusters/production/`** : Dossier racine représentant le cluster cible, surveillé nativement par FluxCD.
* **`clusters/production/flux-system/`** : Dossier généré et maintenu automatiquement par FluxCD contenant ses propres composants internes.
* **`clusters/production/apps-sync.yaml`** et **`infrastructure-sync.yaml`** : Fichiers principaux (App of Apps) ordonnant à FluxCD de surveiller en permanence les dossiers `apps/` et `infrastructure/` situés à la racine.
* **`apps/`** et **`infrastructure/`** : Dossiers centralisant les déclarations de déploiement et d'automatisation de FluxCD.
* **`apps/k3s-manifests-source.yaml`** : Fichier `GitRepository` indiquant à FluxCD l'URL du dépôt distant `loutik-cloud_k3s-manifests`.
* **`apps/*-kustomization.yaml`** : Fichiers `Kustomization` liant la source précédente aux dossiers spécifiques des applications métiers ou systèmes à déployer.
* **`apps/*-imageupdate.yaml`** : Fichiers liés à l'automatisation de la mise à jour des images Docker pour les applications concernées.

---
## B. Installation de l'utilitaire en ligne de commande (CLI)

> Vous devez être capable de communiquer avec l'api du cluster Kubernetes pour pouvoir utiliser FluxCD.

1. **Téléchargement et installation de Flux CLI.** Cette action télécharge le script officiel de FluxCD pour installer la dernière version de l'outil client sur le poste de travail administrateur.

```bash
curl -s https://fluxcd.io/install.sh | sudo bash
```

* `curl` : Commande permettant de transférer des données depuis un serveur.
* `-s` (silent) : Option pour masquer la barre de progression lors du téléchargement.
* `https://fluxcd.io/install.sh` : L'URL pointant vers le script d'installation officiel qui détecte automatiquement la dernière version.
* `|` (pipe) : Redirige le résultat de la commande de gauche vers la commande de droite.
* `sudo` : Exécute la commande avec les privilèges d'administrateur (requis pour installer le binaire dans le système).
* `bash` : L'interpréteur de commandes qui va lire et exécuter le script téléchargé.

2. **Vérification de l'installation et de la compatibilité.** Il est impératif de valider que la version installée est correcte et que le cluster Kubernetes est prêt à recevoir FluxCD.

```bash
flux check --pre
```

* `flux` : L'outil en ligne de commande que nous venons d'installer.
* `check` : Fonctionnalité permettant de lancer des diagnostics.
* `--pre` : Option effectuant les vérifications *préalables* (pre-flight checks) avant l'installation finale sur le cluster.

---
## C. Amorçage (Bootstrap) de FluxCD sur le cluster

1. **Configuration de la variable d'environnement pour l'authentification.** Avant de lancer l'installation, le poste administrateur doit être autorisé à interagir avec l'API Git.

* *Procédure GitHub : Se rendre dans "Settings > Developer settings > Personal access tokens (Tokens classic)". Générer un jeton en cochant impérativement la portée (scope) `repo` (Full control of private repositories).*

```bash
export GITHUB_TOKEN="votre_jeton_d_acces_personnel_ici"
```

* `export` : Commande Linux définissant une variable d'environnement accessible par les processus enfants.
* `GITHUB_TOKEN` : Le nom standardisé de la variable attendue par FluxCD pour s'authentifier auprès de GitHub.

2. **Lancement de l'amorçage sur le cluster.** Cette commande installe les composants internes de FluxCD directement dans le cluster Kubernetes et les synchronise avec le dépôt FluxCD.

```bash
flux bootstrap github \
 --owner=FireToak \
 --repository=loutik-cloud_k3s-flux-system \
 --branch=main \
 --path=./clusters/production \
 --personal \
 --components-extra=image-reflector-controller,image-automation-controller
```

* `flux bootstrap github` : Ordonne l'installation et la synchronisation initiale via le fournisseur GitHub.
* `--owner=FireToak` : Spécifie le propriétaire du dépôt Git cible.
* `--repository=loutik-cloud_k3s-flux-system` : Le nom du dépôt Git qui servira de point de départ (source de vérité).
* `--branch=main` : Indique la branche Git à surveiller par défaut.
* `--path=./clusters/production` : Le chemin du dossier spécifique où FluxCD va écrire sa propre configuration.
* `--personal` : Indique que le dépôt appartient à un compte utilisateur personnel.
* **`--components-extra`** : Paramètre demandant à Flux d'installer des contrôleurs additionnels non inclus dans son cœur de base.
* **`image-reflector-controller`** : Composant qui ajoute la ressource `ImagePolicy`. Il scanne les registres d'images (ex: Docker Hub, GHCR) pour surveiller l'apparition de nouvelles versions de tes applications.
* **`image-automation-controller`** : Composant qui met à jour automatiquement le code de ton dépôt GitHub lorsqu'une nouvelle image est détectée par le contrôleur précédent.

3. **Créer un secret Kubernetes pour le PAT.** Pour le déploiement automatisé de nouvelles versions d'applications conteneurisées, nous devons donner les droits à Flux d'effectuer un commit sur le dépôt contenant les manifests.

```bash
kubectl create secret generic github-token-secret \
  --namespace=flux-system \
  --from-literal=username=FireToak \
  --from-literal=password=<TOKEN_PAT>
```

* **`Secret` :** Objet Kubernetes sécurisé (encodé en base64) permettant de stocker des données sensibles séparément du code source.
* **`kubectl create secret generic` :** Demande à l'API Kubernetes de créer un secret standard de type clé/valeur.
* **`--from-literal` :** Option qui injecte directement la paire `clé=valeur` dans le secret sans avoir à créer un fichier intermédiaire.

4. **Ajouter le secret dans le manifest de source `k3s-manifests-source.yaml` .**

```yaml
apiVersion: source.toolkit.fluxcd.io/v1
kind: GitRepository
metadata:
  name: k3s-manifests
  namespace: flux-system
spec:
  interval: 5m0s
  ref:
    branch: main
  url: https://github.com/FireToak/loutik-cloud_k3s-manifests
  secretRef: # <-- Ajout
    name: github-token-secret # <-- Ajout
```

* **`secretRef` :** Directive de configuration propre aux Custom Resources (CRD) comme Flux. Elle établit une relation de confiance entre le composant `GitRepository` et le `Secret` Kubernetes. C'est grâce à cela que Flux obtient les droits d'écriture (commit/push) pour son automatisation.

---
## E. Annexes

* [Déploiement déclaratif d'applications (Kustomize)](https://docs.loutik.fr/docs/homelab/infra-core/orchestrateur/fluxcd/PROC_Deploiement-d%C3%A9claratif-application-fluxcd)
* [Configuration de l'Image Update Automation (FluxCD)](https://docs.loutik.fr/docs/homelab/infra-core/orchestrateur/fluxcd/PROC_Configuration-image-update-automatisation-flux)
* [Administration au quotidien et débogage (FluxCD)](https://docs.loutik.fr/docs/homelab/infra-core/orchestrateur/fluxcd/PROC_Administration-quotidien-debogage-fluxcd)

---
## Ressources

* [Documentation officielle de FluxCD](https://fluxcd.io/docs/)
* [Concepts de l'architecture GitOps](https://opengitops.dev/)
* [Architecture multi-dépôts (Multi-tenancy) avec Flux](https://fluxcd.io/flux/guides/repository-structure/)