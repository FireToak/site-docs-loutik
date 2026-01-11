# Installation du serveur WordPress (Physique)

**SP 0 : Architecture de prototypage pour le site du BTS réalisé par les SLAM**  

**Mission 2 : Paramétrage d'un prototype du serveur Web et FTP pour l'hébergement du site**

![Logo BTS SIO Lycée Paul-Louis Courier](../img/logoSIO-fb.png)

---

## Informations générales

- **Date de création :** 06/11/2025
- **Dernière modification :** 27/11/2025
- **Auteur :** MEDO Louis
- **Version :** 1

---

## Objectif

Cette procédure décrit l’installation et la configuration d’un serveur WordPress physique sur l’infrastructure du lycée Paul-Louis Courier.

---

## Sommaire

- A. Installation et configuration des paquets de base
- B. Configuration du MOTD
- C. Installation de la stack LAMP
- D. Installation de WordPress
- E. Configuration finale de WordPress

---

## A. Installation et configuration des paquets de base

1. Se connecter en root :

```bash
su
```

2. Installer les paquets nécessaires à la maintenance :

```bash
apt install vim sudo
```

3. Ajouter l’utilisateur au groupe sudo afin qu'il puisse utiliser les privilèges administrateur :

```bash
sudo usermod -aG sudo talipe
```

> `-aG` : ajoute l’utilisateur au groupe sans retirer ses groupes existants.

4. Vérifier que l’utilisateur appartient bien au groupe "sudo" :

```bash
groups talipe
```

---

## B. Configuration du MOTD

1. Éditer le fichier `/etc/motd` :

```bash
sudo vi /etc/motd
```

2. Appuyer sur `i` et coller le message suivant :

```text
==========================================================
     ⚙️  Welcome, Administrator

     "De grands pouvoirs impliquent de grandes responsabilités."

     En tant qu’administrateur système, chaque action compte.
     Merci de respecter les bonnes pratiques Linux :

     ✔ Utilisez sudo uniquement lorsque cela est nécessaire
     ✔ Vérifiez vos commandes avant exécution (particulièrement rm, dd, chmod, chown)
     ✔ Documentez vos modifications pour assurer la traçabilité
     ✔ Gardez le système à jour et appliquez les correctifs de sécurité
     ✔ Surveillez les logs : /var/log/syslog, auth.log, dmesg
     ✔ Sauvegardez avant toute opération à risque (cp)
     ✔ Respectez la confidentialité des données et la sécurité du système

     Bonne administration ✨
==========================================================
```

3. Quitter et enregistrer :

```bash
:wq
```

---

## C. Installation de LAMP

1. Installer PHP et ses modules :

```bash
sudo apt install php php-mysql php-curl php-gd php-mbstring php-xml php-xmlrpc php-soap php-intl php-zip libapache2-mod-php -y
```

2. Installer Apache :

```bash
sudo apt install apache2 -y
```

3. Installer MariaDB :

```bash
sudo apt install mariadb-server -y
```

4. Activer MariaDB au démarrage :

```bash
sudo systemctl enable --now mariadb
```

5. Sécuriser la base de données :

> Générer un mot de passe de 32 caractères avec Bitwarden et le partager à l’équipe.

```bash
sudo mariadb-secure-installation
```

**Choix du script : **
```
NOTE: RUNNING ALL PARTS OF THIS SCRIPT IS RECOMMENDED FOR ALL MariaDB
SERVERS IN PRODUCTION USE! PLEASE READ EACH STEP CAREFULLY!

In order to log into MariaDB to secure it, we'll need the current
password for the root user. If you've just installed MariaDB, and
haven't set the root password yet, you should just press enter here.

Enter current password for root (enter for none):
OK, successfully used password, moving on...

Setting the root password or using the unix_socket ensures that nobody
can log into the MariaDB root user without the proper authorisation.

You already have your root account protected, so you can safely answer 'n'.

Switch to unix_socket authentication [Y/n] n
... skipping.

You already have your root account protected, so you can safely answer 'n'.

Change the root password? [Y/n] Y
New password: **************
Re-enter new password: **************
Password updated successfully!
Reloading privilege tables..
... Success!


By default, a MariaDB installation has an anonymous user, allowing anyone
to log into MariaDB without having to have a user account created for
them. This is intended only for testing, and to make the installation
go a bit smoother. You should remove them before moving into a
production environment.

Remove anonymous users? [Y/n] y
... Success!

Normally, root should only be allowed to connect from 'localhost'. This
ensures that someone cannot guess at the root password from the network.

Disallow root login remotely? [Y/n] y
... Success!

By default, MariaDB comes with a database named 'test' that anyone can
access. This is also intended only for testing, and should be removed
before moving into a production environment.

Remove test database and access to it? [Y/n] y
- Dropping test database...
... Success!
- Removing privileges on test database...
... Success!

Reloading the privilege tables will ensure that all changes made so far
will take effect immediately.

Reload privilege tables now? [Y/n] y
... Success!

Cleaning up...

All done! If you've completed all of the above steps, your MariaDB
installation should now be secure.
```

