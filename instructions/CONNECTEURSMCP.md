# CONNECTEURSMCP.md — Connecteurs & serveurs MCP nécessaires au projet EAM

*Version 1.1 — Août 2026 (corrigée) — précise le partage des rôles entre Vercel et GitHub Actions dans le pipeline de déploiement, cohérent avec CAHIER_DES_CHARGES_EAM.md §9.15/§12.6bis et RULES.md §5.*

Ce document liste, service par service, le connecteur ou serveur MCP à utiliser pour que les agents IA (Claude Code, Cursor, etc.) puissent agir directement sur Supabase, Vercel, GitHub et les autres briques de la stack **sans que quelqu'un doive coller une clé API à la main à chaque session**.

Ces trois connecteurs (Supabase, Vercel, GitHub) forment le **triptyque de déploiement retenu pour EAM** — aucune alternative (GitLab, Netlify, Firebase...) n'est à considérer sauf blocage documenté et validé par Quentin.

**Principe de lecture** : pour chaque service, je précise s'il existe un connecteur **officiel confirmé** (vérifié à la date de rédaction) ou si aucun connecteur officiel n'existe — auquel cas je donne l'alternative la plus fiable plutôt que d'inventer un nom de package qui ne fonctionnerait pas.

---

## 0. Règle de sécurité avant toute chose

- **Aucune clé API en clair dans un prompt, un message de chat, un fichier versionné (Git) ou un fichier partagé sur Drive.**
- Toutes les clés listées ci-dessous vont dans un gestionnaire de secrets (Vercel Environment Variables, Supabase Vault, ou le trousseau local du client MCP type `claude mcp add` avec variable d'environnement) — jamais dans `rules.md`, `connecteursmcp.md` ou un fichier `.md` de doc.
- Créer des clés **à portée limitée** (scoped) quand le service le permet : un token Supabase lié à un seul projet, un token GitHub avec les seuls scopes nécessaires (repo, pas admin:org), un token Vercel lié à une seule équipe.
- Toute clé de **production** (paiement Moneroo, Supabase prod) reste hors de portée des agents en phase de développement. Les agents travaillent sur les clés de **Développement/Recette** ; le passage en Production reste une action humaine validée.

---

## 1. Supabase — base de données, auth, storage, edge functions

**Statut : connecteur MCP officiel confirmé.**

Le serveur MCP officiel `@supabase/mcp-server-supabase` donne accès à plus de 20 outils : exécution SQL, gestion des tables, migrations, déploiement d'Edge Functions, lecture des logs, gestion des utilisateurs Auth.

### Configuration (mode local, recommandé en développement)

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--project-ref=<VOTRE_PROJECT_REF>",
        "--read-only"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "<VOTRE_TOKEN_SUPABASE>"
      }
    }
  }
}
```

### Où récupérer le token
Supabase Dashboard → Account → Access Tokens → Generate new token.

### Règles d'usage pour les agents
- **`--read-only` activé par défaut.** Le flag n'est retiré que pour une tâche précise de migration/écriture, validée au préalable — jamais laissé en écriture libre en continu (risque documenté d'injection de prompt via du contenu utilisateur stocké en base, ex. un commentaire malveillant qui manipule l'agent).
- **`--project-ref` toujours renseigné**, pour empêcher l'agent d'accéder à un autre projet Supabase du compte (ex. un projet d'un autre produit de l'écosystème ENVOL AFRICA).
- Ne jamais pointer ce connecteur vers le projet Supabase de **production** pendant le développement — un projet Supabase dédié « Développement » et un dédié « Recette » doivent exister en amont (cohérent avec le §9.15 du cahier des charges : 3 environnements séparés).

### Ligne Claude Code (raccourci CLI)
```
claude mcp add supabase -- npx -y @supabase/mcp-server-supabase@latest --read-only --project-ref=<VOTRE_PROJECT_REF>
```
Après cette commande, une authentification est déclenchée pour lier le token.

---

## 2. Vercel — déploiement, projets, logs, analytics

**Statut : connecteur MCP officiel confirmé, hébergé (aucune installation locale).**

Serveur distant officiel à l'adresse `https://mcp.vercel.com`. Authentification par OAuth (pas de clé API à coller manuellement — l'agent déclenche une connexion via navigateur une seule fois).

### Configuration

```json
{
  "mcpServers": {
    "vercel": {
      "command": "npx",
      "args": ["mcp-remote", "https://mcp.vercel.com"]
    }
  }
}
```

