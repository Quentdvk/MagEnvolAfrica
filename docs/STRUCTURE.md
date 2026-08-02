# Structure du Projet

Document détaillant l'organisation du code et des fichiers du projet Envol Africa Magazine.

## 📁 Arborescence Complète

```
envol-africa-mag/
├── .github/
│   └── workflows/
│       └── ci.yml              # Configuration GitHub Actions (lint, tests, build)
├── .husky/
│   └── pre-commit              # Hook Git pre-commit (lint + format check)
├── drizzle/                    # Migrations Drizzle (générées automatiquement)
├── instructions/              # Documentation du projet
│   ├── API_ENDPOINTS.md       # Contrat d'API
│   ├── BACKLOG_SPRINTS.md     # Backlog découpé en sprints
│   ├── CAHIER_DES_CHARGES_EAM.md  # Cahier des charges fonctionnel & technique
│   ├── CONNECTEURSMCP.md      # Configuration des connecteurs MCP
│   ├── MATRICE_PERMISSIONS.md # Matrice des permissions
│   ├── MODULE_DONNEES.md      # Modèle de données (schéma DB)
│   ├── RULES.md               # Règles de développement
│   └── USER_FLOWS.md          # Parcours utilisateurs clés
├── public/                     # Assets statiques
│   ├── images/
│   ├── fonts/
│   └── favicon.ico
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Groupe de routes auth
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (public)/          # Groupe de routes publiques
│   │   │   ├── kiosque/
│   │   │   ├── articles/
│   │   │   └── s-abonner/
│   │   ├── (back-office)/     # Groupe de routes back-office
│   │   │   ├── admin/
│   │   │   ├── redacteur/
│   │   │   └── redacteur-en-chef/
│   │   ├── api/               # API Routes (si nécessaire)
│   │   │   └── webhooks/
│   │   ├── layout.tsx         # Layout racine
│   │   ├── page.tsx           # Page d'accueil (landing)
│   │   └── globals.css        # Styles globaux
│   ├── components/             # Composants React
│   │   ├── ui/                # Composants shadcn/ui
│   │   ├── layout/            # Composants de layout (Header, Footer, etc.)
│   │   ├── editorial/          # Composants éditoriaux (ArticleCard, etc.)
│   │   ├── kiosque/           # Composants du kiosque
│   │   ├── auth/              # Composants d'authentification
│   │   └── forms/             # Composants de formulaires
│   ├── db/                    # Configuration base de données
│   │   ├── schema.ts          # Schéma Drizzle ORM
│   │   ├── index.ts           # Client Drizzle
│   │   └── migrations/        # Migrations manuelles (si nécessaire)
│   ├── lib/                   # Utilitaires et helpers
│   │   ├── supabase/          # Client Supabase
│   │   ├── moneroo/           # Client Moneroo
│   │   ├── resend/            # Client Resend
│   │   ├── validators/        # Schémas Zod
│   │   └── utils.ts           # Fonctions utilitaires générales
│   ├── hooks/                 # Custom React hooks
│   │   ├── useAuth.ts         # Hook d'authentification
│   │   ├── useCart.ts         # Hook panier
│   │   ├── useSubscription.ts # Hook abonnements
│   │   └── useAffiliate.ts   # Hook affiliation
│   ├── store/                 # Zustand stores
│   │   ├── cartStore.ts       # Store panier
│   │   ├── uiStore.ts         # Store UI (modals, etc.)
│   │   └── sessionStore.ts   # Store session
│   ├── types/                 # Types TypeScript
│   │   ├── index.ts           # Types globaux
│   │   ├── api.ts             # Types API
│   │   └── db.ts              # Types base de données
│   └── test/                  # Configuration tests
│       ├── setup.ts           # Setup Vitest
│       └── helpers.ts         # Helpers de test
├── .commitlintrc              # Configuration Commitlint
├── .env.local                # Variables d'environnement (non versionné)
├── .env.example              # Exemple de variables d'environnement
├── .eslintrc.json            # Configuration ESLint
├── .gitignore                # Fichiers ignorés par Git
├── .prettierrc               # Configuration Prettier
├── .prettierignore           # Fichiers ignorés par Prettier
├── DECISIONS.md              # Journal de décisions
├── drizzle.config.ts         # Configuration Drizzle
├── next.config.ts            # Configuration Next.js
├── package.json              # Dépendances NPM
├── postcss.config.mjs        # Configuration PostCSS
├── README.md                 # Documentation principale
├── tailwind.config.ts        # Configuration Tailwind CSS
├── tsconfig.json             # Configuration TypeScript
└── vitest.config.ts          # Configuration Vitest
```

