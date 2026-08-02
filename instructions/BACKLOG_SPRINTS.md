# BACKLOG_SPRINTS.md — Backlog découpé en sprints EAM

Traduit la feuille de route du cahier des charges (§13) en tickets actionnables. Sprints de 2 semaines, un agent peut travailler ticket par ticket sans redemander le contexte à chaque fois. Chaque ticket référence son § source dans le cahier et sa Definition of Done s'appuie sur `RULES.md` §7 — non répétée à chaque ticket pour rester lisible, mais **applicable systématiquement**.

**Convention de ticket** : `[Epic] Titre` — Description courte — Réf. cahier — Dépendances — Critère d'acceptation spécifique (en plus de la DoD générale).

---

## PHASE 1 — MVP (fondations) — Sprints 1 à 6

### Sprint 0 — Cadrage technique (avant le Sprint 1)

- **[Infra] Initialisation du triptyque de déploiement** — Créer le dépôt GitHub, connecter Vercel (intégration Git), créer les 2 projets Supabase (Développement+Recette, Production) — Réf. §9.15, §12.6bis — Critère : un `git push` déclenche un déploiement Preview visible, une pull request ne peut pas être mergée sans check GitHub Actions vert.
- **[Infra] Configuration des connecteurs MCP** — Suivre `CONNECTEURSMCP.md` intégralement (Supabase en lecture seule par défaut, Vercel OAuth, GitHub OAuth) — Critère : les 3 connecteurs répondent depuis l'environnement agent, aucune clé en clair dans un fichier versionné.
- **[Infra] Scaffolding Next.js** — App Router, TypeScript strict, Tailwind + shadcn/ui, ESLint + Prettier + Husky — Réf. §9.2, §9.16.
- **[Infra] Migrations initiales** — Créer toutes les tables de `MODULE_DONNEES.md` §1 à §3 (identité, abonnements, éditorial) via Drizzle + Supabase CLI, RLS activé dès la création (pas en fin de sprint) — Réf. §3 rules.md.
- **[Doc] Créer `DECISIONS.md`** vide avec le format défini en `RULES.md` §9.

### Sprint 1 — Authentification & rôles

- **[Auth] Inscription email/téléphone** — Réf. §5.5 — Critère : formulaire validé Zod, création `profiles` via trigger.
- **[Auth] Connexion Google / Facebook OAuth** — Réf. §5.5, §9.5 — Critère : token Supabase Auth émis, `profiles` créé/lié au premier login.
- **[Auth] MFA obligatoire back-office** — Réf. §9.5, §3 rules.md — Critère : impossible d'activer un rôle `redacteur`/`redacteur_en_chef`/`gerant`/`administrateur` sans MFA actif ; test Playwright dédié.
- **[Auth] Verrouillage progressif après échecs de connexion** — Réf. §10.5.
- **[Back-office] Gestion des rôles (Administrateur)** — Réf. §3.2, `MATRICE_PERMISSIONS.md` §1.8 — Critère : seul `administrateur` peut changer un rôle, action tracée dans `audit_log`.

### Sprint 2 — Éditorial (articles) & paywall

