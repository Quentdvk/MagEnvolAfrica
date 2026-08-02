# RULES.md — Règles opérationnelles pour l'agent IA / équipe de développement
## Projet : Envol Africa Magazine (EAM)
Document compagnon du « Cahier des charges fonctionnel & technique — v1.1 — Août 2026 (corrigée) ».
Ce fichier ne remplace pas le cahier des charges : il définit **comment travailler dessus** pour éviter les erreurs, les improvisations et les livraisons non conformes.

> **Version 1.1** : le §5 est mis à jour pour verrouiller explicitement le triptyque de déploiement **GitHub + Vercel + Supabase** et les choix techniques associés (voir CAHIER_DES_CHARGES_EAM.md §9 et §12.6bis pour le détail). Le reste du document est inchangé.

---

## 0. Règle absolue : le cahier des charges est la source de vérité

- Le document `CAHIER_DES_CHARGES_EAM.md` (ou équivalent) fait foi sur toute décision fonctionnelle, tout nom de bloc, tout tarif, toute règle métier.
- L'agent ne doit **jamais** :
  - inventer une fonctionnalité non décrite,
  - simplifier silencieusement une règle métier jugée « trop complexe »,
  - renommer un bloc, une section, une variante produit ou un rôle différemment de ce qui est écrit dans le cahier (ex. « Sentinelles », « Essor », « Ombre douce », « Clarté », « Chef d'entreprise », « Accès IP » sont des noms **imposés**, pas des suggestions).
- Si une instruction reçue en cours de projet (oralement, par message, par un ticket) semble contredire le cahier des charges : **l'agent signale la contradiction avant d'agir**, il ne tranche pas seul.
- Toute affirmation implicite doit être vérifiée dans le cahier avant d'être codée. En cas de doute sur l'intention d'une phrase du cahier, l'agent cite la phrase exacte et demande confirmation plutôt que d'interpréter.

## 1. Principe de blocage explicite (« Stop & Ask »)

L'agent ne doit **jamais avancer sur une hypothèse silencieuse** quand une information manque. À la place :

1. Il identifie précisément ce qui manque (donnée, choix de design, arbitrage produit, accès/credential).
2. Il formule une question fermée et actionnable (pas « que voulez-vous faire ? » mais « A, B ou C ? »).
3. Il **suspend uniquement la tâche concernée**, pas l'ensemble du sprint — il continue les tâches non bloquées en parallèle si possible.
4. Il consigne la question et sa réponse dans un journal de décisions (`DECISIONS.md`, voir §9) pour ne pas la reposer plus tard.

Déclencheurs obligatoires de blocage (liste non exhaustive, à appliquer strictement) :
- Contenu exact des 7 sous-blocs restants du « Fil d'info » (§12.1 du cahier) : la proposition existe mais n'est **pas validée** → ne pas coder en dur avant validation de Quentin.
- Composition finale du « pack prestige » de l'abonnement Soutien (§12.2) : a un impact contractuel/éditorial, pas seulement technique → ne pas créer les entitlements avant validation écrite.
- Toute mesure en pixels du plan de blocs PDF non encore reçue ou illisible.
- Tout accès (compte DHL entreprise, compte Moneroo production, clés Google/Facebook OAuth, accès Google Drive des assets) manquant au moment de l'implémenter.
- Toute divergence entre le plan PDF des blocs et la description textuelle du cahier des charges.
- Robots IA (`robots.txt` — GPTBot, Google-Extended, PerplexityBot, ClaudeBot) : l'arbitrage est explicitement signalé « à trancher avec Quentin » (§17.3) → ne pas choisir seul une politique par défaut sans la faire valider.

## 2. Ne jamais coder en dur ce qui doit être paramétrable

Le cahier des charges répète plusieurs fois cette exigence — elle est **non négociable** :
- Liens du footer (§7.2), catégories éditoriales (§7.3.1), méga-menu (§16), pop-up promotionnel (durée, taux, délai de réapparition — §12.4), pondération du classement « articles les plus lus » (§12.5) : **tout doit être administrable depuis le back-office**, avec valeur par défaut issue du cahier, jamais figée dans le code applicatif.
- Avant de livrer une fonctionnalité, l'agent vérifie : « si Quentin ou le Gérant veut changer cette valeur/ce texte/ce lien demain sans redéploiement, peut-il le faire depuis le back-office ? ». Si la réponse est non alors que le cahier l'exige, la tâche n'est **pas terminée**.

## 3. Sécurité — non négociable, à vérifier à chaque fonctionnalité touchant ces zones

- **Paywall** : toute vérification de droit d'accès à un article, un PDF, un fichier audio se fait **côté serveur / Edge Function**, jamais par masquage CSS ou logique côté client uniquement. Avant de merger une fonctionnalité de lecture de contenu, l'agent doit pouvoir répondre « non » à la question : « un utilisateur non autorisé peut-il récupérer le contenu complet en inspectant la réponse réseau brute ? ».
- **Téléchargements** (PDF/audio) : uniquement via liens signés à expiration courte (Supabase Storage signed URLs), jamais d'URL statique publique. Watermarking à intégrer avant la mise en production du Kiosque, pas après.
- **Paiement** : aucune donnée de carte bancaire ne transite ni n'est stockée par l'application — tout passe par Moneroo. Tout webhook Moneroo doit être vérifié par signature avant d'impacter une commande ou un abonnement.
- **RLS (Row Level Security)** activé sur toute table contenant du contenu payant, des données de paiement ou des données personnelles, **avant** la mise en recette — pas en tâche de fin de projet.
- **MFA obligatoire** pour les rôles Administrateur, Gérant, Rédacteur en chef dès la Phase 1 de l'auth back-office — ne pas la reporter en Phase 2 sous prétexte de gagner du temps.
- Aucune clé API, secret ou credential ne doit apparaître en dur dans le code, dans un commit, ou dans un message de chat — toujours via variables d'environnement (Vercel) / Supabase Vault.
- Avant tout audit de sécurité externe (pentest), l'agent liste les 8 dimensions du §10 du cahier et vérifie qu'aucune n'est restée « à faire plus tard » sans ticket explicite.

## 4. Cohérence des règles métier — points à ne jamais approximer

- **Paywall éditorial** : exactement 12 lignes visibles, puis dégradé progressif sur exactement 3 lignes suivantes, puis disparition. Ne pas remplacer par un nombre de caractères ou un pourcentage « approximatif » sans validation — c'est une règle de contenu, pas une contrainte technique arbitraire.
- **Abonnements** : le tarif « 1er mois réduit » est une **règle de facturation récurrente** (prix promo à J0 puis bascule automatique au tarif plein à la 2e échéance), pas un coupon à usage unique. Tester explicitement le passage de la 1re à la 2e échéance en recette avant de considérer la fonctionnalité terminée.
- **Kiosque** : le tunnel de sélection est toujours dans l'ordre **Version → Langue**, et la liste de langues proposée dépend strictement de la version choisie (3 langues pour Papier/Numérique, 12 pour CD Audio). Ne jamais inverser l'ordre ni proposer une liste de langues indépendante de la version.
- **Affiliation** : le taux de commission (10% ou 25%) dépend du statut d'abonné de l'affilié **au moment de la vente**, pas de son statut au moment de la création du lien. Vérifier ce point en cas d'ambiguïté d'implémentation plutôt que de choisir arbitrairement l'un ou l'autre moment.
- **Livraison DHL** : les frais sont calculés dynamiquement au panier selon le pays de destination pour les versions Papier ; prévoir l'alternative tarif forfaitaire local (§12.3) pour Bénin/zone limitrophe — ne pas livrer uniquement le cas international.
- **Détection langue/devise** : la géolocalisation ne doit jamais écraser un choix manuel déjà fait par l'utilisateur dans une session ultérieure — le choix manuel prime toujours sur la détection automatique.

## 5. Stack technique — verrouillée, ne pas rouvrir sans raison documentée

- **Déploiement (triptyque non négociable)** : **GitHub** (dépôt + revue de code + CI qualité), **Vercel** (hébergement front + déploiement continu), **Supabase** (Postgres + Auth + Storage + Realtime + Edge Functions). L'agent ne propose jamais une alternative à l'un de ces trois services (pas de GitLab, pas de Netlify, pas de Firebase) sans raison bloquante documentée et validée par Quentin.
- **Déploiement = Vercel, pas GitHub Actions.** L'agent ne doit jamais écrire de script GitHub Actions qui déploie sur Vercel (`vercel deploy` en CI, etc.) : le déploiement est natif à l'intégration Git de Vercel (Preview par branche/PR, Production sur `main`). GitHub Actions sert uniquement de portail qualité avant merge (lint, tests Vitest, build, Playwright sur l'URL Preview) — voir §9.15 du cahier.
- Stack applicative : **Next.js (App Router) + React + TypeScript, Tailwind + shadcn/ui, Supabase (Postgres + Auth + Storage + Edge Functions), Moneroo** (voir §9 et §12.6/§12.6bis du cahier).
- Choix techniques verrouillés (ne plus rouvrir en cours de projet, sauf blocage documenté) : **Drizzle ORM** (pas Prisma), **Resend** (pas Brevo), **Meilisearch auto-hébergé** (pas Algolia), **Vercel Image Optimization** (pas Cloudinary sauf besoin avancé validé), **Plausible Analytics** (GA4 en complément seulement si demandé explicitement).
- L'agent ne substitue **aucune brique** de cette stack (ex. pas de Firebase à la place de Supabase, pas de Stripe à la place de Moneroo, pas de WordPress à la place du back-office sur mesure) sans une raison bloquante documentée et validée par Quentin — la cohérence avec les autres projets de l'écosystème (Africa Awards, MagicAfrica) est un objectif explicite du cahier.
- Toute librairie ajoutée en dehors de la liste du §9 doit être justifiée dans `DECISIONS.md` (pourquoi le besoin n'est pas déjà couvert par la stack recommandée).
- Migrations base de données : uniquement via **Supabase CLI** (`supabase migration new` / `supabase db push`) combiné à **Drizzle Kit** pour la génération des migrations typées, versionnées en Git. Jamais de modification manuelle en production, jamais de migration appliquée directement sur le projet Supabase Production par l'agent — uniquement via le pipeline (merge sur `main` → étape de migration automatisée ou validée manuellement selon ce qui sera défini en `DECISIONS.md`).
- Accès agent aux trois services du triptyque (Supabase, Vercel, GitHub) : voir `CONNECTEURSMCP.md` pour la configuration MCP et les règles de sécurité associées (lecture seule par défaut sur Supabase, jamais de push direct sur `main`, jamais de clé de production dans le contexte de l'agent).

## 6. Fidélité pixel/texte aux zones à forte exigence de design

- Header (2 lignes desktop / 2 lignes mobile), bandeau « À la Une », footer (3 niveaux), panneau latéral droit : respecter exactement le comportement de scroll décrit (§7.1, §8.1) — ce sont des comportements fonctionnels précis (ce qui reste sticky, ce qui disparaît), pas des suggestions esthétiques.
- Dimensions de blocs indiquées en pixels (ex. Sentinelles 1000×1000, Clarté 700×933) sont des contraintes de layout à respecter en desktop ; l'adaptation mobile doit être pensée sans perdre la hiérarchie visuelle (bloc principal → secondaire) définie dans le cahier.
- Toute icône/CTA listé dans le header ou la bottom bar mobile (§7.1, §8.2) doit être présent avec le libellé exact donné — ne pas fusionner ou supprimer un élément pour « simplifier » sans validation.

## 7. Définition de « terminé » (Definition of Done)

Une fonctionnalité n'est considérée comme terminée que si **toutes** les conditions suivantes sont vraies :

1. Elle correspond exactement à la description du cahier des charges (nom, comportement, règle métier) — pas une version « proche » ou « équivalente ».
2. Les valeurs concernées sont paramétrables depuis le back-office si le cahier l'exige (§2).
3. La vérification de droits d'accès, si applicable, est faite côté serveur (§3).
4. Un test automatisé existe (Vitest pour la logique unitaire, Playwright pour le parcours utilisateur critique : achat, abonnement, paywall) et passe en CI.
5. La fonctionnalité a été testée sur desktop **et** mobile si elle est visible côté public.
6. Aucun secret, clé ou donnée sensible n'est en dur dans le code livré.
7. Le code a été revu (pull request + revue) avant fusion sur `main`, conformément au §9.15/9.16 du cahier.
8. Toute question laissée ouverte au moment du développement a été soit résolue et documentée, soit explicitement listée comme dépendance bloquante restante dans `DECISIONS.md`.

Si un seul de ces points n'est pas vérifié, la fonctionnalité est **« en cours »**, pas **« terminée »** — ne jamais annoncer une tâche comme finie par optimisme ou pour avancer plus vite.

## 8. Ordre de priorité en cas de conflit entre exigences

Quand deux exigences semblent entrer en tension (ex. rapidité de livraison vs sécurité, simplicité de code vs paramétrage back-office), l'ordre de priorité par défaut est :

1. Sécurité et intégrité des paiements/données (§10 du cahier).
2. Exactitude fonctionnelle par rapport au cahier des charges.
3. Paramétrabilité back-office (rien en dur si le cahier l'exige).
4. Performance (< 2,5 s cible §11) et SEO/GEO (§17).
5. Confort de développement / rapidité d'implémentation.

L'agent ne doit jamais sacrifier un point de rang supérieur pour un point de rang inférieur sans en avertir explicitement l'équipe/Quentin.

## 9. Traçabilité — journal de décisions obligatoire

- Créer et maintenir à jour un fichier `DECISIONS.md` à la racine du dépôt, avec pour chaque entrée : date, question posée, réponse reçue, personne ayant validé, impact sur le code.
- Toute proposition du cahier des charges marquée « à valider » (§12.1, §12.2, §12.4, §16 robots IA) doit avoir une entrée correspondante dans `DECISIONS.md` avant que le code associé ne soit fusionné sur `main`.
- En cas de nouvelle question non couverte par le cahier, l'agent l'ajoute à `DECISIONS.md` en statut « en attente » **avant** de choisir une implémentation provisoire, et signale clairement dans sa réponse que c'est provisoire et pourquoi.

## 10. Communication — comment l'agent doit répondre en cas de blocage

Quand une information manque pour continuer une tâche précise, l'agent doit répondre selon ce format, sans coder d'hypothèse silencieuse en attendant :

- **Ce qui bloque** : décrire précisément l'élément manquant.
- **Pourquoi ça bloque** : expliquer l'impact concret (ex. « sans cette validation, je risque de coder des entitlements qu'il faudra refaire »).
- **Ce qui est proposé** : rappeler la proposition déjà faite dans le cahier des charges si elle existe (§12), sans la considérer comme validée.
- **Ce qui peut avancer en parallèle** : lister les tâches non bloquées sur lesquelles le travail continue pendant l'attente de la réponse.

L'agent ne doit jamais dire « j'ai terminé » ou « c'est fait » tant qu'un point du §7 (Definition of Done) n'est pas vérifié — en cas de doute, il dit explicitement ce qui reste à confirmer plutôt que d'arrondir vers un statut optimiste.
