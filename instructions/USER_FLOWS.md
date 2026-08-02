# USER_FLOWS.md — Parcours utilisateurs clés EAM

Document compagnon de `CAHIER_DES_CHARGES_EAM.md`, `API_ENDPOINTS.md` et `MATRICE_PERMISSIONS.md`. Décrit les enchaînements d'écrans et d'appels API des parcours transactionnels les plus sujets à erreur, pour qu'un agent ne les réinvente pas à sa façon d'un ticket à l'autre.

---

## 1. Lecture d'un article avec paywall

1. Visiteur arrive sur `/articles/<slug>` (SSR Next.js).
2. Le serveur appelle `/functions/v1/articles-get?slug=<slug>` **avant** le rendu — jamais un appel client-side qui recevrait le corps complet puis le masquerait en CSS.
3. Si non autorisé : la réponse contient `chapo` + 12 lignes + `is_locked: true`. Le front affiche le dégradé progressif sur les 3 lignes suivantes puis un CTA « S'abonner pour lire la suite ».
4. Si autorisé (abonné actif ou `is_free = true`) : `body_html` complet renvoyé, `is_locked: false`.
5. CTA « S'abonner » → redirige vers le flow §3 (Souscription) avec un paramètre de retour vers l'article une fois l'abonnement actif.

**Point de vigilance agent** : ne jamais implémenter l'étape 3 en renvoyant `body_html` complet avec une classe CSS `.hidden` — c'est exactement le contournement interdit par §5.1/§10.2 du cahier.

---

## 2. Achat d'un numéro au Kiosque

