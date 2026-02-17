# LoutikDOCS

> Documentation technique centralisée du projet **LoutikCLOUD** — construite avec Docusaurus, conteneurisée avec Docker et déployée sur Kubernetes.

[![Build & Publish](https://github.com/FireToak/site-docs-loutik/actions/workflows/docker-publish.yml/badge.svg)](https://github.com/FireToak/site-docs-loutik/actions/workflows/docker-publish.yml)
[![Docker Image](https://img.shields.io/badge/registry-ghcr.io-blue?logo=github)](https://github.com/FireToak/site-docs-loutik/pkgs/container/site-docs-loutik)
[![Docusaurus](https://img.shields.io/badge/Docusaurus-3.9-green?logo=docusaurus)](https://docusaurus.io/)

---

## Aperçu

LoutikDOCS est un site de documentation moderne et performant qui centralise l'ensemble de la documentation technique du projet LoutikCLOUD. Il applique les principes **Documentation as Code** : versionnement Git, génération automatique et déploiement continu via FluxCD.

**Contenu couvert :**
- **Homelab** — Procédures d'installation et de configuration (Proxmox, K3s, services déployés)
- **Fiches de révision** — Notions théoriques (modèle OSI, TCP/IP, reverse proxy)
- **Boîte à outils** — Cheat sheets et aide-mémoire (Git, Kubernetes, Linux)

---

## Stack technique

| Composant | Technologie |
|---|---|
| Framework documentation | [Docusaurus 3.9](https://docusaurus.io/) |
| Conteneurisation | Docker — image `nginx:alpine` |
| CI/CD | GitHub Actions + FluxCD |
| Registry | GitHub Container Registry (GHCR) |
| Hébergement | Kubernetes K3s — LoutikCLOUD |
| Recherche | [@easyops-cn/docusaurus-search-local](https://github.com/easyops-cn/docusaurus-search-local) |

---

## Structure du projet

```
├── .github/
│   └── workflows/
│       └── docker-publish.yml    # Pipeline CI/CD — build & push GHCR
├── blog/                         # Articles de blog (veille, retours d'expérience)
│   ├── authors.yml
│   ├── tags.yml
│   └── 2026/
├── docs/                         # Documentation principale
│   ├── 01-homelab/               # Infrastructure (Proxmox, K3s, services)
│   ├── 02-notions/               # Théorie (OSI, TCP/IP, DevOps)
│   ├── 03-outils/                # Cheat sheets (Git, kubectl, Markdown)
│   ├── intro.md
│   └── mentions-legales.md
├── src/
│   ├── components/               # Composants React réutilisables
│   ├── css/                      # Styles globaux (custom.css)
│   └── pages/                    # Pages hors documentation
├── static/
│   └── img/                      # Assets statiques
├── build/                        # Site compilé — généré par `npm run build`
├── docusaurus.config.js          # Configuration principale (thème, plugins, navbar)
├── sidebars.js                   # Navigation de la documentation
├── nginx.conf                    # Configuration Nginx du conteneur
├── Dockerfile                    # Build de l'image Docker
└── package.json                  # Dépendances Node.js et scripts npm
```

---

## Démarrage rapide

### Prérequis

- **Node.js** ≥ 20.x
- **npm**
- **Docker** *(optionnel, pour tester en conditions de production)*

### Développement local

```bash
# 1. Cloner le dépôt
git clone https://github.com/FireToak/site-docs-loutik.git
cd site-docs-loutik

# 2. Installer les dépendances
npm ci

# 3. Démarrer le serveur de développement (hot-reload sur http://localhost:3000)
npm start
```

### Build de production

```bash
npm run build
# Les fichiers compilés sont générés dans le dossier /build
```

### Lancer avec Docker

```bash
# Construire l'image
docker build -t loutikdocs .

# Lancer le conteneur
docker run -d -p 80:80 --name loutikdocs-web loutikdocs

# Accéder au site
open http://localhost:80
```

---

## CI/CD & Versionnement

### Pipeline GitHub Actions

Le workflow se déclenche à chaque **push de tag semver** (`v*.*.*`) et publie automatiquement l'image Docker sur GHCR avec les tags suivants :

| Tag Docker | Usage |
|---|---|
| `v1.2.3` | Version exacte — immuable |
| `v1.2` | Reçoit automatiquement les patchs |
| `v1` | Point d'entrée stable — suivi par FluxCD |
| `latest` | Dernier build |

### Publier une nouvelle version

```bash
# Travailler sur main normalement
git add .
git commit -m "feat: ma nouvelle fonctionnalité"
git push origin main

# Taguer et publier une version (déclenche le pipeline)
git tag v1.2.3
git push origin v1.2.3
```

**Convention semver :**

```
v MAJEUR . MINEUR . PATCH
    │         │       │
    │         │       └── Correction de bug
    │         └────────── Nouvelle fonctionnalité rétrocompatible
    └────────────────────  Breaking change (déploiement manuel requis)
```

### Image Docker

```
ghcr.io/firetoak/site-docs-loutik
```

---

## Configuration Nginx

Le fichier `nginx.conf` inclut les optimisations suivantes :

- **Clean URLs** — suppression des extensions `.html` (`/docs/intro` → `intro.html`)
- **Sécurité** — masquage de la version Nginx (`server_tokens off`)
- **Gestion d'erreurs** — redirection personnalisée vers `/404.html`
- **Normalisation** — suppression des trailing slashes, redirection de `/index` vers `/`
- **Favicon** — redirection transparente vers `/img/favicon.ico`

---

## Auteur

**Louis MEDO** — Étudiant BTS SIO, passionné par l'administration système et le DevOps

[![LinkedIn](https://img.shields.io/badge/LinkedIn-louismedo-0077B5?logo=linkedin)](https://linkedin.com/in/louismedo)
[![GitHub](https://img.shields.io/badge/GitHub-firetoak-181717?logo=github)](https://github.com/firetoak)
[![Portfolio](https://img.shields.io/badge/Portfolio-louis.loutik.fr-orange)](https://louis.loutik.fr)
[![Email](https://img.shields.io/badge/Email-louis@loutik.fr-red?logo=gmail)](mailto:louis@loutik.fr)