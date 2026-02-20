---
title: Externalisation et hébergement Web
description: Synthèse sur l'externalisation et l'hébergement Web. Cours BTS SIO - Paul-louis Courier
---

---
## Présentation de la problématique

L'externalisation consiste à confier l'hébergement et la gestion d'applications ou d'infrastructures à un prestataire tiers. Cette démarche soulève plusieurs enjeux techniques, juridiques et financiers.

Dans le cas du groupe Hervé Consultant, la question se pose pour leur site vitrine, développé en interne sous Joomla 6. Ce site traite des données personnelles, imposant une conformité stricte au RGPD. Le choix de l'hébergement (Dédié, VPS, Mutualisé, CDN) doit permettre au développeur d'accéder aux fichiers web (HTML/CSS/PHP) et à la base de données MariaDB à tout moment , tout en garantissant la sécurité (authentification multifacteur, protection DoS/DDoS) et la disponibilité via des engagements contractuels forts.

## Les solutions

Voici un récapitulatif des solutions d'hébergement envisageables pour une application web telle que le site vitrine du groupe.

|**Type d'hébergement**|**Description**|**Avantages**|**Inconvénients**|
|---|---|---|---|
|**Mutualisé**|Ressources partagées entre plusieurs clients sur un même serveur.|Économique, maintenance gérée par l'hébergeur.|Performances limitées, aucun accès d'administration profond.|
|**VPS (Serveur Privé Virtuel)**|Machine virtuelle allouée à un client avec ses propres ressources dédiées.|Bon compromis coût/performance, liberté d'administration (accès root).|Nécessite des compétences en administration système.|
|**Serveur Dédié**|Serveur physique entièrement loué par un seul client.|Puissance maximale, contrôle total, isolement physique.|Coût élevé, gestion matérielle et logicielle à la charge du client.|
|**CDN (Content Delivery Network)**|Réseau de serveurs distribués pour mettre en cache le contenu (ex: Cloudflare, Akamai).|Accélère le chargement mondial, offre une protection DoS/DDoS.|Ne remplace pas l'hébergement principal, ajoute une couche de complexité.|

## Les concepts

### Les modèles de services Cloud (IaaS, PaaS, SaaS)

L'externalisation s'appuie souvent sur le Cloud Computing, divisé en trois modèles :

- **IaaS (Infrastructure as a Service) :** Le fournisseur loue le matériel (serveurs, réseau, stockage). Vous gérez l'OS et les applications (ex: un VPS ou un serveur dédié).
- **PaaS (Platform as a Service) :** Le fournisseur gère le matériel et l'environnement d'exécution (OS, bases de données). Vous vous concentrez uniquement sur le code et l'application.
- **SaaS (Software as a Service) :** L'application est livrée clé en main et accessible via un navigateur web (ex: un webmail). L'hébergeur gère tout.

### Le choix de l'hébergement pour le site vitrine

Pour le groupe Hervé Consultant, le site repose sur NGINX, PHP 8.3 et MariaDB 11. Le développeur exige de pouvoir modifier les fichiers sources et accéder à la base de données librement.

- **Le serveur mutualisé** est à proscrire car il restreint trop l'accès à la configuration du serveur web.
- **Le VPS** est la solution la plus pertinente. Il offre l'accès complet nécessaire au développeur pour gérer NGINX et MariaDB, tout en gardant un coût maîtrisé pour un site vitrine.
- Un **CDN** peut être ajouté en façade pour assurer la protection DoS et DDoS requise.

### Les garanties contractuelles (SLA et Réversibilité)

Lorsqu'on externalise, le contrat est le seul filet de sécurité.

- **SLA (Service Level Agreement) :** C'est l'engagement de niveau de service. Le prestataire doit ici garantir une disponibilité (uptime) de 99 % par an. Des pénalités financières s'appliquent si ce seuil n'est pas atteint.
- **Clause de réversibilité :** Elle est indispensable. Elle oblige l'hébergeur à restituer l'intégralité des données et de l'application (Joomla et MariaDB) dans un format exploitable à la fin du contrat. Cela évite la dépendance (vendor lock-in).

### Sécurité et Sauvegarde Externalisée

Externaliser ne dispense pas de sécuriser. L'hébergeur doit permettre une stratégie de sauvegarde stricte (règle du 3-2-1) et protéger l'accès à ses plateformes par une authentification multifacteur (MFA). De plus, pour respecter le RGPD, l'accès aux données personnelles de la base de données doit être strictement limité aux personnes autorisées.

## Conclusion

L'externalisation est pertinente lorsqu'une entreprise cherche à garantir une haute disponibilité sans investir massivement dans du matériel physique. Pour un site vitrine nécessitant de la flexibilité, un serveur VPS couplé à un CDN représente le meilleur choix technique. Cependant, la réussite de ce projet repose avant tout sur un contrat solide, exigeant un SLA de 99 % , une clause de réversibilité claire et un hébergeur conforme aux exigences du RGPD.