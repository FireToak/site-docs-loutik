---
title: Méthode de calcul VLSM - BTS SIO
description: Présentation et explication du VLSM.
---

---
## Présentation du VLSM

Le **VLSM** (*Variable Length Subnet Mask* ou Masque de Sous-Réseau à Longueur Variable) a été introduit en 1993 par l'IETF (notamment via la RFC 1519) pour optimiser l'utilisation des adresses IP.

Contrairement au découpage classique "classful" (Classes A, B, C) qui imposait des tailles fixes et gaspillait énormément d'adresses, le VLSM permet d'appliquer un masque différent à chaque sous-réseau au sein d'un même bloc d'adressage. C'est l'outil indispensable pour segmenter un réseau de manière chirurgicale.

## La problématique résolue

Avant le VLSM, si vous aviez besoin de 3 sous-réseaux, vous deviez utiliser le même masque pour tous.

* **Le problème :** Si un réseau a besoin de 50 hôtes et un autre de seulement 2, vous étiez obligé de leur allouer la même taille (par exemple 64 adresses).
* **La solution :** Le VLSM permet de "sous-découper" un sous-réseau. On évite ainsi la pénurie d'adresses IPv4 en adaptant la taille du contenant (le masque) au contenu (le nombre d'hôtes).

---

## Comment le réaliser ?

### Les fondamentaux à maîtriser

* **Adresse Réseau :** C'est l'identifiant du groupe. Elle ne peut pas être attribuée à une machine. Tous ses bits "hôte" sont à 0.
* **Masque de sous-réseau :** Une suite de 32 bits qui sépare la partie "Réseau" (les 1) de la partie "Hôte" (les 0).
* **CIDR (*Classless Inter-Domain Routing*) :** C'est la notation simplifiée du masque (ex: `/24`). Le chiffre indique le nombre de bits à 1.

### Méthodologie et Tableaux

**1. Inventaire des besoins**
| Nom du sous-réseau | Nombre d'hôtes réels |
| :--- | :--- |
| Compta | 50 |
| Commercial | 46 |
| Finance | 20 |

**2. Tableau d'adressage final (Trié par ordre décroissant)**

> **Note :** On trie toujours du plus grand besoin au plus petit pour éviter que les plages d'adresses ne se chevauchent.

| Nom | Réseau | Masque (CIDR) | 1ère @ utile | Dernière @ utile | Diffusion |
| --- | --- | --- | --- | --- | --- |
| **Compta** | 192.168.1.0 | /26 | 192.168.1.1 | 192.168.1.62 | 192.168.1.63 |
| **Commercial** | 192.168.1.64 | /26 | 192.168.1.65 | 192.168.1.126 | 192.168.1.127 |
| **Finance** | 192.168.1.128 | /27 | 192.168.1.129 | 192.168.1.158 | 192.168.1.159 |

---

### Calculer un sous-réseau (Exemple : Compta - 50 hôtes)

#### 1. Trouver la puissance de 2

On cherche  (le nombre de bits hôtes) tel que :


*  (Trop petit pour 50)
*  (C'est bon !) -> **On réserve 6 bits pour les hôtes.**

| Valeur | 128 | 64 | 32 | 16 | 8 | 4 | 2 | 1 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **Puissance** | 7 | 6 | 5 | 4 | 3 | 2 | 1 | 0 |

#### 2. Calculer le masque CIDR

Une adresse IPv4 fait 32 bits. Si on utilise 6 bits pour les hôtes, le reste appartient au réseau :

* 32 - 6 = 26
* **Résultat : /26**

#### 3. Masque décimal pointé

On passe les 26 premiers bits à 1, le reste à 0 :
`11111111.11111111.11111111.11000000`

* Les trois premiers octets valent **255**.
* Le dernier : .
* **Résultat : 255.255.255.192**

#### 4. Adresse de Diffusion (Broadcast)

L'adresse de diffusion est la dernière adresse du bloc. Pour la trouver, on prend l'adresse réseau et on passe tous les bits "hôtes" (les 6 derniers) à 1.

* Réseau : `... .00000000` (192.168.1.0)
* Diffusion : `... .00111111` (Le `111111` binaire vaut 63 en décimal).
* **Résultat : 192.168.1.63**

#### 5. Plage d'hôtes utiles

* **Première @ :** Adresse Réseau + 1 = `192.168.1.1`
* **Dernière @ :** Adresse Diffusion - 1 = `192.168.1.62`

---