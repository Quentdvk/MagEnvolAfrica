# MATRICE_PERMISSIONS.md — Matrice de permissions EAM

Document compagnon de `CAHIER_DES_CHARGES_EAM.md` (§3), `MODULE_DONNEES.md` et `API_ENDPOINTS.md`. Cette matrice est la référence unique pour écrire les policies RLS Supabase et les vérifications de rôle dans les Edge Functions — elle évite qu'un agent invente une règle de droits différente d'un endpoint à l'autre.

**Profils considérés** :
- **V** = Visiteur non connecté
- **I** = Utilisateur Inscrit non abonné
- **A** = Abonné (tous paliers confondus — les nuances entre paliers sont notées à part en §2)
- **Aff** = Affilié (peut se cumuler avec I ou A)
- **R** = Rédacteur
- **RC** = Rédacteur en chef
- **G** = Gérant du site
- **Adm** = Administrateur

Légende : ✅ autorisé · ❌ interdit · 🔶 partiel (voir note) · — non applicable

---

## 1. Matrice générale par ressource

### 1.1 Articles

| Action | V | I | A | R | RC | G | Adm |
|---|---|---|---|---|---|---|---|
| Lire 12 premières lignes + chapô | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Lire l'article complet | ❌ | ❌ | ✅ | ✅ (ses articles) | ✅ | ✅ | ✅ |
| Écouter version audio | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Créer un brouillon | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Modifier un brouillon | ❌ | ❌ | ❌ | 🔶 ses brouillons | ✅ tous | ✅ tous | ✅ tous |
| Soumettre à validation | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Publier / dépublier | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Commenter | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Aimer (like) | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Modérer un commentaire | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

### 1.2 Catégories éditoriales

| Action | V | I | A | R | RC | G | Adm |
|---|---|---|---|---|---|---|---|
| Lire | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Créer / modifier / désactiver | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |

### 1.3 Kiosque (magazines)

| Action | V | I | A | R | RC | G | Adm |
|---|---|---|---|---|---|---|---|
| Consulter catalogue / fiche produit | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Feuilleter aperçu limité | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Acheter un numéro | ❌ compte requis | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Télécharger (après achat/entitlement) | ❌ | 🔶 si achat effectué | 🔶 si inclus au palier | — | — | — | — |
| Publier un nouveau numéro (mise en ligne, sommaire, prix) | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |

### 1.4 Abonnements & facturation

| Action | V | I | A | R | RC | G | Adm |
|---|---|---|---|---|---|---|---|
| Souscrire un abonnement | ❌ compte requis | ✅ | ✅ (changement de palier) | ✅ | ✅ | ✅ | ✅ |
| Voir son propre historique de facturation | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Voir la facturation de tous les utilisateurs | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Configurer les tarifs des 4 formules | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Valider le contenu du pack prestige Soutien | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ (avec Quentin) | ✅ |

### 1.5 Dons

| Action | V | I | A | R | RC | G | Adm |
|---|---|---|---|---|---|---|---|
| Faire un don | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Voir la liste des dons reçus | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

### 1.6 Programme d'affiliation

| Action | V | I | A | R | RC | G | Adm |
|---|---|---|---|---|---|---|---|
| Générer un lien d'affiliation | ❌ compte requis | ✅ | ✅ | ✅ (via son compte perso, hors fonction éditoriale) | ✅ | ✅ | ✅ |
| Voir son propre tableau de bord d'affiliation | — | ✅ (Aff) | ✅ (Aff) | ✅ (Aff) | ✅ (Aff) | ✅ (Aff) | ✅ (Aff) |
| Voir le tableau de bord de tous les affiliés | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Demander un retrait | — | ✅ (Aff, si seuil atteint) | ✅ (Aff) | ✅ (Aff) | ✅ (Aff) | ✅ (Aff) | ✅ (Aff) |
| Valider un retrait | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

### 1.7 Landing page, méga-menu, footer, pop-up (paramétrage)

| Action | V | I | A | R | RC | G | Adm |
|---|---|---|---|---|---|---|---|
| Voir le rendu public | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Assigner un article/numéro à un bloc landing page (Sentinelles, Essor, etc.) | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Modifier footer / méga-menu | ❌ | ❌ | ❌ | ❌ | 🔶 méga-menu seulement | ✅ | ✅ |
| Configurer campagne pop-up (taux, durée) | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

### 1.8 Utilisateurs & rôles

| Action | V | I | A | R | RC | G | Adm |
|---|---|---|---|---|---|---|---|
| Modifier son propre profil | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Voir la liste des utilisateurs | ❌ | ❌ | ❌ | ❌ | ❌ | 🔶 lecture seule | ✅ |
| Changer le rôle d'un utilisateur | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Activer/désactiver le MFA d'un rôle back-office | — | — | — | ✅ (le sien, obligatoire) | ✅ (le sien, obligatoire) | ✅ (le sien, obligatoire) | ✅ (le sien + supervision) |

### 1.9 Sécurité, configuration technique

| Action | V | I | A | R | RC | G | Adm |
|---|---|---|---|---|---|---|---|
| Voir les logs / audit log | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Configurer devises/langues supportées | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Gérer les intégrations de paiement (clés Moneroo) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ (jamais l'agent IA — action humaine, cf. CONNECTEURSMCP.md) |
| Voir le formulaire « Autres services » | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

---

## 2. Nuances entre paliers d'abonnement (à l'intérieur du profil « A »)

| Avantage | Mensuel | Annuel | Chef d'entreprise | Soutien |
|---|---|---|---|---|
| Articles illimités + audio | ✅ | ✅ | ✅ | ✅ |
| Magazine digital du mois gratuit | ✅ | ✅ (12/an) | ✅ | ✅ |
| Magazine papier/audio en avant-première | ❌ | ❌ | ✅ | ✅ |
| Accès IP (multi-postes) | ❌ | ❌ | ✅ | ✅ |
| Support client dédié | ❌ | ❌ | ✅ | ✅ |
| Pack prestige (VIP, portrait, réseau) | ❌ | ❌ | ❌ | ✅ (contenu à valider, §12.2) |

**Implémentation** : ces nuances ne sont **pas** un rôle Postgres différent — elles se lisent via `subscriptions.plan_id` → `subscription_plans.code`, jamais via un champ `role` dupliqué. Toute vérification de droit d'accès à un contenu doit interroger la souscription active, pas un flag statique sur `profiles`.

---

## 3. Cas particulier — Affilié (Aff)

Le statut Affilié n'est **jamais exclusif** : il se cumule avec Visiteur-devenu-Inscrit, Inscrit ou Abonné, et même avec un rôle back-office (un Rédacteur peut aussi être affilié via son compte personnel). En base, `profiles.is_affiliate = true` est un flag indépendant du `role` — voir `MODULE_DONNEES.md` §1.1. Les policies RLS sur les tables `affiliate_*` se basent sur ce flag et sur `affiliate_links.profile_id = auth.uid()`, jamais sur `role`.

---

## 4. Règle de résolution en cas de doute

Si une action demandée à l'agent ne figure pas explicitement dans cette matrice :
1. Il ne l'implémente pas par extrapolation silencieuse.
2. Il applique le principe de blocage explicite de `RULES.md` §1 (« Stop & Ask ») : il propose la ligne de matrice manquante avec sa proposition de droits, et attend validation avant de coder la policy RLS correspondante.
3. Une fois validée, la ligne est ajoutée à ce document (mise à jour versionnée, pas une exception non documentée dans le code).
