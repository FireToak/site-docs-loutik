---
title: Projet AP1 - Infrastructure & Hébergement
sidebar_label: Présentation du projet
sidebar_position: 1
description: Mise en place d'une infrastructure d'hébergement Web et de gestion de tickets en binôme.
---

# Projet AP1 : Hébergement Web & Gestion d'Incidents

![Logo BTS SIO Lycée Paul-Louis Courier](pathname:///img/logoSIO-fb.png)

---

:::info Contexte
- **Lieu :** Lycée Paul-Louis Courier (Tours) - BTS SIO
- **Équipe :** Projet réalisé en binôme (2 étudiants)
- **Rôle :** Administrateur Système & Réseau (SISR)
- **Client :** Équipe de développement (SLAM) et Administration
:::

---

## 📋 Présentation de la situation

Le lycée souhaite moderniser sa communication digitale pour mieux promouvoir le BTS SIO. Actuellement, les informations sont dispersées et manquent de visibilité.

Dans ce cadre, les étudiants de l'option **SLAM** développent un nouveau site web. En tant qu'étudiants **SISR**, notre mission est de concevoir et déployer l'infrastructure réseau et serveur nécessaire pour héberger ce site et assurer le support technique via un outil de ticketing.

---

## 🎯 Objectifs techniques

Ce projet se décompose en trois axes principaux :

1.  **Hébergement Web & FTP :** Fournir un espace de stockage pour le site et un accès FTP pour les développeurs.
2.  **Gestion des incidents :** Déployer une solution de ticketing pour centraliser les demandes de support du parc informatique.
3.  **Sécurisation & Sauvegarde :** Assurer la pérennité des données via un NAS et sécuriser les flux (SFTP/FTPS).

---

## 🏗️ Architecture et Environnement

Le projet s'appuie sur une infrastructure hybride (Maquette, Prototype Virtualisé, Production Nutanix).

### Topologie Réseau
* **Plan d'adressage :** `172.16.5X.0/24` (Où X est le numéro du VLAN projet).
* **Matériel :** Routeurs Cisco (1921/2901), Commutateurs Cisco 2960, Ferme Nutanix.

### Services déployés
| Service | Rôle | Adresse IP (Exemple) |
| :--- | :--- | :--- |
| **WEBFTPSIO** | Serveur Web (Apache/Nginx) & FTP | `172.16.5X.1` |
| **TICKETSIO** | Gestion de tickets (GLPI/OsTicket) | `172.16.5X.2` |
| **NASSIO** | Serveur de sauvegarde | `172.16.5X.3` |

---

## 📅 Planning des Missions

Ce projet a été réalisé en suivant 7 missions distinctes :

* **Mission 1 :** Maquettage de l'infrastructure sous *Cisco Packet Tracer*.
* **Mission 2 :** Prototypage des services Web/FTP (VirtualBox).
* **Mission 3 :** Mise en production sur l'hyperviseur **Nutanix**.
* **Mission 4 :** Étude comparative et choix de l'outil de ticketing.
* **Mission 5 :** Prototypage de l'outil de ticketing.
* **Mission 6 :** Mise en production de la solution de ticketing.
* **Mission 7 :** Scripting de sauvegarde automatique vers NAS et sécurisation SSH/TLS.