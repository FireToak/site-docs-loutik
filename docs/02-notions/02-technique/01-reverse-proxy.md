---
title: Reverse Proxy
description: Qu'est-ce qu'un reverse proxy ?
---

## Qu'est-ce qu'un Reverse Proxy ?
Un **reverse proxy** ou serveur mandataire inverse (en français) est un serveur intermédiaire qui reçoit les requêtes des clients au nom d'un ou plusieurs serveurs backend. Contrairement à un proxy traditionnel qui agit pour le compte des clients, un reverse proxy agit pour le compte des serveurs.

## Fonctionnalités principales
Les reverse proxies offrent plusieurs fonctionnalités clés :

- **Répartition de charge (Load Balancing)** : Ils distribuent les requêtes entrantes entre plusieurs serveurs backend pour optimiser l'utilisation des ressources et améliorer les performances.
- **Sécurité** : Ils peuvent masquer l'adresse IP des serveurs backend, filtrer les requêtes malveillantes et fournir une couche supplémentaire de sécurité.
- **Cache** : Ils peuvent stocker en cache les réponses des serveurs backend pour réduire la charge et améliorer les temps de réponse.
- **SSL Termination** : Ils peuvent gérer le chiffrement SSL/TLS, déchargeant ainsi les serveurs backend de cette tâche (offloading SSL).

## Solutions de reverse proxy
Plusieurs solutions de reverse proxy sont couramment utilisées, notamment :
- **Nginx** : Un serveur web populaire qui peut également fonctionner comme un reverse proxy.
- **HAProxy** : Un logiciel de répartition de charge et de reverse proxy très performant.
- **Traefik** : Un reverse proxy moderne conçu pour les environnements de conteneurs et les microservices.
- **Apache HTTP Server** : Peut être configuré pour agir comme un reverse proxy à l'aide de modules spécifiques.