---

## D. Installation de WordPress

### 1. Préparation

1. Aller dans le répertoire temporaire :

```bash
cd /tmp
```

2. Télécharger l’archive WordPress :

```bash
wget https://wordpress.org/latest.zip
```

3. Activer les modules Apache nécessaires :

```bash
sudo a2enmod deflate rewrite ssl
```

### 2. Création de la base de données

1. Connexion à MariaDB :

```bash
mysql -u root -p
```

2. Créer la base :

```sql
CREATE DATABASE rose;
```

3. Vérifier :

```sql
SHOW DATABASES;
```

**Résultat :**
```sql
+--------------------+ 
|	| Database |     |
+--------------------+
| information_schema
| mysql
| performance_schema
| rose
| sys
+--------------------+
5 rows in set (0,003 sec)
```

4. Créer l’utilisateur WordPress :

```sql
CREATE USER 'lolipo'@'localhost' IDENTIFIED BY 'password_voir_bitwarden';
```

5. Accorder les droits :

```sql
GRANT ALL PRIVILEGES ON rose.* TO 'lolipo'@'localhost';
```

6. Appliquer les changements :

```sql
FLUSH PRIVILEGES;
```

### 3. Déploiement des fichiers WordPress

1. Supprimer la page d’index par défaut :

```bash
sudo rm /var/www/html/index.html
```

2. Installer zip :

```bash
sudo apt update
sudo apt install zip -y
```

3. Décompresser WordPress :

```bash
sudo unzip latest.zip -d /var/www/html
```

4. Aller dans le répertoire web :

```bash
cd /var/www/html
```

5. Déplacer les fichiers WordPress à la racine :

```bash
sudo mv wordpress/* /var/www/html/
```

6. Supprimer le dossier restant :

```bash
sudo rm -Rf wordpress/
```

7. Donner les permissions au service web :

```bash
sudo chown -R www-data:www-data /var/www/html/
```

8. Appliquer les droits corrects :

```bash
sudo find /var/www/html/ -type f -exec chmod 644 {} \;
sudo find /var/www/html/ -type d -exec chmod 755 {} \;
```

### Augmenter la mémoire de WordPress

1. Ouvrir le wp-config.php.
   ```bash
   sudo nano /var/www/html/wp-config.php
   ```

2. Aller à la ligne "Add any custom values between this line and the...".
   ```php
   /* Add any custom values between this line and the "stop editing" line. */
   ```

3. Sous cette ligne ajouter la ligne suivante :
   ```php
   define('WP_MEMORY_LIMIT', '512M');
   ```
   > Changer le `512` par la valeur que vous souhaitez.
   > Source : https://wpmarmite.com/snippet/allowed-memory-size-wordpress/
---

## E. Configuration finale de WordPress

1. Ouvrir l’URL du serveur :  
    **[https://172.16.51.1](https://172.16.51.1)**

2. Choisir « Français » puis cliquer sur **Continuer**.
	![Installation étape 1](https://raw.githubusercontent.com/FireToak/medias/main/ap-bts-sio/website-plc/mission-2/1-choix-lang.png)

3. Renseigner les informations suivantes :

- **Nom de la base :** rose
- **Identifiant :** lolipo
- **Mot de passe :** voir Bitwarden (`BD WP MYSQL – lolipo`)
- **Adresse de la base :** localhost
- **Préfixe des tables :** tulipe_
	![Installation étape 1](https://raw.githubusercontent.com/FireToak/medias/main/ap-bts-sio/website-plc/mission-2/2-lancer-conf-sgbd.png)

4. Cliquer sur **Lancer l'installation**.
	![Installation étape 1](https://raw.githubusercontent.com/FireToak/medias/main/ap-bts-sio/website-plc/mission-2/3-conf-sgbd.png)

5. Renseigner les informations du site :

- **Titre :** BTS SIO
- **Identifiant admin :** Patis
- **Mot de passe :** Bitwarden (`WP ADMIN – Patis`)
- **E-mail :** [btssio@plc-sio.fr](mailto:btssio@plc-sio.fr) (à modifier si besoin)
	![Installation étape 1](https://raw.githubusercontent.com/FireToak/medias/main/ap-bts-sio/website-plc/mission-2/4-conf-wp.png)

6. Cliquer sur **Installer**. 
    ![Installation étape 1](https://raw.githubusercontent.com/FireToak/medias/main/ap-bts-sio/website-plc/mission-2/4-lancer-installation.png)

---

## Bibliographie

- Documentation IT-Connect – Installation de WordPress
- Ionos – Installation et gestion de MariaDB/MySQL