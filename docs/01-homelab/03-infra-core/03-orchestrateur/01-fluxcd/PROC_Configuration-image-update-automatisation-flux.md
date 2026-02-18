---
sidebar_position: 4
title: Configuration de l'Image Update Automation (FluxCD)
description: Comment mettre à jour automatiquement l'image docker contenue dans les manifests avec FluxCD.

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

La mise en place de l'Image Update Automation (IUA) permet d'automatiser le processus de Continuous Deployment (CD). FluxCD va scanner périodiquement le registre d'images Docker (ex: GHCR, Docker Hub). Lorsqu'une nouvelle version respectant nos règles (ex: un nouveau tag sémantique) est détectée, le contrôleur FluxCD va automatiquement éditer le fichier de déploiement, créer un commit et le pousser sur notre dépôt Git. L'infrastructure se mettra ensuite à jour de façon 100 % autonome selon l'état du dépôt.

---
## Prérequis

- [ ] Un cluster Kubernetes avec FluxCD fonctionnel.
- [ ] Les composants `image-reflector-controller` et `image-automation-controller` installés sur le cluster.
- [ ] Le dépôt contenant les manifests (`loutik-cloud_k3s-manifests`) configuré dans Flux avec un Secret (Token d'accès) disposant des droits d'écriture (commit/push).
- [ ] L'outil CLI `flux` installé sur le poste administrateur.

---
## Sommaire

1. Préparation du manifeste applicatif (Le marqueur)
2. Déclaration du registre cible (ImageRepository)
3. Définition de la stratégie de versionnement (ImagePolicy)
4. Configuration de l'automate de commit (ImageUpdateAutomation)
5. Gestion des secrets des services

---
## 1. Préparation du manifeste applicatif (Le marqueur)

1. **Ajout du commentaire d'automatisation.** Éditer le fichier de déploiement (ex: `deployment.yaml` dans `loutik-cloud_k3s-manifests/apps/discord-bot-plc`) pour indiquer à Flux où injecter le nouveau tag.

```yaml
    spec:
      containers:
      - name: discord-bot-plc
        image: ghcr.io/lycee-paul-louis-courier-bts-sio/discord-bot-plc:1.0.0 # {"$imagepolicy": "flux-system:discord-bot-plc"}

```

* **Notion (Le marqueur `$imagepolicy`) :** Ce commentaire JSON en fin de ligne est lu par l'automate. La syntaxe stricte `flux-system:<nom-de-la-policy>` établit le lien direct entre la ligne de code à modifier et la règle de mise à jour qui sera créée à l'étape 3.

---
## 2. Déclaration du registre cible (ImageRepository)

1. **Génération de l'objet ImageRepository.** Créer la ressource dans le dépôt système (`loutik-cloud_k3s-flux-system/apps/`).

> [Dépôt git - loutik-cloud_k3s-flux-system](https://github.com/FireToak/loutik-cloud_k3s-flux-system)

```bash
flux create image repository discord-bot-plc \
  --image=ghcr.io/lycee-paul-louis-courier-bts-sio/discord-bot-plc \
  --interval=1h \
  --export > apps/discord-bot-plc-imagerepo.yaml
```

* **`create image repository` :** Demande à Flux de surveiller un dépôt d'images conteneurisées.
* **`--image` :** L'URL exacte de l'image Docker, sans le tag de version.
* **`--interval=1h` :** La fréquence de balayage du registre (ici, toutes les heures).
* **`--export >` :** Redirige le résultat YAML dans un fichier à versionner sur Git au lieu de l'appliquer à chaud.

---
## 3. Définition de la stratégie de versionnement (ImagePolicy)

1. **Génération de l'objet ImagePolicy.** Créer la règle de filtrage dans le dépôt système (`loutik-cloud_k3s-flux-system/apps/`).

```bash
flux create image policy discord-bot-plc \
  --image-ref=discord-bot-plc \
  --select-semver=">=1.0.0" \
  --export > apps/discord-bot-plc-imagepolicy.yaml
```

* **`create image policy` :** Crée l'objet de décision qui sélectionnera la version finale. C'est ce nom précis qui est appelé dans le marqueur de l'étape 1.
* **`--image-ref` :** Lie cette règle à l'objet `ImageRepository` créé à l'étape 2.
* **`--select-semver` :** Notion de filtre (Semantic Versioning). Indique que l'on accepte uniquement les mises à jour supérieures ou égales à `1.0.0` (évite le déploiement accidentel de versions majeures non compatibles).

---
## 4. Configuration de l'automate de commit (ImageUpdateAutomation)

1. **Génération de l'objet ImageUpdateAutomation.** Lier les contrôleurs au dépôt Git de destination dans le dépôt système (`loutik-cloud_k3s-flux-system/apps/`).

```bash
flux create image update discord-bot-plc \
  --git-repo-ref=k3s-manifests \
  --git-repo-path="./apps/discord-bot-plc" \
  --checkout-branch=main \
  --push-branch=main \
  --author-name=fluxcdbot \
  --author-email=fluxcdbot@users.noreply.github.com \
  --commit-template="chore(deps): mise à jour de l'image discord-bot-plc vers {{range .Updated.Images}}{{println .}}{{end}}" \
  --export > apps/discord-bot-plc-imageupdate.yaml
```

* **`create image update` :** Crée l'automate chargé d'écrire le code.
* **`--git-repo-ref` :** Cible l'objet `GitRepository` (déclaré dans le cluster) représentant ton dépôt de manifests.
* **`--git-repo-path` :** Restreint le champ d'action de Flux à ce dossier spécifique pour des raisons de sécurité.
* **`--checkout-branch` et `--push-branch` :** Les branches Git sur lesquelles l'automate lit et écrit le commit.
* **`--author-*` :** Définit l'identité visible sur l'historique des commits GitHub.
* **`--commit-template` :** Notion de standardisation. Gère dynamiquement le message du commit en listant la nouvelle version poussée grâce au moteur de template Go.

---
## 5. Gestion des secrets des services

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

* [FluxCD - Guide de l'Image Update Automation](https://fluxcd.io/flux/guides/image-update/)
* [SemVer - Gestion de versions sémantiques](https://semver.org/lang/fr/)
* [Pratiques GitOps en entreprise](https://opengitops.dev/)