# DECISIONS.md — Journal de décisions EAM

Document compagnon de `RULES.md` §9. Toute décision prise en cours de développement, tout arbitrage technique, tout point bloquant en attente de validation est documenté ici.

---

## Points bloquants (en attente de validation)

### 1. Contenu des 7 sous-blocs « Fil d'info »
- **Statut** : En attente
- **Référence** : CAHIER_DES_CHARGES_EAM.md §12.1
- **Description** : Le contenu exact des 7 sous-blocs du « Fil d'info » (après le bloc principal « Clarté ») n'est pas encore validé par Quentin et l'équipe éditoriale.
- **Impact** : Ces 7 sous-blocs sont visiblement bloqués dans l'UI back-office tant que cette décision n'est pas prise. Aucun article ne peut être assigné à ces emplacements.
- **Proposition** : À définir par Quentin + équipe éditoriale.
- **Date d'ouverture** : 2026-08-01

### 2. Entitlements du pack prestige Soutien
- **Statut** : En attente
- **Référence** : CAHIER_DES_CHARGES_EAM.md §12.2
- **Description** : Le contenu exact du « pack prestige » de l'abonnement Soutien (VIP, portrait, réseau, etc.) a un impact contractuel/éditorial et ne doit pas être codé en dur sans validation.
- **Impact** : La table `soutien_pack_entitlements` existe mais reste vide/désactivée tant que les entitlements exacts ne sont pas définis.
- **Proposition** : À définir par Quentin + Gérant.
- **Date d'ouverture** : 2026-08-01

### 3. Mesures exactes du plan de blocs PDF
- **Statut** : En attente
- **Référence** : CAHIER_DES_CHARGES_EAM.md §7.3
- **Description** : Le PDF avec le plan précis des blocs de la landing page (dimensions en pixels) n'a pas encore été reçu ou n'est pas lisible.
- **Impact** : Les dimensions indiquées dans le cahier (ex. Sentinelles 1000×1000, Clarté 700×933) sont utilisées par défaut mais pourraient nécessiter un ajustement si le PDF diffère.
- **Proposition** : Attendre réception du PDF de Quentin.
- **Date d'ouverture** : 2026-08-01

### 4. Compte DHL Express entreprise
- **Statut** : En attente
- **Référence** : CAHIER_DES_CHARGES_EAM.md §12.3, BACKLOG_SPRINTS.md Sprint 10
- **Description** : L'ouverture du compte DHL Express entreprise (MyDHL API) est en attente.
- **Impact** : L'intégration API DHL pour le calcul dynamique des frais de livraison internationale est bloquée. Le tarif forfaitaire local Bénin/zone limitrophe peut être implémenté en parallèle.
- **Proposition** : Quentin doit ouvrir le compte DHL ou confirmer que ce point reste en attente.
- **Date d'ouverture** : 2026-08-01

### 5. Politique robots IA (robots.txt)
- **Statut** : En attente
- **Référence** : CAHIER_DES_CHARGES_EAM.md §17.3, RULES.md §1
- **Description** : L'arbitrage sur l'autorisation ou le blocage des robots IA (GPTBot, Google-Extended, PerplexityBot, ClaudeBot) est explicitement signalé comme « à trancher avec Quentin ».
- **Impact** : Le fichier `robots.txt` ne peut pas être finalisé sans cette décision stratégique.
- **Proposition** : Quentin doit décider de la politique (autoriser, bloquer, ou approche hybride).
- **Date d'ouverture** : 2026-08-01

### 6. Clés OAuth Google/Facebook production
- **Statut** : En attente
- **Référence** : CONNECTEURSMCP.md §6, BACKLOG_SPRINTS.md Backlog non planifié
- **Description** : Les clés OAuth Google Login et Facebook Login pour l'environnement de production n'ont pas encore été fournies.
- **Impact** : L'authentification OAuth ne peut être activée en production sans ces clés. Les clés de développement/test peuvent être utilisées en phase de développement.
- **Proposition** : Quentin doit fournir les clés OAuth production ou confirmer que l'authentification OAuth n'est pas requise pour le MVP.
- **Date d'ouverture** : 2026-08-01

