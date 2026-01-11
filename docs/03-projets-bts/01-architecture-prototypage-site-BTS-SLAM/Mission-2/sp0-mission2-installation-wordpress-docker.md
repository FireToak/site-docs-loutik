# Installation serveur WordPress (docker)

**SP 0 : Architecture de prototypage pour le site du BTS réalisé par les SLAM**

**Mission 2 : Paramétrage d'un protype du serveur Web et FTP pour l'hébergement du site** 

![Logo BTS SIO Lycée Paul-Louis Courier](pathname:///img/logo_bts-sio.png)

---

## Informations générales

* Date de création : 06/11/2025
* Dernière modification : 06/11/2025
* Auteur(s) : MEDO Louis
* Version : 1

---

## Objectif

Cette procédure a pour but de démontrer comment installer et configurer le service WordPress en utilisant Docker et Docker Compose.

---

## Prérequis

* Docker installé
* Connaissances de base en Linux

---

## Sommaire
- A. Étape 1 : Création du script Docker Compose
- B. Étape 2 : Accès au WordPress
- C. Étape 3 : Vérification
- D. Explication réseau Docker

---

## A. Étape 1 : Création du script Docker Compose

1. Créer un dossier **wordpress** dans `/home`

```bash
cd /home
mkdir wordpress
cd wordpress
vim docker-compose.yml
```

2. Script Docker Compose pour un serveur WordPress utilisant une base de données MySQL

```yaml
services:

  wordpress:
    image: wordpress
    container_name: wordpress-sio
    restart: always
    ports:
      - 8080:80
    environment:
      WORDPRESS_DB_HOST: db
      WORDPRESS_DB_USER: ${db_user}
      WORDPRESS_DB_PASSWORD: ${db_user_password}
      WORDPRESS_DB_NAME: bd-wp-btssio
    volumes:
      - wordpress:/var/www/html

  db:
    image: mysql:8.0
    container_name: db-wordpress-sio
    restart: always
    environment:
      MYSQL_DATABASE: bd-wp-btssio
      MYSQL_USER: ${db_user}
      MYSQL_PASSWORD: ${db_user_password}
      MYSQL_RANDOM_ROOT_PASSWORD: '1'
    volumes:
      - db:/var/lib/mysql

volumes:
  wordpress:
  db:
```

3. Créer un fichier `.env` à la racine du dossier pour stocker les identifiants de connexion de la base de données

```bash
touch .env
```

4. Rentrer les identifiants de base de données dans le fichier `.env`

```.env
db_user=votre_nom_utilisateur
db_user_password=votre_mot_de_passe
```

---

## B. Étape 2 : Accès

1. Accéder à l’adresse IP de la machine avec le port utilisé par WordPress (8080)

---

## C. Étape 3 : Vérification

1. Accéder à `/wp-admin`
2. Vérifier la configuration du titre, du fuseau horaire et des permaliens
3. Vérifier la sécurité du compte administrateur
4. Vérifier les droits d’écriture du dossier `uploads`
5. Mettre WordPress, les thèmes et les extensions à jour

---

## D. Explication réseau Docker

### 1. Fonctionnement du réseau Docker par défaut

Lorsque Docker Compose démarre des services, il crée automatiquement un réseau de type **bridge**.
Ce réseau agit comme un petit réseau local interne où tous les conteneurs peuvent communiquer entre eux.

Exemples de points importants :

* Les conteneurs dans un même fichier `docker-compose.yml` sont automatiquement connectés au même réseau.
* Chaque conteneur reçoit une adresse IP interne gérée par Docker.
* La communication se fait par **nom de service**, pas par adresse IP.

### 2. Explication du réseau dans ce projet WordPress

Dans le fichier Docker Compose :

```
WORDPRESS_DB_HOST: db
```

Le mot `db` correspond **au nom du service Docker**, pas à une adresse IP.
Grâce au réseau interne créé automatiquement par Compose :

* Le conteneur WordPress peut joindre la base MySQL simplement avec `db` comme un nom DNS.
* Le port MySQL 3306 n’a pas besoin d’être exposé vers l’extérieur.
* WordPress et MySQL communiquent uniquement dans le réseau interne, ce qui augmente la sécurité.

### 3. Mécanisme réseau avec WordPress et MySQL

* WordPress cherche la base MySQL à l’adresse `db:3306`.
* Le conteneur MySQL écoute sur son port interne 3306.
* Docker redirige automatiquement la communication interne entre les deux conteneurs.

### 4. Communication externe (accès depuis un navigateur)

Dans notre fichier :

```
ports:
  - 8080:80
```

Cela signifie :

* Port **80** interne du conteneur WordPress est la page web servie par Apache.
* Port **8080** est ouvert sur la machine hôte.
* On accède donc au site via :
  `http://adresse-ip:8080`

### 5. Résumé du flux réseau

**Navigateur → Machine hôte (port 8080) → Conteneur WordPress (port 80) → Conteneur MySQL (réseau interne Docker)**

---

## Bibliographie

* [Install Docker](https://docs.docker.com/engine/install/debian/)
* [Image WordPress Docker](https://hub.docker.com/_/wordpress)