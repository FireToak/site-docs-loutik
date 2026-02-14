# SP 1 - Mission 2 - Mise en place du protypage

**SP 1 : Gestion de l'infrastructure réseau**

**Mission 2 : Mise en place de l'infrastructure réseau**

**Contexte : MILLENUITS**

![Logo MilleNuits](/img/docs/projets-bts/millenuits/logo_millenuits.png)

---
## Informations générales

- **Date de création :** 15/01/2026
- **Dernière modification :** 15/01/2026
- **Auteur :** BISERAY Louis

---
## Sommaire

- A. Adressage des postes et serveurs.
- B. Configuration des commutateurs d'accès.
- C. Configuration du commutateur cœur de réseau.
- D. Configuration du commutateur MILLENUITS.
- E. Configuration du routeur Modem ADSL.

---
## A. Adressage des postes, serveurs et table de routage.

### 1. Adressage

**Adresses Postes différents services :**
```
Adresse Réseau : 172.40.0.0 /16
Pc ADM : 172.40.1.129       Masque : 255.255.255.128
Pc AUTRES : 172.40.1.1      Masque : 255.255.255.128
Pc PROD : 172.40.0.1        Masque : 255.255.255.0
Pc LOGI : 172.40.2.65       Masque : 255.255.255.192
Pc VENTE : 172.40.2.1       Masque : 255.255.255.192
```

**Adressage Serveurs :**
```
Adresse Réseau : 172.16.51.0 /24
MN01 (AD,DNS,DHCP) : 172.16.51.1        Masque : 255.255.255.0
MN02 Messagerie : 172.16.51.2           Masque : 255.255.255.0
MN03 PGI : 172.16.51.3                  Masque : 255.255.255.0
MN04 Web : 172.16.51.4                  Masque : 255.255.255.0
MN05 Sauvegarde : 172.16.51.5           Masque : 255.255.255.0
MN06 Gestion d'incidents : 172.16.51.6  Masque : 255.255.255.0
MN07 Serveur de fichiers : 172.16.51.7  Masque : 255.255.255.0
```

### 2. Plan de nommage :

`type_role-identifiant`

*Exemple :*
`sw_coeur-01`

### 3. Table de routage

**Table de routage - Modem ADSL**

| **Type** **C = connectée** **S = statique** | **Réseau destination** | **Masque** | **Passerelle** | **Adresse IP interface locale** |
| --------------------------------------------------------- | ---------------------- | ---------- | -------------- | ------------------------------- |
| S                                                         | 0.0.0.0                | 255.0.0.0  | 45.45.45.45    | 0.0.0.0                         |

**Table de routage - rt_millenuits-01**

| **Type** **C = connectée** **S = statique** | **Réseau destination** | **Masque**      | **Passerelle** | **Adresse IP interface locale** |
| --------------------------------------------------------- | ---------------------- | --------------- | -------------- | ------------------------------- |
| C                                                         | 172.40.0.0             | 255.255.255.0   | 172.40.0.254   | 172.40.0.254                    |
| C                                                         | 172.40.1.0             | 255.255.255.128 | 172.40.1.126   | 172.40.1.126                    |
| C                                                         | 172.40.1.128           | 255.255.255.128 | 172.40.1.254   | 172.40.1.254                    |
| C                                                         | 172.40.2.0             | 255.255.255.192 | 172.40.2.62    | 172.40.2.62                     |
| C                                                         | 172.40.2.64            | 255.255.255.192 | 172.40.2.126   | 172.40.2.126                    |
| C                                                         | 172.16.51.0            | 255.255.255.0   | 172.16.51.253  | 172.16.51.253                   |
| S                                                         | 0.0.0.0                | 0.0.0.0         | 172.16.31.254  | 0.0.0.0                         |

---
## B. Configuration des commutateurs d'accès.

**Switch ADM**
*Ceci doit être reproduis sur les autres commutateurs en tenant compte du plan d'adressage et du plan de nommage défini ci-dessus.*

**1. Mise en place du plan de nommage.**
```cisco
! Connexion au mode édition
switch> en
switch# conf t

! Changement de nom
switch(config)# hostname sw_adm-01
sw_adm-01(config)#
```

