---
title: Choix du type et du nombre de serveurs physiques
description: Synthèse choix du type et du nombre de serveurs physiques. Cours BTS SIO - Paul-louis Courier
---

---
## Présentation de la problématique

L'évolution d'une infrastructure nécessite de choisir du matériel capable de supporter la charge de travail actuelle tout en anticipant les besoins futurs. La problématique centrale consiste à déterminer la forme physique (tour, rack ou lame) et la quantité de serveurs nécessaires pour héberger les services d'une organisation.

Ce choix ne dépend pas uniquement de la puissance brute, mais implique des enjeux d'encombrement spatial, de refroidissement, d'évolutivité et de tolérance aux pannes. À titre d'exemple, une entreprise devant héberger une centaine de machines virtuelles impose obligatoirement la mise en place d'une haute disponibilité. Il faut donc répartir la charge (par exemple, un minimum de 60 cœurs physiques et 1,5 To de RAM DDR5 ECC) sur plusieurs machines matérielles pour éviter un point de défaillance unique (SPOF).

## Les solutions

Le choix du facteur de forme (form factor) dépend directement de la taille de l'infrastructure et de la salle d'hébergement.

|**Type de Serveur**|**Description**|**Avantages**|**Inconvénients**|**Cas d'usage**|
|---|---|---|---|---|
|**Serveur Tour (Tower)**|Boîtier indépendant similaire à un PC de bureau massif.|Silencieux, ne nécessite pas d'armoire spécifique (baie), coût initial faible.|Encombrant, gestion des câbles complexe, faible densité.|TPE/PME sans salle informatique dédiée, bureaux isolés.|
|**Serveur Rack**|Serveur plat conçu pour être empilé dans une armoire standardisée (mesuré en Unités 'U').|Excellente densité, évolutivité simple, standardisation, gestion des flux d'air optimisée.|Nécessite une baie de brassage/serveur, bruyant.|Datacenters, PME/ETI nécessitant une salle serveur classique.|
|**Serveur Lame (Blade)**|Carte électronique (lame) ultra-compacte s'insérant dans un châssis mutualisant l'alimentation et le réseau.|Densité maximale, câblage drastiquement réduit, administration centralisée.|Coût d'entrée très élevé (achat du châssis), risque de surchauffe important.|Grandes entreprises, calcul haute performance (HPC), très grands datacenters.|

## Les concepts

### Le dimensionnement (Sizing) et la Haute Disponibilité (HA)

Pour répondre à la question "Combien de serveurs ?", il faut appliquer le principe de la redondance N+1 (voire N+2).

Si l'ensemble des services nécessite une puissance totale X, on ne choisit pas un seul gros serveur, mais plusieurs serveurs plus petits. Si l'un tombe en panne, les autres doivent pouvoir absorber la charge des machines virtuelles redémarrées.

- **Calcul de base :** Diviser les besoins globaux (ex: 60 cœurs, 1,5 To de RAM ) par les capacités d'un modèle de serveur, et ajouter au moins un nœud supplémentaire (N+1) pour garantir la continuité de service en cas de crash matériel.

### La Redondance Matérielle

Au-delà du nombre de serveurs, chaque machine physique doit intégrer ses propres sécurités pour éviter de s'éteindre à la moindre défaillance d'un composant.

- **Alimentation :** L'utilisation d'une double alimentation électrique connectée à des onduleurs distincts est indispensable pour maintenir le service.
- **Stockage local :** Le système d'exploitation de l'hyperviseur nécessite une tolérance aux pannes locale, généralement gérée par un contrôleur RAID matériel en miroir (RAID 1).

### L'Administration Hors Bande (Out-of-band management)

Lorsque l'on déploie une flotte de serveurs (en rack ou en lame), on ne branche plus d'écran ni de clavier directement dessus. On utilise des cartes de gestion à distance intégrées aux cartes mères.

- **Notion clé :** Les technologies comme **iDRAC** (Dell) ou **iLO** (HP) permettent d'administrer le serveur au niveau matériel. On peut allumer, éteindre, configurer le BIOS ou installer un OS à distance, même si le serveur est éteint ou que l'OS principal a planté, grâce à un port réseau dédié.

## Conclusion

Le choix du matériel est le socle de toute infrastructure système. Pour un environnement de virtualisation d'entreprise exigeant la haute disponibilité, les serveurs **rack** sont généralement le compromis idéal entre densité et coût, tandis que les **lames** sont réservées aux très grosses volumétries. Le nombre exact de serveurs physiques dépend du calcul des ressources totales nécessaires (CPU/RAM/Réseau) divisé par la capacité unitaire, auquel on ajoute systématiquement un ou plusieurs nœuds de secours (N+1) équipés de composants redondés et d'interfaces de gestion à distance.