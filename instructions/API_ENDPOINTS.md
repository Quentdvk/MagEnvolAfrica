# API_ENDPOINTS.md — Contrat d'API EAM

Document compagnon de `CAHIER_DES_CHARGES_EAM.md`, `RULES.md` et `MODULE_DONNEES.md`. Objectif : fixer un contrat d'API stable pour que le front (Next.js) et le back (Supabase PostgREST + Edge Functions) puissent être développés en parallèle sans ambiguïté, et pour que la règle « le paywall se vérifie côté serveur » (§5.1/§10.2 du cahier) soit techniquement non contournable.

**Convention générale**
- Base : deux familles d'endpoints coexistent — **PostgREST auto-généré par Supabase** (`/rest/v1/<table>`) pour les lectures simples déjà protégées par RLS, et **Edge Functions custom** (`/functions/v1/<nom>`) pour toute logique métier sensible (paywall, paiement, affiliation, facturation).
- **Règle de routage** : si une opération touche au paywall, au paiement, à la génération de lien signé, au calcul de commission ou à une écriture multi-tables transactionnelle → **toujours une Edge Function**, jamais un accès PostgREST direct depuis le front, même si RLS le permettrait techniquement. Cette règle prime sur la simplicité de dev.
- Authentification : JWT Supabase Auth en en-tête `Authorization: Bearer <token>` sur tout endpoint non explicitement public.
- Erreurs : format JSON uniforme `{ "error": { "code": "string", "message": "string" } }`, codes HTTP standards (400 validation, 401 non authentifié, 403 droits insuffisants, 404, 409 conflit, 422 règle métier violée, 429 rate limit, 500).
- Validation : tout payload d'entrée est validé par un schéma **Zod partagé** front/back (§9.2 cahier) — l'Edge Function rejette toute requête qui ne passe pas la validation, avant toute logique métier.
- Rate limiting (§10.3) : appliqué explicitement sur les endpoints marqués 🛡️.

---

## 1. Authentification (`/auth/*` — Supabase Auth natif, pas d'Edge Function custom)

| Endpoint | Méthode | Auth | Note |
|---|---|---|---|
| `/auth/v1/signup` | POST | public 🛡️ | email/téléphone + mot de passe, ou déclenché via OAuth |
| `/auth/v1/token?grant_type=password` | POST | public 🛡️ | connexion |
| `/auth/v1/authorize?provider=google` | GET | public | OAuth Google (§5.5) |
| `/auth/v1/authorize?provider=facebook` | GET | public | OAuth Facebook |
| `/auth/v1/logout` | POST | utilisateur connecté | invalide la session |
| `/auth/v1/recover` | POST | public 🛡️ | réinitialisation mot de passe |
| `/functions/v1/auth-mfa-enroll` | POST | utilisateur connecté | Edge Function custom déclenchant l'enrôlement TOTP, **obligatoire avant activation** d'un rôle back-office ≠ `inscrit` (§9.5) |

---

## 2. Profil & espace client

| Endpoint | Méthode | Auth | Description |
|---|---|---|---|
| `/rest/v1/profiles?id=eq.<id>` | GET | soi-même ou `gerant`/`administrateur` | lecture profil (RLS) |
| `/functions/v1/profile-update` | PATCH | soi-même | mise à jour profil — Edge Function (pas PostgREST direct) car interdit d'écrire soi-même le champ `role` ; la fonction filtre explicitement les champs modifiables |
| `/functions/v1/profile-export-data` | GET | soi-même | export RGPD des données personnelles (§10.6) |
| `/functions/v1/profile-delete-data` | POST | soi-même | droit à l'effacement (§10.6) — déclenche un workflow de suppression différée avec anonymisation des contenus liés (commentaires, avis) plutôt qu'une suppression en cascade destructrice |
| `/rest/v1/subscriptions?profile_id=eq.<id>` | GET | soi-même | historique abonnements |
| `/rest/v1/downloads?profile_id=eq.<id>` | GET | soi-même | historique téléchargements |
| `/rest/v1/favorites?profile_id=eq.<id>` | GET | soi-même | favoris |

---

## 3. Articles & paywall 🛡️

