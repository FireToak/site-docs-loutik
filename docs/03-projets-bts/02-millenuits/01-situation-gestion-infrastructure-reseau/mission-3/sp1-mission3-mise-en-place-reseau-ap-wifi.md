# SP 1 - Mission 3 - Mise en place du réseau pour AP WIFI

**SP 1 : Gestion de l'infrastructure réseau**

**Mission 3 : Mise en place de l'AP**

**Contexte : MILLENUITS**

![Logo MilleNuits](/img/docs/projets-bts/millenuits/logo_millenuits.png)

---
## Informations générales

* **Date de création :** 23/01/2026
* **Dernière modification :** 29/01/2026
* **Auteur(s) :** MEDO Louis
* **Version :** 1

---
## Objectif

Cette procédure permet de configurer l'infrastructure réseau pour accueillir une borne d'accès Wi-Fi (AP) gérant deux segments distincts : le réseau Commercial et le réseau Invité, en assurant la segmentation par VLANs.

---
## Prérequis

* Accès en console ou SSH au routeur `rt_millenuits-01`.
* Accès en console ou SSH au switch `sw_coeur-01`.
* Câblage Ethernet standard (RJ45).

---
## A. Mise en place physique de l'AP

1. **Connexion des liaisons Ethernet**
Connecter la borne Wi-Fi sur un port du switch configuré dans le VLAN COMMERCIAL.
2. **Vérification de la liaison physique**
Vérifier l'état des LEDs sur le port du switch et sur l'AP. Elles doivent être vertes ou orange (indiquant une liaison active à 100 Mbps ou 1 Gbps).

---
## B. Configuration du VLAN 15 (Invité)

1. **Création de la sous-interface sur le routeur**
Configuration de l'encapsulation et de l'adressage IP pour le routage du VLAN 15.
```cisco
rt_millenuits-01(config)# interface GigabitEthernet0/0.15
rt_millenuits-01(config-subif)# encapsulation dot1Q 15
rt_millenuits-01(config-subif)# ip address 172.40.2.142 255.255.255.240
rt_millenuits-01(config-subif)# ip nat inside
rt_millenuits-01(config-subif)# exit

```

* `interface GigabitEthernet0/0.15` : Crée la sous-interface logique liée au VLAN 15.
* `encapsulation dot1Q 15` : Définit le protocole de trunking IEEE 802.1Q pour le VLAN 15.
* `ip address` : Assigne la passerelle par défaut du sous-réseau.
* `ip nat outside` : Marque l'interface comme externe pour le mécanisme de traduction d'adresses.

2. **Configuration du VLAN 15 sur le switch**
Déclaration du VLAN et mise à jour du trunk vers le routeur.
```cisco
sw_coeur-01(config)# vlan 15
sw_coeur-01(config-vlan)# name INVITE
sw_coeur-01(config-vlan)# exit

sw_coeur-01(config)# interface GigabitEthernet0/2
sw_coeur-01(config-if)# switchport trunk allowed vlan 10-15,51
sw_coeur-01(config-if)# exit

sw_coeur-01(config)# interface FastEthernet 0/6
sw_coeur-01(config-if)# switchport mode access
sw_coeur-01(config-if)# switchport access vlan 15
sw_coeur-01(config-if)# exit

```

* `vlan 15` / `name` : Crée et nomme la base de données de VLAN.
* `switchport trunk allowed vlan` : Autorise explicitement le passage du flux VLAN 15 sur le lien montant.
* `switchport mode access` / `access vlan 15` : Affecte statiquement le port au VLAN 15.

3. **Vérification**
Vérifier la création avec la commande `show vlan brief` sur le switch.

---
## C. Configuration du VLAN 11 (Autres)

1. **Affectation du port d'accès**
Configuration du port dédié au segment "Autres".
```cisco
sw_coeur-01(config)# interface FastEthernet 0/8
sw_coeur-01(config-if)# switchport mode access
sw_coeur-01(config-if)# switchport access vlan 11
sw_coeur-01(config-if)# exit

```

2. **Vérification finale**
Réaliser un test de ping depuis un équipement du VLAN 15 vers la sous-interface du routeur (`172.40.2.142`) pour valider le routage.

---
## Notes importantes

* Veillez à ce que l'AP supporte le tagging VLAN (Trunk) si les deux SSID (Commercial/Invité) sont diffusés sur le même port physique.
* Le masque `255.255.255.240` limite le réseau à 14 adresses hôtes utilisables.
   
---