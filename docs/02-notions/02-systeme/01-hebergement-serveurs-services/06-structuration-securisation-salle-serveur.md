---
title: Stratégie de sauvegarde des machines virtuelles
description: Synthèse sur la stratégie de sauvegarde des machines virtuelles. Cours BTS SIO - Paul-louis Courier
---

---
## Présentation de la problématique

La mise en place d'une salle serveur est une étape critique dans l'évolution de l'infrastructure d'une entreprise. L'objectif principal est de garantir l'hébergement et la disponibilité continue des applications internes et des services. La réflexion doit porter sur l'emplacement physique optimal, la prévention rigoureuse des sinistres (dégâts des eaux, incendies, surchauffe, pannes électriques) et le contrôle strict des habilitations d'accès. Une mauvaise conception de cette salle expose l'entreprise à une interruption totale de son système d'information.

## Les solutions

| **Enjeu / Risque**     | **Solutions Techniques et Organisationnelles**                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Emplacement**        | Choix d'une zone hors d'eau (pas de sous-sol), sans passage de conduites d'eau, isolée des zones de grand passage. |
| **Surchauffe**         | Climatisation redondante (N+1), urbanisation en allées chaudes / allées froides.                                   |
| **Pannes électriques** | Double alimentation des équipements, onduleurs, groupes électrogènes.                                              |
| **Incendie**           | Détecteurs de fumée à haute sensibilité, système d'extinction automatique par gaz inerte.                          |
| **Dégâts des eaux**    | Utilisation de faux planchers, installation de cordons détecteurs d'eau sous la salle.                             |
| **Habilitations**      | Badges RFID, biométrie, sas de sécurité, journalisation des accès.                                                 |

## Les concepts

### 1. Urbanisation et Climatisation

L'urbanisation désigne l'organisation physique et spatiale de la salle. Le choix de l'emplacement dans les bâtiments permet de limiter les risques extérieurs (inondations, effondrements).

- L'installation sur faux plancher permet de séparer les câblages et de propulser l'air froid sous les baies informatiques. * L'organisation en "couloirs froids" (face avant des serveurs) et "couloirs chauds" (face arrière) évite le mélange des flux thermiques, ce qui est indispensable pour lutter contre la surchauffe des équipements.

### 2. Continuité Électrique

Pour faire face aux pannes d'électricité et aux risques électriques, l'architecture doit éliminer tout point de défaillance unique (SPOF).

- Les équipements nécessitent une double alimentation reliée à des circuits distincts. * Les onduleurs prennent le relais instantanément en cas de coupure, offrant une autonomie de fonctionnement (par exemple de 15 minutes). Un groupe électrogène démarre ensuite pour les coupures plus longues.

### 3. Gestion des Habilitations et Sécurité Physique

La gestion des habilitations consiste à contrôler de manière stricte qui peut pénétrer dans cette zone critique.

- Le principe du moindre privilège s'applique : seuls les techniciens du service "Infrastructures systèmes et réseaux" (comme c'est le cas pour la société IMDEO) doivent posséder un accès physique.
- La sécurité s'appuie sur la traçabilité (savoir qui est entré et quand) via des systèmes de contrôle d'accès électroniques (badges, biométrie).

### 4. Protection Incendie et Dégâts des Eaux

La protection contre ces sinistres impose des dispositifs spécifiques pour ne pas détériorer le matériel informatique en cas d'intervention.

- En cas d'incendie, on n'utilise jamais d'eau. L'extinction se fait par la libération d'un gaz inerte (ex: FM-200, Argonite) qui abaisse le taux d'oxygène pour étouffer les flammes sans endommager la ferme de serveurs.
- Contre les dégâts des eaux, des capteurs d'hygrométrie déclenchent des alarmes avant même que l'eau n'atteigne le matériel.

## Conclusion

Structurer une salle serveur repose sur la redondance et l'anticipation. L'emplacement stratégique, le contrôle strict du climat (climatisation, flux d'air), la sécurité électrique continue (onduleurs) et une politique rigoureuse des habilitations sont les piliers fondamentaux. Ces éléments garantissent la haute disponibilité de l'infrastructure et la pérennité du système d'information de l'entreprise.