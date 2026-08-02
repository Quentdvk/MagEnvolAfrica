# MODULE_DONNEES.md — Modèle de données EAM (Supabase / PostgreSQL)

Document compagnon de `CAHIER_DES_CHARGES_EAM.md` (v1.1) et `RULES.md`. Il traduit les règles métier du cahier en schéma de tables concret, pour que l'agent n'ait jamais à inventer une structure de données en cours de développement.

**Convention** : tables en `snake_case` singulier-pluriel standard Postgres, clés primaires `uuid` (`gen_random_uuid()`), horodatage `created_at` / `updated_at` (trigger `moddatetime`) sur toutes les tables sauf tables de log immuables. RLS = Row Level Security. Toute table marquée 🔒 doit avoir RLS activé avant la mise en recette (RULES.md §3).

---

## 0. Principe de lecture

Pour chaque table : rôle, colonnes clés, relations, règle métier associée (référence au § du cahier), et note RLS. Les enums Postgres sont utilisés partout où le cahier fige une liste de valeurs fermée (§0 rules.md : ne jamais renommer/inventer une valeur hors de cette liste sans validation).

---

## 1. Identité & rôles

### 1.1 `profiles` 🔒
Étend `auth.users` (Supabase Auth). Une ligne par utilisateur, créée automatiquement via trigger `on_auth_user_created`.

| Colonne | Type | Note |
|---|---|---|
| `id` | uuid (FK `auth.users.id`, PK) | |
| `full_name` | text | |
| `phone` | text | utilisé si inscription par téléphone (§5.5) |
| `avatar_url` | text | |
| `role` | `user_role` enum | `visiteur` n'existe pas en base (non authentifié) ; valeurs : `inscrit`, `redacteur`, `redacteur_en_chef`, `gerant`, `administrateur`. Un abonné n'est **pas** un rôle — c'est déduit de `subscriptions` (voir §2). |
| `preferred_language` | text (ISO 639-1) | prime sur la géo-détection dès qu'il est renseigné (§5.2 — le choix manuel prime toujours) |
| `preferred_currency` | text (ISO 4217) | idem |
| `mfa_enabled` | boolean | doit être `true` avant qu'un rôle back-office ≠ `inscrit` ne soit actif (§9.5, §3 rules.md) |
| `company_name` | text nullable | pour l'option « Accès IP » de l'abonnement Chef d'entreprise |
| `is_affiliate` | boolean default false | activé dès la première génération de lien (§4.5) |