### Ligne Claude Code
```
claude mcp add vercel --transport http https://mcp.vercel.com
```

### Ce que l'agent peut faire avec
Rechercher la documentation Vercel, gérer les projets et déploiements, consulter les logs et le Web Analytics du compte déjà utilisé par l'équipe. Pas besoin de générer un token Vercel séparé pour ce connecteur — l'OAuth suffit.

### Règle d'usage
- L'accès aux **variables d'environnement de production** (clés Moneroo prod, secrets Supabase prod) reste une action manuelle de l'humain dans le dashboard Vercel, même une fois ce connecteur actif — l'agent ne doit pas être celui qui saisit une clé de production.
- **C'est Vercel, pas GitHub Actions, qui déploie.** Le connecteur Vercel MCP sert à consulter l'état des déploiements déjà déclenchés par l'intégration Git native (push = Preview, merge sur `main` = Production), pas à lancer un déploiement manuellement depuis l'agent en dehors de ce flux normal — sauf action explicite demandée par Quentin (ex. rollback vers un déploiement précédent).

---

## 3. GitHub — dépôt de code, pull requests, issues, CI

**Statut : connecteur MCP officiel confirmé, hébergé (recommandé) ou local via Docker.**

### Option recommandée — serveur distant (aucune installation)

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["mcp-remote", "https://api.githubcopilot.com/mcp/"]
    }
  }
}
```

### Ligne Claude Code
```
claude mcp add github --transport http https://api.githubcopilot.com/mcp/
```
Authentification par OAuth GitHub au premier lancement.

### Option alternative — serveur local (si le client ne supporte pas le distant)

```json
{
  "mcpServers": {
    "github-mcp-server": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm",
        "-e", "GITHUB_PERSONAL_ACCESS_TOKEN",
        "ghcr.io/github/github-mcp-server"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "<VOTRE_PAT_GITHUB>"
      }
    }
  }
}
```

### Où créer le token (si mode PAT)
GitHub → Settings → Developer settings → Personal access tokens → Fine-grained token, **scope limité au dépôt EAM uniquement**, permissions : Contents (write), Pull requests (write), Issues (write) — pas de scope `admin:org`.

### Règle d'usage pour les agents
- Restreindre les toolsets activés à ce qui est utile (`repos,issues,pull_requests,actions`) via le header `X-MCP-Toolsets`, plutôt que de laisser tous les outils actifs par défaut.
- Aucun agent ne pousse directement sur `main` (cohérent avec §9.15 du cahier : protection de branche + revue de code obligatoire) — même en mode autonome, l'agent ouvre une pull request, il ne merge pas seul.
- Le workflow **GitHub Actions** à mettre en place dans `.github/workflows/` sert de **portail qualité avant merge** (lint ESLint, tests Vitest, build, Playwright sur l'URL Preview générée par Vercel) — il ne contient **aucune étape de déploiement** puisque Vercel s'en charge nativement via son intégration Git. L'agent ne doit pas dupliquer cette logique de déploiement dans un workflow Actions.

---

## 4. Moneroo — paiement (Mobile Money & carte)

**Statut : aucun connecteur MCP officiel identifié à ce jour.** Moneroo est une plateforme de paiement panafricaine récente ; elle n'a pas publié de serveur MCP au moment de la rédaction de ce document. Ne pas faire confiance à un package qui prétendrait être « le MCP officiel Moneroo » sans l'avoir vérifié sur le dépôt/la documentation Moneroo au moment de l'implémentation.

### Approche recommandée en attendant

1. **Accès direct par clé API REST**, stockée en variable d'environnement, jamais via un connecteur MCP tiers non vérifié :
   ```
   MONEROO_SECRET_KEY=<clé secrète Moneroo, environnement Sandbox pour le développement>
   MONEROO_PUBLIC_KEY=<clé publique Moneroo>
   ```
   Ces clés sont posées dans Vercel Environment Variables (scope Development/Preview séparé de Production) et dans Supabase Vault pour les Edge Functions qui appellent l'API Moneroo (webhooks, création de paiement).

2. Si l'équipe veut donner aux agents une capacité d'interroger l'état des paiements en langage naturel, la solution la plus fiable est de **construire un petit serveur MCP interne maison** (quelques dizaines de lignes avec le SDK MCP officiel, en Node/TypeScript) qui expose 2-3 outils simples (`get_payment_status`, `list_recent_transactions`) en appelant l'API Moneroo côté serveur avec la clé secrète — jamais la clé secrète donnée directement à l'agent.

3. **Ne jamais utiliser l'environnement de production Moneroo pendant le développement.** Toujours démarrer avec les clés Sandbox fournies par Moneroo, et ne basculer sur les clés live qu'au moment du go-live, en validation humaine.

### Ce que l'agent ne doit jamais faire ici
- Ne jamais coder ou tester avec la clé secrète de production Moneroo dans son contexte de travail.
- Ne jamais logguer une clé Moneroo, même partiellement, dans un fichier de debug ou une issue GitHub.

---

## 5. Autres services de la stack — statut à vérifier au moment de l'implémentation

Pour les briques suivantes du §9 du cahier des charges, je n'ai **pas** de confirmation d'un connecteur MCP officiel maintenu par l'éditeur au moment de la rédaction. Plutôt que d'indiquer un nom de package incertain, voici la marche à suivre pour chacune :

| Service | Rôle dans EAM | Marche à suivre |
|---|---|---|
| **Resend / Brevo** | E-mails transactionnels, newsletters | Vérifier sur le site de l'éditeur ou le registre officiel MCP (`registry.modelcontextprotocol.io`) l'existence d'un serveur MCP au moment de démarrer la Phase 1 ; sinon, clé API en variable d'environnement uniquement, appelée depuis les Edge Functions — pas d'accès direct agent. |
| **Meilisearch** | Recherche plein texte | Auto-hébergé : accès par clé API admin/recherche séparées. Un connecteur MCP n'apporte pas grand-chose ici, l'indexation étant pilotée par le code applicatif, pas par un agent en conversation. |
| **Sentry** | Suivi des erreurs | Vérifier le registre MCP officiel à l'implémentation — Sentry a annoncé des intégrations IA par le passé, à reconfirmer avant usage. |
| **Cloudinary** | CDN images | Clé API + secret en variable d'environnement, pas d'accès agent nécessaire (traitement automatique côté code). |
| **Better Uptime / UptimeRobot** | Monitoring disponibilité | Clé API en variable d'environnement si besoin de dashboard custom ; pas de connecteur agent nécessaire pour ce périmètre. |
| **Google Search Console / Bing Webmaster** | SEO | Accès via compte Google/Microsoft de l'organisation, hors périmètre agent — action humaine de vérification de propriété du domaine. |

**Règle générale pour cette catégorie** : avant d'annoncer « connecteur X configuré », l'agent doit avoir vérifié la source officielle (documentation de l'éditeur ou `registry.modelcontextprotocol.io`), pas une source tierce non vérifiée. En cas de doute, se rabattre sur un accès API classique par clé stockée en variable d'environnement, appelée uniquement côté serveur (Edge Function), jamais donnée en direct à l'agent conversationnel.

---

## 6. Récapitulatif — variables d'environnement à préparer par Quentin avant le démarrage

Pour que les agents ne soient jamais bloqués en cours de sprint, ces éléments doivent être réunis **avant** le début de la Phase 1 (voir aussi §12.7 du cahier des charges — dossier Drive « EAM — Assets & Specs ») :

- [ ] `SUPABASE_ACCESS_TOKEN` (compte Développeur) + `project-ref` du projet Supabase Développement
- [ ] `project-ref` séparé pour Supabase Recette (Staging)
- [ ] Accès OAuth Vercel de l'équipe (compte/team à autoriser)
- [ ] Accès OAuth GitHub de l'équipe + dépôt EAM créé avec protection de branche `main`
- [ ] `MONEROO_SECRET_KEY` / `MONEROO_PUBLIC_KEY` en environnement **Sandbox**
- [ ] Clés OAuth Google Login et Facebook Login (créées dans les consoles développeur respectives)
- [ ] Accès au dossier Google Drive « EAM — Assets & Specs » (logos, EAM N°0001, plan PDF des blocs)
- [ ] Compte DHL Express entreprise (MyDHL API) — ou confirmation que ce point reste en attente (voir `DECISIONS.md`, §12.3 du cahier)

Tant qu'un de ces éléments manque, la ou les tâches qui en dépendent doivent être signalées comme bloquées selon la règle « Stop & Ask » de `rules.md`, pas contournées par une valeur factice laissée en code.
