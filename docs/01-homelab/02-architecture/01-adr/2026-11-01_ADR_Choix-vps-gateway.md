---
title: ADR-001 - Choix de l'hébergeur pour le VPS Gateway
sidebar_position: 1
---

![Logo du projet Loutik](/img/logo_loutik.png)

---

## 1. Contexte et Expression des Besoins

Dans le cadre de la mise en place de l'infrastructure hybride, nous avons besoin d'un serveur exposé sur internet (**VPS**) qui servira de point d'entrée unique (Gateway).

### Rôle du serveur (`gateway01`)
* **Reverse Proxy :** Recevoir le trafic HTTP/HTTPS public.
* **Sécurité (WAF) :** Filtrer les attaques via Crowdsec avant qu'elles n'atteignent le domicile.
* **Tunneling :** Monter un tunnel VPN (Wireguard) vers le cluster Proxmox on-premise.

### Contraintes
1.  **Budget Étudiant :** Le coût doit être le plus faible possible (objectif < 5€/mois).
2.  **Géolocalisation :** Le serveur doit être en Europe pour minimiser la latence avec le domicile (Tours).
3.  **Éthique :** Préférence pour un hébergeur ayant une démarche écologique (Green IT).
4.  **Technique :** IP Publique fixe (v4) incluse, OS Linux (Debian/Ubuntu) supporté.

## 2. Étude de Marché (Options considérées)

Nous avons comparé trois solutions populaires pour un VPS d'entrée de gamme (1 vCore, 2Go RAM, 20Go Disk).

| Hébergeur | Offre | Prix Annuel (Approx) | Avantages | Inconvénients |
| :--- | :--- | :--- | :--- | :--- |
| **AWS / Azure** | EC2 / VM | > 100€ (Variable) | Écosystème riche | Trop cher, facturation complexe, IP payante. |
| **OVHcloud** | VPS Starter | ~45€ | Leader français | Support parfois lent, impact carbone variable selon DC. |
| **Infomaniak** | VPS Cloud | **38€** (Offre étudiée) | Suisse (Confidentialité), **Green IT**, Prix fixe. | Gamme moins large que OVH. |

## 3. Décision

Nous choisissons **Infomaniak** pour héberger l'instance `gateway01-infomaniak`.

### Justification
* **Coût :** Avec un tarif de **38€ par an** (soit ~3,15€/mois), c'est l'offre la plus compétitive incluant une IPv4 dédiée.
* **RSE (Responsabilité Sociétale) :** Infomaniak est certifié ISO 14001 et 50001, compensant ses émissions à 200%. Cela s'aligne avec une démarche de numérique responsable.
* **Performance :** Suffisante pour faire tourner NGINX et l'agent Crowdsec sans ralentissement.

## 4. Conséquences

### Positives
* Budget respecté.
* Faible latence réseau (Data centers en Suisse, proche de la France).
* Valorisation possible de l'aspect "Green IT" lors des oraux d'examen.

### Négatives / Risques
* La gestion est "Unmanaged" : nous sommes responsables de la sécurité de l'OS (mises à jour, firewall UFW).
* En cas de panne du datacenter suisse, l'accès à l'ensemble du homelab depuis l'extérieur sera coupé (SPOF - Single Point of Failure).