1. `/kiosque` → clic sur un numéro → `/kiosque/<numero>` (page produit, §7.6).
2. Sélection **Version** (CD Audio / Numérique / Papier / Audio+PDF / Audio+Papier) — obligatoire avant d'afficher le sélecteur de langue.
3. Sélection **Langue**, liste filtrée selon la version choisie (3 langues pour Papier/Numérique, 12 pour CD Audio) — jamais l'inverse, jamais une liste indépendante (§4.2).
4. Prix affiché recalculé dans la devise détectée/choisie (appel `exchange_rates`, jamais de calcul en dur front).
5. Bouton « Ajouter au panier » → `/functions/v1/cart-add-item`.
6. Page panier (§7.7) : si variante = Papier ou Audio+Papier, appel `/functions/v1/cart-estimate-shipping` avec le pays de livraison → affichage frais DHL ou tarif forfaitaire local (§12.3).
7. Si un lien d'affiliation était actif en session (cookie posé lors de l'arrivée via un lien `?ref=<short_code>`), `/functions/v1/cart-apply-affiliate` associe la commande au lien avant paiement.
8. Validation → `/functions/v1/checkout-create-order` → redirection Moneroo.
9. Retour Moneroo → webhook `/functions/v1/webhooks-moneroo` confirme le paiement (signature vérifiée) → `orders.status = payee` → génération différée du lien de téléchargement signé (pas au moment de l'achat, mais à la demande de téléchargement, §10.2).
10. Utilisateur accède à son téléchargement depuis l'espace client (§3.3) → `/functions/v1/magazine-download` → lien signé courte durée + watermark.

---

## 3. Souscription à un abonnement avec 1er mois réduit

1. `/sabonner` → 4 formules affichées depuis `subscription_plans` (jamais en dur dans le composant front).
2. Sélection d'un plan → si non connecté, redirection vers inscription/connexion (compte requis, `MATRICE_PERMISSIONS.md` §1.4).
3. `/functions/v1/subscription-subscribe` crée une ligne `subscriptions` avec `status = en_attente_paiement`, `is_first_period = true`, montant = `price_first_period_xof`.
4. Paiement Moneroo → webhook confirme → `status = active`, `current_period_end` = J+1 mois (ou J+1 an pour Annuel/Soutien).
5. **À l'échéance** (job planifié `cron-subscription-renewal`, pas un événement déclenché par une visite utilisateur) : nouvelle tentative de prélèvement Moneroo au tarif plein (`price_recurring_xof`), `is_first_period` bascule à `false` quel que soit le résultat du prélèvement (le tarif promo ne s'applique qu'une fois, indépendamment du succès du renouvellement).
6. Si échec de prélèvement : `status = en_attente_paiement`, notification email (Resend) à l'utilisateur, grace period à définir en `DECISIONS.md` si non précisée dans le cahier.

**Point de vigilance agent** : le test de recette qui couvre ce flow doit simuler explicitement le passage de la 1re à la 2e échéance (avancer la date système ou déclencher le job manuellement) — ne pas considérer la fonctionnalité terminée sans ce test (§4/§7 `RULES.md`).

---

## 4. Don (Faire un don / Soutenir Envol Africa)

1. Clic sur CTA « Faire un don » ou « Soutenir Envol Africa » (header, panneau latéral, bandeau CTA landing) → ouverture du tunnel en 2 étapes (§4.3), pas une redirection vers une page séparée.
2. **Étape 1** : montant libre + nom/prénom + choix du mode de paiement (Mobile Money / Carte bancaire / autre).
3. **Étape 2**, contenu conditionné par le choix de l'étape 1 :
   - Mobile Money → numéro de téléphone + commentaire optionnel → « Envoyer ».
   - Carte/autre → référence de paiement + commentaire optionnel → « Envoyer ».
4. `/functions/v1/donation-create` → création `donations` + `payments` (`status = initie`).
5. Confirmation affichée immédiatement (le don n'est pas soumis à un paywall ou une vérification de droits — accessible à tous les profils, `MATRICE_PERMISSIONS.md` §1.5).

---

## 5. Génération et suivi d'un lien d'affiliation

1. Utilisateur connecté (n'importe quel profil, y compris un rôle back-office via son compte personnel) → espace client → onglet Affiliation.
2. « Générer un lien » → choix : lien général, ou lien spécifique à un numéro du Kiosque (§4.5).
3. `/functions/v1/affiliate-generate-link` → `profiles.is_affiliate = true` si première génération, création `affiliate_links`.
4. Un visiteur clique sur `https://envolafrica.mag/?ref=<short_code>` → `/functions/v1/affiliate-clicks` enregistre le clic, cookie d'attribution posé côté navigateur (durée à définir en `DECISIONS.md` si non précisée).
5. Si ce visiteur souscrit un abonnement ou achète un magazine avant expiration du cookie → à la confirmation du paiement (webhook Moneroo), le calcul de commission interroge **le statut d'abonné de l'affilié à cet instant précis** (pas au moment de la création du lien à l'étape 3) → `commission_rate = 0.25` si l'affilié est lui-même abonné actif cette année-là, sinon `0.10` (§4.5, §4 `RULES.md`).
6. Le tableau de bord affilié se met à jour en temps réel via Supabase Realtime (§9.9).
7. Une fois le seuil de 150 000 XOF de gains cumulés atteint, bouton « Demander un retrait » actif → `/functions/v1/affiliate-request-payout` → statut `demande` → validation manuelle back-office (`gerant`/`administrateur`) → statut `payee`.

---

## 6. Workflow éditorial de publication d'un article

1. `redacteur` crée un brouillon dans le back-office (Tiptap) → `articles.status = brouillon`.
2. Rédaction, insertion d'images/citations, assignation de catégorie(s) — la première catégorie renseignée devient `is_primary = true` (§7.3.1).
3. Soumission → `status = en_validation`.
4. `redacteur_en_chef` relit, modifie si besoin (droits élargis, `MATRICE_PERMISSIONS.md` §1.1), valide → `status = publie`, `published_at = now()`.
5. Publication déclenche en parallèle (jobs asynchrones, pas de blocage de l'action de publication elle-même) :
   - Indexation Meilisearch.
   - Notification push aux abonnés (§5.4).
   - Soumission à l'API d'indexation Google (§17.1).
   - Éligibilité au module « Nos articles les plus lus » dès la première vue (le score se recalcule au job horaire, §12.5).
6. `redacteur_en_chef`/`gerant`/`administrateur` peut dépublier à tout moment → `status = depublie`, l'article redevient invisible publiquement mais reste en base pour historique/audit.

---

## 7. Paramétrage d'un bloc de la landing page (back-office)

1. `redacteur_en_chef`+ accède à l'interface d'administration des blocs (§7.3, `landing_blocks`).
2. Sélectionne un `block_key` existant (`sentinelles`, `essor`, `ombre_douce`, `clarte`, `manager_du_mois`, etc.) → assigne un article ou un numéro de magazine.
3. **Cas particulier des 7 sous-blocs « Fil d'info »** : l'interface affiche ces emplacements comme désactivés avec un message explicite (« en attente de validation du contenu — voir §12.1 du cahier ») tant qu'aucune entrée `DECISIONS.md` ne confirme le contenu validé — l'agent ne doit jamais permettre une saisie libre silencieuse sur ces 7 emplacements avant cette validation.
4. Sauvegarde → rendu immédiat en landing page sans redéploiement (donnée lue depuis `landing_blocks`, jamais depuis un composant codé en dur).

---

## 8. Détection langue/devise à l'arrivée sur le site

1. Première requête → Edge Middleware Next.js appelle `/functions/v1/geo-detect` (Vercel Geolocation) si aucun cookie `preferred_language`/`preferred_currency` n'existe déjà.
2. Si l'utilisateur est connecté et a déjà un `preferred_language`/`preferred_currency` en base (`profiles`) → ce choix prime toujours, la géo-détection n'est même pas appelée pour l'affichage (§5.2).
3. Si l'utilisateur change manuellement la langue/devise via les sélecteurs du header → écriture immédiate en base (si connecté) ou en cookie long (si visiteur) → ce choix ne sera plus jamais écrasé par une détection automatique ultérieure dans la même session ou une session future une fois connecté.