**2. Création du vlan.**
```cisco
sw_adm-01(config)# vlan 12
sw_adm-01(config-vlan)# name Administratif
sw_adm-01(config-vlan)# exit
```

> Répéter ces commandes sur les autres commutateurs et changer le nom ainsi que le numéro du Vlan en fonction du service qui est indiquer sur le commutateur (*voir SP 1 - Mission 1 - Plan d'adressage*)

**3. Attribution des ports Ethernet au Vlan.**
```cisco
! Configuration de l'interface vers le poste client
sw_adm-01(config)# interface fa 0/1
sw_adm-01(config-if)# switchport mode access
sw_adm-01(config-if)# switchport access vlan 12
sw_adm-01(config-if)# ex

! Configuration de l'interface vers le commutateur coeur de réseau
sw_adm-01(config)# interface fa 1/1
sw_adm-01(config-if)# switchport mode access
sw_adm-01(config-if)# switchport access vlan 12
sw_adm-01(config-if)# ex
```

**4. Vérification de la bonne attribution.**
```
sw_adm-01# show vlan
```

Résultat attendu :

```cisco
12 Administratif active Fa0/1, Fa1/1
```

---
## C. Configuration du commutateur cœur de réseau.

**1. Mise en place du plan de nommage.**
```cisco
switch(config)# hostname sw_coeur-01
sw_coeur-01(config)#
```

**2. Création des vlans.**
```cisco
! Création du vlan Production
sw_coeur-01(config)# vlan 10
sw_coeur-01(config-vlan)# name Production
sw_coeur-01(config-vlan)# ex

! Création du vlan Autres
sw_coeur-01(config)# vlan 11
sw_coeur-01(config-vlan)# name Autres
sw_coeur-01(config-vlan)# ex

! Création du vlan Administratif
sw_coeur-01(config)# vlan 12
sw_coeur-01(config-vlan)# name Administratif
sw_coeur-01(config-vlan)# ex

! Création du vlan VentesEtudes
sw_coeur-01(config)# vlan 13
sw_coeur-01(config-vlan)# name VentesEtudes
sw_coeur-01(config-vlan)# ex

! Création du vlan Logistique
sw_coeur-01(config)# vlan 14
sw_coeur-01(config-vlan)# name Logistique
sw_coeur-01(config-vlan)# ex
```

**3. Configuration du port Trunk vers le routeur `rt_millenuits-01`.**
```cisco
sw_coeur-01(config)# interface Gig0/2
sw_coeur-01(config-if)# switchport mode trunk
sw_coeur-01(config-if)# switchport trunk allowed vlan 10,11,12,13,14
sw_coeur-01(config-if)# no shutdown
sw_coeur-01(config-if)# ex
```

**4. Mise en place des vlan sur les ports des commutateurs d'accès.**
> Répéter cette étape avec les informations du plan d'adressage.
```cisco
! Configuration interface pour le vlan Production
sw_coeur-01(config)# interface fastEthernet 0/1
sw_coeur-01(config-if)# switchport mode access
sw_coeur-01(config-if)# switchport access vlan 10
sw_coeur-01(config-if)# no shutdown
sw_coeur-01(config-if)# ex
```

> Changer les informations suivantes :
> * `fastEthernet 0/1` par l'interface de votre commutateur d'accès
> * `vlan 10` par le vlan dédié au réseau de votre commutateur d'accès

---
## D. Configuration du commutateur MILLENUITS.

**1. Mise en place du plan de nommage.**
```cisco
router(config)# hostname rt_millenuits-01
rt_millenuits-01(config)#
```

**2. Configuration de la PAT WAN du routeur.**
```cisco
! Interface WAN
rt_millenuits-01(config)# interface GigabitEthernet 0/1
rt_millenuits-01(config-if)# ip address 172.16.29.11 255.255.252.0
rt_millenuits-01(config-if)# ip nat outside
rt_millenuits-01(config-if)# no shutdown
rt_millenuits-01(config-if)# ex
```

**3. Création des interfaces des vlans.**
```cisco
! Activation de l'interface physique
rt_millenuits-01(config)# interface g0/0
rt_millenuits-01(config-if)# no shutdown
rt_millenuits-01(config-if)# ex

! Interface du vlan Production
rt_millenuits-01(config)# interface g0/0.10
rt_millenuits-01(config-subif)# encapsulation dot1Q 10
rt_millenuits-01(config-subif)# ip address 172.40.0.254 255.255.255.0
rt_millenuits-01(config-subif)# ip nat inside
rt_millenuits-01(config-subif)# ex

! Interface du vlan Autres
rt_millenuits-01(config)# interface g0/0.11
rt_millenuits-01(config-subif)# encapsulation dot1Q 11
rt_millenuits-01(config-subif)# ip address 172.40.1.126 255.255.255.128
rt_millenuits-01(config-subif)# ip nat inside
rt_millenuits-01(config-subif)# ex

! Interface du vlan Administratif
rt_millenuits-01(config)# interface g0/0.12
rt_millenuits-01(config-subif)# encapsulation dot1Q 12
rt_millenuits-01(config-subif)# ip address 172.40.1.254 255.255.255.128
rt_millenuits-01(config-subif)# ip nat inside
rt_millenuits-01(config-subif)# ex

! Interface du vlan VentesEtudes
rt_millenuits-01(config)# interface g0/0.13
rt_millenuits-01(config-subif)# encapsulation dot1Q 13
rt_millenuits-01(config-subif)# ip address 172.40.2.62 255.255.255.192
rt_millenuits-01(config-subif)# ip nat inside
rt_millenuits-01(config-subif)# ex

! Interface du vlan Logistique
rt_millenuits-01(config)# interface g0/0.14
rt_millenuits-01(config-subif)# encapsulation dot1Q 14
rt_millenuits-01(config-subif)# ip address 172.40.2.126 255.255.255.192
rt_millenuits-01(config-subif)# ip nat inside
rt_millenuits-01(config-subif)# ex

! Interface du vlan Serveur
rt_millenuits-01(config)# interface g0/0.51
rt_millenuits-01(config-subif)# encapsulation dot1Q 51
rt_millenuits-01(config-subif)# ip address 172.16.51.253 255.255.255.0
rt_millenuits-01(config-subif)# ip nat inside
rt_millenuits-01(config-subif)# ex

! Route par défaut
rt_millenuits-01(config)# ip route 0.0.0.0 0.0.0.0 172.16.31.254
```

**4. Activation du NAT.**
```cisco
! Créer les ACL qui autorise les réseaux à sortir
rt_millenuits-01(config)# access-list 1 permit 172.40.0.0 0.0.255.255
rt_millenuits-01(config)# access-list 1 permit 172.16.51.0 0.0.0.255

! Activer la traduction NAT
rt_millenuits-01(config)# ip nat inside source list 1 interface GigabitEthernet0/1 overload
```

---
### E. Configuration du routeur Modem ADSL.

**1. Mise en place du plan de nommage.**
```cisco
router(config)# hostname rt_modem-01
rt_modem-01(config)#
```

**2. Configuration des ports Ethernet.**
```cisco
! Configuration du port du réseau interne (LAN)
rt_modem-01(config)# interface Gig0/0
rt_modem-01(config-if)# ip address 172.16.31.254 255.255.252.0
rt_modem-01(config-if)# ip nat inside
rt_modem-01(config-if)# ex

! Configuration du port réseau externe (WAN)
rt_modem-01(config)# interface Gig0/1
rt_modem-01(config-if)# ip address 45.17.25.3 255.0.0.0
rt_modem-01(config-if)# ip nat outside
rt_modem-01(config-if)# ex
```

**3. Activation du NAT.**
```cisco
! Autorisation du réseau à sortir
rt_modem-01(config)# access-list 1 permit 172.16.0.0 0.0.255.255

! Activation du nat
rt_modem-01(config)# ip nat inside source list 1 interface GigabitEthernet0/1 overload
```

**4. Mise en place de la route par défaut.**
```cisco
rt_modem-01(config)# ip route 0.0.0.0 0.0.0.0 45.45.45.45
```

---