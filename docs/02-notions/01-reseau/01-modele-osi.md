---
title: Modèle OSI
description: Présentation et explication du modèle OSI (Open Systems Interconnection) en réseau informatique.
---

## Présentation du modèle OSI
Le modèle OSI (Open Systems Interconnection) est un cadre conceptuel utilisé pour comprendre et standardiser les fonctions d'un système de communication en réseau. Il divise les processus de communication en sept couches distinctes, chacune ayant des responsabilités spécifiques.

## Les 7 couches du modèle OSI
1. **Couche Physique (Layer 1)**  
   - Responsable de la transmission des bits bruts sur un support physique (câbles, fibres optiques, ondes radio).
   - Exemples : câbles Ethernet, hubs, répéteurs.

2. **Couche Liaison de Données (Layer 2)**
    - Gère la communication entre les nœuds sur un même réseau local.
    - Assure la détection et la correction des erreurs de transmission.
    - Exemples : commutateurs (switches), protocoles Ethernet, PPP.

3. **Couche Réseau (Layer 3)**
    - Responsable de l'acheminement des paquets de données entre différents réseaux.
    - Gère l'adressage logique et la sélection des routes.
    - Exemples : routeurs, protocoles IP (IPv4, IPv6).

4. **Couche Transport (Layer 4)**
    - Assure la livraison fiable des données entre les hôtes.
    - Gère le contrôle de flux, la segmentation et la réassemblage des données.
    - Exemples : TCP, UDP.

5. **Couche Session (Layer 5)**
    - Gère les sessions de communication entre les applications.
    - Établit, maintient et termine les connexions.
    - Exemples : protocoles RPC, NetBIOS.

6. **Couche Présentation (Layer 6)**
    - Traduit les données entre le format utilisé par l'application et le format de transmission.
    - Gère le chiffrement, la compression et la conversion de données.
    - Exemples : SSL/TLS, formats de données (JPEG, ASCII).

7. **Couche Application (Layer 7)**
    - Fournit des services de réseau directement aux applications utilisateur.
    - Gère les protocoles de haut niveau pour les communications.
    - Exemples : HTTP, FTP, SMTP, DNS.

## Conclusion
Le modèle OSI est un outil essentiel pour comprendre comment les données circulent à travers un réseau. En divisant les fonctions de communication en couches distinctes, il facilite la conception, le dépannage et l'interopérabilité des systèmes de réseau. Chaque couche joue un rôle crucial dans le processus global de communication, assurant que les données sont transmises efficacement et de manière fiable entre les dispositifs connectés. Cependant, dans la pratique, le modèle OSI est souvent comparé au modèle TCP/IP, qui est plus représentatif des protocoles utilisés sur Internet aujourd'hui.