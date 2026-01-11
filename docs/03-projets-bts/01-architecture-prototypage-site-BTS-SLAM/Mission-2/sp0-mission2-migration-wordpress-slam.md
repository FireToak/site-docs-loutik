# Migration WordPress SLAM vers SISR

**SP 0 : Architecture de prototypage pour le site du BTS réalisé par les SLAM**

**Mission 2 : Paramétrage d’un prototype du serveur Web et FTP pour l’hébergement du site**

![Logo BTS SIO Lycée Paul-Louis Courier](/img/logoSIO-fb.png)

---
## Informations générales

- **Date de création :** 08/01/2026
- **Dernière modification :** 08/01/2026
- **Auteur(s) :** MEDO Louis
- **Version :** 2.0

---
## Objectif

Réaliser la migration du site WordPress développé par l'équipe SLAM (environnement local/XAMPP) vers le serveur de production SISR (Linux/Debian).

---
## Prérequis

- Accès SSH au serveur de destination.
- Archive des sources et Dump SQL fournis par les SLAM.
- Serveur LAMP installé sur la destination.

---
## A. Serveur source : récupération des données (SLAM)

1. Les fichiers (Code source)
    
    Récupérer l'intégralité du dossier du site.
    
    - **Cas Windows (XAMPP) :**
        
	    Aller dans `C:\xampp\htdocs\nom_du_site`. Sélectionner tout le contenu, faire un clic-droit > "Envoyer vers dossier compressé" pour créer un site.zip.
        
    - **Cas Linux :**

        ```bash
        tar -czvf site_wp.tar.gz /var/www/html/monsite
        ```
        
2. **La base de données (Dump SQL)**
    
    - **Via PhpMyAdmin :** 
    
     Aller sur `http://localhost/phpmyadmin`, sélectionner la base, onglet **Exporter** > Format **SQL** > Exécuter.
        
    - **Via ligne de commande :**
        
        ```Bash
        mysqldump -u root -p nom_de_la_bdd > dump_bdd.sql
        ```
        
    - _Explication :_ `mysqldump` génère un fichier texte contenant les instructions SQL pour reconstruire la base à l'identique.

---
## B. Serveur Production : Installation de l'outillage (WP-CLI)

1. **Téléchargement et Installation**
    
    Installation de l'outil de gestion en ligne de commande pour WordPress.
    
    ```Bash
    curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
    chmod +x wp-cli.phar
    sudo mv wp-cli.phar /usr/local/bin/wp
    ```
    
    - _Explication :_ `chmod +x` rend le fichier exécutable. `mv` le déplace dans un dossier système (`/bin`) pour qu'il soit accessible partout via la commande `wp`.
        
2. **Vérification**
    
    ```Bash
    wp --info
    ```
    
    - **Vérification :** La commande doit retourner la version de WP-CLI et de PHP.

---
## C. Serveur Production : Déploiement du site

1. **Transfert et Permissions**
    
    Copier les fichiers dans le dossier web et attribuer les droits au serveur web.
    
    ```Bash
    cp -r /chemin/vers/fichiers/* /var/www/html/
    chown -R www-data:www-data /var/www/html/
    ```
    
    - _Explication :_ `chown -R` (Change Owner Recursive) donne la propriété des fichiers à l'utilisateur `www-data` (Apache/Nginx). Sans cela, WordPress ne peut pas écrire de fichiers ni se mettre à jour.
        
1. **Import de la Base de Données**
    
    Injecter les données du WordPress SLAM dans la base de données de production (ex: tilleul).
    
    ```Bash
    mysql -u nom_utilisateur_bd -p nom_bd < dump_bdd.sql
    ```
    
    - _Explication :_ Le signe `<` redirige le contenu du fichier SQL vers le moteur MySQL.
        
1. **Adaptation de la configuration (wp-config.php)**
    
    Éditer le fichier /var/www/html/wp-config.php avec les identifiants de la PROD.
    
    - `DB_NAME` : Votre nom de base de données
    - `DB_USER` : Votre utilisateur MySQL
    - `DB_PASSWORD` : Votre mot de passe fort

    - **Point de vigilance :** Vérifier la ligne `$table_prefix`. Si l'import contient des tables `wp_` mais que le fichier config a `py_`, changer pour :
        
        ```PHP
        $table_prefix = 'wp_';
        ```

---
## D. Finalisation et Correction des liens

1. **Search & Replace (Correction des URLs)**

Pour trouver le nom d'hôte de machine à changer, effectuer la commande suivante :
   
```bash
sudo wp db query "SELECT option_value FROM wp_options WHERE option_name = 'siteurl'" --allow-root --path='/var/www/html'
```
	
Remplacer l'adresse du poste de développement (souvent le nom de la machine sous Windows) par l'IP de production.
    
```Bash
sudo -u www-data wp search-replace 'http://S408P02/nom_site' 'http://172.16.51.1' --all-tables --path='/var/www/html'
```
	 
- _Explication :_
        
    - `sudo -u www-data` : Exécute en tant qu'utilisateur web (sécurité).
    - `--all-tables` : Force le scan de toutes les tables.
    - `--path` : Indique où se trouve le site.
            
2. **Régénération des Permaliens (.htaccess)**
    
    Corrige les erreurs 404 sur les pages internes.
    
    ```Bash
    sudo -u www-data wp rewrite structure '/%postname%/' --path='/var/www/html'
    ```
    
3. **Vérification finale**
    
    Accéder à http://172.16.51.1 en navigation privée. Vérifier que les images s'affichent et que les liens ne redirigent pas vers l'ancien poste SLAM.

---
## Bibliographie

- Documentation WP-CLI : [https://wp-cli.org/fr/](https://wp-cli.org/fr/)
- Documentation Debian (Permissions) : [https://wiki.debian.org/Permissions](https://www.google.com/search?q=https://wiki.debian.org/Permissions)

---