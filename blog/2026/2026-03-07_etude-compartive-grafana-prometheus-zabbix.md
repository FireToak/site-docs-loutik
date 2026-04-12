---
slug: etude-comparative-grafana-prometheus-zabbix
title: "Étude comparative - Stack Prometheus/Grafana vs Zabbix"
authors: [louismedo]
tags: [devops, git]
date: 2026-03-08
---

Dans l'état de l'art de la gestion d'infrastructure, disposer d'une visibilité globale en temps réel est indispensable. La supervision permet de passer d'une gestion subie à une approche proactive. Par exemple, si le tableau de bord indique que le stockage de la machine virtuelle _bd01_ (hébergeant une base MySQL) atteint 70 %, l'équipe peut anticiper et allouer de l'espace supplémentaire bien avant la saturation, évitant ainsi une interruption de service.

{/* truncate */}
---
## A. Présentation des outils

### A.1. Prometheus/Grafana

**Prometheus** est un moteur de supervision moderne spécialisé dans la récolte de séries temporelles. Il fonctionne en mode "Pull", interrogeant activement des _exporters_ HTTP pour récupérer les métriques des systèmes.

**Grafana** est l'outil de visualisation qui s'y couple. Il transforme les données brutes de Prometheus en tableaux de bord interactifs et esthétiques.

_Note :_ Grafana étant agnostique, il est tout à fait possible de l'utiliser pour requêter l'API de Zabbix. Cela permet de conserver le moteur de collecte de Zabbix tout en bénéficiant de l'interface de rendu très supérieure de Grafana.

### A.2. Zabbix

**Zabbix** est une solution de supervision monolithique et tout-en-un (collecte, base de données relationnelle, alertes, IHM). Il s'appuie principalement sur des agents installés sur les équipements (serveurs, VM) ou sur des protocoles standards comme le SNMP pour interroger le matériel réseau.

---
## B. Les philosophies de chaque outil

### B.1. Prometheus/Grafana

La philosophie de cette stack est orientée **Cloud Native** et **décentralisation**. Elle est conçue pour des environnements extrêmement dynamiques (comme les microservices ou Docker/Kubernetes) où les ressources apparaissent et disparaissent en permanence. Les données sont organisées via un système de _labels_ (étiquettes) ultra-flexible, adapté à l'automatisation et au requêtage complexe (PromQL).

### B.2. Zabbix

La philosophie de Zabbix repose sur la **centralisation** et la **stabilité**. L'outil excelle dans la modélisation hiérarchique d'un système d'information classique (Hôte > Élément > Déclencheur). Il est pensé pour surveiller des composants à longue durée de vie, de la couche matérielle physique jusqu'à l'OS, via une gestion fine des droits et des utilisateurs.

---
## C. Tableau comparatif des fonctionnalités

|**Fonctionnalité**|**Prometheus + Grafana**|**Zabbix**|
|---|---|---|
|**Architecture**|Microservices, Base de données temporelle (TSDB)|Monolithique, Base de données relationnelle|
|**Collecte**|Pull (requêtes HTTP sur endpoints)|Hybride (Agents, Push/Pull, SNMP)|
|**Découverte**|Dynamique, orientée services (Service Discovery)|Classique, orientée réseau (Scans IP)|
|**Visualisation**|Interface externe avancée (Grafana)|Interface web intégrée (basique)|
|**Alerting**|Externe (Alertmanager), basé sur requêtes|Intégré, basé sur expressions mathématiques|
|**Configuration**|Fichiers texte YAML (Idéal pour l'Infra-as-Code)|Interface Web cliquable (IHM)|

---
## D. Les cas d'utilisation

**Quand choisir Prometheus/Grafana ?** 
Cette stack est le standard de facto si votre projet implique des conteneurs, de l'orchestration dynamique, ou du déploiement continu (CI/CD). Elle est idéale si nous avons besoin de suivre les métriques internes d'applications développées sur mesure et que nous souhaitons gérer toute notre infrastructure par du code (fichiers YAML).

**Quand choisir Zabbix ?** 
Zabbix est la référence si le périmètre du projet englobe une infrastructure d'entreprise classique. Il est le meilleur choix pour monitorer en profondeur des équipements réseau (switchs, routeurs Cisco/Aruba), des hyperviseurs, des serveurs physiques, et si l'équipe préfère paramétrer la supervision via une interface graphique unique de bout en bout.

---
## Ressources
- https://prometheus.io/
- https://grafana.com/
- https://www.zabbix.com/