| Endpoint | Méthode | Auth | Description |
|---|---|---|---|
| `/functions/v1/articles-get?slug=<slug>` | GET | public (droits vérifiés en interne) | **Endpoint central du paywall.** Renvoie toujours `chapo` + les N premières lignes (`body_preview_lines`, défaut 12, §5.1). Renvoie `body_html` complet **uniquement** si la fonction détermine côté serveur que l'appelant a un abonnement actif couvrant l'article, ou que `articles.is_free = true`. Ne renvoie **jamais** le corps complet dans la réponse JSON à un appelant non autorisé, même tronqué côté front — la troncature se fait avant l'envoi réseau (cohérent avec le test de sécurité du §5.1 du cahier : « un utilisateur non autorisé peut-il récupérer le contenu complet en inspectant la réponse réseau brute ? » → doit être non). |
| `/rest/v1/articles?status=eq.publie&order=published_at.desc` | GET | public | liste d'articles (métadonnées uniquement : titre, chapo, catégorie, auteur, date — jamais `body_html` via cette route publique, colonne exclue par la vue RLS) |
| `/functions/v1/articles-audio?slug=<slug>` | GET | abonné uniquement | renvoie une URL signée courte durée vers le fichier audio (§5.1 avantage abonné) |
| `/rest/v1/categories?is_active=eq.true` | GET | public | liste des catégories paramétrées back-office |
| `/functions/v1/articles-create` | POST | `redacteur`+ | création brouillon |
| `/functions/v1/articles-submit-review` | POST | `redacteur`+ | passage `brouillon` → `en_validation` |
| `/functions/v1/articles-publish` | POST | `redacteur_en_chef`+ | validation finale + publication (§3.2) |
| `/functions/v1/articles-unpublish` | POST | `redacteur_en_chef`+ | dépublication |
| `/functions/v1/articles-like` | POST | utilisateur connecté | toggle like |
| `/functions/v1/articles-comment` | POST | utilisateur connecté 🛡️ | création commentaire, sanitizé côté serveur avant stockage |
| `/functions/v1/articles-share-track` | POST | public | incrémente `shares_count` (alimente §12.5) |

---

## 4. Kiosque (magazines)

| Endpoint | Méthode | Auth | Description |
|---|---|---|---|
| `/rest/v1/magazines?order=published_at.desc` | GET | public | liste avec filtres `edition_type`, `year` (query params PostgREST) — pour le scroll infini du §7.4 |
| `/rest/v1/magazines?numero=eq.<numero>` | GET | public | fiche produit d'un numéro |
| `/rest/v1/magazine_variants?magazine_id=eq.<id>` | GET | public | variantes disponibles — le front filtre la liste de langues selon la version sélectionnée en respectant la règle Version → Langue (§4.2) |
| `/functions/v1/magazine-preview?variant_id=<id>` | GET | public | génère l'aperçu limité pour le lecteur flipbook (§5.7/§7.6) |
| `/functions/v1/magazine-download?variant_id=<id>` | GET | acheteur ou abonné éligible uniquement | vérifie le droit côté serveur, génère un **lien signé à expiration courte** avec watermark appliqué (§10.2) — jamais d'URL statique publique |

---

## 5. Panier, commande, paiement 🛡️

| Endpoint | Méthode | Auth | Description |
|---|---|---|---|
| `/functions/v1/cart-add-item` | POST | invité (session) ou connecté | ajoute magazine/abonnement/don au panier |
| `/functions/v1/cart-get` | GET | invité (session) ou connecté | contenu panier + calcul dynamique du prix dans la devise détectée (§5.2) |
| `/functions/v1/cart-apply-affiliate?code=<short_code>` | POST | public | attribution du lien d'affiliation au panier (§4.5, tracking avant conversion) |
| `/functions/v1/cart-estimate-shipping` | POST | invité ou connecté | calcule les frais DHL ou le tarif forfaitaire local selon le pays de livraison (§12.3) |
| `/functions/v1/checkout-create-order` | POST | invité ou connecté 🛡️ | transforme le panier en commande `en_attente_paiement`, initie la transaction Moneroo, renvoie l'URL/token de paiement |
| `/functions/v1/webhooks-moneroo` | POST | signature Moneroo (pas de JWT utilisateur) 🛡️ | **point d'entrée unique des confirmations de paiement.** Vérifie la signature cryptographique avant toute écriture (§10.4) ; idempotent (rejoue sans dupliquer si Moneroo renvoie le même événement) ; met à jour `orders`/`subscriptions`/`donations` selon le type de paiement. |
| `/rest/v1/orders?profile_id=eq.<id>` | GET | soi-même | historique commandes |

---

## 6. Abonnements

| Endpoint | Méthode | Auth | Description |
|---|---|---|---|
| `/rest/v1/subscription_plans?is_active=eq.true` | GET | public | 4 formules affichées sur la page « S'abonner » |
| `/functions/v1/subscription-subscribe` | POST | connecté | crée l'abonnement `en_attente_paiement`, initie Moneroo |
| `/functions/v1/subscription-cancel` | POST | soi-même | annulation, cohérent avec la politique de renouvellement |
| `/functions/v1/subscription-change-plan` | POST | soi-même | changement de palier |
| `/functions/v1/cron-subscription-renewal` | Edge Function planifiée (pg_cron), pas de route HTTP publique | interne | job quotidien : bascule `is_first_period`, déclenche les prélèvements Moneroo à échéance, gère les échecs de paiement |

---

## 7. Dons

