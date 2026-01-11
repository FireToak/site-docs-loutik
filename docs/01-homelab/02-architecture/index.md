---
title: Présentation de Architecture
description: Conception logique, schémas et décisions techniques.
sidebar_position: 2
---

![Logo du projet Loutik](/img/logo_loutik.png)

---

## 🧐 Quoi et pourquoi ?

Bienvenue dans le centre de conception du projet. Cette section documente le **"Quoi"** (les schémas) et le **"Pourquoi"** (les décisions), indépendamment de la mise en œuvre technique.

---

## 🔍 Détails du contenu

### 1. 🗺️ Cartographie
Cette sous-section regroupe l'ensemble des représentations visuelles de l'infrastructure.
* **Schémas Réseaux :** Vue globale des connexions (VPS ↔ VPN ↔ Proxmox).
* **Flux de données :** Trajet d'une requête au travers du WAF (Crowdsec) et du Reverse Proxy.
* **Topologie K3s :** Architecture des nœuds et des pods.

### 2. 🧠 ADRs (Architecture Decision Records)
Cette sous-section contient l'historique des choix techniques structurants.
* Chaque fichier justifie une décision majeure (ex: *Pourquoi utiliser un VPS en frontal ?*).
* Permet de tracer l'évolution du projet et de justifier les choix lors de l'examen.