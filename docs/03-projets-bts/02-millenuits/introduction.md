---
title: Projet Mille Nuits - Contexte & Infrastructure
sidebar_label: Présentation du contexte
sidebar_position: 1
description: Présentation du contexte de l'entreprise Mille Nuits et de son infrastructure informatique.
---

# Projet Mille Nuits : Infrastructure & Gestion du SI

![Logo BTS SIO Lycée Paul-Louis Courier](/img/docs/projets-bts/millenuits/logo_millenuits.png)

---

:::info Contexte
- **Lieu :** Baugé en Anjou (Siège) & Joué-Les-Tours (Logistique)
- **Équipe :** Service Informatique (3 personnes : 2 techniciens, 1 DSI)
- **Rôle :** Technicien Supérieur (SISR/SLAM)
- **Client :** Entreprise Mille Nuits (167 salariés)
:::

---

## 📋 Présentation de la situation

L'entreprise **Mille Nuits**, leader sur le marché français des couettes et oreillers, souhaite professionnaliser la gestion de son système informatique. L'entreprise est répartie sur deux sites géographiques : le site historique de Baugé (49) et le site logistique de Joué-Les-Tours (37), distants de 90 km.

Le service informatique, composé de trois personnes, doit gérer un parc hétérogène et assurer la continuité de service pour l'ensemble des services (Production, Administratif, Ventes, Logistique). L'infrastructure repose sur un environnement Windows Server et intègre un PGI (Open ERP) critique pour l'activité.

---

## 🎯 Objectifs techniques

Les missions du service informatique s'articulent autour de trois axes principaux :

1.  **Administration Système & Réseau :** Gérer le réseau unique (`192.168.110.0/24`) et la liaison privée dédiée reliant le site logistique au siège. Assurer le maintien des services critiques (AD, DNS, DHCP).
2.  **Gestion des Services Applicatifs :** Administrer le serveur de messagerie et le serveur PGI (Open ERP) assurant la comptabilité et la gestion des stocks.
3.  **Support & Maintenance :** Gérer le parc informatique (PC fixes et portables) et assister les utilisateurs, notamment sur le site logistique via la liaison dédiée.

---

## 🏗️ Architecture et Environnement

Le système informatique est centralisé sur le site historique. Le site logistique y accède via une liaison spécialisée.

### Topologie Réseau
* **Plan d'adressage :** `192.168.110.0/24` (Réseau unique pour les deux sites).
* **Connexion Internet :** Routeur ADSL (Orange Pro) avec IP publique fixe `45.17.25.3`.
* **Liaison Inter-sites :** Liaison privée dédiée.

### Services déployés
Les serveurs sont hébergés dans une salle climatisée à Baugé.

| Service | Rôle | Adresse IP |
| :--- | :--- | :--- |
| **MN01** | Contrôleur de domaine (AD), DNS, DHCP, Fichiers | `192.168.110.1` |
| **MN02** | Serveur de messagerie | `192.168.110.2` |
| **MN03** | Serveur PGI (Open ERP : Ventes, Stocks, Compta) | `192.168.110.3` |
| **Routeur ADSL** | Passerelle Internet | `192.168.110.250` |

---

## 🎞️ Organisation de la documentation

Ce projet est documenté à travers les situations professionnelles suivantes :

* **[Situation 1 - Gestion Infrastructure Réseau :]** Administration des serveurs et du réseau d'entreprise.
* **[Situation 2 - Gestion Parc Informatique :]** Inventaire et maintenance des postes clients.