**RLS** : un utilisateur lit/modifie sa propre ligne. Les rôles `gerant`/`administrateur` lisent toutes les lignes. Écriture du champ `role` réservée à `administrateur` (jamais modifiable par l'utilisateur lui-même — faille de privilege escalation sinon).

### 1.2 `user_devices` 🔒
Suivi des sessions/appareils actifs, pour la limitation de sessions simultanées de l'option « Accès IP » (§10.2) et la notification de connexion depuis un nouvel appareil (§10.5).

| Colonne | Type |
|---|---|
| `id` | uuid PK |
| `profile_id` | uuid FK `profiles.id` |
| `device_fingerprint` | text |
| `ip_address` | inet |
| `country` | text |
| `last_seen_at` | timestamptz |
| `is_revoked` | boolean |

---

## 2. Abonnements & facturation

### 2.1 `subscription_plans`
Table de configuration — **paramétrable back-office**, jamais figée en dur dans le code applicatif (§2 rules.md), valeurs de départ = celles du §4.1 du cahier.

| Colonne | Type | Note |
|---|---|---|
| `id` | uuid PK |
| `code` | `plan_code` enum : `mensuel`, `annuel`, `chef_entreprise`, `soutien` | valeurs figées (nom imposé, §0 rules.md) |
| `price_first_period_xof` | numeric | ex. 2 000 XOF pour Mensuel |
| `price_recurring_xof` | numeric | ex. 5 000 XOF pour Mensuel |
| `billing_interval` | `billing_interval` enum : `mensuel`, `annuel` |
| `features` | jsonb | liste d'avantages affichable, éditable back-office |
| `is_active` | boolean | permet de désactiver un plan sans le supprimer |

### 2.2 `subscriptions` 🔒
Une ligne = un cycle d'abonnement d'un utilisateur.

| Colonne | Type | Note |
|---|---|---|
| `id` | uuid PK |
| `profile_id` | uuid FK `profiles.id` |
| `plan_id` | uuid FK `subscription_plans.id` |
| `status` | `subscription_status` enum : `active`, `en_attente_paiement`, `expiree`, `annulee` |
| `is_first_period` | boolean | bascule à `false` après la 1ʳᵉ échéance — pilote le passage tarif promo → tarif plein (§4.1, règle de facturation récurrente, pas un coupon) |
| `current_period_start` | timestamptz |
| `current_period_end` | timestamptz |
| `moneroo_subscription_ref` | text | référence côté Moneroo pour le renouvellement |
| `cancelled_at` | timestamptz nullable |

**Règle métier critique** : le passage `is_first_period = true → false` et le changement de `price` appliqué sont gérés par un **job planifié** (`pg_cron` + Edge Function), jamais par une logique côté client. Un test Playwright dédié doit couvrir explicitement le passage 1re → 2e échéance (§4 rules.md).

**RLS** : un utilisateur lit ses propres abonnements. `gerant`/`administrateur` lisent tout (tableau de bord commercial, §3.2).

### 2.3 `soutien_pack_entitlements` 🔒
Table dédiée aux avantages du « pack prestige » de l'abonnement Soutien — **non codée en dur** tant que le contenu exact n'est pas validé par Quentin (§12.2 cahier, déclencheur de blocage §1 rules.md). Structure prête, contenu vide/désactivé par défaut.

| Colonne | Type |
|---|---|
| `id` | uuid PK |
| `subscription_id` | uuid FK `subscriptions.id` |
| `entitlement_code` | text | ex. `invitation_vip_gala`, `portrait_magazine`, `badge_partenaire` — liste à valider avant activation |
| `status` | text | `en_attente_validation` par défaut |

---

## 3. Éditorial (articles, catégories, paywall)

### 3.1 `categories`
Paramétrable back-office (§7.3.1). Liste de départ non exhaustive du cahier.

| Colonne | Type |
|---|---|
| `id` | uuid PK |
| `slug` | text unique |
| `label` | text | ex. « Éditorial », « Chronique », « Intelligence artificielle » |
| `color_hex` | text | pour le bouton coloré paramétrable de la vignette |
| `is_active` | boolean |

### 3.2 `articles` 🔒
| Colonne | Type | Note |
|---|---|---|
| `id` | uuid PK |
| `slug` | text unique | URL propre `/articles/<slug>` (§17.1) |
| `title` | text |
| `chapo` | text | 2 lignes affichées sur certains blocs (§7.3.1) — aussi la partie « citable » pour le GEO (§17.3), à soigner |
| `body_html` | text | corps complet de l'article |
| `body_preview_lines` | integer default 12 | nombre de lignes visibles avant paywall — **paramétrable**, valeur par défaut = règle exacte du §5.1/§4 rules.md (12 lignes, jamais un pourcentage approximatif) |
| `author_id` | uuid FK `profiles.id` |
| `status` | `article_status` enum : `brouillon`, `en_validation`, `publie`, `depublie` | workflow rédacteur → rédacteur en chef (§3.2) |
| `published_at` | timestamptz nullable |
| `read_time_minutes` | integer |
| `audio_url` | text nullable | lecture audio réservée abonné |
| `is_free` | boolean default false | dérogation paywall ponctuelle décidée en back-office (contenu offert) |
| `views_count`, `shares_count`, `comments_count` | integer | dénormalisés, recalculés pour le score §12.5 |

**RLS — règle de sécurité centrale du projet** : la table `articles` n'expose **jamais** `body_html` complet via l'API publique à un utilisateur non autorisé. Deux approches combinées :
1. RLS sur une **vue** `articles_public` qui ne renvoie que `body_preview_lines` premières lignes calculées côté SQL/Edge Function pour les non-abonnés.
2. La vérification du niveau d'abonnement de l'appelant se fait **dans l'Edge Function** qui sert l'article, jamais uniquement en RLS déclarative simple — cohérent avec §5.1/§10.2 du cahier : « le serveur ne doit jamais envoyer le corps complet de l'article au client non autorisé ». La RLS est une **deuxième couche de défense**, pas la seule.

### 3.3 `article_categories`
Table de jonction many-to-many. Colonne `is_primary boolean` — une seule ligne `true` par article (catégorie mise en avant visuellement, §7.3.1).

### 3.4 `comments` 🔒
| Colonne | Type |
|---|---|
| `id` | uuid PK |
| `article_id` | uuid FK |
| `profile_id` | uuid FK |
| `content` | text | sanitizé (DOMPurify) avant stockage ET avant rendu — défense en profondeur XSS (§10.1) |
| `status` | `comment_status` enum : `visible`, `masque_moderation` |

### 3.5 `likes`
Table de jonction `article_id` + `profile_id`, contrainte unique.

### 3.6 `article_ranking_scores`
Vue matérialisée ou table recalculée toutes les heures (job planifié), implémentant la formule pondérée du §12.5 :
`score = (vues × poids_vue) + (partages × poids_partage) + (commentaires × poids_commentaire)` avec décroissance temporelle.

| Colonne | Type |
|---|---|
| `article_id` | uuid FK |
| `score` | numeric |
| `computed_at` | timestamptz |

Les poids (`poids_vue`, `poids_partage`, `poids_commentaire`, coefficient de décroissance, fenêtre glissante en jours) vivent dans `site_settings` (§6.1), **pas en dur dans le job** — ajustable sans redéploiement comme l'exige le cahier.

---

## 4. Kiosque (magazines)

### 4.1 `magazines`
| Colonne | Type | Note |
|---|---|---|
| `id` | uuid PK |
| `numero` | text unique | ex. « EAM N°0001 » |
| `edition_type` | `edition_type` enum : `normale`, `speciale`, `hors_serie` | valeurs figées du filtre Kiosque (§7.4) |
| `cover_image_url` | text |
| `summary` | text | résumé du sommaire |
| `published_at` | date |
| `year` | integer generated | pour le filtre Année |

### 4.2 `magazine_variants`
Une ligne par combinaison Version × Numéro. Prix figés en XOF (pivot), convertis dynamiquement (§4.2, §9.11).

| Colonne | Type |
|---|---|
| `id` | uuid PK |
| `magazine_id` | uuid FK |
| `version` | `magazine_version` enum : `cd_audio`, `numerique`, `papier`, `audio_pdf`, `audio_papier` |
| `price_xof` | numeric |
| `available_languages` | text[] | 3 langues (FR/EN/ES) pour `numerique`/`papier`, 12 langues pour `cd_audio` — **contrainte applicative** : la liste de langues proposée au front dépend strictement de `version` (§4.2 règle produit, jamais indépendante) |
| `file_url` | text nullable | fichier source PDF/audio, accessible uniquement via Edge Function générant un lien signé (§10.2) — jamais exposé en direct dans cette table côté API publique |

### 4.3 `orders` / `order_items` 🔒
| `orders` | Type |
|---|---|
| `id` | uuid PK |
| `profile_id` | uuid FK nullable | nullable pour un achat invité si autorisé, sinon NOT NULL selon décision produit |
| `status` | `order_status` enum : `panier`, `en_attente_paiement`, `payee`, `annulee`, `remboursee` |
| `currency` | text |
| `total_amount` | numeric |
| `affiliate_link_id` | uuid FK nullable | attribution de commission (§4.5) |
| `dhl_shipping_fee` | numeric nullable | calculé à l'étape panier pour les articles `papier` (§7.7, §12.3) |
| `moneroo_payment_ref` | text |

| `order_items` | Type |
|---|---|
| `id` | uuid PK |
| `order_id` | uuid FK |
| `item_type` | `order_item_type` enum : `magazine`, `abonnement`, `don` |
| `magazine_variant_id` | uuid FK nullable |
| `language` | text nullable |
| `unit_price` | numeric |

### 4.4 `downloads` 🔒
Journal des téléchargements — nécessaire pour le watermarking et la traçabilité (§10.2).

| Colonne | Type |
|---|---|
| `id` | uuid PK |
| `profile_id` | uuid FK |
| `magazine_variant_id` | uuid FK |
| `signed_url_issued_at` | timestamptz |
| `signed_url_expires_at` | timestamptz | courte durée, régénérée à chaque demande |
| `watermark_applied` | boolean |

---

## 5. Paiement, dons, livraison

### 5.1 `payments` 🔒 (journalisation immuable — §10.4)
Aucune ligne n'est jamais supprimée ni modifiée après création (seulement des lignes d'annulation liées) — table append-only.