| Endpoint | Méthode | Auth | Description |
|---|---|---|---|
| `/functions/v1/donation-create` | POST | public 🛡️ | tunnel de don en 2 étapes (§4.3) — un seul appel avec `payment_method` conditionnant les champs requis (`phone_number` si mobile money, `payment_reference` si carte/autre) |

---

## 8. Affiliation 🛡️

| Endpoint | Méthode | Auth | Description |
|---|---|---|---|
| `/functions/v1/affiliate-generate-link` | POST | connecté | crée un lien général ou spécifique à un numéro (§4.5) |
| `/rest/v1/affiliate_links?profile_id=eq.<id>` | GET | soi-même | mes liens |
| `/rest/v1/affiliate_clicks?link_id=eq.<id>` | GET | soi-même (via jointure RLS) | stats de clics |
| `/functions/v1/affiliate-dashboard-summary` | GET | connecté (affilié) | agrégats temps réel (gains cumulés, conversions) — utilise Supabase Realtime pour le live (§9.9) |
| `/functions/v1/affiliate-request-payout` | POST | connecté | vérifie le seuil de 150 000 XOF côté serveur avant de créer la demande |

---

## 9. Notifications & favoris

| Endpoint | Méthode | Auth | Description |
|---|---|---|---|
| `/functions/v1/notifications-subscribe-push` | POST | connecté | enregistre l'abonnement Web Push VAPID |
| `/rest/v1/notifications?profile_id=eq.<id>&read_at=is.null` | GET | soi-même | badge/compteur non lus |
| `/functions/v1/notifications-mark-read` | POST | soi-même | |
| `/functions/v1/favorites-toggle` | POST | connecté | ajoute/retire un favori |

---

## 10. Recherche

| Endpoint | Méthode | Auth | Description |
|---|---|---|---|
| `/functions/v1/search?q=<query>&scope=articles` | GET | public | proxy vers Meilisearch, index articles publiés uniquement (jamais le corps complet verrouillé) |
| `/functions/v1/search?q=<query>&scope=kiosque` | GET | public | recherche catalogue Kiosque par titre/sommaire |

---

## 11. Back-office / Administration

| Endpoint | Méthode | Auth | Description |
|---|---|---|---|
| `/rest/v1/site_settings` | GET/PATCH | `administrateur` (lecture élargie à `gerant`) | paramètres globaux (§6.1 module-données) |
| `/rest/v1/footer_links` | GET/POST/PATCH/DELETE | public en GET, `administrateur` en écriture | §7.2 |
| `/rest/v1/mega_menu_items` | GET/POST/PATCH/DELETE | public en GET, `redacteur_en_chef`+ en écriture | §16 |
| `/rest/v1/landing_blocks` | GET/POST/PATCH | public en GET, `redacteur_en_chef`+ en écriture | affectation des blocs Sentinelles/Essor/Ombre douce/Clarté/sous-blocs Fil d'info (§7.3) — **les 7 sous-blocs restent non assignables tant que §12.1 n'est pas validé**, à bloquer côté UI back-office avec message explicite plutôt que de permettre une saisie libre |
| `/rest/v1/popup_campaigns` | GET/POST/PATCH | public en GET (campagne active), `administrateur` en écriture | §5.3/§12.4 |
| `/functions/v1/admin-dashboard-metrics` | GET | `gerant`/`administrateur` | ventes, abonnements, affiliation (§3.2) |
| `/rest/v1/service_requests` | GET | `gerant`/`administrateur` | demandes du formulaire « Autres services » |
| `/functions/v1/admin-affiliate-validate-payout` | POST | `administrateur` | validation manuelle d'un retrait |
| `/rest/v1/audit_log` | GET | `administrateur` | journal d'audit (§10.8), lecture seule, jamais d'écriture directe via API (uniquement via triggers) |

---

## 12. Internationalisation & géo

| Endpoint | Méthode | Auth | Description |
|---|---|---|---|
| `/functions/v1/geo-detect` | GET | public | déduit langue/devise par défaut depuis l'IP (Vercel Geolocation, §9.11) — **n'écrase jamais** un `preferred_language`/`preferred_currency` déjà défini côté utilisateur (§5.2, choix manuel prioritaire) |
| `/rest/v1/exchange_rates` | GET | public | taux à jour, lus depuis la table, jamais recalculés à la volée |

---

## 13. Règle de conformité transverse

Avant de considérer un endpoint « terminé » au sens du §7 de `RULES.md` (Definition of Done), l'agent vérifie systématiquement :
1. Un accès direct PostgREST ne contourne-t-il pas une Edge Function censée porter la logique sensible ?
2. La réponse JSON, inspectée brute, contient-elle une donnée à laquelle l'appelant n'a pas droit (corps d'article verrouillé, URL de fichier non signée, clé secrète) ?
3. Le endpoint marqué 🛡️ a-t-il bien une règle de rate limiting configurée (§10.3) ?
4. Le payload d'entrée est-il validé par un schéma Zod avant toute écriture ?
