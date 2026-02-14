# Note de synthèse sur le choix du logiciel de gestion de tickets

**SP 0 : Architecture de prototypage pour le site du BTS réalisé par les SLAM**

**Mission 4 : Note de synthèse sur le choix du logiciel de gestion de tickets**

![Logo BTS SIO Lycée Paul-Louis Courier](/img/docs/projets-bts/site-bts/logo_bts-sio.png)

---

## Informations générales

* **Date de création :** 11/11/2025
* **Dernière modification :** 11/11/2025
* **Auteur :** MEDO Louis
* **Version :** 1

---

## Sommaire

* A. Cahier des charges
* B. Étude des solutions
* C. Choix de la solution

---

## A. Cahier des charges

Le projet vise à mettre en place un logiciel de gestion de tickets afin de suivre les demandes et incidents techniques au sein du BTS SIO.
Le logiciel devra être libre, auto-hébergé et compatible Linux, tout en restant simple à déployer et à maintenir.

### Non flexible :

| Exigence           | Description                                                         | Flexibilité  |
| ------------------ | ------------------------------------------------------------------- | ------------ |
| Compatible Linux   | Le logiciel doit être déployé sur un serveur Linux (Debian/Ubuntu). | Non flexible |
| Gratuit            | Aucun coût de licence pour rester dans les contraintes du projet.   | Non flexible |
| Self-hosted        | Le service doit être hébergé localement (on-premise).               | Non flexible |
| Gestion de tickets | Fonctionnalité centrale du projet, indispensable.                   | Non flexible |
| Interface web      | Accessible depuis un navigateur pour tous les utilisateurs.         | Non flexible |
| SSO                | Le logiciel doit permettre les connexions via le SSO du projet.     | Non flexible |

### Flexible :

| Exigence                        | Description                                          | Flexibilité |
| ------------------------------- | ---------------------------------------------------- | ----------- |
| Disponible en Docker            | Pour faciliter l'installation et la maintenance.     | Flexible    |
| Statistiques                    | Suivi des performances et indicateurs d’utilisation. | Flexible    |
| Mode sombre / interface moderne | Amélioration de l’expérience utilisateur.            | Flexible    |

---

## B. Étude des solutions

### Tableau comparatif des solutions

| Critère                             |           GLPI           |         Zammad        |           osTicket           |       Znuny (OTRS)       |         Redmine         |
| ----------------------------------- | :----------------------: | :-------------------: | :--------------------------: | :----------------------: | :---------------------: |
| **Compatible Linux**                |             ✅            |           ✅           |               ✅              |             ✅            |            ✅            |
| **Gratuit**                         |             ✅            |           ✅           |               ✅              |             ✅            |            ✅            |
| **Self-hosted**                     |             ✅            |           ✅           |               ✅              |             ✅            |            ✅            |
| **Gestion des tickets**             |             ✅            |           ✅           |               ✅              |             ✅            |   ✅ (issues ≈ tickets)  |
| **Interface web**                   |             ✅            |           ✅           |               ✅              |             ✅            |            ✅            |
| **SSO**                             |    ✅ (CAS, SAML, LDAP)   | ✅ (SAML, OAuth, LDAP) |  ⚠️ (plugins non officiels)  | ✅ (Kerberos, LDAP, SAML) | ⚠️ (plugins SAML/OAuth) |
| **Docker**                          |       ✅ (officiel)       |      ✅ (officiel)     |       ✅ (communautaire)      |     ✅ (communautaire)    |       ✅ (officiel)      |
| **Statistiques**                    |             ✅            |           ✅           |         ⚠️ (basique)         |             ✅            |     ✅ (via plugins)     |
| **Mode sombre / interface moderne** | ⚠️ (plugins disponibles) | ✅ (interface moderne) | ⚠️ (interface vieillissante) |       ⚠️ (ancienne)      |   ✅ (thèmes modernes)   |

✅ = Conforme ⚠️ = Partiellement conforme ❌ = Non conforme

---

## C. Choix de la solution

Après analyse des différentes solutions, GLPI s’impose comme le meilleur choix pour ce projet.
Cette solution respecte toutes les exigences non flexibles du cahier des charges :
elle est gratuite, open source, auto-hébergée, compatible Linux, et dispose d’une intégration SSO complète.

De plus, GLPI bénéficie d’une grande communauté, d’une documentation complète et d’un support actif.
Grâce à son image Docker officielle, le déploiement et la maintenance sont facilités, ce qui en fait une solution parfaitement adaptée à notre environnement d’infrastructure.

---

## Bibliographie

* [Site officiel de GLPI](https://www.glpi-project.org/en/)
* [Site officiel de Zammad](https://zammad.com/en)
* [Image Docker GLPI](https://hub.docker.com/r/glpi/glpi)
