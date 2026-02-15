---
sidebar_position: 1
title: Installation Prometheus & Grafana
description: Procédure pour l'installation de la stack de supervision (Prometheus/Grafana) via Docker Compose.

# -------------------------------------------------------------------------
# 🎯 MODÈLE : ACTION (VIVANT)
# -------------------------------------------------------------------------
# Utilisez ce modèle pour les fichiers "Vivants" (sans date dans le nom) :
# - [PROC] : Procédure / Runbook (Pas à pas)
# -------------------------------------------------------------------------
---

![Logo Loutik](/img/logo_loutik.png)

---

:::info Métadonnées
* **Mainteneur(s) :** MEDO Louis
* **Dernière validation technique :** 2026-01-07
:::

---
## Contexte
Déployer la stack technique (Prometheus + Grafana) permettant la supervision de l'infrastructure via Docker Compose, avec authentification centralisée (SSO).

---
## 📋 Prérequis

Avant de commencer, s'assurer de :
* [ ] Avoir les accès SSH `root` ou `sudo` sur la machine cible (ex: `mgt-prod-01`).
* [ ] Avoir **Docker** et **Docker Compose** installés.
* [ ] Avoir **Git** installé.
* [ ] Avoir créé l'application "Grafana" dans Authentik pour récupérer le `Client ID` et le `Client Secret`.

---
## A. Préparation de l'environnement

### 1. **Création de l'arborescence**
Nous allons isoler la stack dans un dossier dédié.

> Sur l'infrastructure Loutik, les templates Ansible (Docker) créer automatiquement un dossier `docker`(contient les fichiers de configuration) et `docker-compose`(contient les scripts) dans le `/home` permettant de stocker tous les fichiers de configuration et les scripts.

```bash
# Création du dossier et déplacement dedans
mkdir -p /home/docker/supervision
cd /home/docker/supervision
```

### 2. **Récupération des sources**
Téléchargement du dépôt contenant le code d'infrastructure ("Infrastructure as Code").

```bash
# Le point '.' clone le contenu directement dans le dossier actuel sans créer de sous-dossier
git clone [https://github.com/FireToak/docker-deployment-stack-grafana-prometheus.git](https://github.com/FireToak/docker-deployment-stack-grafana-prometheus.git) .
```

:::tip Pourquoi le point ?
Utiliser `git clone <url> .` permet d'éviter d'avoir un chemin du type `/home/docker/supervision/docker-deployment-stack...`. Les fichiers `docker-compose.yaml` se retrouvent directement à la racine de votre dossier de travail.
:::

### 3. **Vérification**
S'assurer que les fichiers sont présents.

```bash
ls -l
# Doit afficher : docker-compose.yaml, env.example, .gitignore
```

---
## B. Configuration

### 1. **Configuration des secrets (SSO)**
Docker Compose a besoin des identifiants Authentik **avant** de démarrer. Nous utilisons un fichier `.env`.

```bash
# Duplication du template de configuration
cp env.example .env

# Édition du fichier
vi .env
```
Remplir les variables `SSO_ID` et `SSO_SECRET` avec les valeurs fournies par Authentik.

### 2. **Configuration de Prometheus**
Le fichier de configuration de Prometheus est monté depuis l'hôte (Bind Mount). Il doit être créé avant le lancement.

```bash
# Création du dossier de conf s'il n'existe pas (chemin défini dans le docker-compose)
mkdir -p /home/docker/prometheus/

# Création/Édition du fichier
nano /home/docker/prometheus/prometheus.yml
```

Insérer la configuration de base :

```yaml
global:
  scrape_interval: 15s # Fréquence de récupération des métriques

scrape_configs:
  # Job 1 : Auto-surveillance de Prometheus
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
```

:::warning Point d'attention
L'indentation (les espaces) est cruciale en YAML. Une mauvaise indentation empêchera Prometheus de démarrer.
:::

---
## C. Déploiement

### 1. **Lancement de la stack**
Exécuter la commande suivante pour télécharger les images et lancer les conteneurs en arrière-plan.

```bash
docker compose up -d
```

:::info Analyse technique
* `up` : Crée et démarre les conteneurs.
* `-d` (Detached) : Lance les conteneurs en tâche de fond (rend la main sur le terminal).
:::

### 2. **Vérification immédiate**
Vérifier que les conteneurs sont en statut `Up` (et non `Restarting`).

```bash
docker compose ps
```

---
## Validation Finale

### 1. **Accès Web**
* **Grafana :** Accéder à `https://supervision.loutik.fr`.
    * Le bouton de connexion SSO doit apparaître.
    * La connexion doit réussir via Authentik.
* **Prometheus :** Accéder à `http://<IP_SERVEUR>:9090`.

:::warning Configuration DNS & Reverse-proxy 
Pour que la résolution de supervision.loutik.fr le DNS et le reverse proxy doivent être configurés.
:::

### 2. **Vérification des logs (Optionnel)**
Si un service ne répond pas, vérifier les logs :

```bash
docker compose logs -f grafana
# ou
docker compose logs -f prometheus
```

---
## Mise à jour de la configuration (Exemple : Ajout d'un hôte)

Pour ajouter une cible (ex: un serveur Web) à surveiller :

1. Éditer le fichier sur l'hôte :
    ```bash
    nano /home/docker/prometheus/prometheus.yml
    ```
2. Ajouter le job :
    ```yaml
      - job_name: 'webserver'
        static_configs:
          - targets: ['192.168.1.205:9100']
    ```
3. Demander à Prometheus de recharger sa configuration (Hot Reload) sans redémarrer le conteneur :
    ```bash
    docker exec -it prometheus kill -HUP 1
    ```

---
## Rollback (Retour arrière)

En cas de problème critique nécessitant un nettoyage complet :

1. Arrêter et supprimer les conteneurs et le réseau :
    ```bash
    docker compose down
    ```
2. Pour supprimer également les volumes de données (⚠️ **Perte définitive des historiques**) :
    ```bash
    docker compose down -v
    ```

---
## Références
* [Documentation Prometheus](https://prometheus.io/docs/introduction/overview/)
* [Documentation Grafana OAuth](https://grafana.com/docs/grafana/latest/auth/generic-oauth/)
* [Documentation Authentik Integration](https://goauthentik.io/integrations/services/grafana/)