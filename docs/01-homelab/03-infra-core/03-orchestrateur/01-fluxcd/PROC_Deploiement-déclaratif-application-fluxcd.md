---
sidebar_position: 3
title: Déploiement déclaratif d'applications (Kustomize)
description: Comment déployer une application avec kustomize avec FluxCD

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

Le déploiement déclaratif via Kustomize permet d'assembler et de configurer des manifestes Kubernetes standards sans les altérer. En l'associant à FluxCD, nous créons un pipeline GitOps. L'objectif est de déclarer l'état souhaité d'une nouvelle application dans le dépôt de manifestes, puis de créer un objet de synchronisation dans le dépôt système. À l'issue de cette procédure, la nouvelle application sera déployée et maintenue de manière 100 % autonome par le cluster.

---
## Prérequis

- [ ] Un cluster Kubernetes opérationnel avec FluxCD installé.
- [ ] L'utilitaire en ligne de commande `flux` installé sur le poste de travail.
- [ ] Les deux dépôts d'infrastructure clonés localement ([loutik-cloud_k3s-manifests](https://github.com/FireToak/loutik-cloud_k3s-manifests) et [loutik-cloud_k3s-flux-system](https://github.com/FireToak/loutik-cloud_k3s-flux-system)).

---
## Sommaire

1. Création et assemblage des manifestes (Dépôt applicatif)
2. Déclaration du synchroniseur GitOps (Dépôt système)
3. Gestion des secrets des services

---
## 1. Création et assemblage des manifestes (Dépôt applicatif)

1. **Création de l'index Kustomize.** Placer les fichiers standards de l'application (ex: `deployment.yaml`, `namespace.yaml`) dans un nouveau dossier sous `apps/nom-app/` du dépôt `loutik-cloud_k3s-manifests`, puis générer le fichier d'assemblage Kustomize.
```bash
cat <<EOF > apps/nom-app/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - namespace.yaml
  - deployment.yaml
  - ingress.yaml
EOF
```

* **Notion (Kustomization) :** Kustomize est un moteur de templating natif à Kubernetes. Ce fichier agit comme le point d'entrée (l'index) du dossier.
* **`cat <<EOF >` (Here Document) :** Commande native sous Linux qui redirige un bloc de texte multilignes directement dans le fichier cible sans nécessiter l'ouverture d'un éditeur de texte interactif.
* **`resources:` :** Liste ordonnée des manifestes Kubernetes qui doivent être traités et fusionnés par le moteur Kustomize avant leur déploiement sur le cluster.

---
## 2. Déclaration du synchroniseur GitOps (Dépôt système)

1. **Génération de l'objet Kustomization Flux.** Créer la ressource de contrôle FluxCD dans le dépôt `loutik-cloud_k3s-flux-system` (sous le dossier `apps/`) pour indiquer au cluster l'emplacement précis du nouveau code à déployer.

```bash
flux create kustomization nom-app \
  --source=GitRepository/k3s-manifests \
  --path="./apps/nom-app" \
  --prune=true \
  --interval=10m \
  --export > apps/nom-app-kustomization.yaml
```

* **`create kustomization` :** Demande à Flux de générer une Custom Resource `Kustomization` (composant Flux à ne pas confondre avec le composant natif de l'étape 1). C'est l'agent chargé d'appliquer le code.
* **`--source=GitRepository/k3s-manifests` :** Indique au contrôleur de récupérer le code source depuis l'objet représentant notre dépôt de manifestes Kubernetes.
* **`--path="./apps/nom-app"` :** Restreint l'espace de travail du contrôleur à ce dossier précis pour des raisons d'isolation.
* **`--prune=true` :** Notion de Garbage Collection (Règle d'or GitOps). Si un fichier YAML est supprimé du dépôt Git, la ressource correspondante sera automatiquement détruite sur le cluster.
* **`--interval=10m` :** Définit la boucle de réconciliation. FluxCD vérifiera l'état du dossier cible toutes les 10 minutes.
* **`--export >` :** Intercepte la commande pour ne pas l'exécuter directement sur le cluster, mais pour imprimer le résultat YAML propre dans un fichier prêt à être versionné.

*Action finale : Exécuter `git add`, `git commit` et `git push` sur les deux dépôts. Le scan automatique configuré sur le cluster détectera les changements et déploiera l'application.*

---
## 3. Gestion des secrets des services

1. **Injection manuelle des secrets.** Pour des raisons de sécurité, les mots de passe et tokens ne doivent jamais être versionnés en clair sur les dépôts Git. Récupérez les identifiants depuis le coffre-fort Bitwarden de LoutikCLOUD et créez le secret Kubernetes directement en ligne de commande, impérativement avant le déploiement de l'application.

```bash
kubectl create secret generic nom-du-secret \
  --namespace=nom-de-l-application \
  --from-literal=CLE_VARIABLE_1="valeur_bitwarden_1" \
  --from-literal=CLE_VARIABLE_2="valeur_bitwarden_2"
````

- **`generic` :** Crée un objet Kubernetes `Secret` standard de type Opaque (des paires de clés et de valeurs).
- **`--namespace` :** Isole le secret dans l'espace de travail dédié à l'application. Le composant Flux ou Kustomize liera dynamiquement ce secret aux Pods au moment du déploiement.
- **`--from-literal` :** Injecte la donnée de manière sécurisée directement via l'API du cluster. Cela évite de devoir écrire un fichier physique contenant des mots de passe en clair sur le disque du poste administrateur.
- **`\` (Anti-slash) :** Caractère d'échappement natif au shell permettant de poursuivre une commande longue sur la ligne suivante pour améliorer la lisibilité.

---
## Ressources

* [Kustomize - Documentation officielle (Kubernetes)](https://kubectl.docs.kubernetes.io/references/kustomize/)
* [FluxCD - Kustomize Controller](https://fluxcd.io/flux/components/kustomize/kustomization/)