# Configuration du routeur CISCO

**SP 0 : Architecture de prototypage pour le site du BTS réalisé par les SLAM**

**Mission 2 : Paramétrage d’un prototype du serveur Web et FTP pour l’hébergement du site**

![Logo BTS SIO Lycée Paul-Louis Courier](pathname:///img/logo_bts-sio.png)

---
## Informations générales

* **Date de création :** 06/11/2025
* **Dernière modification :** 13/11/2025
* **Auteur(s) :** MEDO Louis
* **Version :** 1

---

## Objectif

Cette procédure a pour objectif de présenter les étapes nécessaires à la configuration du routeur Cisco dans le cadre de la mise en place de l’environnement réseau du projet.

---
## Sommaire
- A. Configuration du routeur Cisco
- B. Vérification de la connectivité
- C. Configuration : running-configuration

---

## A. Configuration du routeur Cisco

### 1. Accéder au mode administrateur

```
en
```

**Explication :**
La commande `en` (abréviation de `enable`) permet de passer en **mode privilégié** sur le routeur Cisco, afin d’effectuer des configurations.

---

### 2. Passer en mode de configuration globale

```
conf t
```

**Explication :**
`configure terminal` permet d’entrer dans le **mode de configuration globale**, où l’on peut modifier les paramètres du routeur.

---

### 3. Définir le nom du routeur

```
hostname RTESIO
```

**Explication :**
La commande `hostname` attribue un **nom unique** au routeur, ici `RTESIO`.

**Vérification :**
Le prompt du routeur doit maintenant afficher `RTESIO#`.

---

### 4. Configurer l’interface GigabitEthernet0/0

```
interface GigabitEthernet0/0
ip address 172.16.51.253 255.255.255.0
no shutdown
duplex auto
speed auto
```

**Explication :**

* `interface GigabitEthernet0/0` : permet d’entrer dans la configuration de l’interface.
* `ip address` : définit l’adresse IP et le masque de sous-réseau.
* `no shutdown` : active l’interface.
* `duplex auto` et `speed auto` : laissent le routeur négocier automatiquement la vitesse et le mode duplex.

**Vérification :**
Utiliser la commande :

```
show ip interface brief
```

L’interface **GigabitEthernet0/0** doit apparaître avec l’adresse IP configurée et le statut **up**.

---

### 5. Configurer l’interface GigabitEthernet0/1

```
interface GigabitEthernet0/1
ip address 172.16.29.1 255.255.252.0
no shutdown
duplex auto
speed auto
```

**Explication :**
Même principe que pour l’interface précédente, avec une autre adresse IP adaptée au second réseau.

**Vérification :**
Vérifier que l’interface est bien **active** et que l’adresse est correcte avec :

```
show running-config
```

---

## B. Vérification de la connectivité

1. Tester la connectivité entre les interfaces :

   ```
   ping 172.16.29.1
   ping 172.16.51.253
   ```
   
2. Observer les réponses ICMP des différentes machines pour confirmer le bon fonctionnement du routage.

   ```
   ping 172.16.29.20
   ping 172.16.51.1
   ```
   
   `172.16.29.20` => adresse ip du poste client.
   `172.16.51.1` => adresse ip du serveur Wordpress.
   
## C. Configuration : running-configuration

```
version 15.1
no service timestamps debug uptime
no service timestamps log uptime
no service password-encryption
!
hostname RTESIO
!
boot-start-marker
boot-end-marker
!
!
!
no aaa new-model
!
no ipv6 cef
ip source-route
ip cef
!
!
!
!
!
multilink bundle-name authenticated
!
crypto pki token default removal timeout 0
!
!
license udi pid CISCO1921/K9 sn FGL162926Z0
!
!
!
!
!
!
!
!
interface Embedded-Service-Engine0/0
 no ip address
 shutdown
!
interface GigabitEthernet0/0
 ip address 172.16.51.253 255.255.255.0
 no shutdown
 duplex auto
 speed auto
!
interface GigabitEthernet0/1
 ip address 172.16.29.1 255.255.252.0
 no shutdown
 duplex auto
 speed auto
!
interface Serial0/0/0
 no ip address
 shutdown
 clock rate 2000000
!
ip forward-protocol nd
!
no ip http server
no ip http secure-server
ip flow-export version 9
!
!
!
!
!
control-plane
!
!
!
line con 0
line aux 0
line 2
 no activation-character
 no exec
 transport preferred none
 transport input all
 transport output pad telnet rlogin lapb-ta mop udptn v120 ssh
 stopbits 1
line vty 0 4
 login
 transport input all
!
scheduler allocate 20000 1000
end
```

---

## Notes importantes

* Toujours sauvegarder la configuration après les modifications :

  ```
  write memory
  ```

  ou

  ```
  copy running-config startup-config
  ```
* Vérifier les câbles et le statut physique des interfaces si une interface reste **down**.

---

## Bibliographie

* Documentation Cisco : [https://www.cisco.com/c/en/us/support/index.html](https://www.cisco.com/c/en/us/support/index.html)