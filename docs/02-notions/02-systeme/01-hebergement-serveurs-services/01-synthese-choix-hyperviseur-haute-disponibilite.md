---
title: Choix d'un hyperviseur de type 1 et architecture de haute disponibilité
description: Synthèse du choix d'un hyperviseur de type 1 et d'une architecture de haute disponibilité. Cours BTS SIO - Paul-louis Courier
---

---
## Présentation de la problématique

Lorsqu'une organisation (comme par exemple la société IMDEO gérant le pôle numérique d'un grand groupe ) renouvelle son infrastructure, elle doit garantir que ses services informatiques fonctionnent sans interruption. Le remplacement d'une ferme de serveurs pose un double enjeu : choisir un système capable d'héberger efficacement de multiples serveurs virtuels (comme une centaine de machines Windows et Linux ) et concevoir une architecture matérielle et logicielle robuste. L'objectif est d'éviter tout point de défaillance unique (SPOF) afin d'assurer une haute disponibilité et une continuité de service.

## Les solutions

Le choix d'un hyperviseur de type 1 dépend des compétences internes, du budget et des besoins en fonctionnalités avancées. Voici un comparatif des solutions majeures du marché :

|**Solution (Hyperviseur)**|**Description et spécificités**|
|---|---|
|**VMware vSphere (ESXi)**|Leader historique. Très robuste, riche en fonctionnalités d'entreprise, mais coût de licence élevé.|
|**Microsoft Hyper-V**|Intégré à l'écosystème Windows Server. Idéal si l'entreprise dispose déjà de licences Microsoft Datacenter.|
|**Proxmox VE**|Solution Open Source basée sur Debian (KVM/LXC). Gratuite à l'utilisation, avec un support technique payant en option.|
|**Nutanix (AHV)**|Axé sur l'hyperconvergence (HCI). Simplifie la gestion en fusionnant calcul, stockage et réseau, mais nécessite un investissement matériel spécifique.|
|**XCP-ng / Xen**|Alternative Open Source performante basée sur Xen, souvent associée à l'interface de gestion Xen Orchestra.|

## Les concepts

### Hyperviseur de type 1 (Bare-Metal)

Un hyperviseur de type 1 est un système d'exploitation allégé qui s'installe directement sur le matériel physique du serveur (le _bare-metal_).

- Il contrôle directement les ressources physiques (CPU, RAM, stockage, réseau) pour les allouer aux machines virtuelles (VM).
- Contrairement à un hyperviseur de type 2 (comme VirtualBox qui s'installe sur un OS classique comme Windows), le type 1 offre des performances optimales et une latence réduite, indispensables en production.

### Haute Disponibilité (HA - High Availability)

La Haute Disponibilité est un mécanisme d'architecture garantissant qu'un service reste accessible même en cas de panne d'un composant.

- **Le principe de cluster :** Les serveurs physiques (nœuds) sont regroupés. Si un serveur physique tombe en panne, l'hyperviseur redémarre automatiquement les machines virtuelles affectées sur un autre serveur sain du cluster.
- **Prérequis :** Pour que cela fonctionne, les nœuds doivent posséder des caractéristiques matérielles suffisantes (ex: 60 cœurs CPU et 1,5 To de RAM répartis ) et avoir accès à un espace de stockage commun.

### Réseau de Stockage (SAN - Storage Area Network)

Pour assurer la mobilité des VM entre les serveurs physiques, leurs disques virtuels ne doivent pas être stockés localement, mais sur un réseau dédié.

- Le SAN est un réseau de stockage indépendant à très haut débit qui relie les serveurs à des baies de disques.
- Il permet à tous les hyperviseurs du cluster d'accéder simultanément aux mêmes données (les disques virtuels des VM). Ainsi, si un serveur physique meurt, un autre peut reprendre la VM là où elle s'est arrêtée.

### Tolérance aux pannes matérielles (Redondance)

Pour assurer la continuité, chaque composant physique du serveur doit être doublé (redondant) :

- **Stockage local (OS) :** Utilisation de grappes RAID pour tolérer la perte d'un disque physique hébergeant l'hyperviseur.
- **Réseau :** Multiplication des cartes réseaux (ex: 4 ports 10 Gbits et 4 ports 1 Gbits ) reliées à des commutateurs différents.
- **Énergie :** Double alimentation électrique branchée sur des onduleurs distincts pour pallier les coupures de courant.

## Conclusion

Pour garantir la continuité de service d'une entreprise, l'installation d'un hyperviseur de type 1 (comme Proxmox, VMware ou Hyper-V ) ne suffit pas à elle seule. Il est impératif de concevoir une architecture en cluster adossée à un stockage partagé (SAN) et de redonder l'ensemble des composants physiques (réseau, alimentation, disques). C'est cette combinaison matérielle et logicielle qui permet de construire une infrastructure véritablement hautement disponible.