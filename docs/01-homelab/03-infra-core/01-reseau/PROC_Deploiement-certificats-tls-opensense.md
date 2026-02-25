---
sidebar_position: 4
title: Déploiement des certificats TLS via OPNsense (ACME)
description: Configuration du service Unbound DNS sur le pare-feu OPNsense pour le homelab LoutikCLOUD. L'objectif est de mettre en place une résolution locale pour accéder aux différentes interfaces d'administration via des noms de domaine personnalisés et lisibles, sans avoir à retenir les adresses IP.

# -------------------------------------------------------------------------
# 🎯 MODÈLE : ACTION (VIVANT)
# -------------------------------------------------------------------------
---

![Logo du projet Loutik](/img/logo_loutik.png)

---

:::info Métadonnées
* **Mainteneur :** MEDO Louis
* **Dernière validation technique :** 2026-02-25
:::

---
## A. Contexte

L'objectif de cette procédure est de sécuriser les accès aux interfaces d'administration de l'infrastructure locale (pare-feu OPNsense et hyperviseurs Proxmox) à l'aide de certificats TLS valides. Pour garantir l'isolation du réseau de management (VLAN 99), l'obtention des certificats s'effectue via le protocole ACME (Let's Encrypt) en utilisant le challenge DNS-01 avec l'API Cloudflare. OPNsense agit comme un bastion central : il centralise la génération du certificat "Wildcard" (`*.loutik.fr`) et automatise son déploiement de manière sécurisée (Push SSH) vers les nœuds Proxmox, évitant ainsi la dissémination des tokens d'API de gestion DNS sur plusieurs machines.

---
## B. Prérequis

- [ ] **Token d'API.** Un token d'API restreint doit être généré sur Cloudflare avec les permissions strictes "Zone:DNS:Édition" ciblées uniquement sur la zone `loutik.fr`.
- [ ] **Connectivité.** Le pare-feu OPNsense doit être en mesure de joindre le port 22 (SSH) des serveurs Proxmox.

---
## C. Installation du plugin sur OPNsense

1. **Installation du paquet.** Depuis l'interface web d'OPNsense, naviguer dans **Système > Microprogramme > Mises à jour**, sélectionner l'onglet **Plugins**. Rechercher et installer le paquet `os-acme-client`.

*Notion : Le protocole ACME (Automated Certificate Management Environment) permet l'automatisation complète des échanges avec une autorité de certification. Le plugin transforme OPNsense en un client ACME autonome.*

---
## D. Configuration du client ACME (OPNsense)

1. **Enregistrement du compte Let's Encrypt.** Naviguer dans **Services > ACME Client > Accounts**. Ajouter un nouveau compte, définir un nom représentatif, renseigner l'adresse email de l'administrateur et accepter les conditions d'utilisation.

2. **Configuration du challenge DNS-01.** Aller dans **Services > ACME Client > Challenge Types** et ajouter une entrée :
   - Nom : `Challenge-Cloudflare`.
   - Challenge Type : `DNS-01`.
   - DNS Service : `Cloudflare`.
   - Token : Insérer le token API restreint généré en prérequis.

---
## E. Création et application du certificat pour OPNsense

1. **Génération du certificat Wildcard.** Se rendre dans **Services > ACME Client > Certificates** et créer une demande :
   - Nom : `Cert-Wildcard-Loutik`.
   - Nom de domaine (Common Name) : `*.loutik.fr`.
   - Challenge Type : Sélectionner `Challenge-Cloudflare`.
   - Enregistrer, puis cliquer sur le bouton **Issue/Renew** en bas de page pour forcer la première génération.

2. **Automatisation de l'interface OPNsense.** Dans **Services > ACME Client > Automations**, créer une règle :
   - Nom : `Restart-OPNsense-WebGUI`.
   - Run Command : `Restart OPNsense Web UI`.

3. **Liaison de l'automatisation.** Retourner dans les paramètres du certificat `Cert-Wildcard-Loutik` et ajouter `Restart-OPNsense-WebGUI` dans le champ "Automations".

4. **Application finale.** Aller dans **Système > Paramètres > Administration**. Modifier le champ "Certificat SSL/TLS" pour sélectionner `Cert-Wildcard-Loutik`. Sauvegarder et recharger la page pour valider la sécurisation de l'interface du routeur.

---
## F. Préparation de l'accès API sur Proxmox (Moindre privilège)

1. **Création du compte de service.** Sur l'interface web de Proxmox, naviguer dans **Datacenter > Permissions > Users** et cliquer sur **Add**.
   - User name : `deploycert`
   - Realm : `Proxmox VE authentication server (pve)`
   - *Explication : Le realm "pve" permet de créer un utilisateur interne à Proxmox sans avoir à créer un véritable compte système Linux sous-jacent, ce qui renforce la sécurité.*

2. **Attribution des permissions.** Naviguer dans **Datacenter > Permissions** et cliquer sur **Add > User Permission**.
   - Path : `/nodes/pve-gideon` *(ou `/` pour l'ensemble du cluster)*
   - User : `deploycert@pve`
   - Role : `Sys.Modify`
   - *Explication : Le rôle `Sys.Modify` est le niveau de privilège strict et nécessaire pour qu'un compte puisse modifier la configuration système d'un nœud, y compris le remplacement de ses certificats.*

3. **Génération du Token d'API.** Naviguer dans **Datacenter > Permissions > API Tokens** et cliquer sur **Add**.
   - User : `deploycert@pve`
   - Token ID : `acme`
   - Privilege Separation : *Décocher cette case*.
   - *Explication : Décocher la séparation des privilèges permet au token d'hériter exactement des droits `Sys.Modify` que nous venons de donner à l'utilisateur. Le "Secret" généré à la fin de cette étape s'affichera une seule fois, il doit être copié précieusement.*

---
## G. Automatisation du déploiement vers Proxmox (API Push)

1. **Configuration de l'automatisation d'envoi.** Sur l'interface web d'OPNsense, dans **Services > ACME Client > Automations**, créer une règle :
    - Nom : `Push-Cert-To-PVE-GIDEON`.
    - Run Command : `Upload certificate to Proxmox VE`.
    - Proxmox VE server : `192.168.1.249`.
    - Proxmox VE server port : `8006`.
    - Proxmox VE node name : `gideon` *(doit correspondre exactement au nom dans Proxmox)*.
    - Proxmox VE user : `deploycert`.
    - Proxmox VE realm : `pve`.
    - Proxmox VE token name : `acme`.
    - Proxmox VE token key : *[Coller ici le Secret obtenu à l'étape F.3]*.

2. **Liaison finale et déploiement.** Dans **Services > ACME Client > Certificates**, éditer le certificat `Cert-Wildcard-Loutik` pour ajouter l'automatisation `Push-Cert-To-PVE-GIDEON`. Cliquer sur **Issue/Renew** pour déclencher le déploiement sécurisé via l'API. L'API Proxmox se chargera de placer les fichiers et de redémarrer le service web automatiquement.