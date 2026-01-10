---
sidebar_position: 1
title: Mise en place de NGINX sur gateway01-infomaniak
description: Procédure pour l'installation et la configuration du reverse-proxy NGINX sur le VPS gateway01.

# -------------------------------------------------------------------------
# 🎯 MODÈLE : ACTION (VIVANT)
# -------------------------------------------------------------------------
# Utilisez ce modèle pour les fichiers "Vivants" (sans date dans le nom) :
#
# - [PROC] : Procédure / Runbook (Pas à pas)
# - [CONF] : Fichier de configuration commenté
# - [INV]  : Inventaire (Tableaux d'IP, Matériel)
# -------------------------------------------------------------------------
---

![Logo Loutik](https://raw.github.com/firetoak/firetoak/master/00-logo-loutik.png)

---

:::info Métadonnées
* **Mainteneur(s) :** MEDO Louis
* **Dernière validation technique :** 2025-12-07
:::

---

## Contexte
Mettre en place un reverse-proxy NGINX sur la machine gateway01-infomaniak afin de centraliser, répartir et sécuriser le trafic web vers l'infrastructure on-premise.

---

## Prérequis

Avant de commencer, s'assurer de :
* [ ] Avoir les accès SSH `root` ou `sudo` sur la machine `gateway01-infomaniak`.
* [ ] Avoir accès au manager Infomaniak (Pare-feu) et Cloudflare (DNS).
* [ ] Avoir défini les entrées DNS pour `*.loutik.fr`.

---

## Étape 1 : Installation du socle NGINX

Installation du paquet et préparation de l'environnement.

### 1.1 Exécution
Exécuter les commandes suivantes pour installer le service et nettoyer la configuration par défaut :

```bash
# Installation du paquet NGINX
sudo apt install nginx -y

# Suppression du lien symbolique par défaut pour éviter la page "Welcome to Nginx"
sudo rm /etc/nginx/sites-enabled/default
```

### 1.2 Vérification immédiate
Vérifier que le service est actif :

```bash
systemctl status nginx
# Doit retourner : Active: active (running)
```

:::warning Point d'attention
Vérifier dans le pare-feu Infomaniak que les ports TCP 80 (HTTP) et 443 (HTTPS) sont bien ouverts en entrée.
:::

---

## Étape 2 : Gestion des pages d erreur

Mise en place de pages d'erreur personnalisées (Custom Error Pages).

### 2.1 Exécution
Créer la configuration et le fichier HTML associé :

1. Créer le snippet de configuration :
    ```bash
    # Création du fichier de configuration pour les erreurs
    sudo nano /etc/nginx/snippets/error_pages.conf
    ```
    *Contenu à insérer :*
    ```nginx
    error_page 502 503 504 /bad-gateway.html;

    location = /bad-gateway.html {
        root /var/www/html;
        internal; # Empêche l'accès direct depuis le navigateur
    }
    ```

2. Télécharger la page HTML :
    ```bash
    # Récupération du template HTML depuis GitHub
    sudo curl -o /var/www/html/bad-gateway.html https://raw.githubusercontent.com/FireToak/loutik-tunnel/main/error-pages/bad-gateway.html
    ```

### 2.2 Vérification
Vérifier la présence du fichier HTML :

```bash
ls -l /var/www/html/bad-gateway.html
```

---

## Étape 3 : Automatisation SSL avec Certbot

Génération des certificats Wildcard via l'API Cloudflare.

### 3.1 Exécution
Installer les outils et générer le certificat :

```bash
# Installation de certbot et du plugin DNS Cloudflare
sudo apt install certbot python3-certbot-nginx python3-certbot-dns-cloudflare -y

# Création du répertoire sécurisé pour les secrets
sudo mkdir -p /etc/letsencrypt/secrets

# Création du fichier de credentials (à éditer avec le token API)
sudo nano /etc/letsencrypt/secrets/cloudflare.ini
# Contenu : dns_cloudflare_api_token = VOTRE_TOKEN

# Sécurisation du fichier (lecture root uniquement)
sudo chmod 600 /etc/letsencrypt/secrets/cloudflare.ini

# Génération du certificat (remplacer loutik.fr par le domaine réel)
sudo certbot certonly \
  --dns-cloudflare \
  --dns-cloudflare-credentials /etc/letsencrypt/secrets/cloudflare.ini \
  --dns-cloudflare-propagation-seconds 20 \
  -d "loutik.fr" \
  -d "*.loutik.fr" \
  --deploy-hook "systemctl reload nginx"
```

### 3.2 Vérification immédiate
Vérifier la création du timer de renouvellement :

```bash
systemctl list-timers | grep certbot
```

---

## Étape 4 : Configuration des services

Création des configurations TLS et des Vhosts.

### 4.1 Exécution
Configurer le snippet TLS et un service exemple :

1. Créer le snippet TLS commun :
    ```bash
    sudo nano /etc/nginx/snippets/tls.conf
    ```
    *Contenu :*
    ```nginx
    ssl_certificate /etc/letsencrypt/live/loutik.fr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/loutik.fr/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ```

2. Créer un vhost pour un service (ex: sous-domaine) :
    ```bash
    # Bonne pratique : créer dans sites-available
    sudo nano /etc/nginx/sites-available/sous_domaine.loutik.fr.conf
    ```
    *Contenu standard :*
    ```nginx
    server {
        listen 80;
        server_name sous_domaine.loutik.fr;
        return 301 https://$host$request_uri; # Redirection HTTPS forcée
    }

    server {
        listen 443 ssl;
        server_name sous_domaine.loutik.fr;
        http2 on;

        include /etc/nginx/snippets/tls.conf;
        include /etc/nginx/snippets/error_pages.conf;

        location / {
            proxy_pass [http://192.168.1.209](http://192.168.1.209); # IP du backend
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
    ```

3. Activer le site :
    ```bash
    # Création du lien symbolique
    sudo ln -s /etc/nginx/sites-available/sous_domaine.loutik.fr.conf /etc/nginx/sites-enabled/
    ```

### 4.2 Vérification immédiate
Tester la syntaxe avant redémarrage :

```bash
sudo nginx -t
# Doit retourner : syntax is ok / test is successful
```

---

## Validation Finale

Comment s'assurer que tout fonctionne globalement ?

* [ ] La commande `sudo nginx -t` ne renvoie aucune erreur.
* [ ] Le service est accessible en HTTPS : `curl -I https://sous_domaine.loutik.fr`.
* [ ] Le certificat SSL est valide (cadenas dans le navigateur).
* [ ] En cas de coupure du backend, la page d'erreur personnalisée s'affiche.

---

## Rollback (Retour arrière)

1.  Désactiver le site problématique :
    ```bash
    # Suppression du lien symbolique
    sudo rm /etc/nginx/sites-enabled/sous_domaine.loutik.fr.conf
    sudo systemctl reload nginx
    ```
2.  En cas de problème majeur, désinstaller NGINX :
    ```bash
    sudo apt remove nginx -y
    sudo apt autoremove -y
    ```

---

## Références
* [Documentation officielle NGINX](https://nginx.org/en/docs/)
* [Guide Certbot Cloudflare](https://certbot-dns-cloudflare.readthedocs.io/en/stable/)