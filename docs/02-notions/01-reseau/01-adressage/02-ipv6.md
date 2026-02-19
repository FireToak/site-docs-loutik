---
title: Présentation de l'IPv6
description: Présentation et explication de l'IPv6.
---

## Présentation générale

L'**IPv6** (*Internet Protocol version 6*) est le successeur de l'IPv4. Contrairement à son prédécesseur codé sur 32 bits, l'IPv6 est codé sur **128 bits**. Cette longueur permet de passer d'environ 4 milliards d'adresses à 3,4×1038 adresses.

**Format d'écriture :**

* Notation en **hexadécimal** (8 blocs de 16 bits séparés par des `:`).
* Exemple : `2001:0db8:0000:85a3:0000:0000:ac1f:8001`
* **Simplification :** On peut supprimer les zéros en tête (`0db8` -> `db8`) et remplacer une suite de zéros consécutifs par `::` (une seule fois par adresse).

---

## La problématique

Le déploiement de l'IPv6 répond à trois enjeux majeurs du référentiel :

1. **Pénurie d'adresses IPv4 :** L'épuisement des adresses publiques IPv4 a rendu nécessaire un espace d'adressage quasi illimité.
2. **Fin du NAT "obligatoire" :** En IPv4, le NAT est utilisé pour économiser les adresses. En IPv6, chaque équipement peut avoir sa propre IP publique, facilitant les communications de bout en bout (IoT, VoIP).
3. **Optimisation des performances :** L'en-tête IPv6 est simplifié pour être traité plus rapidement par les routeurs.

---

## Les concepts clés du référentiel

### 1. Types d'adresses (Les Scopes)

Il est crucial de savoir les identifier selon leurs premiers bits :

* **Unicast Global (GUA) :** Débute par `2000::/3`. Ce sont les adresses routables sur Internet.
* **Lien Local (Link-Local) :** Débute par `fe80::/10`. Utilisée pour le voisinage sur un même segment réseau.
* **Unique Local (ULA) :** Débute par `fc00::/7`. Équivalent des adresses privées IPv4 (souvent `fd00::/8`).
* **Multicast :** Débute par `ff00::/8`. **Note importante :** Le broadcast n'existe pas en IPv6, tout passe par le multicast.

### 2. Attribution d'adresses

* **SLAAC (*Stateless Address Autoconfiguration*) :** La machine s'auto-configure sans serveur. Elle reçoit le préfixe du routeur et génère son identifiant d'interface.
* **EUI-64 :** Méthode pour créer l'identifiant d'interface à partir de l'adresse MAC (insertion de `ff:fe` au milieu et inversion du 7ème bit).
* **DHCPv6 :**
* *Stateless :* Le client prend son IP via SLAAC mais demande au DHCP les serveurs DNS.
* *Stateful :* Le serveur gère et distribue tout (comme en IPv4).



### 3. Le protocole NDP (*Neighbor Discovery Protocol*)

Il remplace l'ARP de l'IPv4. Il utilise des messages ICMPv6 :

* **NS / NA (*Neighbor Solicitation / Advertisement*) :** Pour trouver l'adresse MAC d'un voisin.
* **RS / RA (*Router Solicitation / Advertisement*) :** Pour qu'une machine trouve son routeur et obtienne son préfixe.

### 4. Coexistence avec l'IPv4

Les mécanismes de transition à connaître :

* **Dual Stack :** L'équipement fait tourner IPv4 et IPv6 en même temps.
* **Tunneling (6to4) :** On encapsule un paquet IPv6 dans un paquet IPv4.