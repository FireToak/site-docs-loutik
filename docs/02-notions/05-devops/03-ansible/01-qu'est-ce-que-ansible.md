# Qu'est-ce qu'Ansible ?

---

## 1. Présentation générale

### 1.1 Origine

Créé par Michael DeHaan en 2012, racheté par Red Hat en 2015. C'est un outil majoritairement open-source (avec une version entreprise propriétaire nommée Ansible Automation Platform).

### 1.2 Définition technique

Ansible est un outil de gestion de configuration (Configuration Management) et d'automatisation des déploiements en mode déclaratif, fonctionnant sans agent (agentless).

### 1.3 La problématique résolue

Historiquement, les administrateurs exécutaient manuellement des scripts Bash serveur par serveur, créant une maintenance complexe et un fort taux d'erreur humaine. Ansible remplace ces scripts par une approche automatisée et idempotente, réduisant massivement le "toil" (travail manuel répétitif) sans nécessiter l'installation de logiciels supplémentaires sur les serveurs cibles.

---

## 2. Concepts clés et Vocabulaire

* **Playbook :** Fichier écrit en YAML décrivant l'état désiré de l'infrastructure. C'est la "recette" qui contient la liste des tâches à exécuter.
* **Inventory (Inventaire) :** Fichier (format INI ou YAML) listant les adresses IP ou les noms DNS des serveurs cibles, souvent organisés par groupes (ex: web, bdd).
* **Module :** Unité de code (souvent en Python) exécutant une action très spécifique (ex: `apt` pour gérer un paquet, `service` pour démarrer un démon, `copy` pour transférer un fichier).
* **Task (Tâche) :** L'appel d'un module unique avec ses paramètres spécifiques au sein d'un Playbook.
* **Role (Rôle) :** Structure de dossiers standardisée permettant de regrouper et de réutiliser des variables, des tâches et des fichiers (modularisation du code).

---

## 3. Architecture et Fonctionnement

### 3.1 Mécanique interne

Ansible fonctionne selon un modèle "Push" et "Agentless". Depuis un nœud de contrôle (Control Node), il lit le Playbook et l'inventaire, génère des mini-scripts Python correspondants aux tâches, et se connecte aux nœuds cibles (Managed Nodes) via le protocole standard SSH (ou WinRM pour Windows). Il transfère ces scripts, les exécute en mémoire pour atteindre l'état désiré (idempotence : si l'état est déjà correct, aucune action n'est effectuée), puis se déconnecte et supprime les scripts temporaires, garantissant une empreinte nulle sur la cible.

### 3.2 Schéma d'architecture

```text
+----------------+      git pull      +-------------------+
| Développeur/CI | -----------------> | Nœud de Contrôle  |
| (Git, GitLab)  |                    | (Ansible installé)|
+----------------+                    +-------------------+
                                        |   |   | (Modèle Push)
                            +-----------+   |   +-----------+
                      SSH / |               | SSH           | \ WinRM
                      Python|               | Python        |  \ PowerShell
                    +-------v-------+ +-----v---------+ +---v-----------+
                    | Serveur Linux | | Serveur Linux | | Serveur Windows|
                    | (Groupe: Web) | | (Groupe: BDD) | | (Groupe: AD)   |
                    +---------------+ +---------------+ +----------------+
```

---

## 4. Cas d'utilisation concret

**Contexte :** Une entreprise doit déployer un cluster de serveurs web Nginx avec une configuration sécurisée et des certificats SSL fraîchement générés. 

**Mise en place SRE :** Au lieu de configurer chaque machine à la main, un pipeline CI/CD (ex: GitLab CI) déclenche automatiquement un Playbook Ansible lors d'un "commit". Ansible récupère les certificats chiffrés depuis un coffre-fort (Vault), se connecte aux nouvelles machines virtuelles via SSH, installe Nginx, pousse le fichier de configuration et redémarre le service. Si le Playbook est relancé le lendemain, Ansible détecte que Nginx est déjà installé et configuré (idempotence) et ne modifie rien, garantissant la fiabilité et la prédictibilité de l'infrastructure sans intervention humaine.

---

## 5. Mise en pratique (Pareto 80/20)

* `ansible-playbook -i inventory.ini deploy.yml --check` : Exécute un Playbook complet sur une infrastructure.
  * `-i inventory.ini` : Indique le chemin vers le fichier d'inventaire définissant les cibles.
  * `deploy.yml` : Spécifie le fichier YAML contenant les tâches à exécuter.
  * `--check` : Lance l'exécution en mode "Dry Run" (simulation). Valide ce qui *serait* modifié sans appliquer les changements réellement (essentiel pour la sécurité et les revues de code).

* `ansible all -m ping` : Commande ad-hoc pour vérifier la communication avec les cibles.
  * `all` : Cible absolument tous les serveurs listés dans l'inventaire.
  * `-m ping` : Fait appel au module `ping` pour vérifier la connectivité SSH et s'assurer qu'un interpréteur Python est utilisable sur la cible.

* `ansible-vault encrypt secrets.yml` : Chiffre un fichier contenant des données sensibles (mots de passe, tokens API).
  * `encrypt` : Action ordonnant le chiffrement au format AES256.
  * `secrets.yml` : Fichier cible qui sera remplacé par sa version chiffrée.

* `ansible-playbook site.yml --tags "nginx" --limit "prod"` : Exécution très ciblée pour gagner du temps et limiter les risques.
  * `site.yml` : Playbook global de l'entreprise.
  * `--tags "nginx"` : Ignore toutes les tâches sauf celles explicitement marquées avec l'étiquette "nginx".
  * `--limit "prod"` : Restreint l'exécution au seul groupe d'hôtes nommé "prod" dans l'inventaire.

* `ansible-galaxy install -r requirements.yml` : Télécharge et installe des rôles externes (comme un gestionnaire de paquets).
  * `install` : Action d'installation de composants.
  * `-r requirements.yml` : Pointe vers le fichier listant les dépendances (noms des rôles et versions) à télécharger depuis le dépôt central Ansible Galaxy ou un dépôt Git.

---

## 6. État de l'art et Bonnes Pratiques

* **Sécurité :**
  * Ne jamais versionner de secrets en clair sur Git. Toujours utiliser `Ansible Vault` pour chiffrer les variables sensibles, ou coupler Ansible avec des outils externes spécialisés comme HashiCorp Vault.

* **Maintenabilité :**
  * Toujours découper ses Playbooks monolithiques en **Rôles** indépendants, versionnés et réutilisables, en suivant scrupuleusement la structure de dossiers standard d'Ansible.

* **Anti-pattern :** 
  * Abuser des modules `command` ou `shell`. Exécuter des commandes Linux brutes (ex: `shell: apt-get install nginx`) casse l'idempotence native d'Ansible, car le script tentera de se réinstaller à chaque exécution. Il faut impérativement utiliser les modules dédiés (ex: module `apt`, `yum` ou `package`) qui vérifient d'abord l'état du système.