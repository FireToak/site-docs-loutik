# Installation de TrueNas core

**SP 0 : Architecture de prototypage pour le site du BTS réalisé par les SLAM**  

**Mission 7 : Sauvegarde automatique des fichiers du site sur un serveur NAS et sécurisation des transferts FTP (SFTP ou FTPS)**

![Logo BTS SIO Lycée Paul-Louis Courier](pathname:///img/logo_bts-sio.png)

---
## Informations générales

- **Date de création** : 22/11/2025
- **Dernière modification** : 22/11/2025
- **Auteur** : MEDO Louis
- **Version** : 1

---

## Objectif

Cette procédure vous explique comment installer et configurer **TrueNAS Core** dans l’infrastructure du lycée Paul-Louis Courier.

**Note :** Nous utilisons TrueNAS _Core_ car TrueNAS _Scale_ (basé sur Debian) manque de pilotes sur VMware et sur l’hyperviseur Nutanix. 

Vous devez disposer **d’au moins deux disques** :

- 1 disque de **10 Go** pour le système TrueNAS
- 1 disque de **50 Go** pour les données

---

## Sommaire

- A. Télécharger l’ISO
- B. Installation de TrueNAS
- C. Configuration réseau
- D. Paramétrages généraux
- E. Création du pool de stockage
- F. Création du dataset “backup”
- G. Création de l’utilisateur "backup"

---

## A. Télécharger l’ISO

1. Téléchargez l’ISO de TrueNAS Core à l’adresse suivante :  
    [https://www.truenas.com/download-truenas-legacy/](https://www.truenas.com/download-truenas-legacy/)

---

## B. Installation

1. Sélectionnez l’ISO dans votre logiciel de virtualisation.
    
2. Démarrez la machine virtuelle.
    
3. Choisissez **Install/Upgrade**.
    
4. Sélectionnez votre disque de **10 Go** en naviguant jusqu’au disque et en appuyant sur **Espace** (une étoile doit apparaître).
    
5. Confirmez la partition du disque avec **Yes**.
    
6. Saisissez un mot de passe.
    
    > Attention : le clavier est en QWERTY. Un mot de passe tapé en “azerty” apparaîtra en “qwerty”.
    
7. Choisissez **Boot via UEFI**.
    
8. Cliquez sur **OK**.
    
9. Choisissez **Shutdown System**.
    
10. Retirez l’ISO du lecteur CD de la VM et redémarrez.
    

---

## C. Configuration de TrueNAS – Adresse IP

1. Tapez **1** pour configurer l’interface réseau.
    
    ```bash
    Enter an option from 1-11: 1
    ```
    
2. Sélectionnez votre interface (ici **em0**) :
    
    ```bash
    1) em0
    Select an interface (q to quit): 1
    ```
    
3. Répondez **n** pour ne pas supprimer les paramètres actuels.
    
4. Répondez **n** pour ne pas utiliser DHCP.
    
5. Répondez **y** pour configurer l’IPv4.
    
6. Indiquez le nom de l’interface : `em0`.
    
7. Entrez l’adresse IP :
    
    ```
    IPv4 Address: 172.16.51.3
    ```
    
8. Entrez le masque :
    
    ```
    IPv4 Netmask: 255.255.255.0
    ```
    
9. Répondez **n** pour l’IPv6.
   
10. Vérifier la configuration IP en faisant un ping à infomaniak.com
    ```bash
    ping infomaniak.com
    ```
    
11. Si vous n'arrivez pas à ping suivre la procédure suivante.
12. Choisir l'option 4 dans le menu TrueNAS
13. Choisir `y` pour changer la route par défaut pour l'IPv4
14. Rentrer la passerelle
    ```
    172.16.51.253
    ```
15. Confirmer et dire non pour l'IPv6


---

## D. Paramétrages généraux de TrueNAS

1. Accédez à l’interface web : **[http://172.16.51.3](http://172.16.51.3)**
    
    - Identifiant : `root`
        
    - Mot de passe : celui défini lors de l’installation
        
2. Dans **System → General** :
    
    - Timezone : `Europe/Paris`
        
    - Console Keyboard Map : `French (fr)`
        
    - Sauvegardez avec **SAVE**
        
3. Dans **System → Advanced** :
    
    - Modifier le MOTD :  
        _« Un grand pouvoir implique de grandes responsabilités. »_
        
    - Sauvegardez avec **SAVE**
        

---

## E. Création du pool “datastore”

1. Allez dans **Storage → Pools**.
    
2. Cliquez sur **ADD**.
    
3. Choisissez **Create new pool**.
    
4. Nommez le pool : `datastore`.
    
5. Cochez **Encryption** pour protéger les données.
    
6. Dans **Available Disks**, sélectionnez les disques puis cliquez sur la flèche de droite.
    
    > **VMware/Nutanix :** cochez _Show disks with non-unique serial numbers_.  
    > Sur notre instance, un seul disque suffit car la redondance est assurée par Nutanix.
    
7. Cliquez sur **Create**.
    
8. Téléchargez la clé d’encryption (**DOWNLOAD ENCRYPTION KEY**) et conservez-la dans Bitwarden.
    

---

## F. Création du dataset “backup”

1. Dans **Storage → Pools**, cliquez sur les trois points en face du pool.
    
2. Choisissez **Add Dataset**.
    
3. Nommez-le : `backup`.
    
4. Validez avec **SUBMIT**.
    

---

## G. Création de l’utilisateur “backup”

1. Accédez à **Accounts → Users**.
    
2. Cliquez sur **Add**.
    
3. Configurez :
    
    - **Full Name** : backup
        
    - **Username** : backup
        
    - **Password** : collez le mot de passe généré dans Bitwarden (20 caractères).
        
4. Dans **Directories and Permissions**, sélectionnez le dataset _backup_ et assurez-vous que l’utilisateur possède les droits d’écriture.
    
5. Générez une clé SSH dans Bitwarden et collez la **clé publique** dans _SSH Public Key_.
    
6. Cliquez sur **SUBMIT**.
    
7. Testez la connexion SSH :
    
    - Vérifiez que le service **SSH** est activé (Services → SSH). (Cliquer sur running et sur start automatically)
        
    - Configurez votre accès :
        
        ```bash
        cd ~/.ssh
        vi config
        ```
        
        Ajoutez :
        
        ```
        Host truenas
          HostName 172.16.51.3
          IdentityFile ~/.ssh/truenas
          User backup
        ```
        
    - Testez la connexion :
        
        ```bash
        ssh truenas
        ```
        
---

## Bibliographie

- [Install TrueNAS](https://www.truenas.com/docs/core/13.0/gettingstarted/install/)
- [Comment créer et utiliser des clés SSH - YouTube](https://youtu.be/EylhVIqHlYo)