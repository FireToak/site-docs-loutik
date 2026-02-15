---
title: Guide de rédaction d'un Runbook
description: Guide complet pour rédiger un Runbook efficace pour les opérations récurrentes et la réponse à incident.
---

# Guide de rédaction d'un Runbook

## 1. Définition
Un Runbook (ou *Playbook*) est une documentation opérationnelle destinée à être exécutée "à chaud" lors d'un incident, d'une maintenance ou d'une demande récurrente. Contrairement à une procédure d'installation, il doit être direct et actionnable immédiatement.

## 2. Quand en rédiger un ?
* Pour les tâches récurrentes (Maintenance, Sauvegardes manuelles).
* Pour la réponse à incident (Que faire si le disque est plein ? Si un utilisateur est banni ?).
* Pour les opérations sensibles (Mise en production, Restauration de BDD).

## 3. Structure type (Template)

### Metadonnées

* **Nom du Runbook :** Verbe d'action + Objet (ex: *Débannir une IP*, *Restaurer un backup*)
* **Service concerné :** Nom du service (ex: CrowdSec, PostgreSQL)
* **Déclencheur :** Quel événement lance ce runbook ? (Alerte, Ticket, Cron)
* **Rôles requis :** Qui peut l'exécuter ? (Admin, User, Bot)

### I. Contexte et Objectif
* **Pourquoi :** À quoi sert cette opération ?
* **Quand :** Dans quel cas précis doit-on l'utiliser ?

### II. Prérequis techniques
* **Accès :** Quels serveurs/droits sont nécessaires (SSH, VPN, Credentials) ?
* **Outils :** Commandes ou logiciels requis (`cscli`, `kubectl`, `psql`).

### III. Procédure pas-à-pas
* **Étape 1 :** Action précise + Commande à copier-coller.
* **Étape 2 :** Action suivante...
*(Les commandes doivent être explicites et sécurisées).*

### IV. Vérification (Sanity Check)
* Comment s'assurer que l'action a réussi ? (Commande de test, log à vérifier).

### V. Rollback (Retour arrière)
* **Procédure d'annulation :** Si l'opération échoue ou casse la prod, comment revenir à l'état initial ?

## 4. Exemple de Runbook

````MARKDOWN
# Runbook - Gestion des bannissements CrowdSec

**Phase 1 – socle physique et réseau**

![Logo Loutik](/img/logo_loutik.png)

---
## Informations générales

- **Date de création :** 04/01/2026
- **Dernière modification :** 04/01/2026
- **Auteur :** MEDO Louis
- **Version :** 1.0

---
## Informations Runbook

* **Nom du Runbook :** Débannir une adresse IP manuellement
* **Service concerné :** CrowdSec (IPS)
* **Déclencheur :** Ticket support utilisateur ou Alerte de faux-positif
* **Rôles requis :** Administrateur (Sudoer)

---
## 1. Contexte et Objectif

Ce runbook doit être utilisé lorsqu'un utilisateur légitime signale ne plus pouvoir accéder aux services (erreur 403 ou Timeout), soupçonnant un blocage par l'IPS CrowdSec. L'objectif est de vérifier le bannissement et de lever la sanction si elle est injustifiée.

---
## 2. Prérequis techniques

* **Accès :** Connexion SSH au serveur hébergeant CrowdSec.
* **Droits :** Privilèges `sudo` ou `root`.
* **Info requise :** L'adresse IP publique de l'utilisateur (via whatismyip.com).

---
## 3. Procédure pas-à-pas

### Étape 1 : Vérifier le statut de l'IP
Avant de débloquer, vérifier si l'IP est effectivement bannie et pour quelle raison.

```BASH
sudo cscli decisions list --ip <IP_UTILISATEUR>

```

* **Cas A :** `No decision for IP ...` ➔ Le problème n'est pas CrowdSec. **Arrêter ici.**
* **Cas B :** Une ligne apparaît avec `Type: ban` ➔ **Passer à l'étape 2.**

### Étape 2 : Supprimer le bannissement

Exécuter la commande suivante pour retirer l'IP de la base de données locale et du pare-feu.

```bash
sudo cscli decisions delete --ip <IP_UTILISATEUR>

```

---

## 4. Vérification

Vérifier que l'IP n'apparaît plus dans la liste des décisions actives.

```bash
sudo cscli decisions list --ip <IP_UTILISATEUR>

```

*Le retour doit être vide.*

Demander à l'utilisateur de tester l'accès au service.

---

## 5. Rollback (Retour arrière)

Si vous avez débanni une IP malveillante par erreur, vous pouvez la rebannir manuellement pour 4 heures.

```bash
sudo cscli decisions add --ip <IP_MALVEILLANTE> --duration 4h --reason "Erreur de manipulation admin"
```

````