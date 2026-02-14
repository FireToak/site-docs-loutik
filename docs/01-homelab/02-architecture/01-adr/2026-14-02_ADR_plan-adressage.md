---
title: ADR-001 - Choix de l'hébergeur pour le VPS Gateway
sidebar_position: 1
---

![Logo du projet Loutik](/img/logo_loutik.png)

---
## 1. Contexte

Suite à l'acquisition d'un nouveau routeur, une segmentation des réseaux est nécessaire pour garantir la sécurité et contrôler les flux.

## 2. Décision

Nous implémentons une segmentation logique basée sur des VLANs dédiés, avec un adressage IPv4 en /24 pour les sous-réseaux standards et un sous-réseau restreint en /30 pour le réseau GATEWAY qui comprend la connexion inter-site VPN.

### A. Plan de segmentation

| **Nom VLAN** | **Description** |
| --------------- | ------------------------------------------------------------------------------------ |
| MANAGEMENT      | Gestion de l'infrastructure, interfaces d'administration (switch, routeur, Proxmox). |
| UTILISATEURS    | Réseau dédié aux équipements clients (ordinateurs, téléphones).                      |
| GATEWAY         | SAS de sécurité pour la liaison VPN avec le VPS distant.                             |
| INFRASTRUCTURES | Services centraux (DNS, VPN d'accès, etc.).                                          |
| SERVICES        | Services hébergés sur les nœuds Kubernetes et Proxmox.                               |

### B. Plan d'adressage

| **N° VLAN** | **Nom** | **Réseau** | **Masque** | **Passerelle** | **Diffusion** |
| ----------- | --------------- | ------------ | --------------------- | -------------- | -------------- |
| 99          | MANAGEMENT      | 192.168.1.0  | 255.255.255.0 (/24)   | 192.168.1.254  | 192.168.1.255  |
| 10          | UTILISATEURS    | 192.168.10.0 | 255.255.255.0 (/24)   | 192.168.10.254 | 192.168.10.255 |
| 20          | INFRASTRUCTURES | 192.168.20.0 | 255.255.255.0 (/24)   | 192.168.20.254 | 192.168.20.255 |
| 30          | SERVICES        | 192.168.30.0 | 255.255.255.0 (/24)   | 192.168.30.254 | 192.168.30.255 |
| 40          | GATEWAY         | 192.168.40.0 | 255.255.255.252 (/30) | 192.168.40.2   | 192.168.40.3   |

---