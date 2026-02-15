---
sidebar_position: 3
title: Configuration Reverse Proxy
description: Configuration du Reverse Proxy Nginx et du WAF Crowdsec pour Outline.

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

![Logo Loutik](/img/logo_loutik.png)

---

:::info Métadonnées
* **Mainteneur(s) :** MEDO Louis
* **Dernière validation technique :** 2025-12-28
:::

---

## Contexte
Exposer le service Outline publiquement via Nginx et appliquer une liste blanche Crowdsec pour éviter les faux positifs liés à l'authentification API.

---

## Prérequis

Avant de commencer, s'assurer de :
* [ ] Avoir les accès SSH sur la gateway (`gateway01-infomaniak`).
* [ ] Avoir le déploiement Kubernetes actif (IP interne : `192.168.1.151`).
* [ ] Avoir le service MinIO actif (IP interne : `192.168.1.215`).

---

## Étape 1 : Configuration Nginx

Création des virtual hosts pour l'application et le stockage objet.

### 1.1 Exécution
Créer les fichiers dans `/etc/nginx/sites-available/` et faire les liens symboliques :

1.  **note.loutik.fr.conf** (Proxy vers `192.168.1.151` avec support WebSocket).
2.  **minio.loutik.fr.conf** (Proxy vers `192.168.1.215`).
3.  Activer les sites :
    ```bash
    sudo ln -s /etc/nginx/sites-available/note.loutik.fr.conf /etc/nginx/sites-enabled/
    sudo ln -s /etc/nginx/sites-available/minio.loutik.fr.conf /etc/nginx/sites-enabled/
    ```

### 1.2 Vérification immédiate
Tester la configuration et recharger :

```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

## Étape 2 : Configuration Crowdsec

Ajout d'une exception pour l'API Outline.

### 2.1 Exécution
Créer le parser `/etc/crowdsec/parsers/s02-enrich/outline-whitelist.yaml` :

```yaml
name: custom/outline-whitelist-final
description: "Whitelist brute pour l'API Outline"
whitelist:
  reason: "Outline API False Positives (Auth 401/403)"
  expression:
    # Autorise les erreurs 401/403 uniquement sur les routes /api/
    - evt.Line.Raw matches ".* /api/.*" && evt.Line.Raw matches ".* (401|403) .*"
```

### 2.2 Vérification immédiate
Redémarrer le service WAF :

```bash
sudo systemctl restart crowdsec
systemctl status crowdsec
# Doit être Active (running)
```

---

## Validation Finale

Comment s'assurer que tout fonctionne globalement ?

* [ ] L'accès à `https://note.loutik.fr` redirige vers Authentik.
* [ ] La connexion SSO fonctionne et crée l'utilisateur.
* [ ] La création d'une note est fonctionnelle (test écriture DB + MinIO).
* [ ] Crowdsec ne bannit pas l'IP lors de la navigation dans l'app.

---

## Rollback (Retour arrière)

**Pour supprimer les éléments mis en place :**

1.  Désactiver les sites Nginx :
    ```bash
    rm /etc/nginx/sites-enabled/note.loutik.fr.conf
    systemctl reload nginx
    ```
2.  Supprimer la règle Crowdsec :
    ```bash
    rm /etc/crowdsec/parsers/s02-enrich/outline-whitelist.yaml
    systemctl restart crowdsec
    ```

---

## Références
* [Documentation Crowdsec](https://doc.crowdsec.net/)