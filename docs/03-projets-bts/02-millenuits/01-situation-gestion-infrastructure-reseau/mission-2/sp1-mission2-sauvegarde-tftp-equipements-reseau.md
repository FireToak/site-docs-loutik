# SP 1 - Mission 2 - Sauvegarde via TFTP des équipements réseau

**SP 1 : Gestion de l'infrastructure réseau**

**Mission 2 : Mise en place de l'infrastructure réseau**

**Contexte : MILLENUITS**

![Logo MilleNuits](/img/docs/projets-bts/millenuits/logo_millenuits.png)

---
## Informations générales

- **Date de création** : 23/01/2026
- **Dernière modification** : 23/01/2026
- **Auteur** : MEDO Louis

---
## Sommaire

- A. Configuration du serveur TFTP (Poste Admin)
- B. Sauvegarde des équipements vers TFTP
- C. Stockage et Versionning (Git)
- D. Vérification de la translation sur le routeur

---
## Objectif

Cette procédure permet de sauvegarder de manière fiable la configuration active (`running-config`) et la base de données des VLANs (`vlan.dat`) des équipements Cisco vers un serveur centralisé via le protocole TFTP. Elle couvre également l'archivage sur le dépôt Git du projet.

---
## Prérequis

- Un poste d'administration relié au réseau (avec une IP statique configurée).
- Le logiciel **Tftpd64** (ou équivalent) installé sur ce poste.
- Un câble console ou un accès SSH fonctionnel vers les équipements (`sw_coeur-01`, `rt_millenuits-01`, etc.).
- La connectivité réseau (Ping) validée entre l'équipement Cisco et le poste d'administration.

---
## A. Configuration du serveur TFTP (Poste Admin)

> *Cette étape transforme votre poste de travail en serveur de réception pour les fichiers.*

1. **Lancement du service**
    
    - Lancer le logiciel **Tftpd64** en mode administrateur.
    - _Note : Le TFTP utilise le port UDP 69. Assurez-vous que le pare-feu Windows autorise ce trafic._
    
2. **Sélection de l'interface réseau**
    
    - Dans le menu déroulant **Server interface**, sélectionner l'adresse IP de votre carte réseau connectée au switch/routeur (ex: `192.168.1.50` ou une IP dans le VLAN d'administration).
        
3. **Définition du dossier de réception**
    
    - Cliquer sur **Browse** et créer un dossier dédié (ex: `C:\TFTP-Root`).
    - C'est ici que les fichiers `.cfg` et `.dat` atterriront.
        
4. **Vérification**
    
    - S'assurer que l'onglet **Log viewer** est vide (pas d'erreur au démarrage).

---
## B. Sauvegarde des équipements vers TFTP

> *Cette section détaille les commandes à exécuter sur le matériel Cisco.*

### 1. Cas d'un Routeur (ex: `rt_millenuits-01`)

> 💡 Le routeur ne gère pas de base VLAN locale (pas de `vlan.dat`), seule la configuration courante est nécessaire.

1. **Connexion et privilèges**
    ```CISCO
    enable
    ```
    
2. **Lancement du transfert**
    ```CISCO
    copy running-config tftp:
    ```
    
    - `copy` : Commande de duplication.
    - `running-config` : Source (Mémoire vive actuelle).
    - `tftp:` : Destination (Protocole réseau).
        
3. **Paramétrage du transfert (Interactif)**
    
    Le routeur va poser des questions, voici quoi répondre :
    
    - `Address or name of remote host []?` : Entrer l'IP de votre PC (ex: `192.168.1.50`).
    - `Destination filename [rt_millenuits-01-confg]?` : Valider par **Entrée** ou personnaliser le nom.
        
4. **Vérification**
    
    - Le message `!!` s'affiche (chaque point d'exclamation signifie un paquet transmis avec succès).
    - Message final : `[OK - x bytes]`.

### 2. Cas d'un Switch (ex: `sw_coeur-01`)

Les switchs Cisco (en mode VTP Server/Client) stockent les VLANs séparément. Deux fichiers sont requis.

1. **Sauvegarde de la configuration (Même procédure que le routeur)**
    ```CISCO
    copy running-config tftp:
    # Renseigner l'IP du serveur TFTP
    # Valider le nom de fichier
    ```
    
2. **Sauvegarde de la base de données VLAN (Spécifique Switch)**
    ```CISCO
    copy flash:vlan.dat tftp:
    ```
    
    - `flash:vlan.dat` : Fichier binaire source situé dans la mémoire non-volatile.
    - `Address or name of remote host []?` : IP de votre PC.
    - `Destination filename [vlan.dat]?` : **Renommez-le impérativement** pour éviter d'écraser celui d'un autre switch (ex: `vlan_sw-coeur-01.dat`).

---
## C. Stockage et Versionning (Git)

> *Une fois les fichiers reçus sur votre PC, ils doivent être archivés et partagés.*

1. **Renommage normalisé**
    
    Appliquer la convention de nommage stricte du projet pour faciliter le tri :
    
    - Structure : `type_hostname_JJ-MM-AAAA.extension`
    - _Exemple Routeur :_ `router_rt-millenuits-01_23-01-2026.cfg`
    - _Exemple Switch Config :_ `switch_sw-coeur-01_23-01-2026.cfg`
    - _Exemple Switch Vlan :_ `switch_sw-coeur-01_vlan_23-01-2026.dat`
        
2. **Archivage Git**
    
    Déplacer les fichiers renommés dans le répertoire local de votre dépôt.
    
    - **Chemin cible :** `millenuits/01-situation-gestion-infrastructure-reseau/02-mission/`
        
3. **Envoi vers GitHub**
    
    Ouvrir un terminal (Git Bash ou VS Code) dans le dossier et exécuter :
    ```bash
    git pull # Toujours récupérer la dernière version avant
    git add .
    git commit -m "Backup : Sauvegarde configurations et VLANs du 23/01/2026"
    git push origin main
    ```
    
4. **Vérification finale**
    
    - Aller sur l'URL : `https://github.com/AP-BTS-SIO-Louis/millenuits`
    - Naviguer dans `01-situation-gestion-infrastructure-reseau/02-mission/` pour confirmer la présence des fichiers.

---
## Notes importantes

- **Sécurité :** Le protocole TFTP n'est pas chiffré. Ne réalisez jamais cette opération à travers un réseau public (Internet).
- **Restauration Switch :** Pour restaurer un switch, il faut copier le fichier `.dat` vers `flash:vlan.dat` puis redémarrer l'équipement avant d'injecter la configuration `.cfg`.

---