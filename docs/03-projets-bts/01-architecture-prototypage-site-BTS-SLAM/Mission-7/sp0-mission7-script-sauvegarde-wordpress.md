# Mise en place du script de sauvegarde WordPress vers TrueNAS

**SP 0 : Architecture de prototypage pour le site du BTS réalisé par les SLAM** 

**Mission 7 : Sauvegarde automatique des fichiers du site sur un serveur NAS et sécurisation des transferts FTP (SFTP ou FTPS)**

![Logo BTS SIO Lycée Paul-Louis Courier](/img/logoSIO-fb.png)

---

## Informations générales

- **Date de création** : 22/11/2025
- **Dernière modification** : 22/11/2025
- **Auteur** : MEDO Louis
- **Version** : 1

---

## Objectif

Cette procédure décrit l’installation et la configuration du script permettant la sauvegarde automatique du site WordPress (172.16.51.1) vers un serveur TrueNAS.

Le script permet :

- Une sauvegarde quotidienne à 23h
- Un nom de fichier incluant la date
- Une rétention de 30 jours
- Un suivi via des logs
- Un transfert sécurisé avec SSH / SCP

---

## Sommaire

- A. Présentation du script
- B. Mise en place du script 
- C. Configuration du cron
- D. Configuration d’une clé SSH privée (clé récupérée depuis Bitwarden)

---

## A. Présentation du script

```sh
#!/bin/bash

# --- CONFIGURATION ---
DATE=$(date +%Y-%m-%d)

# Configuration MySQL
# Les identifiants de connexion sont dans le fichier ~/.my.cnf
DB_NAME="tilleul"

# Chemins
SOURCE_FILES="var/www/html/"
TEMP_DIR="/tmp"
ARCHIVE_NAME="wp_backup_$DATE.tar.gz"

# Configuration NAS
# Vérifier que la clé privée et le host "truenas" sont bien configurés dans ~/.ssh/config
NAS_HOST="truenas"
NAS_PATH="wordpress/"

# --- 1. DUMP SQL ---
mysqldump $DB_NAME > $TEMP_DIR/db.sql

# --- 2. COMPRESSION ---
tar -czvf $TEMP_DIR/$ARCHIVE_NAME -C $TEMP_DIR db.sql -C / $SOURCE_FILES

# --- 3. TRANSFERT SCP ---
scp $TEMP_DIR/$ARCHIVE_NAME $NAS_HOST:$NAS_PATH

# --- 4. RÉTENTION ---
ssh $NAS_HOST "find $NAS_PATH -mtime +30 -iname 'wp_backup_*.tar.gz' -delete"

# --- 5. NETTOYAGE ---
rm $TEMP_DIR/db.sql
rm $TEMP_DIR/$ARCHIVE_NAME
```

**Explication des étapes**

1. **Configuration** : toutes les variables sont regroupées pour simplifier la maintenance.
2. **Dump MySQL** : `mysqldump` exporte la base dans `/tmp/db.sql`.
3. **Compression** : `tar` crée une archive nommée avec la date.
4. **Transfert** : `scp` envoie la sauvegarde vers TrueNAS via SSH.
5. **Rétention** : `find` supprime les archives de plus de 30 jours.
6. **Nettoyage** : suppression des fichiers temporaires.

---
## B. Mise en place du script

1. Créer un dossier pour les scripts

```bash
mkdir ~/script
```

 2. Aller dans ce dossier

```bash
cd ~/script
```

 3. Créer le script

```bash
vi backup_wp.sh
```

 4. Coller le contenu du script (Shift + Ctrl + V)

_(script identique à celui de la section A)_

 5. Modifier les variables

Exemple :

```
DB_NAME=ROSE
```

 6. Enregistrer et quitter

Échap → `:wq`

 7. Rendre le script exécutable

```bash
chmod +x backup_wp.sh
```

 8. Créer un fichier `.my.cnf` pour éviter les mots de passe dans le script

```bash
cd ~
touch .my.cnf
vi .my.cnf
```

Y coller :

```ini
[client]
user=MON_USER
password=MON_PASSWORD
```

 9. Tester la connexion MySQL

```bash
mysql
```

 10. Tester le script

```bash
./script/backup_wp.sh
```

> Si vous avez une erreur de permissions sur TrueNAS :
> 
> - Dans TrueNAS → Dataset “backup” → Activer “Apply permissions recursively”
>     
> - Ou créer un sous-dataset et mettre l’utilisateur `backup` en propriétaire.

---

## C. Configuration du cron

 1. Ouvrir la crontab

```bash
crontab -e
```

 2. Ajouter la ligne suivante

```bash
0 23 * * * /home/user/script/backup_wp.sh >> /var/log/backup_wp.log 2>&1
```

Le fonctionnement du temps d'éxecution du script :

```
*  *  *  *  *
|  |  |  |  |
|  |  |  |  └── Jour de la semaine (0–7)
|  |  |  └──── Mois (1–12)
|  |  └─────── Jour du mois (1–31)
|  └────────── Heure (0–23)
└───────────── Minute (0–59)
```

 3. Créer un fichier de log

```bash
sudo touch /var/log/backup_wp.log
sudo chown user:user /var/log/backup_wp.log
```

---

## D. Configuration d’une clé SSH privée (clé récupérée depuis Bitwarden)

La clé SSH **n’est pas générée**, elle est **récupérée depuis Bitwarden**.
Le but est de pouvoir se connecter à TrueNAS simplement avec :

```
ssh truenas
```

---

### Étape 1. Récupérer la clé privée depuis Bitwarden

1. Ouvrir Bitwarden
2. Rechercher l’entrée : **Clé SSH TrueNAS - Privée**
3. Copier le contenu complet de la clé privée
4. Sur le serveur WordPress, créer le fichier :

```bash
mkdir -p ~/.ssh
vi ~/.ssh/id_ed25519
```

5. Coller la clé privée dans ce fichier
6. Enregistrer → `Échap` + `:wq`

Puis appliquer les permissions :

```bash
chmod 600 ~/.ssh/id_ed25519
```

---

### Étape 2. Ajouter la clé publique sur TrueNAS

La clé publique doit être ajoutée à l’utilisateur `backup` dans TrueNAS.

Sur TrueNAS → **Accounts → Users → backup → SSH Public Key**

Coller la clé **publique** correspondante (également stockée dans Bitwarden).

---

### Étape 3. Créer le fichier de configuration SSH

```bash
vi ~/.ssh/config
```

Y mettre :

```
Host truenas
    HostName 172.16.51.10      # IP de votre TrueNAS
    User backup                # utilisateur sur TrueNAS
    IdentityFile ~/.ssh/id_ed25519
    IdentitiesOnly yes
```

Ensuite :

```bash
chmod 600 ~/.ssh/config
```

---

### Étape 4. Tester la connexion SSH

```bash
ssh truenas
```

Si vous arrivez sur TrueNAS **sans mot de passe**, c’est OK.

---

### Étape 5. Tester le SCP

1. Créer un fichier test

```bash
mkdir ~/test
echo "test" > ~/test/fichier.txt
```

2. Envoyer le fichier vers TrueNAS

```bash
scp ~/test/fichier.txt truenas:~/
```

Si aucun mot de passe n’est demandé → **la configuration SSH est bonne**.