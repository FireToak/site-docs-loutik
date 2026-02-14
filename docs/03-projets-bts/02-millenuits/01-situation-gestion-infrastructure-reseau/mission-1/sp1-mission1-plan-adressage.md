# SP 1 - Mission 1 : Plan d'adressage

![Logo MilleNuits](/img/docs/projets-bts/millenuits/logo_millenuits.png)

---

## Informations générales

* **Date de création :** 15/01/2026
* **Dernière modification :** 15/01/2026
* **Auteur(s) :** MEDO Louis
* **Version :** 1.0

## Objectif
Cette documentation permet de définir et de calculer le nouveau plan d'adressage pour l'infrastructure réseau de l'entreprise Mille Nuits.

---

## A. Besoins en hôtes

| Nom du sous-réseau | Services concernés | Nombre d'hôtes | Hôtes avec marge (+20%) |
| :--- | :--- | :--- | :--- |
| **Production** | Production | 110 | 132 |
| **Autres** | Ventes, achats, qualité, études, informatique | 100 | 120 |
| **Administratif** | Administratif, Direction | 52 | 63 |
| **VentesEtudes** | Projets, Etudes | 48 | 58 |
| **Logistique** | Logistique, gestion des stocks | 30 | 36 |
| | **Total :** | **340** | **411** |
| **Serveurs** | Zone Serveurs (DMZ/LAN) | - | - |

:::note Règle de nommage
La passerelle est toujours la dernière adresse disponible du sous-réseau.
**Exception :** Le sous-réseau *Serveurs* utilise la passerelle `172.16.51.253/24`.
:::

---

## B. Plan d'adressage

### 1. Réseaux et VLANs

| Nom | N° VLAN | Adresse Réseau | Masque (CIDR) | Passerelle | Diffusion (Broadcast) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Production** | 10 | `172.40.0.0` | `255.255.255.0 (/24)` | `172.40.0.254` | `172.40.0.255` |
| **Autres** | 11 | `172.40.1.0` | `255.255.255.128 (/25)`| `172.40.1.126` | `172.40.1.127` |
| **Administratif** | 12 | `172.40.1.128` | `255.255.255.128 (/25)`| `172.40.1.254` | `172.40.1.255` |
| **VentesEtudes** | 13 | `172.40.2.0` | `255.255.255.192 (/26)`| `172.40.2.62` | `172.40.2.63` |
| **Logistique** | 14 | `172.40.2.64` | `255.255.255.192 (/26)`| `172.40.2.126` | `172.40.2.127` |
| **Invité** | 15 | `172.40.2.128` | `255.255.255.240 (/28)`| `172.40.2.142` | `172.40.2.143` |
| **Management** | 99 | `172.40.2.144` | `255.255.255.240 (/28)`| `172.40.2.158` | `172.40.2.159` |

### 2. Plages d'hôtes

| Nom | N° VLAN | Première IP utilisable | Dernière IP utilisable |
| :--- | :--- | :--- | :--- |
| **Production** | 10 | `172.40.0.1` | `172.40.0.254` |
| **Autres** | 11 | `172.40.1.1` | `172.40.1.126` |
| **Administratif** | 12 | `172.40.1.129` | `172.40.1.254` |
| **VentesEtudes** | 13 | `172.40.2.1` | `172.40.2.62` |
| **Logistique** | 14 | `172.40.2.65` | `172.40.2.126` |

---

## C. Méthodologie de calcul (Exemple)

Détail du calcul pour le sous-réseau **Production** (132 hôtes nécessaires) :

1. **Déterminer la puissance de 2 nécessaire**
On cherche n tel que `2^n - 2 = 132`.
`2^8 - 2 = 254`
Comme `254 >= 132`, nous avons besoin de 8 bits pour la partie hôte.

2. **Calculer le masque de sous-réseau**
Le masque IPv4 total est de 32 bits. On soustrait les bits hôtes trouvés ci-dessus.
32 - 8 = 24
Le préfixe CIDR est donc `/24`.

3. **Convertir le masque en décimal**
On positionne les 24 premiers bits à `1` (partie réseau) et les 8 derniers à `0` (partie hôte) :
`11111111.11111111.11111111.00000000`
**Résultat :** `255.255.255.0`

4. **Calculer l'adresse de diffusion (Broadcast)**
On prend l'adresse réseau et on passe tous les bits de la partie hôte à `1` :
`172.40.0.11111111`
**Résultat :** `172.40.0.255`

5. **Définir la plage d'adresses utilisables**
- **Première IP :** Adresse réseau + 1 -> `172.40.0.1`
- **Dernière IP :** Adresse de diffusion - 1 -> `172.40.0.254`