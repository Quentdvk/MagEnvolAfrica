# Configuration du site (Supabase, admin, données, Moneroo)

## 1. Variables d'environnement

En local : créer `.env.local` à la racine (copier `.env.example`).
Sur Vercel : Project Settings > Environment Variables, puis **redéployer** (les variables
`NEXT_PUBLIC_*` sont injectées au moment du build).

| Variable                        | Où la trouver                                       | Rôle                                          |
| ------------------------------- | --------------------------------------------------- | --------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase > Project Settings > API                    | URL du projet (connexion, lecture des données) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase > Project Settings > API                    | Clé publique (navigateur + serveur)            |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase > Project Settings > API                    | Clé serveur (webhooks, emails du back-office)  |
| `MONEROO_SECRET_KEY`            | Dashboard Moneroo > API Keys                         | Initialisation et vérification des paiements   |
| `MONEROO_WEBHOOK_SECRET`        | Dashboard Moneroo > Webhooks                         | Vérification de la signature des webhooks      |
| `NEXT_PUBLIC_APP_URL`           | URL publique du site                                 | `return_url` après paiement                    |

Tant que `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` sont absentes, la page de
connexion affiche un bandeau explicite et le site affiche des données de démonstration.

⚠️ `SUPABASE_SERVICE_ROLE_KEY`, `MONEROO_SECRET_KEY` et `MONEROO_WEBHOOK_SECRET` ne doivent jamais
être préfixées par `NEXT_PUBLIC_` : elles resteraient exposées dans le navigateur.

## 2. Base de données

Dans Supabase > SQL Editor, exécuter dans l'ordre :

1. `drizzle/0003_create_all_tables.sql` — tables, trigger de création de profil, catégories et plans.
2. `drizzle/0002_create_admin.sql` — attribue le rôle `administrateur` au compte
   `yekpondafe@gmail.com` (le compte doit exister au préalable : Authentication > Users > Add user,
   avec « Auto Confirm User » activé).
3. `drizzle/0004_seed_test_data.sql` — articles publiés, magazines et formats de test (idempotent).

Rôles valides : `inscrit`, `redacteur`, `redacteur_en_chef`, `gerant`, `administrateur`.
Statuts d'article valides : `brouillon`, `en_validation`, `publie`, `depublie`.
Le back-office `/admin` est accessible aux rôles `administrateur` et `gerant`.

## 3. Moneroo

- Initialisation du paiement : `POST /api/payments/initialize`
  (corps `{"itemType":"abonnement","planId":"..."}` ou
  `{"itemType":"magazine","magazineVariantId":"..."}`). L'utilisateur doit être connecté.
  La route crée la commande, appelle Moneroo côté serveur et renvoie `checkoutUrl`.
- Webhook à déclarer dans le dashboard Moneroo :
  `https://<domaine-du-site>/api/webhooks/moneroo`
  La signature `X-Moneroo-Signature` (HMAC-SHA256 du corps brut) est vérifiée ; une signature
  invalide reçoit un `403`. Le statut final est ensuite revérifié via l'API Moneroo avant de
  confirmer le paiement, de passer la commande en `payee` et d'activer l'abonnement.
- Page de retour client : `/paiement/retour`.

## 4. Vérification rapide

```bash
npm run lint
npx tsc --noEmit
npm run build
npx vitest run
```