---

## Décisions techniques prises

### 1. Stack technique verrouillée
- **Date** : 2026-08-01
- **Décision** : Adoption du triptyque GitHub + Vercel + Supabase comme spécifié dans CAHIER_DES_CHARGES_EAM.md §9.
- **Raison** : Cohérence avec les autres projets de l'écosystème (Africa Awards, MagicAfrica), mutualisation de la maintenance, pipeline de déploiement natif Vercel.
- **Validé par** : Cahier des charges v1.1 (déjà tranché)

### 2. ORM Drizzle plutôt que Prisma
- **Date** : 2026-08-01
- **Décision** : Utilisation de Drizzle ORM pour l'accès typé à la base de données.
- **Raison** : Compatible nativement avec le runtime Edge de Vercel et les Edge Functions Supabase (Deno), pas de moteur binaire à générer/déployer séparément, cohérent avec `supabase db diff` pour les migrations.
- **Validé par** : CAHIER_DES_CHARGES_EAM.md §9.3 (déjà tranché)

### 3. Resend plutôt que Brevo pour les emails
- **Date** : 2026-08-01
- **Décision** : Utilisation de Resend pour les emails transactionnels et newsletters.
- **Raison** : Créé par l'équipe Vercel, intégration officielle en un clic dans le dashboard Vercel, React Email partage la même stack de composants que le reste du front.
- **Validé par** : CAHIER_DES_CHARGES_EAM.md §9.10 (déjà tranché)

### 4. Meilisearch auto-hébergé plutôt qu'Algolia
- **Date** : 2026-08-01
- **Décision** : Utilisation de Meilisearch auto-hébergé pour la recherche plein texte.
- **Raison** : Pas de service SaaS tiers supplémentaire hors du triptyque Vercel/Supabase/GitHub, coût récurrent non justifié tant que le volume d'articles reste modeste.
- **Validé par** : CAHIER_DES_CHARGES_EAM.md §9.8 (déjà tranché)

### 5. Vercel Image Optimization plutôt que Cloudinary
- **Date** : 2026-08-01
- **Décision** : Utilisation de Vercel Image Optimization (composant `next/image`) pour le CDN images.
- **Raison** : Natif au déploiement Vercel retenu, aucun compte/service tiers à configurer. Cloudinary reste une option de repli si un besoin de traitement image avancé apparaît en Phase 2/3.
- **Validé par** : CAHIER_DES_CHARGES_EAM.md §9.7 (déjà tranché)

### 6. Plausible Analytics plutôt que Google Analytics 4 par défaut
- **Date** : 2026-08-01
- **Décision** : Utilisation de Plausible Analytics pour l'analytics produit par défaut.
- **Raison** : Respectueux RGPD, sans bannière cookie complexe. Google Analytics 4 reste une option additionnelle (pas un remplacement) si le groupe a un besoin publicitaire précis en Phase 3.
- **Validé par** : CAHIER_DES_CHARGES_EAM.md §9.13 (déjà tranché)

### 7. Colonne year des magazines (champ standard)
- **Date** : 2026-08-01
- **Décision** : La colonne `year` de la table `magazines` est implémentée comme un champ standard (integer), pas une colonne générée.
- **Raison** : Simplification technique avec Drizzle ORM. Le calcul de l'année depuis `published_at` sera fait via trigger PostgreSQL ou côté application lors de la création/mise à jour.
- **Validé par** : Décision technique interne (non bloquante)

---

## Décisions fonctionnelles prises

*Aucune décision fonctionnelle prise à ce stade du développement (Sprint 0).*

---

## Historique des modifications

| Date | Section | Modification | Auteur |
|---|---|---|---|
| 2026-08-01 | Création du document | Initialisation avec les 6 points bloquants identifiés dans BACKLOG_SPRINTS.md et les 7 décisions techniques verrouillées dans le cahier des charges | Agent IA |