- **[Éditorial] CRUD articles + catégories back-office** — Réf. §3.2, §7.3.1 — Critère : workflow `brouillon → en_validation → publie` respecté, noms de catégories imposés non modifiés silencieusement.
- **[Paywall] Endpoint `/functions/v1/articles-get`** — Réf. §5.1, `API_ENDPOINTS.md` §3 — Critère : test qui vérifie que la réponse réseau brute à un utilisateur non autorisé ne contient jamais le corps complet.
- **[Paywall] Rendu front du dégradé progressif** — 12 lignes puis 3 lignes en dégradé puis disparition — Réf. §5.1, §4 rules.md — Critère : valeurs exactes, pas de pourcentage approximatif.
- **[Éditorial] Page Article publique** — Réf. §7.5 — En-tête, corps, actions (partager/aimer/commenter/écouter/s'abonner), articles liés.
- **[Social] Commentaires + likes** — Réf. §5.8 — Sanitization DOMPurify — Réf. §10.1.

### Sprint 3 — Landing page (desktop)

- **[Landing] Header 2 lignes + comportement sticky** — Réf. §7.1 — Critère : comportement de scroll exact (ligne 2 seule sticky, ligne 1 + bandeau visibles seulement en haut de page).
- **[Landing] Bandeau « À la Une »** défilant — Réf. §7.1.
- **[Landing] Panneau latéral droit** (menu réduit) — Réf. §7.1, contenu exact (baseline, 10 liens, encart CTA).
- **[Landing] Section « Image catégorie A »** — blocs Sentinelles/Bloc secondaire/Essor/Ombre douce, dimensions et comportement exacts — Réf. §7.3.1, §6 rules.md.
- **[Landing] Footer 3 niveaux paramétrable** — Réf. §7.2 — Critère : liens modifiables depuis back-office sans redéploiement.
- **[Back-office] Table `landing_blocks` + interface d'assignation** — Réf. §6.4 module-données — Critère : les 7 sous-blocs « Fil d'info » sont visiblement bloqués dans l'UI tant que §12.1 n'est pas validé (pas de saisie libre silencieuse).

### Sprint 4 — Kiosque & paiement Moneroo

- **[Kiosque] Catalogue + fiche produit + scroll infini + filtres** — Réf. §7.4.
- **[Kiosque] Sélecteur Version → Langue** — Réf. §4.2 — Critère : test qui vérifie que la liste de langues change selon la version choisie et jamais l'inverse.
- **[Panier] Page panier + calcul devise dynamique** — Réf. §7.7, §5.2.
- **[Paiement] Intégration Moneroo (carte + Mobile Money)** — Réf. §9.6 — Critère : webhook vérifié par signature avant tout impact commande (`API_ENDPOINTS.md` §5).
- **[Téléchargement] Liens signés + watermark** — Réf. §10.2 — Critère : URL non réutilisable après expiration, test qui vérifie l'échec d'accès direct à l'URL Storage brute.

### Sprint 5 — Abonnements (4 formules)

- **[Abonnement] Page « S'abonner » + 4 formules** — Réf. §4.1, §7 landing.
- **[Abonnement] Souscription + paiement récurrent Moneroo** — Réf. §9.6.
- **[Abonnement] Job planifié 1re → 2e échéance** — Réf. §4.1, §4 rules.md — Critère : **test Playwright explicite du passage de tarif promo à tarif plein**, condition de Definition of Done non négociable.
- **[Espace client] Gestion abonnement (renouvellement, changement de formule, factures)** — Réf. §3.3.

### Sprint 6 — Détection langue/devise, durcissement sécurité, recette Phase 1

- **[I18n] Détection Geo-IP langue/devise** — Réf. §5.2, §9.11 — Critère : le choix manuel de l'utilisateur n'est jamais écrasé par une détection automatique ultérieure.
- **[I18n] Table `exchange_rates` + job quotidien** — Réf. §9.11.
- **[Sécurité] Audit OWASP Top 10 + CSP + headers** — Réf. §10.1.
- **[Sécurité] RLS complet sur toutes les tables 🔒 de `MODULE_DONNEES.md`** — vérification exhaustive avant recette — Réf. §3 rules.md.
- **[QA] Suite Playwright critique (achat, abonnement, paywall)** — Réf. §9.16.
- **[Recette] Déploiement environnement Recette + tests de bout en bout**.

---

## PHASE 2 — Enrichissement — Sprints 7 à 11

### Sprint 7 — Affiliation

- **[Affiliation] Génération de liens (général + par numéro)** — Réf. §4.5.
- **[Affiliation] Tracking clics + attribution panier** — Réf. `API_ENDPOINTS.md` §5, §8.
- **[Affiliation] Calcul de commission 10%/25%** — Réf. §4.5, §4 rules.md — Critère : le taux appliqué reflète le statut de l'affilié **au moment de la vente**, pas au moment de la création du lien ; test dédié.
- **[Affiliation] Tableau de bord temps réel (Supabase Realtime)** — Réf. §9.9.
- **[Affiliation] Demande de retrait (seuil 150 000 XOF) + validation back-office** — Réf. §4.5.

### Sprint 8 — Notifications, feuilletage, audio

- **[Notifications] Web Push VAPID + badge compteur** — Réf. §5.4, §9.9.
- **[Feuilletage] Lecteur flipbook PDF.js** — Réf. §5.7, §9.12 — Aperçu limité + accès complet réservé acheteurs/abonnés.
- **[Audio] Lecture audio des articles pour abonnés** — Réf. §5.1.

### Sprint 9 — Pop-up promotionnel & espace client complet

- **[Pop-up] Compte à rebours 48h + règle de réapparition 30j** — Réf. §5.3, §12.4 — Paramétrable back-office (durée, taux, délai).
- **[Espace client] Téléchargements, factures, favoris centralisés** — Réf. §3.3.
- **[Dons] Tunnel de don 2 étapes** — Réf. §4.3.

### Sprint 10 — Livraison DHL & « Autres services »

- **[Livraison] Intégration API DHL Express (MyDHL)** — Réf. §12.3 — ⚠️ bloqué tant que le compte DHL entreprise n'est pas ouvert (déclencheur §1 rules.md).
- **[Livraison] Tarif forfaitaire local Bénin/zone limitrophe** — Réf. §12.3.
- **[Services] Formulaire « Autres services »** — Réf. §4.4.

### Sprint 11 — Recette Phase 2

- Tests de bout en bout affiliation + notifications + feuilletage.
- Durcissement sécurité incrémental (§10.7 sauvegardes, tests de restauration).

---

## PHASE 3 — Écosystème & optimisation — Sprints 12+

- **[SSO] Interconnexion sous-domaines écosystème** — Réf. §6, §9.5 — ⚠️ dépend des autres projets (Africa Awards, MagicAfrica) déployés sur le même projet Supabase Auth partagé.
- **[Pub] Régie publicitaire / contenus sponsorisés** — Réf. §4.6, §7.3.7.
- **[Recherche] Recherche avancée + recommandations personnalisées** — Réf. §9.8.
- **[SEO/GEO] Données structurées, `llms.txt`, arbitrage robots IA** — Réf. §17 — ⚠️ arbitrage robots IA bloqué tant que non tranché avec Quentin (§17.3, §1 rules.md).
- **[Perf] Optimisation Core Web Vitals internationalisée** — Réf. §11, §17.1.

---

## Backlog non planifié — dépend de validations externes

Ces tickets ne rentrent dans aucun sprint tant que leur blocage (§1 `RULES.md`) n'est pas levé :

| Ticket | Blocage | Qui doit trancher |
|---|---|---|
| Contenu des 7 sous-blocs « Fil d'info » | Proposition non validée (§12.1) | Quentin + équipe éditoriale |
| Entitlements du pack prestige Soutien | Impact contractuel/éditorial (§12.2) | Quentin + Gérant |
| Mesures pixels exactes du plan de blocs | PDF non encore reçu/lisible | Quentin |
| Compte DHL Express entreprise | Ouverture de compte en attente | Quentin |
| Politique robots IA (`robots.txt`) | Arbitrage stratégique (§17.3) | Quentin |
| Clés OAuth Google/Facebook production | Accès non fournis | Quentin |

Ces tickets doivent apparaître dans `DECISIONS.md` en statut « en attente » dès le Sprint 0, pas seulement au moment où le sprint correspondant démarre — pour que l'attente commence le plus tôt possible.
