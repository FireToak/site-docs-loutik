---
sidebar_position: 1
title: Déploiement du service d'identité (Authentik)
description: Procédure pour le déploiement et la configuration d'Authentik via HELM pour la gestion SSO.

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
* **Dernière validation technique :** 2025-12-21
:::

---

## Contexte
Déployer et configurer Authentik via HELM pour gérer l'authentification centralisée (SSO) des services du LoutikCloud (ex: Stirling-PDF). Le déploiement inclut une base de données PostgreSQL persistante et un cache Redis volatile.

**Impact :** Mise en place d'un nouveau service (pas d'interruption de l'existant).

---

## Prérequis

Avant de commencer, s'assurer de :
* [ ] Avoir un Cluster K3s fonctionnel (Master + Workers).
* [ ] Avoir **Helm** installé sur le poste d'administration ou le Master.
* [ ] Avoir accès au fichier de configuration `values.yaml` personnalisé.
* [ ] Avoir un nom de domaine configuré (ex: `sso.loutik.fr`).

---

## Étape 1 : Préparation de l'environnement HELM

Ajout des dépôts nécessaires et préparation de l'espace de travail Kubernetes.

### 1.1 Exécution
Exécuter les commandes suivantes pour ajouter le dépôt et créer le namespace :

```bash
# Ajout du dépôt officiel Authentik
helm repo add authentik https://charts.goauthentik.io

# Mise à jour de la liste des paquets Helm
helm repo update

# Création du namespace dédié pour isoler les ressources
kubectl create namespace authentik
```

### 1.2 Vérification immédiate
Vérifier que le dépôt est bien référencé :

```bash
helm search repo authentik
# Doit retourner la liste des charts authentik disponibles
```

---

## Étape 2 : Configuration du déploiement (Values)

Définition des surcharges de configuration (Persistance, SMTP, Ingress).

### 2.1 Exécution
Créer le fichier `authentik-values.yaml` avec le contenu suivant :

```yaml
authentik:
    secret_key: "VoirBitwarden"
    # Rapport d'erreur vers sentry.io (activé)
    error_reporting:
        enabled: true
    postgresql:
        password: "VoirBitwarden"
    # Configuration SMTP pour l'envoi de mails
    email:
        host: "mail.infomaniak.com"
        port: 587
        username: "contact@loutik.fr"
        password: "VoirBitwarden"
        use_tls: true
        use_ssl: false
        from: "Authentik <contact@loutik.fr>"

server:
    ingress:
        # Définition du contrôleur Ingress (Traefik) et du domaine
        ingressClassName: traefik
        enabled: true
        hosts:
            - sso.loutik.fr

redis:
  enabled: true
  master:
    persistence:
      enabled: false  # Désactivation de la persistance disque pour Redis (cache)

postgresql:
    enabled: true
    primary:
      persistence:
        enabled: true # Activation de la persistance disque pour la BDD
    auth:
        password: "VoirBitwarden"
```

### 2.2 Vérification immédiate
Vérifier visuellement que les champs `password` et `secret_key` ne contiennent pas de valeurs par défaut mais font référence au gestionnaire de mots de passe.

---

## Étape 3 : Installation du Chart

Déploiement effectif de l'application sur le cluster.

### 3.1 Exécution
Lancer l'installation via Helm :

```bash
# Installation dans le namespace 'authentik' avec le fichier de values personnalisé
helm install authentik authentik/authentik -f authentik-values.yml -n authentik
```

### 3.2 Vérification immédiate
Surveiller le démarrage des pods :

```bash
# L'option -w permet de suivre l'évolution en temps réel
kubectl get pods -n authentik -w
```

:::warning Point d'attention
Les pods peuvent mettre plusieurs minutes à passer en statut `Running` le temps de l'initialisation de la base de données.
:::

---

## Étape 4 : Configuration de l'option mot de passe oublié

Mise en place du workflow de récupération de compte par email.

### 4.1 Exécution
1.  **Télécharger le Template :** Récupérer le JSON sur [la documentation officielle](https://docs.goauthentik.io/add-secure-apps/flows-stages/flow/examples/flows/#recovery-with-email-verification).
2.  **Importer le Flow :** Dans l'interface web (`Flows and Stages` > `Flows`), cliquer sur `Import` et charger le fichier.
3.  **Activer l'option :** Dans `System` > `Brands`, éditer la marque par défaut. Ajouter `default-recovery-flow` dans le champ `Recovery flow`.

### 4.2 Vérification immédiate
Se rendre sur `https://sso.loutik.fr/` et vérifier que le lien "Mot de passe oublié" est visible sur la page de login.

---

## Étape 5 : Visualisation adresse IP source

Configuration de Traefik pour remonter les vraies IP clientes dans les logs Authentik.

### 5.1 Exécution
Modifier la configuration de Traefik via le manifest K3s :

```bash
# Édition du fichier de configuration Traefik intégré à K3s
sudoedit /var/lib/rancher/k3s/server/manifests/traefik-config.yaml
```

Insérer la configuration suivante pour approuver les headers forwarded :

```yaml
apiVersion: helm.cattle.io/v1
kind: HelmChartConfig
metadata:
  name: traefik
  namespace: kube-system
spec:
  valuesContent: |-
    additionalArguments:
      # Autoriser les IPs du réseau interne à transmettre les headers (X-Forwarded-For)
      - "--entryPoints.web.forwardedHeaders.trustedIPs=10.42.0.0/16,192.168.1.0/24"
      - "--entryPoints.websecure.forwardedHeaders.trustedIPs=10.42.0.0/16,192.168.1.0/24"
```

### 5.2 Vérification immédiate
Vérifier le redémarrage du pod Traefik :

```bash
kubectl get pods -n kube-system -w
```

---

## Validation Finale

Comment s'assurer que tout fonctionne globalement ?

* [ ] Accès initial réussi sur `https://sso.loutik.fr/if/flow/initial-setup/` (Définition admin).
* [ ] Le stockage PostgreSQL est bien lié :
    ```bash
    kubectl get pvc -n authentik
    # Doit afficher le statut "Bound"
    ```
* [ ] Une demande de réinitialisation de mot de passe déclenche bien un email.
* [ ] Une tentative de connexion échouée affiche bien l'IP réelle du client dans les logs Authentik.

---

## Rollback (Retour arrière)

**Si ça casse tout, voici comment revenir à l'état initial :**

1.  Désinstaller le release Helm :
    ```bash
    helm uninstall authentik -n authentik
    ```
2.  Supprimer le namespace et les données associées :
    ```bash
    kubectl delete namespace authentik
    ```
3.  Restaurer la configuration Traefik (si modifiée) en supprimant les lignes ajoutées dans `/var/lib/rancher/k3s/server/manifests/traefik-config.yaml`.

---

## Références
* [Documentation officielle Authentik](https://docs.goauthentik.io)
* [Doc Flow Recovery](https://docs.goauthentik.io/add-secure-apps/flows-stages/flow/examples/flows/#recovery-with-email-verification)
* [Doc User Operations](https://docs.goauthentik.io/users-sources/user/user_basic_operations/#configure-a-recovery-flow)