| Colonne | Type |
|---|---|
| `id` | uuid PK |
| `order_id` / `donation_id` | uuid FK nullable (l'un ou l'autre) |
| `provider` | text default `moneroo` |
| `provider_ref` | text |
| `amount` | numeric |
| `currency` | text |
| `status` | `payment_status` enum : `initie`, `confirme`, `echoue`, `rembourse` |
| `webhook_signature_verified` | boolean | doit être `true` avant tout impact sur `orders`/`subscriptions` (§10.4) |
| `raw_webhook_payload` | jsonb | pour audit |

### 5.2 `donations` 🔒
| Colonne | Type |
|---|---|
| `id` | uuid PK |
| `profile_id` | uuid FK nullable | don possible sans compte |
| `full_name` | text |
| `amount` | numeric |
| `payment_method` | `donation_payment_method` enum : `mobile_money`, `carte`, `autre` |
| `phone_number` | text nullable | requis si `mobile_money` |
| `payment_reference` | text nullable | requis si `carte`/`autre` (§4.3) |
| `comment` | text nullable |

### 5.3 `dhl_shipping_rates` / `local_shipping_rates`
Deux tables distinctes reflétant la double option du §12.3 : tarifs DHL internationaux (synchronisés via API MyDHL) et tarif forfaitaire local Bénin/zone limitrophe.

