---
title: Architecture Globale
description: Représentation détaillée de l'infrastructure hybride LoutikCLOUD (Cloud & On-Premise).
sidebar_position: 1
---

![Logo du projet Loutik](/img/logo_loutik.png)

---

* **Auteur :** Louis MEDO
* **Date de mise à jour :** 14/02/2026

---

## 1. Vue d'ensemble de l'infrastructure

Ce schéma présente la topologie globale du projet, divisée entre une zone publique externalisée (VPS) et une zone privée locale (On-Premise) segmentée par un routeur physique OPNsense.

![Architecture globale LoutikCLOUD](/img/docs/homelab/schema/schema-globale-architecture-loutik.png)

### A. Zone Cloud (VPS Infomaniak)
Il s'agit du point d'entrée public de l'infrastructure. Son rôle est de filtrer et de router le trafic légitime vers le domicile de manière sécurisée.
* **WAF (Crowdsec) :** Analyse et bloque les requêtes malveillantes en amont (EDR / IPS).
* **Reverse Proxy (NGINX) :** Réceptionne les requêtes HTTP/HTTPS entrantes et les redirige vers les services locaux appropriés.
* **Endpoint VPN (Tailscale) :** Assure le tunnel chiffré (Mesh VPN) entre le VPS public et le réseau privé.

### B. Zone On-Premise (LoutikCLOUD)
C'est l'infrastructure locale, hébergée à domicile. Le composant central est le **Routeur / Pare-Feu OPNsense**, qui gère le routage inter-VLAN et l'application stricte des règles de sécurité.

---

## 2. Plan de Segmentation (VLANs)

L'OPNsense distribue le trafic local à travers 5 réseaux logiques (VLANs) distincts afin d'isoler les environnements :

* **VLAN 40 (GATEWAY - 192.168.40.0/30) :** Fait office de SAS de sécurité. Il réceptionne la liaison inter-site VPN provenant de Tailscale.
* **VLAN 99 (MANAGEMENT - 192.168.1.0/24) :** Réseau d'administration restreint. Il donne accès aux interfaces critiques (GUI Proxmox, administration Switch/Routeur).
* **VLAN 10 (UTILISATEURS - 192.168.10.0/24) :** Réseau de confiance pour les équipements personnels (Postes clients, Smartphones).
* **VLAN 20 (INFRASTRUCTURE - 192.168.20.0/24) :** Héberge les services vitaux du réseau comme le Serveur DNS interne et la stack de monitoring (Grafana, Prometheus).
* **VLAN 30 (SERVICES - 192.168.30.0/24) :** Environnement d'hébergement applicatif, contenant le Cluster K3s (Web, Outline) et les VMs Proxmox standards (ex: Jellyfin).

:::info Logique de flux
Le trafic externe arrive sur le VPS, est filtré par Crowdsec, puis routé par NGINX dans le tunnel Tailscale jusqu'au SAS de sécurité (VLAN 40). À partir de là, OPNsense inspecte le trafic et l'autorise à atteindre le cluster K3s dans le VLAN 30.
:::