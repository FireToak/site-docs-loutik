---
title: Déploiement du service d'identité Authentik sur K3s
description: Procédure d'installation et de configuration du service d'identité Authentik dans le cluster k3s.
---

# Procédure - Déploiement du service d'identité (Authentik)

**Phase 3 – Cluster Kubernetes**

![Logo Loutik](https://raw.github.com/firetoak/firetoak/master/00-logo-loutik.png)

---
## Informations générales

- **Date de création :** 21/12/2025
- **Dernière modification :** 03/01/2026
- **Auteur :** MEDO Louis
- **Version :** 1

---
## Objectif

Déployer et configurer Authentik via HELM pour gérer l'authentification centralisée (SSO) des services du LoutikCloud (ex: Stirling-PDF). Le déploiement inclut une base de données PostgreSQL persistante et un cache Redis volatile.

---
## Prérequis

* Cluster K3s fonctionnel (Master + Workers).
* **Helm** installé sur le poste d'administration ou le Master.
* Accès au fichier de configuration `values.yaml` personnalisé.
* Un nom de domaine configuré (ex: `sso.domaine.com`).

---
## Sommaire

- A. Préparation de l'environnement HELM
- B. Configuration du déploiement (Values)
- C. Installation du Chart
- D. Vérification de l'installation
- E. Configuration de l'option "mot de passe oublié"

---
## A. Préparation de l'environnement HELM

1. **Ajout du dépôt (Repository).** Ajouter les sources officielles d'Authentik à Helm pour qu'il puisse télécharger les paquets. 
    ```bash
    helm repo add authentik https://charts.goauthentik.io
    helm repo update
    ```

2. **Création du Namespace.** Isoler les ressources de sécurité dans un espace dédié.
    ```bash
    kubectl create namespace authentik
    ```

 3. **Vérification.** S'assurer que le dépôt est bien visible.
    ```bash
    helm search repo authentik
    ```

---
## B. Configuration du déploiement (Values)

 1. **Création du fichier de surcharge.** Créer le fichier `authentik-values.yaml` qui contient nos spécificités (Persistance PostgreSQL, SMTP, Ingress, Désactivation persistance Redis).
    ```yaml
    authentik:
        secret_key: "GénérerUneCléSecrèteComplexe"
        # This sends anonymous usage-data, stack traces on errors and
        # performance data to sentry.io, and is fully opt-in
        error_reporting:
            enabled: true
        postgresql:
            password: "GénérerUnMotDePasseComplexe"
        # Email
        email:
            host: "mail.infomaniak.com"
            port: 587
            username: "contact@domaine.com"
            password: "GénérerUnMotDePasseComplexe"
            use_tls: true
            use_ssl: false
            from: "Authentik <contact@domaine.com>"
    server:
        ingress:
            # Specify kubernetes ingress controller class name
            ingressClassName: traefik
            enabled: true
            hosts:
                - sso.domaine.com

    redis:
    enabled: true
    master:
        persistence:
        enabled: false  # On confirme qu'on ne veut pas de disque pour Redis

    postgresql:
        enabled: true
        primary:
        persistence:
            enabled: true
        auth:
            password: "GénérerUnMotDePasseComplexe"
    ```

 2. **Vérification.** Vérifier que les mots de passe et clés secrètes ont bien été remplacés par des valeurs complexes.

---
## C. Installation du Chart

 1. **Lancement du déploiement.** Installer Authentik dans le namespace `security` en utilisant notre fichier de configuration.
    ```bash
    helm install authentik authentik/authentik -f authentik-values.yml -n authentik
    ```

 2. **Suivi du déploiement.** Les pods peuvent mettre quelques minutes à démarrer (initialisation de la base de données).
    ```bash
    kubectl get pods -n authentik -w
    ```
 

---
## D. Vérification Finale

 1. **Accès à l'interface.** Ouvrir un navigateur vers `https://sso.domaine.com/if/flow/initial-setup/`. _Note : La première connexion permet de définir le mot de passe de l'utilisateur `akadmin`._

2. **Validation du stockage.** Vérifier que le PVC (Disque persistent) pour PostgreSQL est bien lié ("Bound").
   ```bash
   kubectl get pvc -n authentik
   ```

---
## E. Configuration de l'option "mot de passe oublié"

> **Documentations utilisées :**
> - https://docs.goauthentik.io/add-secure-apps/flows-stages/flow/examples/flows/#recovery-with-email-verification
> - https://docs.goauthentik.io/users-sources/user/user_basic_operations/#configure-a-recovery-flow

 1. **Télécharger le Template.** Ouvrir un navigateur et aller sur https://docs.goauthentik.io/add-secure-apps/flows-stages/flow/examples/flows/#recovery-with-email-verification. Ensuite télécharger le Flow.

 2. **Importer le Flow.** Rendez-vous dans l'interface d'administration de Authentik, aller dans la section `Flows and Stages`, puis dans `Flows`. Enfin, cliquez sur le bouton `import` pour importer le Template précédemment télécharger.

 3. **Activer l'option.** Toujours dans l'interface d'administration de Authentik, rendez-vous dans la section `System`, puis cliquez sur `Brands`, éditer le brand avec le rectangle avec un crayon. Enfin, dans la section `Default flows`, ajouter `default-recovery-flow` à `Recovery flow` et cliquer sur `Update`.

 4. **Vérification.** Connectez vous à https://sso.domaine.com/, puis entrez un utilisateur et vous devriez voir `Mot de passe oublié` apparaître. Enfin, vous pouvez réaliser une demande de changement de mot de passe pour vérifier que tout le processus fonctionne.

---
## F. Configuration : visualisation de l'adresse IP source dans les logs

1. **Créer un fichier.** On va ajouter une configuration à Traefik pour qu'il puisse lire les adresse IP déclarer dans l'entête http.
   ```bash
   sudoedit /var/lib/rancher/k3s/server/manifests/traefik-config.yaml
   ```
   
2. **Coller le contenue.** Cette configuration va permettre à Traefik de lire les déclarations d'ip dans les entêtes http pour seulement les adresses de confiance.
    ```yaml
    apiVersion: helm.cattle.io/v1
    kind: HelmChartConfig
    metadata:
      name: traefik
      namespace: kube-system
    spec:
      valuesContent: |-
        additionalArguments:
          - "--entryPoints.web.forwardedHeaders.trustedIPs=10.42.0.0/16,192.168.1.0/24"
          - "--entryPoints.websecure.forwardedHeaders.trustedIPs=10.42.0.0/16,192.168.1.0/24"
    ```

3. **Vérification.** Regarder si le pod `Traefik` à un âge de quelques secondes.
    ```bash
    kubectl get pods -n kube-system -w
    ```

> Vous pouvez également essayer de vous connectez à un compte sur Authentik en rentrant un faux mot de passe. Ensuite, vous devriez votre adresse IP dans les logs d'Authentik.
---
## Bibliographie
- [Authentik Helm Chart](https://charts.goauthentik.io/charts/authentik/)
- [Authentik Documentation](https://docs.goauthentik.io/)
- [K3s Documentation](https://rancher.com/docs/k3s/latest/en/)