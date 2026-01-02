# Mise en place du VPS (gateway01-infomaniak)

**Phase 1 – Socle physique et réseau**

![Logo Loutik](./img/00-logo-loutik.png)

---
## Informations générales

- **Date de création :** 01/12/2025
- **Dernière modification :** 01/12/2025
- **Auteur :** MEDO Louis
- **Version :** 1.1

---
## Objectif

Cette procédure décrit la mise en place d’une **infrastructure hybride sécurisée** reliant un environnement local (**Homelab sous Proxmox**) à Internet via un **VPS Infomaniak** jouant le rôle de **passerelle unique (gateway)**.

Objectifs principaux :

- Masquer l’IP résidentielle du homelab
- Centraliser l’exposition Internet sur un point unique
- Chiffrer les flux réseau (VPN / tunnel sécurisé)
- Servir de point d’entrée HTTPS (reverse-proxy NGINX)
- Ajouter une couche de sécurité (TLS, CrowdSec)

---
## A. Installation et préparation du système (Debian)

> ⚠️ _Cette étape n’est pas toujours nécessaire sur les VPS préinstallés, mais reste valable pour une installation manuelle ou un reprovisionnement._

1. **Paramètres d’installation recommandés**

- **Mot de passe root** : généré par Bitwarden
- **Utilisateur principal** : généré par Bitwarden
- **Mot de passe utilisateur** : généré par Bitwarden
- **Hostname** : `gateway01-infomaniak`
- **Paquets sélectionnés** :
    - Serveur SSH
    - Utilitaires système standards

 2. **Mise à jour du système**

```bash
apt update && apt full-upgrade -y
```

> Met à jour l’index des paquets et applique toutes les mises à jour de sécurité.

3. **Installation des outils de base**

```bash
apt install sudo vim curl ca-certificates gnupg -y
```

 4. **Ajout de l’utilisateur au groupe sudo**

```bash
sudo adduser <utilisateur> sudo
```

 5. **Vérification des groupes**

```bash
groups <utilisateur>
```

Résultat attendu (exemple) :

```text
user : user cdrom floppy sudo audio dip video plugdev users netdev
```

➡️ **Reconnectez-vous en SSH** afin que les droits sudo soient effectifs.

---
## B. Sécurisation SSH (recommandé)

_(Optionnel mais fortement conseillé)_

- Désactiver la connexion root
- Forcer l’authentification par clé SSH

```bash
sudo nano /etc/ssh/sshd_config
```

Paramètres recommandés :

```text
PermitRootLogin no
PasswordAuthentication no
```

Puis :

```bash
sudo systemctl restart ssh
```

---
## C. Configuration du gateway (NGINX)

### Notions importantes

- `/etc/nginx/nginx.conf` : configuration globale
- `/etc/nginx/sites-available/` : stockage des configurations
- `/etc/nginx/sites-enabled/` : liens symboliques **actifs**

> ➡️ NGINX ne lit **que** les fichiers présents dans `sites-enabled`.

1. **Installation de NGINX**

```bash
sudo apt install nginx -y
```

 2. **Ouverture des ports sur le firewall Infomaniak**

- TCP **80** (HTTP)
- TCP **443** (HTTPS)

Interface Infomaniak :

- Firewall Cloud → Autoriser IPv4/IPv6

3. **Suppression de la configuration par défaut**
```bash
sudo rm /etc/nginx/sites-enabled/default
```

 4. **Création d’une configuration de test**
```bash
sudo nano /etc/nginx/sites-available/maintenance.conf
```

 **Exemple : reverse-proxy vers un serveur distant**
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name loutik.fr *.loutik.fr;

    location / {
        proxy_pass http://192.168.1.205:1027;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

 5. **Activation du site**
```bash
sudo ln -s /etc/nginx/sites-available/maintenance.conf /etc/nginx/sites-enabled/
```

6. **Vérification de la configuration**
```bash
sudo nginx -t
```

 7. **Redémarrage du service**
```bash
sudo systemctl restart nginx
```

---
## D. Gestion des erreurs NGINX

1. **Création du snippet d’erreurs**
```bash
sudo nano /etc/nginx/snippets/error_pages.conf
```

```nginx
error_page 502 503 504 /bad-gateway.html;

location = /bad-gateway.html {
    root /var/www/html;
    internal;
}
```

 2. **Ajout de la page HTML**
```bash
sudo nano /var/www/html/bad-gateway.html
```

> Page affichée en cas d’indisponibilité du backend.

 3. **Optimisation des délais TCP (optionnel)**
```bash
echo 2 | sudo tee /proc/sys/net/ipv4/tcp_syn_retries
```

> Réduit le temps d’attente lors d’un backend inaccessible.

---
## E. Gestion automatique des certificats TLS (Let’s Encrypt + Cloudflare)

1. **Installation des dépendances**
```bash
sudo apt install certbot python3-certbot-nginx python3-certbot-dns-cloudflare -y
```

 2. **Création du token Cloudflare**

- Modèle : **Edit zone DNS**
- Permissions : Écriture
- Zone : `loutik.fr`

 2. **Stockage sécurisé du token**
```bash
sudo mkdir -p /etc/letsencrypt/secrets
sudo nano /etc/letsencrypt/secrets/cloudflare.ini
```

```ini
dns_cloudflare_api_token = TON_TOKEN_ICI
```

```bash
sudo chmod 600 /etc/letsencrypt/secrets/cloudflare.ini
```

 4. **Génération du certificat wildcard**
```bash
sudo certbot certonly \
  --dns-cloudflare \
  --dns-cloudflare-credentials /etc/letsencrypt/secrets/cloudflare.ini \
  --dns-cloudflare-propagation-seconds 20 \
  -d "loutik.fr" \
  -d "*.loutik.fr" \
  --deploy-hook "systemctl reload nginx"
```

 5. **Vérification du renouvellement automatique**
```bash
systemctl list-timers | grep certbot
```

---
## F. Sécurisation avec CrowdSec

 1. **Installation**
```bash
curl -s https://install.crowdsec.net | sudo sh
sudo apt install crowdsec crowdsec-nginx-bouncer -y
```

 2. **Enregistrement à la console CrowdSec**
```bash
sudo cscli console enroll <CLE_ENROLL>
```

 3. **Redémarrage des services**
```bash
sudo systemctl reload crowdsec
sudo systemctl reload nginx
```

---
## G. Publication d’un site LoutikCLOUD

 1. **Création du fichier de configuration**
```bash
sudo nano /etc/nginx/sites-available/sous_domaine.loutik.fr.conf
```

 2. **Template recommandé**
```nginx
server {
    listen 80;
    server_name sous_domaine.loutik.fr;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name sous_domaine.loutik.fr;

    ssl_certificate /etc/letsencrypt/live/loutik.fr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/loutik.fr/privkey.pem;

    include /etc/nginx/snippets/error_pages.conf;

    location / {
        proxy_pass http://192.168.1.209;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

 3. **Activation et test**
```bash
sudo ln -s /etc/nginx/sites-available/sous_domaine.loutik.fr.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

 4. **Vérification depuis un poste client**
```bash
curl -I https://sous_domaine.loutik.fr
```

---
## Recommandations finales

- Sauvegarder `/etc/nginx`, `/etc/letsencrypt`, `/etc/crowdsec`
- Monitorer le VPS (CPU, RAM, disque)
- Centraliser les logs (rsyslog, Loki, etc.)
- Ajouter Fail2ban côté SSH si nécessaire