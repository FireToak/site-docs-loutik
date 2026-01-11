# Fiche recette : vérification du bon fonctionnement du script de sauvegarde WordPress & TrueNAS

**SP 0 : Architecture de prototypage pour le site du BTS réalisé par les SLAM**

**Mission 7 : Sauvegarde automatique des fichiers du site sur un serveur NAS et sécurisation des transferts FTP (SFTP ou FTPS)**

![Logo BTS SIO Lycée Paul-Louis Courier](pathname:///img/logoSIO-fb.png)

---

## Informations générales

- **Date de création :** 23/11/2025
- **Dernière modification :** 23/11/2025
- **Auteur :** MEDO Louis
- **Version :** 1

---

## Objectif

Cette fiche recette permet de vérifier :

- le bon fonctionnement du **script de sauvegarde WordPress** (fichier + base de données),
- la **connexion SSH** entre le serveur WordPress et TrueNAS,
- le **transfert SCP** des sauvegardes,
- le fonctionnement du **cron**,
- la bonne réception des sauvegardes sur TrueNAS.

---

## Prérequis

- Le script `backup_wp.sh` installé sur le serveur WordPress.
- La clé privée SSH stockée dans Bitwarden et installée dans `~/.ssh/id_ed25519`.
- Le fichier de configuration `~/.ssh/config` configuré pour l’hôte `truenas`.
- Un dataset **backup** créé sur TrueNAS et accessible par l’utilisateur **backup**.

---

## A. Vérification de la connexion SSH

1. Sur le serveur WordPress, exécutez :
    ```bash
    ssh truenas
    ```
    
2. **Vérification :**
    - Vous devez vous connecter **sans mot de passe**.
    - Vous devez arriver dans le répertoire utilisateur de _backup_.

---

## B. Vérification du transfert SCP

1. Sur le serveur WordPress, créez un fichier test :
    ```bash
    mkdir -p ~/test
    echo "test de transfert" > ~/test/fichier.txt
    ```
    
2. Envoyez-le sur TrueNAS :
    ```bash
    scp ~/test/fichier.txt truenas:~/
    ```
    
3. **Vérification :**
    - Sur TrueNAS (Web → **Shell**), tapez :
        ```bash
        ls -l /mnt/datastore/backup
        ```
    - Le fichier **doit apparaître** dans le dataset.

---

## C. Vérification du script de sauvegarde

1. Sur le serveur WordPress, lancez le script manuellement :
    ```bash
    bash ~/script/backup_wp.sh
    ```
    
2. **Vérification :**
    
    Dans `/var/log/backup_wp.log`, vous devez voir :
    
    - Aucun message d’erreur
    - La création du fichier `.tar.gz`
    - L’envoi vers TrueNAS via SCP
    
    Vérifiez le log :
    
    ```bash
    cat /var/log/backup_wp.log
    ```
    
3. Vérifiez la présence de la sauvegarde sur TrueNAS :
    
    ```bash
    ls -l /mnt/datastore/backup
    ```
    
    Vous devez voir un fichier du type :
    
    ```
    backup_wp_2025-11-23-23-00.tar.gz
    ```
    

---

## D. Vérification du cron

1. Comprendre le cron

Le cron exécute automatiquement des tâches planifiées.  
Les 5 champs définissent la minute, l’heure, le jour, le mois et la semaine :

```
*  *  *  *  *
|  |  |  |  |
|  |  |  |  └── Jour de la semaine (0–7)
|  |  |  └──── Mois (1–12)
|  |  └─────── Jour du mois (1–31)
|  └────────── Heure (0–23)
└───────────── Minute (0–59)
```

Image explicative :

![Schéma cron](https://raw.githubusercontent.com/FireToak/medias/main/ap-bts-sio/website-plc/mission-7/1-schema-cron.png)

 2. Vérifier la présence de la tâche cron

Ouvrez le crontab :
```bash
crontab -e
```

Vous devez avoir une tâche similaire à :
```
0 23 * * * /home/user/script/backup_wp.sh >> /var/log/backup_wp.log 2>&1
```

3. Vérification du bon fonctionnement

4. Patientez jusqu’au passage de l’heure programmée (ou modifiez temporairement l’heure/minute pour tester).
    
5. Après l’exécution automatique, vérifiez le log :
    ```bash
    tail -n 20 /var/log/backup_wp.log
    ```
    
6. Vérifiez sur TrueNAS que **un nouveau fichier de sauvegarde** est présent.

---

# E. Vérification finale globale

Pour valider l’ensemble, les points suivants doivent être **OK** :

- [ ] SSH fonctionne sans mot de passe
- [ ] SCP transfère correctement un fichier test
- [ ] Le script s’exécute sans erreur
- [ ] Une sauvegarde complète arrive sur TrueNAS
- [ ] Le cron exécute automatiquement le script à l’heure prévue

---

## Contact

**Support :** En cas de problème technique sur votre instance, contactez les administrateurs via un ticket GLPI :  
➡ [http://172.16.51.2](http://172.16.51.2)

> ⚠️ Si une alerte HTTPS apparaît (certificat auto-signé), acceptez l’avertissement.

---