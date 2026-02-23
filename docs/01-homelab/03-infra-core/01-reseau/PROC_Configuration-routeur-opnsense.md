---
sidebar_position: 2
title: Configuration du routeur OPNsense
description: Cette procédure vise à montrer comment configurer le routeur OPNsense sur l'infrastructure LoutikCLOUD dans le cadre de mon homelab. Elle détaille la mise en place du routage, du pare-feu, des services réseau et de l'accès distant sécurisé.

# -------------------------------------------------------------------------
# 🎯 MODÈLE : ACTION (VIVANT)
# -------------------------------------------------------------------------
---

![Logo du projet Loutik](/img/logo_loutik.png)

---

:::info Métadonnées
* **Mainteneur :** MEDO Louis
* **Dernière validation technique :** 2026-02-23
:::

---
## A. Contexte

Cette procédure vise à montrer comment configurer le routeur OPNsense sur l'infrastructure LoutikCLOUD dans le cadre de mon homelab. Elle détaille la mise en place du routage, du pare-feu, des services réseau et de l'accès distant sécurisé.

---
## B. Création des interfaces de VLAN

## 1. Création des VLANs

1. **Aller dans l'interface de création.** Aller dans l'interface d'administration OPNsense et dans la section suivante : `Interfaces > Other Types > VLAN`

