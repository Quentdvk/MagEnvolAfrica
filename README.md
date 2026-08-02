# Envol Africa Magazine

Site de presse panafricain premium, kiosque digital et plateforme d'abonnement pour l'écosystème ENVOL AFRICA GROUPE.

## 🏗️ Architecture Technique

### Stack Principale
- **Frontend**: Next.js 15 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime + Edge Functions)
- **ORM**: Drizzle ORM
- **Déploiement**: Vercel (frontend) + Supabase Cloud (backend)
- **CI/CD**: GitHub Actions (lint, tests, build) + Vercel Git Integration
- **Paiement**: Moneroo (Mobile Money & carte)
- **Email**: Resend
- **Recherche**: Meilisearch (auto-hébergé)
- **Analytics**: Plausible Analytics
- **Tests**: Vitest (unit tests) + Playwright (E2E)

### Structure du Projet

```
envol-africa-mag/
├── src/
│   ├── app/              # Next.js App Router (pages, layouts)
│   ├── components/      # Composants React réutilisables
│   ├── db/              # Schéma Drizzle ORM et configuration DB
│   ├── lib/             # Utilitaires et helpers
│   ├── hooks/           # Custom React hooks
│   ├── store/           # Zustand stores (état global)
│   └── test/            # Configuration et setup tests
├── drizzle/             # Migrations Drizzle
├── instructions/        # Documentation du projet (cahier des charges, règles, etc.)
├── .github/workflows/   # GitHub Actions CI/CD
└── public/              # Assets statiques
```

## 🚀 Getting Started

### Prérequis

- Node.js 20+
- npm
- Compte Supabase (Développement + Recette + Production)
- Compte Vercel
- Compte GitHub

### Installation

1. **Cloner le dépôt**
```bash
git clone <repository-url>
cd EnvolAfricaMag
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**

Créer un fichier `.env.local` à la racine :

```env
# Supabase
DATABASE_URL=postgresql://postgres:[password]@[project-ref].supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]

# Moneroo (Sandbox pour le développement)
MONEROO_SECRET_KEY=[sandbox-secret-key]
MONEROO_PUBLIC_KEY=[sandbox-public-key]

# Resend
RESEND_API_KEY=[resend-api-key]

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Initialiser la base de données**

```bash
# Générer les migrations
npm run db:generate

# Pousser les migrations vers Supabase
npm run db:push
```

5. **Lancer le serveur de développement**

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans le navigateur.

## 📚 Scripts Disponibles

```bash
# Développement
npm run dev              # Serveur de développement
npm run build            # Build de production
npm run start            # Serveur de production

# Qualité de code
npm run lint             # ESLint
npm run lint:fix         # ESLint avec auto-fix
npm run format           # Prettier (formatage)
npm run format:check     # Prettier (vérification)

# Tests
npm test                 # Tests unitaires (Vitest)
npm run test:ui          # Interface UI Vitest
npm run test:e2e         # Tests E2E (Playwright)

# Base de données
npm run db:generate      # Générer les migrations Drizzle
npm run db:migrate       # Appliquer les migrations
npm run db:push          # Pousser le schéma vers Supabase
npm run db:studio        # Ouvrir Drizzle Studio
```

## 🔒 Sécurité

### Règles de Sécurité

- **Paywall**: Vérification côté serveur (Edge Functions), jamais côté client
- **RLS**: Row Level Security activé sur toutes les tables sensibles
- **Téléchargements**: Liens signés à expiration courte (Supabase Storage)
- **Paiement**: Webhooks Moneroo vérifiés par signature cryptographique
- **MFA**: Multi-factor authentication obligatoire pour les rôles back-office
- **Secrets**: Jamais en dur dans le code, toujours via variables d'environnement

### Matrice des Rôles

Voir `instructions/MATRICE_PERMISSIONS.md` pour la matrice complète des permissions.

## 📖 Documentation

- **Cahier des charges**: `instructions/CAHIER_DES_CHARGES_EAM.md`
- **Règles de développement**: `instructions/RULES.md`
- **API Endpoints**: `instructions/API_ENDPOINTS.md`
- **Modèle de données**: `instructions/MODULE_DONNEES.md`
- **User Flows**: `instructions/USER_FLOWS.md`
- **Backlog & Sprints**: `instructions/BACKLOG_SPRINTS.md`
- **Connecteurs MCP**: `instructions/CONNECTEURSMCP.md`
- **Décisions**: `DECISIONS.md`

## 🚢 Déploiement

### Environnements

- **Développement**: Branche `main` → Preview deployment Vercel
- **Recette**: Environnement Supabase dédié
- **Production**: Branche `main` → Production deployment Vercel

### Pipeline CI/CD

1. Pull Request créée → Déploiement Preview Vercel
2. GitHub Actions exécute : lint, type-check, format-check, tests, build
3. Merge sur `main` → Déploiement Production Vercel
4. Migrations appliquées automatiquement

## 🤝 Contribution

1. Créer une branche depuis `main`
2. Suivre les règles de `instructions/RULES.md`
3. Commit avec messages conventionnels (Commitlint)
4. Ouvrir une Pull Request
5. Attendre validation des checks GitHub Actions
6. Merge après revue de code

## 📝 Points Bloquants

Voir `DECISIONS.md` pour la liste des points en attente de validation.

## 📄 Licence

Propriété de ENVOL AFRICA GROUPE. Tous droits réservés.

---

**Version**: 0.1.0  
**Dernière mise à jour**: Août 2026
