---
title: Mise en place de NGINX (gateway01-infomaniak)
description: Procédure de mise en place d'un reverse-proxy NGINX sur le VPS gateway01-infomaniak.
---

# Mise en place de NGINX (gateway01-infomaniak)

**Phase 1 – Socle physique et réseau**

![Logo Loutik](./img/00-logo-loutik.png)

---
## Informations générales

- **Date de création :** 07/12/2025
- **Dernière modification :** 02/12/2025
- **Auteur :** MEDO Louis
- **Version :** 1.1

---
## Objectif

Mettre en place un **reverse-proxy NGINX** sur la machine **gateway01-infomaniak** afin de centraliser, répartir et sécuriser le trafic web à destination des différents backends de l’infrastructure **Loutik**.

---
## Sommaire

A. Installation de NGINX  
B. Gestion des erreurs NGINX  
C. Gestion automatique des certificats  
D. Ajout du certificat dans les configurations NGINX  
E. Configuration d’un nouveau service dans NGINX

---
## A. Installation de NGINX

### Notions importantes

- `/etc/nginx/nginx.conf` → configuration globale de NGINX.  
    Ce fichier **inclut automatiquement** les configurations présentes dans `/etc/nginx/sites-enabled/`.
- `/etc/nginx/sites-available/` → répertoire de **stockage** des configurations.  
    NGINX **ne lit pas directement** ces fichiers.
- `/etc/nginx/sites-enabled/` → contient les **liens symboliques** des configurations actives.  
    C’est ce répertoire qui est réellement interprété par NGINX.

> ⚠️ **Bonne pratique** : toujours créer ou modifier les fichiers dans `sites-available`, puis activer le site via un lien symbolique dans `sites-enabled`.

1. **Installation de NGINX**
```bash
sudo apt install nginx -y
```

2. **Ouverture des ports 80 et 443 sur Infomaniak**

Accéder au pare-feu du VPS :  
[https://manager.infomaniak.com/v3/887489/ng/admin3/cloud/40818/firewall](https://manager.infomaniak.com/v3/887489/ng/admin3/cloud/40818/firewall)

> Vérifier que les règles autorisent bien :
> 
> - **Entrée TCP 80 (HTTP)**
> - **Entrée TCP 443 (HTTPS)**

3. **Suppression de la configuration par défaut**
```bash
sudo rm /etc/nginx/sites-enabled/default
```

> Évite l’affichage de la page par défaut de NGINX.

4. **Création d’un fichier de configuration de test**
```bash
sudo nano /etc/nginx/sites-available/test.conf
```

5. **Exemple de configuration vers un backend distant**
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name loutik.fr *.loutik.fr;
}