### 5.4 `exchange_rates`
| Colonne | Type |
|---|---|
| `currency_code` | text PK |
| `rate_to_xof` | numeric |
| `updated_at` | timestamptz |

Synchronisée quotidiennement par job planifié (§9.11) — **jamais appelée en direct à chaque affichage de prix**, toujours lue depuis cette table.

---

## 6. Paramétrage back-office (rien en dur)

### 6.1 `site_settings`
Table clé-valeur générique (`key text PK`, `value jsonb`) pour tout paramètre évolutif sans redéploiement : durée du compte à rebours pop-up, taux de réduction, délai de réapparition (§5.3/§12.4), poids du classement articles les plus lus (§12.5), fenêtre glissante (7/30 jours).

### 6.2 `footer_links`
Paramétrable (§7.2) : `column_name`, `label`, `url`, `order`, `is_active`.

### 6.3 `mega_menu_items`
Paramétrable (§16) : `column_name` (Rubriques éditoriales / Par zone géographique / Formats & séries / Écosystème), `label`, `url`, `icon`, `order`, plus un champ `featured_article_id` pour le bloc mis en avant à droite du méga-menu.

### 6.4 `landing_blocks`
Table générique de configuration des emplacements de la landing page nommés dans le cahier (§7.3) : `block_key` (`sentinelles`, `bloc_secondaire`, `essor`, `ombre_douce`, `clarte`, `sous_bloc_1`…`sous_bloc_7`, `manager_du_mois`, etc.), `article_id` ou `magazine_id` assigné, `order`. Les 7 sous-blocs du « Fil d'info » restent avec `article_id = null` tant que le contenu n'est pas validé (§12.1, déclencheur de blocage).

### 6.5 `popup_campaigns`
| Colonne | Type |
|---|---|
| `id` | uuid PK |
| `discount_percent` | numeric | 50 par défaut |
| `countdown_hours` | integer | 48 par défaut |
| `reappear_after_days` | integer | 30 par défaut (§12.4) |
| `is_active` | boolean |

### 6.6 `user_popup_dismissals`
Suivi par utilisateur/session pour ne jamais réafficher indéfiniment ni à un abonné (§5.3/§12.4).

---

## 7. Affiliation