2. **Créer une entrée de vlan.** Créer vos VLAN dans l'interface en suivant les informations ci-dessous (à répéter pour les VLANs 10, 20, 30, 40 et 99) :

    - **Device :** `vlan0.X` (X = numéro de votre vlan tag)
    - **Parent :** `re0` (re0 = nom de votre interface LAN physique)
    - **VLAN tag :** `X` (X = numéro de vlan choisi)
    - **VLAN priority :** `Best Effort` (Vous pouvez l'ajuster en fonction de vos besoins)
    - **Description :** `VLAN <nom>`

:::tip
Le VLAN (Virtual Local Area Network) permet de segmenter logiquement un réseau physique unique en plusieurs réseaux virtuels isolés. La priorité VLAN (802.1p) gère la qualité de service (QoS) au niveau de la couche liaison de données, permettant de prioriser certains trafics (ex: téléphonie).
:::

## 2. Assigner les VLANs

1. **Accéder à l'assignation.** Aller dans `Interfaces > Assignments`.

2. **Ajouter l'interface.** Dans la section `New interface`, choisir l'interface de VLAN souhaitée dans le menu déroulant (par exemple `vlan0.10`), puis cliquer sur `+` (Add).

3. **Configurer l'interface.** Cliquer sur le nom généré (ex: `OPT1`) dans le menu de gauche.

4. **Nommer et activer.** Cocher `Enable interface`. Dans le champ `Description`, utiliser la nomenclature `<interface_physique>_vlan<ID>_<role>`. Exemple : `re0_vlan10_utilisateurs`. Sauvegarder et appliquer.

---
## C. Configuration des adresses IP des interfaces

1. **Accéder aux paramètres de l'interface.** Aller dans `Interfaces > [Nom de l'interface]`.

2. **Définir le type IPv4.** Passer `IPv4 Configuration Type` en `Static IPv4`.

3. **Assigner l'adresse.** Dans la section `Static IPv4 configuration`, entrer l'adresse IP et le masque selon le plan d'adressage (ex: `192.168.10.254` avec un masque `/24` pour le VLAN 10).

4. **Appliquer les changements.** Répéter l'opération pour les interfaces Infrastructure (VLAN 20), Services (VLAN 30), Gateway (VLAN 40) et Management (VLAN 99).

:::info
L'adresse configurée ici servira de passerelle par défaut (Gateway) pour tous les équipements connectés à ce VLAN spécifique.
:::

---
## D. Configuration des Alias

1. **Accéder aux Alias.** Aller dans `Firewall > Aliases`.

2. **Créer un réseau privé (RFC1918).** Cliquer sur `+`. Nom : `RF1918_Reseaux_prives`. Type : `Network(s)`. Contenu : `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`.

3. **Créer les alias d'hôtes.** Répéter l'opération avec le Type `Host(s)` pour centraliser les adresses IP spécifiques :

    - `DNS_Interne` : 192.168.20.10, 192.168.30.253
    - `Ingress_k3s` : 192.168.30.10
    - `Supervision` : 192.168.30.11
    - `ReverseProxy_Interne` : 192.168.20.11

:::tip
Les Alias permettent de regrouper des adresses IP, des réseaux ou des ports sous un nom logique. Cela simplifie la lecture des règles de pare-feu et permet une mise à jour centralisée sans avoir à modifier chaque règle individuellement.
:::

---
## E. Configuration du serveur DHCP (Kea)

1. **Activer Kea DHCPv4.** Aller dans `Services > Kea DHCP > IPv4`.

2. **Ajouter un sous-réseau.** Dans l'onglet `Subnets`, ajouter le réseau `192.168.10.0/24` (vlan utilisateurs).

3. **Définir le pool d'adresses.** Entrer la plage dynamique : `192.168.10.10 - 192.168.10.253`.

4. **Configurer les options réseau.** Définir la passerelle (`192.168.10.254`), le nom de domaine (`loutik.lab`) et les serveurs DNS (`192.168.20.10, 9.9.9.9, 1.1.1.1`).

:::tip
Le protocole DHCP (Dynamic Host Configuration Protocol) distribue automatiquement les configurations IP aux clients. OPNsense utilise désormais le moteur Kea, plus moderne et performant que le serveur ISC DHCP hérité.
:::

---
## F. Configuration du NAT (Outbound)

1. **Accéder au NAT Sortant.** Aller dans `Firewall > NAT > Outbound`.

2. **Passer en mode Hybride.** Sélectionner `Hybrid outbound NAT rule generation` et sauvegarder.

3. **Créer les règles de traduction.** Cliquer sur `+` pour ajouter une règle pour chaque VLAN nécessitant un accès internet.

    - **Interface :** `WAN`
    - **Source address :** Choisir le réseau (ex: `re0_vlan10_utilisateurs net`)
    - **Translation / target :** `Interface address`
    - **Description :** `NAT Utilisateurs`

:::info
Le NAT (Network Address Translation) en mode Outbound permet de masquer les adresses IP privées (RFC1918) de votre réseau local derrière l'adresse IP publique de votre interface WAN. Le mode "Hybride" conserve les règles automatiques tout en permettant d'ajouter des règles manuelles.
:::

---
## G. Configuration des Règles de Pare-feu (Firewall)

1. **Accéder aux règles par interface.** Aller dans `Firewall > Rules > [Nom de l'interface VLAN]`.

2. **Créer les règles d'accès granulaire (Exemple VLAN 10 - Utilisateurs).** Cliquer sur `+` pour créer des règles de haut en bas (la première règle validée l'emporte).

    - **Autoriser le DHCP :** Action `Pass`, Protocole `UDP`, Destination Port `67`.
    - **Autoriser le DNS interne :** Action `Pass`, Protocole `TCP/UDP`, Destination `DNS_Interne` (Alias), Port `53`.
    - **Autoriser le Reverse Proxy :** Action `Pass`, Protocole `TCP/UDP`, Destination `ReverseProxy_Interne` (Alias), Port `443`.
    - **Autoriser l'Internet (Isolé des autres VLAN) :** Action `Pass`, Protocole `IPv4+6`, Destination `Invert match` (coché) pointant vers l'Alias `RF1918_Reseaux_prives`.

3. **Répéter la logique de flux pour les autres réseaux.** Appliquer le principe de moindre privilège : n'autoriser que les flux strictement nécessaires (ex: Ping ICMP, SSH port 22 pour le Management).

:::tip
La règle avec l'inversion de destination (`Invert match` sur `RF1918_Reseaux_prives`) est une bonne pratique. Elle autorise le trafic vers toutes les adresses publiques (Internet) tout en bloquant l'accès à tous les autres réseaux privés internes, garantissant ainsi le cloisonnement des VLANs.
:::

---
## H. Annexes

- [Mise en place du VPN Tailscale sur OPNsense](https://docs.loutik.fr/docs/homelab/edge/tailscale/PROC_Installation-vpn-tailscale-opnsense)
- [Création du Tailnet (Taiscale) pour loutik](https://docs.loutik.fr/docs/homelab/edge/tailscale/PROC_Cr%C3%A9ation-tailnet-vpn-administratif)