## 📂 Détail des Dossiers Principaux

### `src/app/` - Next.js App Router

Organisation des pages et layouts selon le pattern App Router de Next.js 15.

**Groupes de routes** (Route Groups) :
- `(auth)` : Pages d'authentification (login, register, forgot-password)
- `(public)` : Pages accessibles sans authentification (kiosque, articles, abonnement)
- `(back-office)` : Pages protégées par rôle (admin, rédacteur, etc.)

**Fichiers clés** :
- `layout.tsx` : Layout racine avec Header/Footer globaux
- `page.tsx` : Landing page principale
- `globals.css` : Styles globaux Tailwind

### `src/components/` - Composants React

**Sous-dossiers thématiques** :
- `ui/` : Composants shadcn/ui (Button, Input, Modal, etc.)
- `layout/` : Composants de layout (Header, Footer, Navigation)
- `editorial/` : Composants liés au contenu éditorial
- `kiosque/` : Composants spécifiques au kiosque
- `auth/` : Composants d'authentification
- `forms/` : Composants de formulaires réutilisables

### `src/db/` - Base de Données

**Fichiers** :
- `schema.ts` : Définition complète des tables Drizzle ORM
- `index.ts` : Instance client Drizzle avec connexion pool
- `migrations/` : Migrations manuelles (si nécessaire)

### `src/lib/` - Utilitaires

**Sous-dossiers** :
- `supabase/` : Wrappers autour du client Supabase
- `moneroo/` : Intégration API Moneroo
- `resend/` : Intégration API Resend
- `validators/` : Schémas de validation Zod
- Fichiers utilitaires généraux

### `src/hooks/` - Custom Hooks

Hooks personnalisés React pour encapsuler la logique métier :
- `useAuth.ts` : Gestion de l'authentification
- `useCart.ts` : Gestion du panier
- `useSubscription.ts` : Gestion des abonnements
- `useAffiliate.ts` : Gestion de l'affiliation

### `src/store/` - État Global

Stores Zustand pour l'état global de l'application :
- `cartStore.ts` : État du panier
- `uiStore.ts` : État UI (modals, notifications, etc.)
- `sessionStore.ts` : État de session utilisateur

### `src/types/` - Types TypeScript

Définitions de types TypeScript pour :
- Types globaux de l'application
- Types API (requêtes/réponses)
- Types base de données (générés depuis Drizzle)

## 🎯 Conventions de Nommage

### Fichiers

- **Composants** : PascalCase (`ArticleCard.tsx`, `Header.tsx`)
- **Hooks** : camelCase avec préfixe `use` (`useAuth.ts`, `useCart.ts`)
- **Stores** : camelCase avec suffixe `Store` (`cartStore.ts`)
- **Utilitaires** : camelCase (`formatDate.ts`, `validateEmail.ts`)
- **Types** : camelCase ou PascalCase selon contexte

### Dossiers

- **Composants** : kebab-case (`article-card/`, `user-profile/`)
- **Routes** : kebab-case (`kiosque/`, `s-abonner/`)
- **Utilitaires** : kebab-case (`validators/`, `utils/`)

## 🔗 Dépendances Entre Modules

```
src/app/
  └── components/
  └── hooks/
  └── lib/
      └── db/
  └── store/
      └── hooks/
```

**Règles** :
- Les composants peuvent utiliser des hooks et des stores
- Les hooks peuvent utiliser des stores et des utilitaires
- Les stores peuvent utiliser des utilitaires
- Les utilitaires peuvent utiliser la base de données
- La base de données ne dépend d'aucun autre module (couche la plus basse)

## 📝 Notes Importantes

1. **Pas de logique métier dans les composants** : La logique doit être dans les hooks ou les stores
2. **Typage strict** : Tous les fichiers doivent être typés avec TypeScript
3. **Composants réutilisables** : Privilégier des composants petits focaux et réutilisables
4. **Tests** : Chaque module important doit avoir des tests unitaires
5. **Documentation** : Les fonctions complexes doivent être documentées avec JSDoc

## 🚀 Prochaines Étapes

1. Créer les composants de layout de base (Header, Footer)
2. Implémenter l'authentification Supabase
3. Créer les pages principales (Landing, Kiosque)
4. Implémenter le paywall
5. Intégrer Moneroo pour les paiements
6. Développer le back-office

---

**Version**: 0.1.0  
**Dernière mise à jour**: Août 2026
