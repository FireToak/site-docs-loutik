---
title: Investissement et usages des architectures SAN et NAS
description: Synthèse sur l'investissement et usages des architectures SAN et NAS. Cours BTS SIO - Paul-louis Courier
---

---
## Présentation de la problématique

Dans le cadre d'une évolution d'infrastructure, comme le remplacement d'une ferme de serveurs de virtualisation, la question du stockage est centrale. L'objectif est de garantir la haute disponibilité, les performances et la sécurité des données. Face à des besoins importants (ex: 50 To pour les machines virtuelles et 80 To pour les sauvegardes ), le stockage local (dans le serveur) montre ses limites. Il faut alors se demander : est-il pertinent d’investir dans un SAN ou un NAS? Et pour quels usages précis?

Le choix entre ces deux technologies dépend de la nature des données à stocker (fichiers vs blocs) et des exigences en matière de vitesse et de budget.

## Les solutions

Voici un comparatif des solutions pour répondre à cette problématique d'infrastructure :

| **Critère**                        | **Serveur de stockage NAS**                                             | **Réseau de stockage SAN**                                                   |
| ---------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **Type de stockage**               | Fichier (File-level)                                                    | Bloc (Block-level)                                                           |
| **Réseau utilisé**                 | Réseau IP standard (LAN)                                                | Réseau dédié haute vitesse (Fibre Channel, iSCSI)                            |
| **Protocoles**                     | SMB/CIFS, NFS                                                           | FC, iSCSI, FCoE                                                              |
| **Coût & Complexité**              | Modéré / Simple à administrer                                           | Très élevé / Complexe                                                        |
| **Usage pertinent (Cas pratique)** | Hébergement de sauvegardes déportées. Partage de fichiers utilisateurs. | Stockage mutualisé pour hyperviseurs. Hébergement des disques virtuels (VM). |

## Les concepts

### Le NAS (Network Attached Storage)

Un NAS est un équipement de stockage connecté au réseau local (LAN) qui met des fichiers à disposition des utilisateurs et des serveurs.

- **Fonctionnement :** Il gère lui-même son système de fichiers. Les clients lui demandent un fichier complet, et non des blocs de données brutes.
- **Usage dans une infrastructure :** Il est parfait pour le stockage de masse peu coûteux, le partage de documents et l'archivage. Dans notre contexte, un NAS est l'équipement idéal pour stocker les réplicas de sauvegardes dans un bâtiment distant , afin de respecter la règle du 3-2-1 (3 copies, 2 supports, 1 hors ligne).

### Le SAN (Storage Area Network)

Un SAN n'est pas un simple boîtier, c'est un réseau de stockage dédié et isolé regroupant des baies de disques.

- **Fonctionnement :** Contrairement au NAS, le SAN fournit des volumes de stockage bruts ("en mode bloc"). Le serveur (l'hyperviseur) qui s'y connecte le formate avec son propre système de fichiers (ex: VMFS pour VMware). Le serveur voit l'espace de stockage distant exactement comme si c'était un disque dur physique branché à l'intérieur de son propre châssis.
- **Usage dans une infrastructure :** Le SAN est indispensable pour la virtualisation à grande échelle. Il permet de stocker les disques durs des machines virtuelles (les 50 To requis ) sur des disques ultra-rapides (SSD/NVME ou SAS). C'est ce stockage partagé en mode bloc qui permet la haute disponibilité: si un serveur physique tombe en panne, un autre serveur peut redémarrer la VM instantanément, car ils accèdent tous au même SAN.

### La Haute Disponibilité (HA) et la Tolérance aux pannes

Ces deux concepts sont souvent confondus mais sont complémentaires dans le stockage :

- **Tolérance aux pannes (RAID) :** Concerne le matériel physique. Si un disque dur lâche au sein du NAS ou du SAN, les données ne sont pas perdues grâce à la redondance des autres disques.
- **Haute Disponibilité (HA) :** Concerne le service. Un SAN disposant d'une double alimentation et de doubles contrôleurs assure que le stockage reste toujours accessible aux hyperviseurs, garantissant une continuité de service maximale.

## Conclusion

L'investissement dans un NAS et un SAN est totalement pertinent, mais pour des usages strictement différents. Le **SAN** est le moteur performant de la production : il stocke les blocs de données des machines virtuelles et assure la haute disponibilité des hyperviseurs. Le **NAS**, quant à lui, est le coffre-fort capacitaire : il permet d'archiver les données et d'externaliser les sauvegardes à moindre coût dans un autre bâtiment pour garantir la reprise d'activité en cas de sinistre.