server {
    listen 80;
    server_name rapide.loutik.fr;

    location / {
        proxy_pass http://192.168.1.155:1025;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

> Notes importantes :
> 
> - `proxy_set_header` permet de transmettre les informations client au backend
> - `server_name` doit correspondre au DNS configuré
> - Vérifier que le backend est accessible depuis le VPS

6. **Activation de la configuration (lien symbolique)**
```bash
sudo ln -s /etc/nginx/sites-available/test.conf /etc/nginx/sites-enabled/
```

7. **Vérification de la syntaxe NGINX**
```bash
sudo nginx -t
```

Résultat attendu :
```text
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

8. **Redémarrage du service NGINX**
```bash
sudo systemctl restart nginx
```

---
## B. Gestion des erreurs NGINX

> Cette section permet de personnaliser les pages d’erreur afin d’améliorer l’expérience utilisateur en cas d’indisponibilité d’un backend.

1. **Création du fichier `error_pages.conf`**
```bash
sudo nano /etc/nginx/snippets/error_pages.conf
```

2. **Contenu du fichier**
```nginx
error_page 502 503 504 /bad-gateway.html;

location = /bad-gateway.html {
    root /var/www/html;
    proxy_connect_timeout 3s;
    proxy_read_timeout 30s;
    proxy_send_timeout 30s;
    internal;
}
```

> - `internal` empêche l’accès direct à la page
> - Le fichier HTML doit être présent dans `/var/www/html`

3. **Ajout de la page HTML personnalisée**

Créer le fichier :  
`/var/www/html/bad-gateway.html`

Source GitHub :  
[https://github.com/FireToak/loutik-tunnel/blob/main/error-pages/bad-gateway.html](https://github.com/FireToak/loutik-tunnel/blob/main/error-pages/bad-gateway.html)

4. **Inclusion des pages d’erreur dans un service**
```nginx
server {
    listen 80;
    server_name rapide.loutik.fr;

    include /etc/nginx/snippets/error_pages.conf;

    location / {
        proxy_pass http://192.168.1.55;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

5. **Réduction du timeout TCP du kernel (optionnel)**
```bash
echo 2 | sudo tee /proc/sys/net/ipv4/tcp_syn_retries
```

---
## C. Gestion automatique des certificats

1. **Installation de Certbot et du plugin Cloudflare**
```bash
sudo apt install certbot python3-certbot-nginx python3-certbot-dns-cloudflare -y
```

2. **Création du token API Cloudflare**

Étapes :

- Accéder à : [https://dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens)
- Cliquer sur **Create Token**
- Modèle : **Edit zone DNS**
- Permissions : `Zone / DNS / Edit`
- Zone : **loutik.fr**
- Créer le token

> ⚠️ Le token ne sera visible qu’une seule fois.

3. **Création du répertoire des secrets**
```bash
sudo mkdir -p /etc/letsencrypt/secrets
```

4. **Création du fichier Cloudflare**
```bash
sudo nano /etc/letsencrypt/secrets/cloudflare.ini
```

```ini
dns_cloudflare_api_token = TON_TOKEN_SUPER_SECRET_ICI
```

5. **Sécurisation du fichier**
```bash
sudo chmod 600 /etc/letsencrypt/secrets/cloudflare.ini
```

6. **Génération du certificat wildcard**
```bash
sudo certbot certonly \
  --dns-cloudflare \
  --dns-cloudflare-credentials /etc/letsencrypt/secrets/cloudflare.ini \
  --dns-cloudflare-propagation-seconds 20 \
  -d "loutik.fr" \
  -d "*.loutik.fr" \
  --deploy-hook "systemctl reload nginx"
```

7. **Vérification du renouvellement automatique**
```bash
systemctl list-timers | grep certbot
```

---
## D. Ajout du certificat dans les configurations NGINX

1. **Création du snippet TLS**
```bash
sudo nano /etc/nginx/snippets/tls.conf
```

2. **Contenu du snippet**
```nginx
ssl_certificate /etc/letsencrypt/live/loutik.fr/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/loutik.fr/privkey.pem;

ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers HIGH:!aNULL:!MD5;
```

3. **Exemple de configuration HTTPS**
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name loutik.fr *.loutik.fr;

    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name rapide.loutik.fr;

    include /etc/nginx/snippets/tls.conf;
    include /etc/nginx/snippets/error_pages.conf;

    location / {
        proxy_pass http://192.168.1.55;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---
## E. Configuration d’un nouveau service dans NGINX

1. **Accéder au répertoire des sites**
```bash
cd /etc/nginx/sites-available
```

2. **Création du fichier de configuration**
```bash
sudo vi sous_domaine.loutik.fr.conf
```

> Convention de nommage : `<sous-domaine>.loutik.fr.conf`

3. **Template de configuration**
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name sous_domaine.loutik.fr;

    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name sous_domaine.loutik.fr;
    http2 on;

    include /etc/nginx/snippets/tls.conf;
    include /etc/nginx/snippets/error_pages.conf;

    location / {
        proxy_pass http://192.168.1.209;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

4. **Vérification de l’accès au service**
```bash
curl -I https://sous_domaine.loutik.fr
```

---
## Bibliographie

- [Beginner's guide – documentation nginx](https://nginx.org/en/docs/beginners_guide.html)
- [Introduction – documentation nginx](https://nginx.org/en/docs/index.html)