### 7.1 `affiliate_links` 🔒
| Colonne | Type |
|---|---|
| `id` | uuid PK |
| `profile_id` | uuid FK |
| `target_type` | `affiliate_target_type` enum : `general`, `magazine_numero` | lien raccourci spécifique à un numéro possible (§4.5) |
| `magazine_id` | uuid FK nullable |
| `short_code` | text unique |

### 7.2 `affiliate_clicks`
`link_id`, `clicked_at`, `ip_address` (anonymisée), `converted boolean`.

### 7.3 `affiliate_conversions` 🔒
| Colonne | Type | Note |
|---|---|---|
| `id` | uuid PK |
| `link_id` | uuid FK |
| `order_id` / `subscription_id` | uuid FK |
| `commission_rate` | numeric | 0.10 ou 0.25 |
| `commission_rate_reason` | text | **doit enregistrer explicitement** si l'affilié était abonné *au moment de la vente* — champ dénormalisé calculé à l'écriture, jamais recalculé a posteriori (§4 rules.md : le statut pris en compte est celui au moment de la vente, pas de la création du lien) |
| `commission_amount` | numeric |
| `status` | `commission_status` enum : `en_attente`, `validee`, `payee` |

### 7.4 `affiliate_payouts` 🔒
| Colonne | Type |
|---|---|
| `id` | uuid PK |
| `profile_id` | uuid FK |
| `amount` | numeric | seuil minimum 150 000 XOF vérifié en Edge Function avant création |
| `method` | `payout_method` enum : `mobile_money`, `virement`, `carte` |
| `status` | `payout_status` enum : `demande`, `en_traitement`, `payee`, `rejetee` |

---

## 8. Notifications & favoris

### 8.1 `notifications`
`profile_id`, `type` (`nouvel_article`, `nouveau_numero`, `offre`, `info`), `title`, `body`, `link`, `read_at nullable`, `created_at`.

### 8.2 `push_subscriptions`
Web Push VAPID (§9.9) : `profile_id`, `endpoint`, `keys jsonb`, `created_at`.

### 8.3 `favorites`
Jonction `profile_id` + (`article_id` ou `magazine_id`).

---

## 9. Autres services & audit

### 9.1 `service_requests`
Formulaire « Autres services » (§4.4) : `service_type` enum figée sur la liste exacte du cahier (montage de plan d'affaires, conseils et externalisation, recrutement, formation et recyclage, levée de fonds, services digitaux, marketing et stratégie de vente, audit de gestion, gestion de projet, courtage), `description`, `budget_indicatif`, `company_name`, `contact_name`, `contact_phone`, `status`.

### 9.2 `audit_log` 🔒 (append-only, §10.8)
`actor_id`, `action`, `entity_type`, `entity_id`, `previous_value jsonb`, `new_value jsonb`, `created_at`. Déclenché automatiquement (trigger ou middleware Edge Function) sur toute écriture sensible : prix, publication/dépublication d'article, validation de retrait d'affiliation, changement de rôle utilisateur.

---

## 10. Enums récapitulatifs

Tous les enums ci-dessus doivent être créés via migration Drizzle/Supabase CLI avec **exactement** les valeurs listées dans ce document — aucune valeur n'est ajoutée, renommée ou supprimée sans passer par `DECISIONS.md` (cohérent avec RULES.md §0 sur les noms imposés).

---

## 11. Notes RLS transverses

- Toute table 🔒 doit avoir `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` **avant** la mise en recette, jamais en fin de projet (§3 rules.md, §10.6 cahier).
- Policy par défaut recommandée : `deny all`, puis policies explicites additives par rôle — jamais l'inverse (policy permissive par défaut qu'on restreint ensuite).
- Les rôles back-office (`redacteur`, `redacteur_en_chef`, `gerant`, `administrateur`) sont vérifiés via une fonction Postgres `auth.user_role()` lisant `profiles.role`, réutilisée dans toutes les policies pour éviter la duplication de logique.
- Aucune policy ne doit se fier à une donnée envoyée par le client (header, paramètre de requête) pour déterminer un droit d'accès — uniquement `auth.uid()` et les tables serveur.
