---
sidebar_position: 3
title: "Sauvegarde et restauration – Authentik"
description: "Runbook d’exploitation pour la sauvegarde et la restauration d’Authentik sur cluster k3s."
---

![Logo Loutik](/img/logo_loutik.png)

---

:::info Métadonnées
* **Mainteneur(s) :** MEDO Louis
* **Dernière validation technique :** 2026-02-19
:::

---
## Contexte

Cette procédure décrit la méthode officielle de sauvegarde et de restauration d’Authentik déployé sur le cluster k3s.

Authentik étant un composant critique d’authentification (SSO / IAM), la perte de sa base de données entraîne l’impossibilité d’accéder aux applications protégées.  
La sauvegarde repose sur l’export complet de la base PostgreSQL, qui contient l’ensemble des configurations (flows, providers, utilisateurs, applications, politiques).

---
## Prérequis

- [ ] Un accès au cluster Kubernetes
- [ ] Les droits sur le namespace `authentik`
- [ ] Accès au gestionnaire de mots de passe

---
## Sommaire

1. Sauvegarde d'Authentik  
2. Restauration d'Authentik  
3. Vérification  

---
## 1. Sauvegarde d'Authentik

1.1 **Identification du pod PostgreSQL.** Identifier le pod contenant la base de données Authentik.

```bash
kubectl get pods -n authentik -l app.kubernetes.io/name=postgresql
```

- `kubectl get pods` : Liste les pods actifs.
- `-n authentik` : Cible le namespace où Authentik est installé.
- `-l app.kubernetes.io/name=postgresql` : Filtre l’affichage pour ne montrer que le pod PostgreSQL.

---

1.2 **Export de la base de données.** Créer un dump complet de la base PostgreSQL.

```bash
kubectl exec -it <nom-du-pod-db> -n authentik -- bash -c 'pg_dump -U $POSTGRES_USER $POSTGRES_DB > /tmp/authentik_backup-YYYYMMDD.sql'
```

> Le mot de passe de la base PostgreSQL est stocké dans le gestionnaire de mots de passe sous le nom : `Authentik - PostgreSQL`.

- `kubectl exec -it` : Exécute une commande dans le pod cible.
- `pg_dump` : Outil officiel PostgreSQL pour exporter une base.
- `-U $POSTGRES_USER` : Utilise l’utilisateur défini dans les variables d’environnement du pod.
- `$POSTGRES_DB` : Base de données Authentik.
- `> /tmp/...sql` : Redirige la sortie vers un fichier temporaire dans le pod.

---

1.3 **Récupération du fichier de sauvegarde.** Copier le dump sur la machine locale.

```bash
kubectl cp authentik/<nom-du-pod-db>:/tmp/authentik_backup-YYYYMMDD.sql ./authentik_backup-YYYYMMDD.sql
```

- `kubectl cp` : Copie un fichier entre un pod et la machine locale.
- `./authentik_backup-YYYYMMDD.sql` : Destination locale.

---

## 2. Restauration d'Authentik

2.1 **Arrêt des composants applicatifs.** Stopper les pods serveur et worker afin d’éviter toute écriture pendant la restauration.

```bash
kubectl scale deployment,statefulset -n authentik -l app.kubernetes.io/name=authentik --replicas=0
```

> Le pod PostgreSQL doit rester actif.

- `kubectl scale` : Modifie le nombre de réplicas.
- `--replicas=0` : Arrête temporairement l’application.

---

2.2 **Transfert de la sauvegarde vers PostgreSQL.** Copier le fichier de sauvegarde dans le pod base de données.

```bash
kubectl cp ./authentik_backup-YYYYMMDD.sql authentik/<nom-du-pod-db>:/tmp/authentik_backup-YYYYMMDD.sql
```

---

2.3 **Réinitialisation et restauration de la base.** Supprimer la base existante, la recréer puis injecter le dump.

```bash
kubectl exec -it <nom-du-pod-db> -n authentik -- bash -c 'dropdb -U $POSTGRES_USER $POSTGRES_DB && createdb -U $POSTGRES_USER $POSTGRES_DB && psql -U $POSTGRES_USER $POSTGRES_DB < /tmp/authentik_backup-YYYYMMDD.sql'
```

> Le mot de passe de la base PostgreSQL est stocké dans le gestionnaire de mots de passe sous le nom : `Authentik - PostgreSQL`.

- `dropdb` : Supprime la base existante.
- `createdb` : Crée une base vide.
- `psql` : Client PostgreSQL.
- `< fichier.sql` : Injecte le dump dans la base.

---

2.4 **Redémarrage d’Authentik.** Relancer les composants applicatifs.

```bash
kubectl scale deployment,statefulset -n authentik -l app.kubernetes.io/name=authentik --replicas=1
```

- `--replicas=1` : Redémarre une instance (adapter si haute disponibilité).

---

## 3. Vérification

3.1 **Vérification des pods.** S’assurer que tous les pods sont en état `Running`.

```bash
kubectl get pods -n authentik
```

3.2 **Vérification fonctionnelle.**  
- Accès à l’interface web Authentik  
- Connexion utilisateur fonctionnelle  
- Absence d’erreurs critiques dans les logs  

```bash
kubectl logs -n authentik -l app.kubernetes.io/name=authentik --tail=50
```

---