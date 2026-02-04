---
title: Initialisation de Git
description: Documentation approfondie pour l'installation, la configuration et l'utilisation de Git avec GitHub. Inclut les mécanismes d'authentification, le cycle de vie des fichiers et la gestion des erreurs courantes.
---

# Initialisation de Git

## Présentation de Git

### Pourquoi le versioning ?

Dans un environnement de production, la gestion manuelle des versions (fichiers nommés `projet_final_v2.zip`) constitue un risque critique (perte de données, écrasement). Git répond à cette problématique en historisant chaque modification du code source. Il assure la traçabilité ("qui a fait quoi et quand"), la réversibilité des actions et permet la collaboration simultanée de plusieurs développeurs via des mécanismes de fusion.

### Architecture Décentralisée

Contrairement aux systèmes centralisés, Git est **décentralisé**. Chaque poste de travail dispose d'une copie autonome et intégrale de l'historique du projet. Les opérations courantes (commits, consultation de l'historique, changement de branche) s'effectuent localement, sans dépendance au réseau. La connexion internet est uniquement requise pour la synchronisation avec le dépôt commun (GitHub, GitLab).

### Le cycle de vie des fichiers (Les 3 zones)

La maîtrise de Git repose sur la compréhension du flux de données entre trois zones logiques distinctes :

```ascii
+----------------+         +----------------+            +----------------+          +----------------+
|   Working Dir  |         |  Staging Area  |            |   Repository   |          |     Remote     |
|   (Travail)    | ------> |     (Index)    | ---------> |     (Local)    | -------> |    (Serveur)   |
|  Vos fichiers  | git add | Zone de transit| git commit |   Historique   | git push | GitHub/GitLab  |
|    modifiés    |         |  Prêt à partir |            |     validé     |          |   Sauvegarde   |
+----------------+         +----------------+            +----------------+          +----------------+

```

---
## Prérequis

* Disposer d'un compte **GitHub** actif.
* Avoir un environnement de développement intégré (IDE) installé (Recommandation : Visual Studio Code).

---
## Installation de Git

### Méthode A : Environnement Windows (Interface Graphique)

> Cette section couvre le déploiement de la suite "Git for Windows", incluant l'émulateur Bash nécessaire pour exécuter les commandes Unix dans un environnement Microsoft.

1. **Téléchargement.** Récupérez l'exécutable certifié sur le site officiel [git-scm.com](https://git-scm.com/download/win).
2. **Configuration de l'installateur.** Durant l'installation, une vigilance particulière est requise à l'étape "Choosing the default editor used by Git".
* Action : Sélectionnez **Use Visual Studio Code as Git's default editor**.
* *Justification :* Facilite la rédaction des messages de commit et la résolution graphique des conflits de fusion.
* *Note :* Conservez les valeurs par défaut pour les autres options.

3. **Validation de l'installation.** Ouvrez un terminal (PowerShell) et exécutez le test de version :
```powershell
git --version
```

* `git` : Appel du programme principal.
* `--version` : Retourne le numéro de build, confirmant l'ajout correct aux variables d'environnement (PATH).

### Méthode B : Environnement Linux (CLI)

Sur les distributions basées sur Debian/Ubuntu, l'installation s'effectue via le gestionnaire de paquets APT.

1. **Mise à jour des référentiels.**
```bash
sudo apt update
```

* `sudo` : Exécution avec élévation de privilèges.
* `update` : Actualisation des index de paquets disponibles.

2. **Installation du paquet.**
```bash
sudo apt install git -y
```

* `install git` : Déploie le binaire Git.
* `-y` : Validation automatique des prompts pour l'automatisation.

---
## Configuration Globale

> L'identification de l'auteur est une étape obligatoire pour garantir la traçabilité (audit trail). Ces métadonnées sont scellées de manière immuable dans chaque commit.

1. **Paramétrage de l'identité.**
```bash
git config --global user.name "Prenom Nom"
git config --global user.email "email@exemple.com"
```

* `config` : Modifie les paramètres de Git.
* `--global` : Applique la configuration au niveau de la session utilisateur (fichier `~/.gitconfig`).
* `user.email` : **Point de vigilance :** Doit correspondre strictement à l'email de votre compte GitHub pour l'attribution des contributions.

---
## Authentification et Liaison GitHub

> Pour écrire sur un dépôt distant, votre machine doit être authentifiée. Cette section détaille les deux protocoles supportés : HTTPS (via Credential Manager) et SSH (Recommandé).

### Option A : Git Credential Manager (HTTPS)

> **Usage :** Méthode recommandée pour les débutants, reposant sur une authentification web standard via navigateur.

1. **Déclenchement.** Initiez une première commande réseau (ex: `git clone` ou `git push`). Une fenêtre "Git Credential Manager" apparaît.
2. **Connexion.** Sélectionnez "Sign in with your browser" et authentifiez-vous sur la page GitHub qui s'ouvre.
3. **Résultat.** Un jeton d'accès (OAuth token) est généré et stocké de manière sécurisée dans le gestionnaire d'identifiants Windows. Aucune ressaisie n'est nécessaire.

### Option B : Protocole SSH (Recommandé)

> **Usage :** Standard industriel privilégiant la cryptographie asymétrique. Cette méthode offre une sécurité accrue et facilite l'automatisation des flux sans intervention humaine.

1. **Génération de la paire de clés.**
```bash
ssh-keygen -t ed25519 -C "votre.email@exemple.com"
```

* `ssh-keygen` : Utilitaire de génération de clés.
* `-t ed25519` : Algorithme de courbe elliptique moderne (plus performant et sécurisé que RSA).
* `-C` : Étiquette (commentaire) pour identifier la clé.

2. **Récupération de la clé publique.**
```bash
cat ~/.ssh/id_ed25519.pub
```

* `.pub` : Extension désignant la clé publique (diffusable). **Ne jamais divulguer la clé privée.**

3. **Enregistrement sur GitHub.** Copiez la chaîne de caractères. Dans GitHub : **Settings > SSH and GPG keys > New SSH key**.

4. **Test de connectivité.**
```bash
ssh -T git@github.com
```

* `-T` : Désactive le pseudo-terminal (GitHub n'autorisant pas de Shell interactif).
* *Validation :* Le message "Hi [Username]! You've successfully authenticated" doit apparaître.

---
## Flux de travail (Workflow)

> Ce cycle opérationnel décrit les commandes essentielles pour transformer des modifications locales en une version partagée sur le serveur.

### 1. Initialisation d'un projet

Pour placer un répertoire sous contrôle de version :

```bash
git init
```

* `init` : Génère le dossier caché `.git` contenant la base de données relationnelle du projet.

### 2. Vérification de l'état (Audit)

Pour visualiser les modifications en cours et l'état de l'index :
```bash
git status
```

### 3. Indexation (Staging)

Sélection des fichiers à inclure dans la prochaine version (passage de "Working Dir" à "Staging Area") :

```bash
git add fichier.txt
# Ou pour indexer l'ensemble du dossier :
git add .
```

### 4. Validation (Commit)

Enregistrement définitif des modifications indexées dans l'historique local :

```bash
git commit -m "feat: Ajout de la navbar responsive"
```

* `-m` : Permet de spécifier le message de commit.
* **Bonne pratique :** Le message doit être impératif et décrire la valeur ajoutée fonctionnelle.

### 5. Synchronisation (Push)

Transfert de l'historique local vers le serveur distant :

```bash
git push -u origin main
```

* `push` : Envoi des objets vers le "remote".
* `-u` : (Upstream) Configure le suivi permanent entre la branche locale `main` et la branche distante.

---
## Gestion des anomalies et Rollback

> **Sécurité :** Git permet la réversibilité. Cette section distingue les actions non destructives (restauration de fichiers) des actions réécrivant l'historique (reset).

### Restauration de fichiers (Discard changes)

> **Cas d'usage :** Annuler des modifications non désirées sur un fichier pour revenir à son état lors du dernier commit.

```bash
git restore nom_du_fichier.txt
```

* `restore` : Écrase la version locale par la version stockée dans l'index. **Action irréversible pour les modifications non sauvegardées.**

### Correction du dernier commit (Soft Reset)

> **Cas d'usage :** Le commit a été effectué trop tôt ou contient une erreur, mais le travail doit être conservé pour rectification.

```bash
git reset --soft HEAD~1
```

* `--soft` : Annule le commit dans l'historique mais **conserve les fichiers modifiés** dans la zone de staging (Index).
* `HEAD~1` : Cible le parent immédiat de la version actuelle.

---
## Bibliographie

* [Documentation officielle (Livre Pro Git)](https://git-scm.com/book/fr/v2) - Référence des commandes.
* [GitHub Docs - Connexion SSH](https://docs.github.com/fr/authentication/connecting-to-github-with-ssh) - Procédure détaillée par OS.
* [Conventional Commits](https://www.conventionalcommits.org/) - Norme de rédaction des messages de commit.