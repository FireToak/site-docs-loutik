---
sidebar_position: 1
title: Configuration VLANs (Zyxel)
description: Segmentation réseau via 802.1Q sur le switch GS1200-8.

# -------------------------------------------------------------------------
# 🎯 MODÈLE : ACTION (VIVANT)
# -------------------------------------------------------------------------
---

![Logo du projet Loutik](/img/logo_loutik.png)

---

:::info Métadonnées
* **Mainteneur(s) :** MEDO Louis
* **Dernière validation technique :** 2026-01-11
:::

---

## Contexte
Cette procédure décrit comment segmenter le réseau physique en créant des réseaux virtuels (VLANs) sur le switch Zyxel. Cela permet d'isoler les flux (ex: Management, Serveurs, IoT).

---

## Prérequis

Avant de commencer, s'assurer de :
* [ ] Avoir les accès à l'interface Web du switch (`http://192.168.1.2`).
* [ ] Avoir défini son plan d'adressage VLAN (Ex: ID 10 = Serveurs, ID 20 = IoT).
* [ ] **Important :** Être connecté physiquement sur un port qui restera dans le VLAN de Management (VLAN 1 par défaut) pour ne pas s'enfermer dehors.

---

## Étape 1 : Activation du 802.1Q

Le switch est par défaut en mode "Port-Based VLAN", il faut basculer en norme standard 802.1Q.

### 1.1 Exécution
1. Se connecter à l'interface Web.
2. Aller dans le menu **VLAN**.
3. Cocher l'option **802.1Q VLAN**.
4. Cliquer sur **Apply**.

:::warning Attention
Une fois activé, tous les ports sont par défaut membres du VLAN 1 (Untagged). Ne retirez pas votre port de gestion du VLAN 1 pour l'instant.
:::

---

## Étape 2 : Création des VLANs (Tagging)

Nous allons déclarer les VLANs et définir comment les paquets sortent du switch.

### 2.1 Exécution
Supposons la création du **VLAN 10** (Serveurs) :

1. Dans la section **VLAN Configuration**, entrer `10` dans le champ **VLAN ID**.
2. Configurer les ports selon le besoin :
    * **Port 1 (Uplink/Routeur) :** Cocher `Tagged` (Doit faire passer plusieurs VLANs).
    * **Port 2 (Serveur Proxmox) :** Cocher `Tagged` (Si Proxmox gère lui-même les VLANs).
    * **Port 3 (PC Fixe) :** Cocher `Untagged` (Le PC ne connaît pas les VLANs).
    * **Autres ports :** Laisser `Excluded` (Non membre).
3. Cliquer sur **Add/Apply**.

**Rappel théorique :**
* **Tagged (T) :** Le switch garde l'étiquette VLAN sur le paquet. L'équipement en face (Routeur, Proxmox) doit être configuré pour lire cette étiquette.
* **Untagged (U) :** Le switch retire l'étiquette avant d'envoyer le paquet. L'équipement (PC, TV) reçoit du réseau "normal".

---

## Étape 3 : Configuration du PVID (Ingress)

Si vous avez configuré des ports en **Untagged** à l'étape précédente (ex: Port 3 pour un PC), vous devez dire au switch comment étiqueter le trafic *entrant* venant de ce PC.

### 3.1 Exécution
1. Aller dans l'onglet/section **Port** ou **PVID**.
2. Pour le **Port 3** (défini en Untagged VLAN 10 précédemment) :
    * Modifier le **PVID** de `1` à `10`.
3. Cliquer sur **Apply**.

### 3.2 Vérification immédiate
Vérifier dans le tableau récapitulatif que le Port 3 est bien :
* Member of VLAN 10 (Untagged).
* PVID = 10.

:::tip Règle d'or
Si un port est **Untagged** dans le VLAN X, son **PVID** doit être X.
Si un port est **Tagged** uniquement, son PVID reste généralement à 1 (ou le VLAN natif).
:::

---

## Validation Finale

Comment s'assurer que la segmentation fonctionne ?

* [ ] Connecter un PC sur le port configuré (ex: Port 3).
* [ ] Vérifier qu'il récupère une IP correspondant à la plage du VLAN 10 (via DHCP du routeur).
* [ ] Tenter un ping vers la passerelle du VLAN 10 (`ping 192.168.10.1` par exemple).

---

## Rollback (Retour arrière)

**En cas d'erreur (perte d'accès au switch) :**

1. **Méthode douce :** Si vous n'avez pas cliqué sur "Save Configuration" (disquette en haut à droite), débranchez électriquement le switch et rebranchez-le. Il reprendra la dernière config sauvegardée.
2. **Méthode forte (Reset) :**
    * Maintenir le bouton **RESET** en façade pendant 10 secondes.
    * Le switch redémarre en configuration usine (IP: `192.168.1.1`, Password: `1234`).
    * Restaurer la configuration depuis une sauvegarde précédente si disponible.

---

## Références
* [Documentation officielle Zyxel GS1200](https://www.zyxel.com/support)