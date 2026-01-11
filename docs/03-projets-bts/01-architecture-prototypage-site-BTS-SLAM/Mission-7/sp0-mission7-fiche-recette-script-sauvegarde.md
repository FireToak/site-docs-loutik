# Recette production - Script de sauvegarde WordPress

**SP 0 : Architecture de prototypage pour le site du BTS réalisé par les SLAM** 

**Mission 7 : Sauvegarde automatique des fichiers du site sur un serveur NAS et sécurisation des transferts FTP (SFTP ou FTPS)**

![Logo BTS SIO Lycée Paul-Louis Courier](pathname:///img/logo_bts-sio.png)

---
## Informations générales

- **Date de création** : 11/12/2025
- **Dernière modification** : 11/12/2025
- **Auteur** : MEDO Louis
- **Version** : 1

---
## Objectif

Cette recette permet de vérifier le bon fonctionnement de l'infrastructure ainsi que le script de sauvegarde du serveur WordPres.

---
## Prérequis

Avant de lancer les tests, assurez-vous que les éléments suivants sont en place :
* Le script `backup_wp.sh` est créé sur le serveur WordPress.
* La clé SSH privée est configurée dans `~/.ssh/id_ed25519` et la config SSH pointe vers l'hôte `truenas`.
* Sur TrueNAS, le dataset "backup" existe et l'utilisateur "backup" y a les droits.

---

## Sommaire

- A. Protocole de Tests
- B. Validation Finale

---

## A. Protocole de Tests

### 1. Test de la connexion SSH (Sans mot de passe)

> L'objectif est de vérifier que le serveur WordPress peut "parler" au NAS sans intervention humaine.

1. Sur le serveur WordPress, lancez la commande :

```bash
ssh truenas
```

2. **Résultat attendu :** Vous devez être connecté automatiquement (sans entrer de mot de passe) et arriver dans le répertoire de l'utilisateur `backup`.

### 2. Test du transfert de fichier (SCP)

> L'objectif est de vérifier que l'écriture de fichiers sur le NAS fonctionne.

1. Sur le serveur WordPress, créez un fichier de test :

```bash
mkdir -p ~/test
echo "test de transfert" > ~/test/fichier.txt
```

2. Envoyez ce fichier vers le NAS :

```bash
scp ~/test/fichier.txt truenas:~/
```

3. **Résultat attendu :**

    - Aucune erreur ne doit s'afficher lors de l'envoi.
    - Sur le **TrueNAS** (via le Shell de l'interface web), vérifiez la présence du fichier avec :

```bash
ls -l /mnt/datastore/backup
```

Le fichier `fichier.txt` doit apparaître.

### 3. Test du script de sauvegarde (Exécution manuelle)

> L'objectif est de valider que le script complet (dump SQL + compression + envoi) fonctionne.

1. Sur le serveur WordPress, exécutez le script manuellement :

```
bash ~/script/backup_wp.sh
```

1. **Résultat attendu :**
    
    - Vérifiez les logs sur WordPress : `cat /var/log/backup_wp.log`. Il ne doit y avoir **aucun message d'erreur**.
    - Vérifiez sur TrueNAS : `ls -l /mnt/datastore/backup`.
    - Vous devez voir un fichier au format : `backup_wp_AAAA-MM-JJ.tar.gz` (ex: `backup_wp_2025-11-23.tar.gz`)11.

### 4. Test de l'automatisation (Cron)

L'objectif est de s'assurer que la sauvegarde se déclenchera seule tous les soirs.

1. Vérifiez la présence de la tâche planifiée sur WordPress :

```bash
crontab -e
```

2. Assurez-vous que la ligne suivante est présente (pour une exécution à 23h00) :

```bash
0 23 * * * /home/user/script/backup_wp.sh >> /var/log/backup_wp.log 2>&1
```

3. **Validation :**
    
    - Pour tester immédiatement, vous pouvez modifier l'heure du cron à l'heure actuelle + 1 minute, attendre, puis vérifier le log avec `tail -n 20 /var/log/backup_wp.log`.
    - Vérifiez ensuite sur TrueNAS qu'un nouveau fichier a bien été créé automatiquement15.

---
## B. Validation Finale

La recette est validée si toutes les cases suivantes sont cochées:

| **Point de contrôle**                                   | **Statut** |
| ------------------------------------------------------- | ---------- |
| SSH fonctionne sans mot de passe                        | [  ]       |
| SCP transfère correctement un fichier test              | [  ]       |
| Le script `backup_wp.sh` s'exécute sans erreur          | [  ]       |
| Une archive `.tar.gz` complète est présente sur TrueNAS | [  ]       |
| Le cron est configuré et écrit bien dans les logs       | [  ]       |

---