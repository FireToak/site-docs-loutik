---
title: Mise en place de CrowdSec sur gateway01-infomaniak
description: Procédure de mise en place de CrowdSec sur le VPS gateway01-infomaniak.
---

# Mise en place de CrowdSec sur gateway01-infomaniak

**Phase 1 – socle physique et réseau**

![Logo Loutik](./img/00-logo-loutik.png)

---
## Informations générales

- **Date de création :** 07/12/2025
- **Dernière modification :** 07/12/2025
- **Auteur :** MEDO Louis
- **Version :** 1

---
## Objectif

Mettre en place un **IPS (Intrusion Prevention System)** ainsi qu’un **WAF (Web Application Firewall)** afin de sécuriser les services de Loutik en amont.  
CrowdSec analysera les logs système et applicatifs, détectera automatiquement les comportements malveillants et appliquera des décisions de blocage via le **bouncer NGINX** directement au niveau du reverse-proxy.

---
## Sommaire

- A. Installation de CrowdSec
- B. Vérification du fonctionnement de CrowdSec

---
## A. Installation de CrowdSec

1. **Lancer le script d’installation automatique de CrowdSec**  
    (documentation disponible dans la bibliographie)
```bash
sudo curl -s https://install.crowdsec.net | sudo sh
```

> Installer le paquet **curl** au préalable s’il n’est pas déjà présent sur le système.

2. **Installer CrowdSec depuis le gestionnaire de paquets**
```bash
sudo apt install crowdsec
```

> Cette commande installe :
> 
> - le moteur d’analyse CrowdSec (security engine)
> - les scénarios de détection par défaut
> - la configuration principale située dans `/etc/crowdsec/`
> - le service systemd `crowdsec`

3. **Vérifier que le service CrowdSec est actif**
```bash
sudo systemctl status crowdsec
```

> Le service doit être en état **active (running)** avant de poursuivre.

4. **Installer le bouncer NGINX**  
    Le bouncer permet d’appliquer les décisions de CrowdSec directement au niveau du reverse-proxy, sans impacter les applications en aval.
```bash
sudo apt install crowdsec-nginx-bouncer
```

> Le bouncer communique avec l’API locale de CrowdSec pour récupérer dynamiquement les décisions de type _ban_.

5. **Vérifier la configuration du bouncer NGINX**
```bash
sudo cat /etc/crowdsec/bouncers/crowdsec-nginx-bouncer.conf
```

> Vérifier notamment :
> 
> - l’URL de l’API CrowdSec (par défaut `http://127.0.0.1:8080`)
> - la présence de la clé API générée automatiquement
> - les permissions d’accès au fichier

6. **Connecter la machine au dashboard CrowdSec**  
    Depuis la section **“Connect with the console”** du site CrowdSec, copier la commande fournie :
```bash
sudo cscli console enroll [TA_CLE_ENROLL_AFFICHEE_SUR_LE_SITE]
```

> Cette action permet de remonter automatiquement vers la console :
> 
> - les scénarios actifs
> - les alertes détectées
> - les décisions appliquées (bans)
> - l’état du moteur de détection

7. **Vérifier l’enrôlement du moteur**

```bash
sudo cscli console status
```

> Le moteur doit apparaître comme **enrolled** et **online**.

8. **Redémarrer ou recharger les services** pour appliquer les configurations :

```bash
sudo systemctl reload crowdsec
sudo systemctl reload nginx
```

> ⚠️ Un _reload_ est suffisant dans la majorité des cas.  
> En cas de dysfonctionnement, utiliser `restart`.

---

## B. Vérification du fonctionnement de CrowdSec

1. **Vérifier localement que des attaques ont été détectées**
```bash
sudo cscli alerts list
```

Exemple de sortie attendue :
```
╭─────┬───────────────────┬───────────────────────────────────┬─────────┬────────────────────────┬───────────┬──────────────────────╮
│  ID │       value       │               reason              │ country │           as           │ decisions │      created_at      │
├─────┼───────────────────┼───────────────────────────────────┼─────────┼────────────────────────┼───────────┼──────────────────────┤
│ 378 │ Ip:159.65.207.162 │ crowdsecurity/ssh-slow-bf         │ NL      │ 14061 DIGITALOCEAN-ASN │ ban:1     │ 2025-12-07T08:34:16Z │
│ 377 │ Ip:178.128.253.30 │ crowdsecurity/ssh-slow-bf         │ NL      │ 14061 DIGITALOCEAN-ASN │ ban:1     │ 2025-12-07T08:33:37Z │
│ …   │        …          │                 …                 │   …     │            …           │    …      │          …           │
╰─────┴───────────────────┴───────────────────────────────────┴─────────┴────────────────────────┴───────────┴──────────────────────╯
```

> Cette sortie confirme que CrowdSec détecte les comportements malveillants et génère des décisions de blocage.

2. **Vérifier les décisions actives**
```bash
sudo cscli decisions list
```

> Les adresses IP bannies doivent apparaître avec leur durée de blocage.

3. **Vérifier l’état des services CrowdSec et du bouncer**
```bash
sudo systemctl status crowdsec
sudo systemctl status crowdsec-nginx-bouncer
```

> Les deux services doivent être en **active (running)**.

4. **Vérifier que NGINX charge correctement les règles CrowdSec**
```bash
sudo tail -f /var/log/nginx/error.log
```

> Des entrées liées au bouncer CrowdSec doivent être visibles lors du chargement des décisions.

5. **Vérifier le bon fonctionnement depuis le dashboard CrowdSec**  
    Accéder à :  
    👉 [https://app.crowdsec.net/security-engines](https://app.crowdsec.net/security-engines)
    
    Vous devez voir :

    - le serveur VPS identifié par son hostname
    - les scénarios actifs (ex : `ssh-bf`, `nginx-401`, `http-bf`, etc.)
    - les alertes générées
    - les décisions envoyées au bouncer NGINX

---
## Bibliographie

- [Installation Linux – documentation CrowdSec ](https://docs.crowdsec.net/u/getting_started/installation/linux)
- [Introduction – documentation CrowdSec  ](https://docs.crowdsec.net/u/getting_started/intro)