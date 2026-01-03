# 📚 LoutikDOCS - Documentation Technique & Homelab

Ce dépôt héberge le code source de la documentation technique du projet **LoutikCLOUD**.
Il s'agit d'un site de documentation moderne et performant, construit avec **Docusaurus**, conteneurisé avec Docker et servi par un serveur Nginx optimisé.

## 📋 À propos

Ce projet centralise l'ensemble de ma documentation technique, couvrant :
- **Mon Homelab** : Procédures d'installation et configuration (Proxmox, K3s, services déployés)
- **Mes fiches de révisions** : Notions théoriques (Modèle OSI, TCP/IP, reverse proxy)
- **Ma boîte à outils** : Cheat sheets et aide-mémoire (Git, Kubernetes, Linux)

Construit avec **Docusaurus 3.9**, ce site applique les principes **Documentation as Code** : versionnement Git, génération automatique et déploiement continu.

## 🏗️ Architecture du projet

L'architecture suit les conventions Docusaurus avec une séparation claire entre contenu, configuration et build.

```text
├── .github/                      # Pipelines CI/CD (GitHub Actions)
│   └── workflows/
│       └── docker-publish.yml    # Build et push automatique vers GHCR
├── blog/                         # Articles de blog (veille techno, retours d'expérience)
│   ├── authors.yml               # Profil auteur
│   ├── tags.yml                  # Taxonomie des tags
│   └── 2026/                     # Articles par année
├── docs/                         # Documentation principale
│   ├── 01-homelab/               # Procédures infrastructure (Proxmox, K3s, services)
│   ├── 02-notions/               # Fiches théoriques (OSI, TCP/IP, DevOps)
│   ├── 03-outils/                # Cheat sheets (Git, kubectl, Markdown)
│   ├── intro.md                  # Page d'accueil de la doc
│   └── mentions-legales.md       # Mentions légales
├── src/                          # Composants React personnalisés
│   ├── components/               # Composants réutilisables (HomepageFeatures)
│   ├── css/                      # Styles globaux (custom.css)
│   └── pages/                    # Pages hors documentation (index.js, markdown-page.md)
├── static/                       # Assets statiques (images, favicon, manifeste)
│   └── img/
├── .docusaurus/                  # Fichiers générés (ne pas éditer manuellement)
├── build/                        # Site compilé (généré par `npm run build`)
├── docusaurus.config.js          # Configuration Docusaurus (thème, plugins, navbar)
├── sidebars.js                   # Structure de navigation de la documentation
├── nginx.conf                    # Configuration Nginx pour le conteneur
├── Dockerfile                    # Instructions de build de l'image Docker
├── package.json                  # Dépendances Node.js et scripts npm
└── README.md                     # Documentation du projet
```

## 🚀 Installation et Démarrage

### Prérequis

* **Node.js 20.x ou supérieur** (spécifié dans package.json)
* **npm** ou **yarn** pour la gestion des dépendances
* **Docker** (optionnel, pour tester en environnement de production)

### Lancer le projet en développement local

1. **Cloner le dépôt :**
```bash
git clone https://github.com/FireToak/docusaurus-docs.git
cd docusaurus-docs
```

2. **Installer les dépendances :**
```bash
npm ci
```

3. **Démarrer le serveur de développement :**
```bash
npm start
```

4. **Accéder au site :**
Le site s'ouvre automatiquement sur `http://localhost:3000` avec rechargement à chaud (hot-reload).

### Compiler le site en production

Pour générer le site statique final :

```bash
npm run build
```

Les fichiers compilés sont placés dans le dossier build et peuvent être servis par n'importe quel serveur web statique.

### Lancer le site avec Docker (environnement de production)

Pour tester le site avec la configuration Nginx en conditions réelles :

1. **Construire l'image Docker :**
```bash
docker build -t loutikdocs .
```

2. **Lancer le conteneur :**
```bash
docker run -d -p 80:80 --name loutikdocs-web loutikdocs
```

3. **Accéder au site :**
Ouvrez votre navigateur sur `http://localhost:80`.

## ⚙️ Configuration Nginx

Le fichier nginx.conf inclut des optimisations pour l'expérience utilisateur et le SEO :

* **Clean URLs :** Suppression des extensions `.html` dans l'URL (ex: `/docs/intro` affiche le contenu de `intro.html`).
* **Sécurité :** Masquage de la version de Nginx (`server_tokens off`).
* **Gestion d'erreurs :** Redirection personnalisée vers `/404.html`.
* **Favicon :** Redirection transparente de `/favicon.ico` vers `/img/favicon.ico`.
* **Normalisation :** Suppression automatique des trailing slashes et redirection de `/index` vers la racine `/`.

## 🔄 CI/CD (Intégration Continue)

Le déploiement est entièrement automatisé via **GitHub Actions** (docker-publish.yml) :

1. **Déclenchement :** À chaque `push` sur la branche `main`
2. **Build Docusaurus :** Compilation du site statique avec `npm run build`
3. **Conteneurisation :** Construction d'une image Docker incluant Nginx et les fichiers statiques
4. **Publication :** Push automatique sur le **GitHub Container Registry (GHCR)** avec les tags :
   * `latest` (dernière version)
   * `sha-<commit>` (identifiant du commit)

**Registry des images :** [`ghcr.io/firetoak/docusaurus-docs`](https://github.com/FireToak/docusaurus-docs/pkgs/container/docusaurus-docs)

## 🎨 Personnalisation

### Configuration du site

Le fichier docusaurus.config.js centralise la configuration :

* **Métadonnées** : Titre, tagline, URL, favicon
* **Thème** : Couleurs, logo, navbar, footer
* **Plugins** : Blog, recherche locale ([@easyops-cn/docusaurus-search-local](https://github.com/easyops-cn/docusaurus-search-local))
* **Prism** : Coloration syntaxique du code

### Structure de la documentation

Le fichier sidebars.js définit la navigation latérale de la documentation. Actuellement configuré en mode **autogenerated** (génération automatique depuis la structure des dossiers docs).

### Styles personnalisés

Les styles globaux sont définis dans custom.css :

* Variables CSS pour les couleurs primaires (mode clair et sombre)
* Styles des titres (h1, h2, h3)
* Icônes personnalisées dans la navbar (GitHub, LinkedIn, Discord)

## 🛠️ Technologies utilisées

* **Framework :** [Docusaurus 3.9.2](https://docusaurus.io/)
* **Conteneurisation :** Docker (image basée sur `nginx:alpine`)
* **CI/CD :** GitHub Actions
* **Recherche locale :** [@easyops-cn/docusaurus-search-local](https://github.com/easyops-cn/docusaurus-search-local)
* **Reverse Proxy :** Nginx (configuration dans nginx.conf)
* **Hébergement :** Kubernetes (K3s) sur infrastructure LoutikCLOUD

## 👤 Auteur

**Louis MEDO** - *Étudiant BTS SIO, passionné par l'administration système et le DevOps* ❤️

* **LinkedIn :** [louismedo](https://linkedin.com/in/louismedo)
* **GitHub :** [firetoak](https://github.com/firetoak)
* **Portfolio :** [louis.loutik.fr](https://louis.loutik.fr)
* **Email :** louis@loutik.fr