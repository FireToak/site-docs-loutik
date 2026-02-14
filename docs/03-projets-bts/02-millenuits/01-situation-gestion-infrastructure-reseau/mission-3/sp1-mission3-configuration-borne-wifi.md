# SP 1 - Mission 3 - Configuration de la borne WIFI

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

Cette procédure détaille les étapes pour configurer initialement un point d'accès Wi-Fi (AP) autonome, lui attribuer une adresse IP de management statique et déployer le réseau sans-fil (SSID) pour les invités.

---
## Prérequis

* Un ordinateur portable avec port Ethernet.
* Un câble réseau RJ45.
* La borne d'accès réinitialisée aux paramètres d'usine (IP par défaut : 192.168.0.50).

---
## A. Configuration du poste d'administration

1. **Configuration IP temporaire de l'ordinateur**
Pour communiquer avec la borne à sa sortie de boîte, il faut placer l'ordinateur dans le même sous-réseau.
* **IP :** `192.168.0.1`
* **Masque :** `255.255.255.0`
* **Passerelle :** `192.168.0.50` (IP par défaut de l'AP)

2. **Accès à l'interface d'administration**
Ouvrir un navigateur web et entrer l'adresse `http://192.168.0.50`. Se connecter avec les identifiants par défaut (ID : admin/ MDP : vide).

---
## B. Configuration IP de la borne (Management)

1. **Définition de l'adressage statique**
Dans le menu `Basic Settings` > `LAN`, saisir les paramètres suivants pour intégrer la borne au réseau d'infrastructure :
* **Get IP From :** `Static` (Fixe l'adresse IP pour qu'elle ne change pas).
* **IP Address :** `172.40.2.129` (Adresse unique de la borne dans le plan d'adressage).
* **Subnet Mask :** `255.255.255.240` (Définit la taille du sous-réseau).
* **Default Gateway :** `172.40.2.142` (Adresse du routeur permettant à la borne de communiquer avec les autres réseaux).

---
## C. Configuration du réseau sans-fil (SSID)

1. **Paramétrage du signal Wi-Fi**
Dans le menu `Basic Settings` > `Wireless Settings` :
* **Mode :** `Access Point` (La borne diffuse le réseau de la connexion filaire).
* **Wireless Network Name (SSID) :** `INVITE Louis` (Nom du réseau visible par les utilisateurs).
* **SSID Broadcast :** `Enable` (Autorise la diffusion du nom du réseau ; s'il est désactivé, le réseau est caché).
* **Authentification :** `WPA-Personal` (Standard de sécurité utilisant un mot de passe unique pour tous).
* **PassPhrase :** `louislouis` (Clé de sécurité pour se connecter).

---
## D. Finalisation et vérification

1. **Application de la configuration**
Dans la barre de navigation supérieure, cliquer sur `Configuration`, puis sélectionner `Save and Activate`.
* *Note : La borne va redémarrer. Vous perdrez la connexion immédiate car son adresse IP a changé.*

2. **Vérification finale**
* Reconnecter le PC au réseau local normal (ou remettre sa carte réseau en DHCP).
* Ouvrir une invite de commande et tester la connectivité : `ping 172.40.2.129`.
* Vérifier sur un smartphone que le réseau Wi-Fi "INVITE Louis" est visible.

---
## Notes importantes

* **Connexion switch :** Une fois configurée, assurez-vous de brancher la borne sur le port du switch configuré spécifiquement pour ce VLAN (voir Mission 3). Si le port est mal configuré, la borne ne sera plus joignable.
* **Sécurité :** Il est impératif de changer le mot de passe d'administration par défaut de la borne pour éviter toute intrusion.

---