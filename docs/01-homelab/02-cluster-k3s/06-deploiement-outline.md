---
title: Déploiement du service de prise de note (Outline) sur K3s
description: Procédure de déploiement du service de prise de note (Outline) dans le cluster k3s.
---

# Procédure - Déploiement du service de prise de note (Outline)

**Phase 3 – Cluster Kubernetes**

![Logo Loutik](https://raw.github.com/firetoak/firetoak/master/00-logo-loutik.png)

:::warning
Certains éléments de cette procédure ont été offusqués pour des raisons de sécurité.
:::

---
## Informations générales

* **Date de création :** 28/12/2025
* **Dernière modification :** 03/01/2025
* **Auteur :** MEDO Louis
* **Version :** 1

---
## Objectif

Déployer et configurer **Outline** ainsi que ses dépendances (**PostgreSQL, Redis, MinIO, SSO Authentik**) sur un cluster Kubernetes.
Cette procédure couvre également la **configuration réseau** nécessaire à l’exposition du service via le **LoadBalancer Traefik** du cluster Kubernetes.

---
## Prérequis

* Cluster **K3s** fonctionnel (Master + Workers).
* Service d’identité **Authentik** opérationnel.
* Accès au **reverse proxy / ingress controller** (Traefik).

---
## Sommaire

- A. Configuration SSO sur Authentik
- B. Préparation de l’environnement Kubernetes
- C. Configuration du reverse proxy
- D. Configuration du WAF CrowdSec
- E. Vérification du bon fonctionnement d’Outline

---
## A. Configuration SSO sur Authentik

> Procédure basée sur la documentation officielle d’Authentik pour Outline :
> [https://integrations.goauthentik.io/documentation/outline/](https://integrations.goauthentik.io/documentation/outline/)

1. **Connexion à Authentik.**
   Se connecter à l’interface Authentik avec un compte disposant des droits administrateur :
   [https://sso.domaine.fr](https://sso.domaine.fr)

2. **Création de l’application.**
   Aller dans la section `Applications`, puis `Applications`, et cliquer sur `Create with Provider`.

3. **Configuration de l’application.**
   Renseigner les informations suivantes puis cliquer sur `Next` :

   * **Name** : `Outline`
   * **Slug** : `outline` (remplissage automatique)
   * **Group** : non renseigné
   * **Policy engine mode** : `ANY`

   *Dans `UI Settings` :*

   * **Launch URL** : `https://note.domaine.fr`
   * **Open in new tab** : activé

4. **Choix du type de provider.**
   Sélectionner `OAuth2/OpenID Provider`.

5. **Configuration du provider.**
   Renseigner les informations suivantes puis cliquer sur `Next` :

   * **Provider Name** : `Provider for outline`
   * **Authorization flow** : `default-provider-authorization-implicit-consent (Authorize Application)`
   * **Client type** : `Confidential`
   * **Redirect URIs/Origins** : `https://sso.domaine.fr/auth/oidc.callback`

   *Dans `Advanced protocol settings` :*

   * **Subject mode** : `Based on the User's username`

   > Copier les valeurs **Client ID** et **Client Secret** dans un emplacement sécurisé, elles seront nécessaires lors de la configuration d’Outline.

6. **Ignorer la configuration des bindings.**
   Les bindings ne sont pas utilisés dans l’infrastructure actuelle.

7. **Application de la configuration.**
   Vérifier l’ensemble des paramètres puis cliquer sur `Submit`.

> Recommandation :
> Il est possible de définir `Access code validity` à `hours=24` afin d’éviter que l’utilisateur ne doive se reconnecter fréquemment à Authentik.

---

## B. Préparation de l’environnement Kubernetes

> Les manifestes Kubernetes sont disponibles dans le dépôt GitHub :
> [https://github.com/FireToak/k3s-deployment-outline](https://github.com/FireToak/k3s-deployment-outline)

1. **Connexion à l’instance Kubernetes de production.**
   Se connecter via Terminus ou à l’aide du client OpenSSH.

    ```bash
    ssh k3s-m-prod-01
    ```

2. **Création de l’espace pour les manifestes.**
   Créer le répertoire destiné à contenir les fichiers de configuration nécessaires au déploiement d’Outline.

    ```bash
    mkdir -p ~/kubernetes/outline && cd ~/kubernetes/outline
    ```

3. **Import des manifestes.**
   Cloner le dépôt GitHub contenant les manifestes Kubernetes.

    ```bash
    git clone https://github.com/FireToak/k3s-deployment-outline.git .
    ```

> Vous devez impérativement être positionné dans `~/kubernetes/outline`.

4. **Création des identifiants.**
   Depuis Bitwarden, dans l’espace `Loutik`, générer des mots de passe de **64 caractères**, composés de lettres minuscules, majuscules et de chiffres.

5. **Ajout des identifiants dans les variables d’environnement.**
   Ouvrir le fichier `outline-secret.yaml` et remplacer :

   * les valeurs `*-bitwarden` par celles stockées dans Bitwarden,
   * `Past_your_client_id` par le **Client ID** fourni par Authentik,
   * `Past_your_client_secret` par le **Client Secret** fourni par Authentik.

> Recommandation :
> Utiliser des secrets d’une longueur minimale de **64 caractères**, incluant majuscules, minuscules et chiffres.

6. **Application des configurations Kubernetes.**

    ```bash
    sudo kubectl apply -f ./outline -n outline
    ```

> `-f ./outline` indique le chemin des manifestes.
> `-n outline` précise le namespace utilisé pour le déploiement.

7. **Vérification du bon fonctionnement.**
   Vérifier que l’ensemble des pods sont correctement démarrés.
   Des erreurs temporaires peuvent apparaître au démarrage, notamment le temps que la base de données soit prête.

    ```bash
    sudo kubectl get pods -n outline
    ```

---

## C. Configuration du reverse proxy

1. **Connexion au reverse proxy.**
   Se connecter au reverse proxy `gateway01-infomaniak`.

    ```bash
    ssh gateway01-infomaniak
    ```

2. **Création des fichiers de configuration.**
   Dans le répertoire `/etc/nginx/sites-available`, créer deux fichiers de configuration nommés `note.loutik.fr.conf` et `minio.loutik.fr.conf`.

    ```bash
    vi /etc/nginx/sites-available/note.loutik.fr.conf
    ```

**note.loutik.fr.conf :**

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name note.domaine.fr;

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name note.domaine.fr;

    http2 on;

    ssl_certificate /etc/letsencrypt/live/loutik.fr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/loutik.fr/privkey.pem;

    include /etc/nginx/snippets/error_pages.conf;

    location / {
        proxy_pass http://172.168.10.215; # IP du control-plane Kubernetes
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 86400;
    }
}
```

**minio.loutik.fr.conf :**

    ```nginx
    server {
        listen 80;
        listen [::]:80;
        server_name minio.domaine.fr;

        location / {
            return 301 https://$host$request_uri;
        }
    }

    server {
        listen 443 ssl;
        server_name minio.domaine.fr;

        http2 on;

        ssl_certificate /etc/letsencrypt/live/loutik.fr/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/loutik.fr/privkey.pem;

        include /etc/nginx/snippets/error_pages.conf;

        location / {
            proxy_pass http://172.168.10.215;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
    ```

3. **Création des liens symboliques.**
   Activer les configurations en créant des liens symboliques dans `sites-enabled`.

    ```bash
    sudo ln -s /etc/nginx/sites-available/note.domaine.fr.conf /etc/nginx/sites-enabled/
    sudo ln -s /etc/nginx/sites-available/minio.domaine.fr.conf /etc/nginx/sites-enabled/
    ```

4. **Vérification de la syntaxe.**
   Vérifier l’absence d’erreurs de syntaxe avant rechargement.

    ```bash
    sudo nginx -t
    ```

**Retour attendu :**

    ```text
    nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
    nginx: configuration file /etc/nginx/nginx.conf test is successful
    ```

5. **Application de la configuration.**
   Recharger la configuration NGINX.

    ```bash
    sudo systemctl reload nginx
    ```

---

## D. Configuration du WAF CrowdSec

> Cette configuration permet d’éviter les faux positifs lors des authentifications Outline via Authentik, susceptibles d’entraîner un bannissement injustifié de l’adresse IP.

1. **Création de la whitelist.**
   Créer un fichier `outline-whitelist.yaml` dans `/etc/crowdsec/parsers/s02-enrich/`.

    ```bash
    sudoedit /etc/crowdsec/parsers/s02-enrich/outline-whitelist.yaml
    ```

    **Contenu à insérer :**

    ```yaml
    name: custom/outline-whitelist
    description: "Ignore les erreurs 401 sur les API Outline"
    whitelist:
    reason: "Faux positifs Outline API (Auth 401)"
    expression:
        - |
        evt.Meta.service == 'http' &&
        evt.Parsed.http_status == '401' &&
        evt.Meta.http_path startsWith '/api/' &&
        evt.Meta.http_path endsWith '.list'
    ```

2. **Application des modifications.**
   Redémarrer CrowdSec.

    ```bash
    sudo systemctl restart crowdsec
    ```

3. **Vérification du bon fonctionnement.**

    ```bash
    systemctl status crowdsec
    ```

---
## E. Vérification du fonctionnement d’Outline

1. Accéder à l’URL : `https://note.domaine.fr`
2. Vérifier la redirection vers Authentik
3. Tester la connexion via le SSO
4. Vérifier la création automatique du compte utilisateur
5. Tester la création et la sauvegarde d’une note

---
## Bibliographie

* [https://integrations.goauthentik.io/documentation/outline/](https://integrations.goauthentik.io/documentation/outline/)
* [https://docs.getoutline.com/s/hosting/doc/docker-7pfeLP5a8t](https://docs.getoutline.com/s/hosting/doc/docker-7pfeLP5a8t)
* [https://github.com/FireToak/k3s-deployment-outline](https://github.com/FireToak/k3s-deployment-outline)

---
