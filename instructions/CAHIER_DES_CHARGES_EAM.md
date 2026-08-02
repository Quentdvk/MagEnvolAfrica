# CAHIER DES CHARGES FONCTIONNEL & TECHNIQUE
## ENVOL AFRICA MAGAZINE

*Site de presse, kiosque digital, abonnements et écosystème ENVOL AFRICA — Document de référence pour équipe de développement / agent IA*

Version 1.1 — Août 2026 (corrigée)
Préparé pour : Quentin — ENVOL AFRICA GROUPE

> **Note de version 1.1** : cette version corrige la v1.0 sur un seul axe — la levée des choix techniques laissés ouverts par un « ou » dans le §9, pour que le déploiement **Vercel + Supabase + GitHub** ne rencontre aucune décision en suspens en cours de développement. Chaque choix tranché est signalé par 🔒 ci-dessous, avec la raison du choix. Aucune exigence fonctionnelle (§1 à §8, §10 à §18) n'a été modifiée — seul le §9 (architecture technique) et le §12.6 sont impactés.

---

## 1. Introduction et vision du projet

« Envol Africa Magazine » (EAM) est le média phare de l'écosystème ENVOL AFRICA GROUPE, un ensemble de plateformes numériques dédiées à l'entrepreneuriat, à l'économie et aux affaires en Afrique (Kiosque, Jobs, Marketplace, Crowdfunding, Africa Awards, World Africa Business, Salons).

EAM se positionne comme un site de presse premium, à la fois magazine digital, kiosque de vente de numéros papier/numérique/audio, et porte d'entrée vers l'ensemble des services du groupe. Le modèle économique repose sur l'abonnement (paywall progressif), la vente à l'unité de magazines, les dons/soutien, la publicité et un programme d'affiliation rémunéré.

Ce document reformule et complète les notes de cadrage initiales de Quentin, enrichies par une analyse des sites de référence cités (Jeune Afrique, Prisma Media / Capital, le kiosque Jeune Afrique propulsé par miLibris, et l'ancien site envolafrica.net). Il est rédigé pour être exploitable tel quel par une équipe de développement, un freelance ou un agent IA chargé de la réalisation.

### 1.1 Références étudiées et enseignements clés

| Référence | Ce qu'on en retient pour EAM |
|---|---|
| jeuneafrique.com | Site de presse panafricain avec articles classés par rubriques (Politique, Économie, Grand Format, Dossier...), grande interview, newsletters, structure éditoriale par catégories multiples par article. |
| kiosque.jeuneafrique.com (moteur miLibris) | Catalogue de kiosque numérique avec numéro à la Une en tête, grille des anciens numéros en scroll, aperçu/extrait consultable avant achat, système de « crédits » de lecture, filtres par titre/collection, moteur de recherche plein texte, tri par date/pertinence. |
| prismashop.fr (Capital et autres titres Prisma) | Boutique de vente de magazines avec variations produit (édition papier / numérique / abonnement), page produit dédiée par numéro, tunnel d'achat classique e-commerce. |
| envolafrica.net (version précédente) | Structure de header/footer, liens vers l'écosystème (Kiosque, Jobs, Marketplace, Crowdfunding, Africa Awards, World Africa Business), bouton « Soutenir Envol Africa », sélecteurs langue/devise/mode sombre déjà envisagés — base de départ à moderniser. |

---

## 2. Objectifs du projet

- Créer un site de presse économique panafricain premium, rapide, multilingue et multidevise.
- Monétiser le contenu éditorial via un paywall progressif (abonnements) et la vente à l'unité de magazines (Kiosque).
- Fédérer l'écosystème ENVOL AFRICA en donnant une porte d'entrée unique vers Jobs, Marketplace, Crowdfunding, Africa Awards, World Africa Business et Salons.
- Mettre en place un programme d'affiliation générateur de revenus pour les ambassadeurs de la marque.
- Permettre la collecte de dons et de soutiens financiers au projet.
- Offrir une expérience mobile-first robuste (site responsive complet, notifications push).
- Fournir aux équipes éditoriales (rédacteurs, rédacteur en chef, gérant, administrateur) des outils de back-office adaptés à leur rôle.

---

## 3. Utilisateurs, profils et rôles

### 3.1 Utilisateurs côté public

| Profil | Description / droits |
|---|---|
| Visiteur non connecté | Accès à la Une, aux 12 premières lignes de chaque article (le reste est crypté avec dégradé progressif sur 3 lignes puis disparition), au Kiosque en consultation (sans téléchargement), à la page de don, au formulaire « autres services ». |
| Utilisateur inscrit (non abonné) | Comme le visiteur + gestion de favoris, notifications, commentaires/likes, panier, historique de navigation, mais toujours paywall sur les articles complets et sur les téléchargements. |
| Abonné (mensuel / annuel / chef d'entreprise / soutien) | Accès selon le palier souscrit : articles illimités, enquêtes exclusives, lecture audio, magazine du mois (ou 12 mois) en téléchargement gratuit et en avant-première, newsletters réservées. Voir §4.1 pour le détail des 4 formules. |
| Affilié | Toute personne (abonnée ou non) qui génère un lien d'affiliation unique et touche des commissions sur les abonnements et achats de magazines réalisés via ce lien (voir §4.5). |
| Client Kiosque | Achète des numéros à l'unité (papier / numérique / audio / combinés) dans des langues variables selon le support (voir §4.2). |

### 3.2 Utilisateurs côté back-office

| Rôle | Périmètre de droits |
|---|---|
| Rédacteur | Création, rédaction, publication, modification et dépublication des articles. Gestion de ses propres brouillons et soumissions à validation. |
| Rédacteur en chef | Tous les droits du rédacteur + gestion des magazines (mise en ligne des numéros, sommaire, couverture, prix), configuration des catégories éditoriales, planification éditoriale, validation finale des articles avant publication. |
| Gérant du site | Tous les droits du rédacteur en chef + modération des avis, commentaires et notifications, gestion des campagnes de promotion (pop-up, comptes à rebours), suivi des indicateurs commerciaux (ventes, abonnements, affiliation). |
| Administrateur | Accès complet : gestion des utilisateurs et rôles, configuration des abonnements et tarifs, paramétrage des devises/langues, intégrations de paiement (Moneroo, etc.), sécurité, logs, sauvegardes, configuration des blocs de la landing page (mapping avec le PDF de plan de blocs fourni). |

### 3.3 Espace client

Chaque utilisateur connecté dispose d'un espace personnel permettant de gérer :

- Ses réglages de compte (profil, mot de passe, préférences de langue/devise, notifications).
- Ses abonnements en cours (renouvellement, changement de formule, historique de facturation).
- Ses téléchargements (magazines PDF/audio achetés ou inclus dans son abonnement).
- Son tableau de bord d'affiliation (lien, statistiques de clics/conversions, gains cumulés, demandes de retrait).
- Ses favoris, ses commentaires publiés, son historique de dons.

---

## 4. Modèle économique et monétisation

### 4.1 Abonnements

Quatre formules d'abonnement sont proposées. Les prix de référence sont en Francs CFA (XOF) et doivent être automatiquement convertis dans la devise locale détectée (voir §5.2).

| Formule | Tarif | Avantages inclus |
|---|---|---|
| Mensuel | 5 000 XOF/mois (2 000 XOF le 1er mois) | Articles illimités, enquêtes et analyses exclusives, lecture audio des articles, magazine digital du mois en téléchargement gratuit et en avant-première, newsletters réservées. |
| Annuel | 3 500 XOF/mois soit 42 000 XOF/an (au lieu de 5 000/mois) | Idem mensuel + les 12 magazines digitaux de l'année en téléchargement gratuit et en avant-première. |
| Chef d'entreprise | 20 000 XOF/mois (15 000 XOF le 1er mois) | Tous les avantages « abonné » + magazine papier et audio en avant-première, support client dédié, tarif dégressif, accès IP (accès multi-postes / entreprise). |
| Soutien | 600 000 XOF/an | Tout l'abonnement « Chef d'entreprise » + le « pack prestige » (à définir précisément avec le Gérant : avantages VIP, invitations événements, visibilité, etc.). |

> **Point d'attention développeur** : le tarif « premier mois » réduit doit être géré comme une règle de facturation récurrente (prix promo à J0, puis bascule automatique au tarif plein à la 2ᵉ échéance), pas comme un simple coupon ponctuel.

### 4.2 Vente de magazines — le Kiosque

Le Kiosque est la boutique du site. Le dernier numéro est mis en avant en tête de page, les numéros précédents s'affichent en vignettes avec scroll infini, filtrables par année et par édition (Normale, Spéciale, Hors-Série) — à l'image du fonctionnement observé sur kiosque.jeuneafrique.com.

**Versions et tarifs (par numéro) :**

| Version | Prix | Détail |
|---|---|---|
| CD Audio | 5 000 XOF | Fichier audio téléchargeable après paiement. |
| Numérique | 10 000 XOF | Fichier PDF téléchargeable après paiement. |
| Papier | 16 000 XOF | Livraison après achat ; frais de livraison calculés automatiquement selon les tarifs DHL du pays de destination, à la charge du client. |
| Audio + PDF | 12 000 XOF | Combo numérique + audio. |
| Audio + Papier | 18 000 XOF | Combo papier + audio. |

**Langues disponibles :**

- Versions Papier et Numérique : disponibles en 3 langues au choix à l'achat — Français, Anglais, Espagnol.
- Version CD Audio : disponible dans 12 langues africaines/internationales — Anglais, Français, Espagnol, Arabe, Swahili, Haoussa, Yoruba, Igbo, Fongbé, Fulfulde/Peul, Zoulou, Mina.

> **Règle produit** : après ajout au panier, les variantes à sélectionner sont toujours « Version » puis « Langue » (la liste de langues proposée dépend de la version choisie).

### 4.3 Dons et soutien

Les CTA « Faire un don » et « Soutenir Envol Africa » ouvrent un tunnel de don en 2 étapes :

- **Étape 1** : montant du don (libre, saisi par le donateur), nom et prénom, choix du mode de paiement.
- **Étape 2 (Mobile Money)** : numéro de téléphone + commentaire optionnel → bouton « Envoyer ».
- **Étape 2 (Carte bancaire / autre moyen)** : référence de paiement + commentaire optionnel → bouton « Envoyer ».

### 4.4 Demandes de services « Autres services »

Un formulaire dédié permet de qualifier une demande de prestation (montage de plan d'affaires, conseils, externalisation, recrutement, formation, levée de fonds, services digitaux, marketing, audit, gestion de projet, courtage). Champs à prévoir : service concerné, description du besoin et des attentes, budget indicatif, nom de la société, personne ressource, contact téléphonique.

### 4.5 Programme d'affiliation

- Tout utilisateur peut générer un lien d'affiliation personnel.
- Commission de 10% sur tout abonnement souscrit via son lien si l'affilié lui-même n'est pas abonné cette année-là, ou 25% s'il est abonné cette année-là.
- Mêmes taux et conditions pour tout achat de magazine réalisé via son lien.
- L'affilié peut générer un lien raccourci spécifique à chaque numéro du Kiosque, à promouvoir individuellement, avec les mêmes règles de commission.
- Les gains sont visibles en temps réel dans le tableau de bord de l'affilié.
- Retrait des gains par Mobile Money (numéro fourni) ou virement/carte bancaire, à partir d'un seuil minimum de 150 000 XOF.

### 4.6 Publicité et contenus sponsorisés

Un emplacement « Contenus sponsorisés » est prévu sur la landing page (voir §7.3.7) ainsi qu'un module « Publicité » listé au footer, à connecter à une régie publicitaire ou à une gestion interne d'espaces publicitaires (bannières, native ads).

---

## 5. Fonctionnalités transverses

### 5.1 Paywall / cryptage progressif des articles

Un visiteur sans abonnement actif peut lire uniquement les 12 premières lignes d'un article. La suite du texte est affichée « cryptée » (texte brouillé/flouté) avec un effet de dégradation progressive sur les 3 lignes suivantes jusqu'à disparition complète. Techniquement : le serveur ne doit jamais envoyer le corps complet de l'article au client non autorisé (pas de simple masquage CSS côté front, qui serait contournable) — la vérification des droits doit se faire côté API avant l'envoi du contenu.

### 5.2 Détection automatique de langue et de devise

Dès l'arrivée sur le site, la géolocalisation (IP ou GPS avec consentement) détermine la langue et la devise d'affichage par défaut. Tous les prix (abonnements, magazines, options) sont recalculés dynamiquement dans la devise locale à un taux de change tenu à jour. Dans le Kiosque, les versions et langues disponibles s'affichent également adaptées à la langue détectée. L'utilisateur peut à tout moment changer manuellement la langue et la devise via les sélecteurs de l'entête.

### 5.3 Pop-up promotionnel avec compte à rebours

Dès le lancement du site (ou à la première visite), un pop-up en bas d'écran annonce une promotion de -50% sur tout abonnement annuel, avec un compte à rebours de 48h qui se déclenche automatiquement à la première visite de chaque utilisateur (stocké côté session/compte pour ne pas se relancer indéfiniment).

### 5.4 Notifications push

- Demande d'autorisation de notification dès la connexion au site (navigateur desktop et mobile).
- Notifications envoyées à chaque nouvel article, nouveau numéro de magazine, offre commerciale ou information importante.
- Badge/compteur sur l'icône de notification pour signaler les notifications non lues pendant que l'utilisateur navigue sur le site.

### 5.5 Authentification / Connexion

- Connexion via réseaux sociaux : Google Login et Facebook Login.
- Connexion / création de compte manuelle par numéro de téléphone ou email pour les nouveaux utilisateurs.

### 5.6 Messagerie interne

Non développée dans le périmètre de ce site : la messagerie sera traitée dans d'autres applications de l'écosystème ENVOL AFRICA et documentée séparément.

### 5.7 Feuilletage numérique

Chaque numéro doit pouvoir être « feuilleté » en ligne (visionneuse de type flipbook/reader, à l'image du lecteur « Extrait » de kiosque.jeuneafrique.com), avec un aperçu gratuit limité et un accès complet réservé aux acheteurs/abonnés.

### 5.8 Interactions sociales

Chaque article et chaque magazine dispose de fonctions de partage (réseaux sociaux, lien direct), de commentaires et de « likes ».

---

## 6. Arborescence générale du site

- Accueil (Landing page)
- S'abonner (page des 4 plans)
- Kiosque (catalogue de magazines + page produit + panier)
- Article (page de lecture d'un article)
- Jobs (lien externe / sous-domaine de l'écosystème)
- Marketplace (lien externe / sous-domaine)
- Crowdfunding (lien externe / sous-domaine)
- Africa Awards (lien externe / sous-domaine)
- Salons (lien vers World Africa Business /live)
- World Africa Business (lien externe / sous-domaine)
- Faire un don / Soutenir Envol Africa
- Autres services (formulaire)
- Espace client (compte, abonnements, téléchargements, affiliation, favoris)
- Back-office (Rédacteur, Rédacteur en chef, Gérant, Administrateur)

> **Note** : à l'image de l'ancienne version (envolafrica.net), chaque brique de l'écosystème (Jobs, Marketplace, Crowdfunding, Africa Awards, World Africa Business) vit sur son propre sous-domaine (ex. jobs.envolafrica.net, marketplace.envolafrica.net) avec une authentification partagée (SSO) recommandée entre tous les sous-domaines.

---

## 7. Présentation détaillée — Version Ordinateur

### 7.1 Entête (Header)

**Ligne 1 — barre supérieure**
Alignés à gauche, côte à côte, icône + texte : S'abonner, Kiosque, Jobs, Marketplace, Crowdfunding, Africa Awards, Salons, World Africa Business.
Alignés à droite : icônes Traduction (sélecteur de langue) et Devise (sélecteur de devise).

**Ligne 2 — barre principale (devient la barre fixe au scroll)**
De gauche à droite : logo ENVOL AFRICA → menu déroulant (Envol Africa Magazine, Kiosque, Jobs, Marketplace, Crowdfunding, Africa Awards, Salons, World Africa Business) → un « méga-menu » secondaire (rubriques éditoriales) → 5 icônes (panier, notification, message, favoris, recherche) → 3 boutons (Se connecter, S'abonner, Faire un don) → un bouton menu réduit, tout à droite, qui ouvre un panneau latéral droit.

**Panneau latéral droit (au clic sur le menu réduit)**
- Logo Envol Africa Magazine.
- Baseline : « Une chaîne regroupant toutes les valeurs pour votre succès en entreprises. Plus qu'un magazine, c'est le seul outil qui vous apporte tout pour réussir en affaires et prospérer à tout égard. »
- Bouton « Soutenir Envol Africa ».
- Liens : Montage de plan d'affaires, Conseils et externalisation, Recrutement, Formation et recyclage, Levée de fonds, Services digitaux, Marketing et stratégie de vente, Audit de gestion, Gestion de projet, Courtage.
- Encart de bas de panneau : titre « Osez la réussite ! Lisez Envol Africa Magazine », texte d'accroche, bouton « S'abonner ».

**Bandeau « À la Une »**
Sous la ligne 2, bandeau sur fond gris clair : bouton rouge « À la Une » (texte blanc) à gauche, suivi des titres d'articles en vedette défilant en continu de droite à gauche, en noir. Comportement au scroll : seule la ligne 2 (logo) reste fixe/sticky en haut de la page ; la ligne 1 et le bandeau « À la Une » ne sont visibles que lorsque l'utilisateur est tout en haut de la page.

### 7.2 Pied de page (Footer) — 3 niveaux

**Niveau 1 (fond noir)** : Logo ENVOL AFRICA MAG en blanc à gauche, suivi (sur 2 lignes, en blanc) de la baseline de la marque.

**Niveau 2 (fond noir) — 4 colonnes de liens :**

| Tous nos sites | Nos accompagnements | | |
|---|---|---|---|
| Crowdfunding | Ingénierie digitale | Sur Android | Publicité |
| Kiosque | Newsletters | Sur iPhone | Suivi complet |
| World Africa Business | Abonnement | Sur Huawei | |
| Marketplace | Levée de fonds et accompagnement | | |
| Jobs | Programme d'affiliation | | |
| Africa Awards | Externalisation / Applications | | |
| | Kit média | | |
| | Recherche de financement | | |

> **Remarque développeur** : ce bloc doit rester paramétrable depuis le back-office (ajout/suppression de liens) plutôt que codé en dur.

**Niveau 3 (fond gris clair)** : À gauche : « © 2026 Envol Africa Groupe. Tous droits réservés ». À droite, sur la même ligne : Terms, Privacy, Cookies.

### 7.3 Landing page — sections détaillées

Les noms de sections et de blocs ci-dessous reprennent la nomenclature du plan de configuration fourni par Quentin (fichier PDF), afin que ces mêmes noms soient utilisés dans le back-office d'administration pour le paramétrage des emplacements éditoriaux.

#### 7.3.1 Section « IMAGE CATÉGORIE A »

4 blocs :
- **« Sentinelles »** — bloc principal, 1000 × 1000 px, articles en vedette défilant de droite à gauche.
- **Bloc secondaire** (sans nom donné), 1000 × 460 px, fixe (ne défile pas), positionné en haut à droite du bloc Sentinelles.
- **« Essor »** — 460 × 460 px, sous le bloc secondaire.
- **« Ombre douce »** — 460 × 460 px, sous le bloc secondaire, à côté d'Essor.

Habillage de chaque vignette d'article : catégorie (1ʳᵉ catégorie associée à l'article, en bouton coloré paramétrable) → titre en Montserrat Bold blanc → sur le bloc « Sentinelles » uniquement, un chapô de 2 lignes → nom de l'auteur et date de publication sur une ligne. Sur les 3 autres blocs : catégorie + titre + auteur + date (sans chapô).

Catégories éditoriales paramétrables dans le back-office (liste de départ, extensible) : Éditorial, Chronique, Opinion, Entrepreneuriat, Management, Manager du mois, Marketing, Financement, Intelligence artificielle, Opportunités, Économie, Développement, Agriculture, etc. Un article peut appartenir à plusieurs catégories ; la première catégorie renseignée est celle mise en avant visuellement.

#### 7.3.2 Section « IMAGE CATÉGORIE B (Carrousel de magazines) »

Carrousel de 4 photos de couverture des derniers numéros publiés, défilement automatique droite → gauche. Chaque couverture affiche catégorie + titre en surimpression. Au clic, redirection vers la fiche produit du numéro dans le Kiosque.

#### 7.3.3 Section « Fil d'info & Manager du mois »

Deux blocs côte à côte :
- **Bloc « Fil d'info »** (large, à gauche) — 9 sous-blocs, dont un bloc principal « Clarté » de 700 × 933 px en haut à gauche, suivi en dessous par 2 sous-blocs empilés (les 7 autres sous-blocs restent à finaliser avec Quentin quant à leur contenu exact — voir §12 Questions ouvertes).
- **Bloc « Manager du mois »** (à droite) — photo du manager, titre, chapô de 2 lignes.

#### 7.3.4 « Nos articles les plus lus »

Module de mise en avant des articles à plus fort trafic (classement calculé automatiquement, ex. sur 7 ou 30 jours glissants — à trancher).

#### 7.3.5 « Formations certifiées ENVOL AFRICA »

Grille de vignettes de formations (image, badge type de formation ex. « Formation gratuite », titre, date). Ce module reprend le principe déjà présent sur l'ancien site (formations Wordpress, IA, Amazon, réseaux sociaux, e-commerce, Canva).

#### 7.3.6 Sections à onglets

Zone à onglets permettant de basculer entre plusieurs listes d'articles : Financement, Formations, Concours, + d'opportunités (onglet extensible). Chaque onglet affiche une liste d'articles avec titre, date et lien.

#### 7.3.7 Autres modules de la landing page

- Section Vidéos (intégration YouTube).
- « Dans notre prochain numéro » (teaser du numéro à venir).
- « Tout l'écosystème ENVOL AFRICA » (mosaïque de dossiers/images renvoyant vers Jobs, Marketplace, Crowdfunding, Africa Awards, World Africa Business, Salons, Recrutement).
- Start-ups (mise en avant de jeunes pousses africaines).
- Recrutement (offres à la une, lien vers Jobs).
- Bandeau CTA « Osez la réussite ! » avec bouton « S'abonner ».
- Contenus sponsorisés (emplacement publicitaire / partenaires).

### 7.4 Page Kiosque

Reprend la logique observée sur kiosque.jeuneafrique.com :
- Dernier numéro mis en avant en tête de page (grande couverture, résumé du sommaire, bouton « Extrait / Feuilleter », CTA d'achat/abonnement).
- Grille des anciens numéros en vignettes, scroll infini.
- Filtres : Année, Édition (Normale, Spéciale, Hors-Série).
- Moteur de recherche interne (par titre, mot-clé du sommaire).
- Au clic sur un numéro : accès à sa page produit.

### 7.5 Page Article

- En-tête article : catégorie(s), titre, chapô, auteur, date, temps de lecture estimé.
- Corps de l'article : 12 premières lignes visibles pour tous, puis paywall progressif (voir §5.1) pour les non-abonnés.
- Actions : partager, aimer, commenter, écouter (lecture audio si abonné), s'abonner (CTA persistant si contenu verrouillé).
- Articles liés / recommandations en bas de page.

### 7.6 Page Produit (fiche magazine)

- Visuel de couverture, titre du numéro, date de parution, résumé du sommaire.
- Sélecteur de variantes : Version (CD Audio / Numérique / Papier / Audio+PDF / Audio+Papier) puis Langue (liste dépendante de la version choisie).
- Prix dynamique recalculé selon la variante et la devise détectée ; pour la version Papier, estimation des frais de port DHL calculée à l'étape de paiement selon le pays de livraison.
- Bouton « Feuilleter » (aperçu limité).
- Bouton « Ajouter au panier ».

### 7.7 Page Panier

- Récapitulatif des articles (magazines, abonnements, dons) avec variantes choisies.
- Application des liens d'affiliation actifs (tracking + attribution de commission).
- Calcul automatique des frais de livraison DHL pour les articles papier.
- Choix du mode de paiement (voir §9 Intégrations de paiement) et validation de commande.

---

## 8. Présentation détaillée — Version Mobile et Tablette

Le site est intégralement responsive. Spécificités mobiles :

### 8.1 Entête mobile

**Ligne 1** : Icônes de gauche à droite : Live, Panier, Favoris, Message, Notification, Traduction, Profil.

**Ligne 2** : Logo réduit ENVOL AFRICA → menu déroulant (Envol Africa Magazine, Kiosque, Jobs, Marketplace, Crowdfunding, Africa Awards, Salons, World Africa Business) → à droite : loupe de recherche + menu réduit ouvrant un panneau latéral droit plein écran.

Comportement au scroll : c'est la ligne 1 qui reste fixe en haut de l'écran (à l'inverse du desktop où c'est la ligne 2).

### 8.2 Navigation basse (bottom bar) — fixe

Icônes avec libellés sous chaque icône : Accueil, Kiosque, Jobs, Crowdfunding, Marketplace, Africa Awards, WAB (World Africa Business).

### 8.3 Pages mobiles

La landing page, la page Kiosque, la page Article, la page Produit et la page Panier reprennent la même architecture de contenu qu'en version desktop, réorganisée en colonne unique, avec les carrousels/défilements adaptés au tactile (swipe).

---

## 9. Architecture technique complète (stack recommandée de bout en bout)

Cette section détaille, brique par brique, l'ensemble des technologies à utiliser pour que l'agent IA ou l'équipe de développement puisse livrer le projet complet — du code au déploiement — sans zone d'ombre. La cohérence avec les autres projets de l'écosystème ENVOL AFRICA (MagicAfrica, Africa Awards) est recherchée partout où c'est pertinent, pour mutualiser la maintenance.

### 9.1 Vue d'ensemble

Architecture cible : **Jamstack / hybride SSR**, front Next.js déployé sur Vercel, back-end « BaaS + API custom » sur Supabase complété de fonctions serverless (Edge Functions) pour toute la logique métier sensible (paywall, paiement, affiliation), le tout orchestré derrière un CDN et un WAF.

### 9.2 Front-end

| Brique | Techno recommandée | Rôle |
|---|---|---|
| Framework | **Next.js 15 (App Router) + React 19 + TypeScript** | SSR/SSG hybride, essentiel pour le SEO d'un site de presse ; TypeScript pour la fiabilité sur un projet à fort périmètre. |
| Style | **Tailwind CSS** + `shadcn/ui` pour les composants (formulaires, modales, tableaux) | Cohérence visuelle rapide, base de composants accessibles. |
| Gestion d'état | **Zustand** ou React Context pour l'état global léger (panier, session) | Plus léger que Redux pour ce périmètre. |
| Formulaires | **React Hook Form + Zod** | Validation typée partagée front/back (le schéma Zod validant aussi côté API). |
| Internationalisation UI | **next-intl** ou **next-i18next** | Gestion FR/EN/ES de l'interface, en complément de la détection Geo-IP (§9.11). |
| Lecteur flipbook | **PDF.js** (rendu des pages) encapsulé dans un composant custom de type « tourne-page » (ex. inspiré de `react-pageflip`) | Feuilletage des numéros sans dépendre d'un service tiers payant. |
| PWA | **next-pwa** (service worker, manifest) | Permet l'installation mobile et la réception de notifications push web. |
| Animations | **Framer Motion** | Défilements (bandeau « À la Une », carrousels) fluides. |

### 9.3 Back-end / API

| Brique | Techno recommandée | Rôle |
|---|---|---|
| Plateforme principale | **Supabase** (PostgreSQL managé + Auth + Storage + Realtime + Edge Functions en Deno/TypeScript) | Réduit le time-to-market tout en gardant un accès SQL complet et du Row Level Security. |
| Logique métier sensible | **Supabase Edge Functions** (paywall, calcul de commission d'affiliation, webhooks Moneroo, génération de liens signés) | Toute vérification de droit d'accès doit s'exécuter côté serveur, jamais côté client. |
| API publique (si besoin d'un front mobile natif futur) | **API REST auto-générée par Supabase (PostgREST) + endpoints custom en Edge Functions** | Réutilisable par une future app mobile native. |
| ORM / accès typé 🔒 | **Drizzle ORM** en complément du client Supabase, pour les requêtes complexes (reporting, classement des articles) | Sécurité de typage et migrations versionnées. Choisi plutôt que Prisma : compatible nativement avec le runtime Edge de Vercel et les Edge Functions Supabase (Deno), pas de moteur binaire à générer/déployer séparément, cohérent avec `supabase db diff` pour les migrations. |

### 9.4 Base de données

- **PostgreSQL** (fourni par Supabase) comme unique source de vérité.
- **Row Level Security (RLS)** activé sur toutes les tables sensibles (articles complets, téléchargements, données de paiement) : la base elle-même refuse la lecture si l'utilisateur n'a pas les droits, en complément de la vérification applicative.
- Migrations gérées via **Supabase CLI** ou **Prisma Migrate**, versionnées dans le dépôt Git (jamais de modification manuelle en production).

### 9.5 Authentification & identités

| Besoin | Techno |
|---|---|
| Auth email/téléphone + OAuth Google/Facebook | **Supabase Auth** |
| Multi-facteur (MFA) pour les rôles back-office | **Supabase Auth MFA (TOTP)** obligatoire pour Administrateur, Gérant, Rédacteur en chef |
| SSO entre sous-domaines de l'écosystème 🔒 | **Projet Supabase Auth unique partagé** entre EAM et les autres briques de l'écosystème (Africa Awards, MagicAfrica), combiné aux **cookies de session posés sur le domaine racine `.envolafrica.net`** pour que la session soit lisible par chaque sous-domaine. Les deux mécanismes sont complémentaires, pas alternatifs : le projet Auth partagé est la source de vérité des identités, le cookie de domaine racine évite une reconnexion à chaque changement de sous-domaine. Hors périmètre du MVP EAM (Phase 3, §13) mais la table `users`/`profiles` doit être conçue dès la Phase 1 en anticipant ce partage (pas de champ ni de logique métier propre à EAM dans le schéma Auth lui-même). |

### 9.6 Paiement & facturation

| Besoin | Techno |
|---|---|
| Paiement Mobile Money & carte, marché africain | **Moneroo** (déjà utilisé sur les autres projets de Quentin) |
| Facturation récurrente (abonnements avec 1er mois réduit) | Logique custom en Edge Functions + webhooks Moneroo, avec un job planifié (**Supabase Cron / pg_cron**) pour les échéances de renouvellement |
| Réconciliation & comptabilité | Export automatique des transactions vers un tableau (Google Sheets API ou Airtable) pour le suivi financier du Gérant, en attendant un outil comptable dédié |

### 9.7 Stockage & diffusion média

| Besoin | Techno |
|---|---|
| Stockage fichiers (PDF, audio, images) | **Supabase Storage** (basé S3) |
| CDN images 🔒 | **Vercel Image Optimization** (composant `next/image`) pour un redimensionnement/format adaptatif (WebP/AVIF) | Natif au déploiement Vercel retenu, aucun compte/service tiers à configurer. Cloudinary reste une option de repli uniquement si un besoin de traitement image avancé (recadrage IA, watermark dynamique sur images) apparaît en Phase 2/3 — décision à documenter dans `DECISIONS.md` si ce cas se présente. |
| Liens signés à expiration courte pour les téléchargements | **Supabase Storage signed URLs** (durée de validité courte, régénérées à chaque demande de téléchargement) |
| Compression / conversion audio | **FFmpeg** en Edge Function ou job asynchrone à l'ingestion des CD audio |

### 9.8 Recherche

🔒 **Meilisearch** auto-hébergé (déployé séparément de Vercel/Supabase — voir §12.6bis) pour la recherche plein texte sur les articles et le catalogue du Kiosque, avec indexation incrémentale déclenchée à chaque publication. Algolia n'est pas retenu : c'est un service SaaS tiers supplémentaire hors du triptyque Vercel/Supabase/GitHub, avec un coût récurrent non justifié tant que le volume d'articles reste modeste.

### 9.9 Notifications & temps réel

| Besoin | Techno |
|---|---|
| Notifications navigateur (desktop + mobile web) | **Web Push (VAPID)** |
| Notifications mobile natif (si app future) | **Firebase Cloud Messaging (FCM)** |
| Compteurs/temps réel (badge notifications, tableau de bord affiliation) | **Supabase Realtime** |

> **Point de vigilance conservé** : si Supabase Realtime sert aussi aux compteurs en direct, valider sa capacité de connexions simultanées face aux pics de trafic (sortie d'un numéro, notification de masse) avant la mise en production.

### 9.10 E-mailing & communication

🔒 **Resend** pour les emails transactionnels (confirmation de commande, facture, réinitialisation de mot de passe) et les newsletters réservées aux abonnés, avec templates gérés en **React Email**. Choisi plutôt que Brevo : créé par l'équipe Vercel, intégration officielle en un clic dans le dashboard Vercel (clé API provisionnée automatiquement en variable d'environnement), React Email partage la même stack de composants que le reste du front.

### 9.11 Internationalisation (langue/devise)

- **Geo-IP** : **Vercel Geolocation** (edge, gratuit) en première intention, avec **MaxMind GeoIP2** en solution de repli plus précise si besoin.
- **Taux de change** : API de change (ex. **exchangerate.host** ou **Open Exchange Rates**) synchronisée quotidiennement dans une table `taux_de_change` en base, jamais appelée en direct à chaque affichage de prix.

### 9.12 Feuilletage (flipbook)

Solution interne (**PDF.js + composant flip custom**) plutôt qu'un service tiers, pour garder la maîtrise du DRM (pages d'aperçu limitées, watermarking) — voir §10.

### 9.13 Analytics & mesure

| Besoin | Techno |
|---|---|
| Analytics produit (comportement, funnels d'achat/abonnement) 🔒 | **Plausible Analytics** (respectueux RGPD, sans bannière cookie complexe) — retenu par défaut pour ne pas alourdir la conformité (§10.6) dès le MVP. **Google Analytics 4** reste une option additionnelle (pas un remplacement) si le groupe a un besoin publicitaire précis en Phase 3 — décision et bannière cookie associée à documenter dans `DECISIONS.md` avant activation. |
| Suivi SEO | **Google Search Console**, **Bing Webmaster Tools** |
| Suivi des paiements et cohortes d'abonnement | Tableau de bord custom dans le back-office Administrateur, alimenté par des vues SQL dédiées |

### 9.14 CMS / back-office

Back-office développé sur mesure en Next.js (plutôt qu'un CMS générique type WordPress), pour coller exactement aux rôles décrits en §3.2 et à la logique de paramétrage des blocs de la landing page (§7.3). Éditeur de texte riche : **Tiptap** (extensible, open-source) pour la rédaction d'articles avec insertion d'images, citations, encarts.

### 9.15 Infrastructure, hébergement, CI/CD

| Brique | Techno |
|---|---|
| Hébergement front | **Vercel** (déploiement continu, preview par pull request, edge network) |
| Hébergement back-end | **Supabase Cloud** (région Europe la plus proche pour la latence Afrique de l'Ouest) |
| Contrôle de version | **Git** sur **GitHub**, avec protection de branche `main` et revue de code obligatoire |
| CI/CD 🔒 (pipeline précisé) | Le **déploiement lui-même** est assuré nativement par l'intégration Git de **Vercel** (aucun script de déploiement à écrire) : chaque push sur une branche crée un déploiement Preview avec son URL unique, chaque merge sur `main` déclenche le déploiement Production. **GitHub Actions** n'exécute donc pas le déploiement : il sert de **portail qualité obligatoire avant merge** — lint (ESLint), tests unitaires (Vitest), build de contrôle, et exécution des tests Playwright critiques sur l'URL Preview générée par Vercel. Une pull request ne peut être mergée que si ce workflow GitHub Actions est vert (statut de check requis, cohérent avec la protection de branche `main`). |
| Environnements | 3 environnements distincts : **Développement, Recette (staging), Production** — correspondant respectivement aux déploiements locaux/Preview Vercel, à la branche `staging` (déploiement Preview fixe promu), et à `main` (déploiement Production) — avec 2 projets Supabase séparés (Développement/Recette partagent un même projet non-production, Production isolée, cf. §12.6bis). |
| Gestion des secrets | **Vercel Environment Variables** (scopées par environnement : Development / Preview / Production) + **Supabase Vault** pour les secrets utilisés côté Edge Functions — jamais de clé en dur dans le code. Voir `CONNECTEURSMCP.md` pour la procédure d'accès agent à ces trois services. |

### 9.16 Tests & qualité

- Tests unitaires : **Vitest**
- Tests end-to-end (parcours d'achat, abonnement, paywall) : **Playwright**
- Linting/formatage : **ESLint + Prettier**, exécutés en pre-commit (**Husky**)
- Revue de code obligatoire avant fusion sur `main`

### 9.17 Monitoring & observabilité

| Besoin | Techno |
|---|---|
| Suivi des erreurs applicatives | **Sentry** |
| Performance & Core Web Vitals réels | **Vercel Analytics** / **Vercel Speed Insights** |
| Logs & alerting infra | **Supabase Logs** + **Better Uptime** (ou **UptimeRobot**) pour la surveillance de disponibilité et les alertes en cas d'incident |

---

## 10. Sécurité du site — dispositif complet

La sécurité doit être traitée comme une exigence transverse dès la Phase 1, pas comme un chantier ajouté après coup. Le dispositif recommandé couvre huit dimensions :

### 10.1 Sécurité applicative (OWASP)

- Respect systématique de l'**OWASP Top 10** : validation stricte de toutes les entrées (Zod côté API), requêtes paramétrées (jamais de SQL concaténé), protection CSRF sur les formulaires sensibles (dons, paiement, changement de mot de passe).
- **Content Security Policy (CSP)** stricte, en-têtes `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options` sur toutes les réponses.
- Sanitization systématique du contenu généré par les utilisateurs (commentaires) pour empêcher les injections XSS (ex. **DOMPurify** côté rendu).
- Limitation stricte des types et tailles de fichiers uploadés (couvertures, avatars, PDF de magazine).

### 10.2 Protection du contenu / paywall

- Chaque appel API renvoyant le corps d'un article vérifie le niveau d'abonnement de l'utilisateur **côté serveur** avant de renvoyer le contenu complet (jamais de masquage uniquement côté front, contournable).
- Les fichiers PDF/audio sont servis via des **liens signés à expiration courte** (quelques minutes), jamais via une URL statique publique.
- **Watermarking discret** (nom/email de l'acheteur incrusté dans le PDF) pour dissuader le partage non autorisé.
- Limitation du nombre d'appareils/sessions simultanées par compte pour l'option « Accès IP » de l'abonnement Chef d'entreprise.

### 10.3 Sécurité de l'infrastructure

- **WAF (Web Application Firewall)** activé au niveau de Vercel/Cloudflare pour filtrer le trafic malveillant en amont de l'application.
- **Rate limiting** sur les endpoints sensibles (connexion, don, paiement, recherche) pour prévenir le brute-force et le scraping massif de contenu.
- **Protection anti-DDoS** au niveau du CDN (incluse nativement chez Vercel/Cloudflare).
- Isolation stricte des environnements (les clés API de production ne sont jamais présentes en recette/développement).

### 10.4 Securité des paiements

- Aucune donnée de carte bancaire ne transite ni n'est stockée par les serveurs d'ENVOL AFRICA : la conformité **PCI DSS** est déléguée à **Moneroo**, qui gère la tokenisation.
- Vérification systématique des **webhooks Moneroo** par signature cryptographique avant de valider une commande ou un abonnement côté application.
- Journalisation immuable de toutes les transactions (aucune suppression possible, uniquement des annulations tracées) pour l'audit financier.

### 10.5 Sécurité des comptes utilisateurs

- Politique de mot de passe robuste + **MFA obligatoire** pour tous les rôles back-office (§9.5).
- Verrouillage progressif après tentatives de connexion échouées répétées.
- Notification automatique par email en cas de connexion depuis un nouvel appareil/pays.
- Expiration et révocations des sessions actives lors d'un changement de mot de passe.

### 10.6 Conformité et protection des données

- Bandeau de consentement cookies conforme (RGPD pour les visiteurs européens, et bonnes pratiques recommandées même si la réglementation béninoise/CEDEAO est moins contraignante) avec granularité (nécessaires / analytics / marketing).
- Politique de confidentialité et conditions d'utilisation rédigées et accessibles depuis le footer (déjà prévu en §7.2).
- Chiffrement des données sensibles au repos (géré nativement par Supabase/PostgreSQL) et en transit (TLS 1.2+ partout).
- Droit à l'effacement et à l'export des données personnelles, accessible depuis l'espace client.

### 10.7 Sauvegarde et continuité d'activité

- Sauvegardes automatiques quotidiennes de la base de données (rétention minimum 30 jours), avec tests de restauration périodiques.
- Réplication du stockage média (Supabase Storage) sur une région de secours.
- Plan de reprise d'activité documenté (procédure de restauration, contacts d'astreinte).

### 10.8 Sécurité organisationnelle

- Rotation régulière des clés API et secrets (Moneroo, Google/Facebook OAuth, services tiers).
- Journal d'audit des actions sensibles en back-office (qui a modifié un prix, publié/dépublié un article, validé un retrait d'affiliation).
- Un **audit de sécurité externe (pentest)** recommandé avant le lancement public, puis à chaque évolution majeure (nouveau moyen de paiement, nouvelle intégration tierce).

---

## 11. Exigences non-fonctionnelles

- **Multilingue** : Français (langue de référence), Anglais, Espagnol au minimum pour les contenus produit ; jusqu'à 12 langues pour les CD audio (métadonnées uniquement, pas nécessairement l'interface entière).
- **Multidevise** : XOF comme devise pivot, conversion automatique vers USD, EUR, et autres devises locales détectées.
- **Performance** : cible < 2,5 s de chargement initial sur connexion mobile 3G/4G moyenne africaine ; images optimisées et servies via CDN.
- **SEO** : URLs propres par article/numéro, balises meta dynamiques, sitemap XML, données structurées (schema.org Article/Product).
- **Accessibilité** : contrastes suffisants, navigation clavier, textes alternatifs sur les images.
- **RGPD / protection des données** : bandeau cookies, politique de confidentialité, consentement explicite pour la géolocalisation et les notifications.
- **Disponibilité** : hébergement avec sauvegardes automatiques quotidiennes et plan de reprise d'activité.

---

## 12. Points à clarifier avec Quentin — propositions expertes

Plutôt que de laisser ces points en simples questions ouvertes, voici pour chacun une proposition concrète, prête à valider ou ajuster avec Quentin. L'objectif : qu'aucun de ces points ne bloque le démarrage du développement.

### 12.1 Contenu des 7 sous-blocs restants du « Fil d'info »

Proposition d'organisation (en complément du bloc principal « Clarté » et des 2 sous-blocs déjà identifiés), pour occuper les 7 emplacements restants avec du contenu à forte valeur éditoriale et un bon taux de clic :

| Sous-bloc proposé | Contenu |
|---|---|
| « Pouls du jour » | 3 brèves d'actualité économique/entrepreneuriale du jour (titre + heure). |
| « Chronique » | Dernière chronique/opinion publiée, mise en avant avec photo de l'auteur. |
| « Focus Régional » | Article classé par zone géographique (Afrique de l'Ouest, Centrale, Australe, Nord, Est) en rotation. |
| « Interview flash » | Extrait vidéo ou citation d'un dirigeant/entrepreneur (courte interview). |
| « Chiffre clé » | Une statistique ou donnée économique du jour, présentée en gros caractère avec source. |
| « Agenda ENVOL AFRICA » | Prochains événements du groupe (Salons, Africa Awards, webinaires de formation). |
| « Opportunité du jour » | Un appel à projet, financement ou offre d'emploi Jobs mis en avant. |

Ce plan reste indicatif : il doit être confronté au plan PDF de blocs fourni par Quentin (mesures exactes en pixels) pour vérifier que les 7 emplacements ont bien des proportions compatibles avec ce contenu. **Action recommandée** : Quentin valide ou réagence cette liste en une session de 15 minutes avec l'équipe éditoriale avant le début du développement du back-office.

### 12.2 Contenu du « pack prestige » (abonnement Soutien, 600 000 XOF/an)

Proposition de composition, cohérente avec un abonnement de très haut de gamme destiné à des mécènes/partenaires institutionnels :

- Invitation VIP (2 places) aux événements du groupe : gala Africa Awards, Salons World Africa Business.
- Un portrait/interview de l'entreprise ou du dirigeant publié dans un numéro du magazine (avantage éditorial, à encadrer par une charte de séparation avec la ligne rédactoriale indépendante).
- Visibilité logo « Partenaire Soutien » sur le site (page dédiée + footer) et dans le magazine papier.
- Accompagnement dédié avec un conseiller ENVOL AFRICA (mise en relation prioritaire avec les services Jobs, Marketplace, Levée de fonds).
- Accès à un salon/réseau privé de mise en relation entre abonnés Soutien (networking B2B).
- Badge distinctif sur le profil et les commentaires du site.

**Action recommandée** : faire valider cette liste par Quentin et le Gérant du site avant de coder les entitlements liés à ce palier — le pack prestige a un impact éditorial (portrait sponsorisé) qui doit être cadré contractuellement, pas seulement techniquement.

### 12.3 Fournisseur de calcul des frais de livraison (magazines papier)

Proposition : intégrer l'**API DHL Express (MyDHL API)** pour le calcul des tarifs internationaux à l'étape du panier (compte entreprise DHL à ouvrir par ENVOL AFRICA). Pour les livraisons locales au Bénin et dans les pays limitrophes où DHL serait trop coûteux pour de petits colis, prévoir un **tarif forfaitaire local négocié avec un transporteur régional** (ou retrait en point relais/kiosque partenaire à Cotonou) comme option alternative moins chère à l'achat. Cette double option (DHL international + tarif local forfaitaire) évite de pénaliser les clients béninois/ouest-africains avec des frais DHL disproportionnés par rapport au prix du magazine.

### 12.4 Comportement du pop-up promotionnel après les 48h

Proposition de règle : à l'expiration du compte à rebours, le pop-up disparaît pour l'utilisateur concerné (stocké en base ou en cookie long) pendant **30 jours**, puis peut réapparaître avec une nouvelle offre limitée dans le temps (jamais la même promotion en boucle immédiate, pour préserver sa crédibilité). Si l'utilisateur s'abonne entre-temps, le pop-up ne doit plus jamais s'afficher pour lui. Cette logique doit être pilotable depuis le back-office Administrateur (durée du compte à rebours, taux de réduction, délai de réapparition) plutôt que codée en dur, pour permettre de futures campagnes.

### 12.5 Règle de calcul « Articles les plus lus »

Proposition de formule pondérée, recalculée toutes les heures, sur une fenêtre glissante de 7 jours :

`Score = (Nombre de vues × 1) + (Nombre de partages × 3) + (Nombre de commentaires × 2)`

avec une légère décroissance temporelle (les articles des dernières 24h sont légèrement favorisés) pour éviter qu'un article ancien mais très vu reste indéfiniment en tête. Le Top 10 obtenu alimente le module « Nos articles les plus lus ». Cette pondération est un point de départ raisonnable et doit rester ajustable sans redéploiement (paramètre en base de données).

### 12.6 Choix définitif de la stack technique

Recommandation ferme : conserver la stack déjà proposée en §9 (**Next.js + Vercel + Supabase + Moneroo**), pour une raison simple : c'est déjà la stack utilisée sur Africa Awards et cohérente avec MagicAfrica. Mutualiser la stack sur tout l'écosystème ENVOL AFRICA réduit les coûts de maintenance, permet de réutiliser des composants (auth, paiement Moneroo, design system) d'un projet à l'autre, et facilite le SSO entre sous-domaines évoqué en §6. Sauf contrainte budgétaire ou technique particulière du prestataire retenu, ce choix ne devrait pas être rouvert.

### 12.6bis Récapitulatif du triptyque de déploiement retenu 🔒

Pour lever toute ambiguïté avant le démarrage du développement, le déploiement du projet repose exclusivement sur trois services, sans alternative à arbitrer en cours de route :

- **GitHub** — dépôt de code unique, branche `main` protégée, pull requests obligatoires, GitHub Actions comme portail de qualité (lint/tests) avant merge.
- **Vercel** — hébergement du front Next.js, déploiement automatique par intégration Git (Preview par branche/PR, Production sur `main`), variables d'environnement scopées par environnement.
- **Supabase** — base PostgreSQL, Auth, Storage, Edge Functions, Realtime ; deux projets Supabase (Développement+Recette / Production) reliés aux environnements Vercel correspondants.

Tout service additionnel mentionné en §9 (Moneroo, Meilisearch, Resend, Sentry, etc.) reste un service tiers appelé **depuis** cette base Vercel/Supabase/GitHub — aucun de ces services tiers n'héberge de code applicatif ni ne remplace une brique du triptyque. Voir `CONNECTEURSMCP.md` pour la configuration des connecteurs MCP correspondant à ces trois services, et `RULES.md` §5 pour la règle de non-substitution de stack.

### 12.7 Accès aux assets et transfert vers l'équipe technique

Proposition d'organisation : créer un dossier Google Drive unique « EAM — Assets & Specs » regroupant logos, premier numéro EAM N°0001, plan PDF des blocs, et ce cahier des charges, partagé en lecture avec l'équipe/le freelance retenu. En parallèle, ouvrir un dépôt de code (GitHub/GitLab) et un espace de gestion de projet (Notion, Trello ou Linear) dès le lancement de la Phase 1, pour que les assets ne restent pas dispersés dans des liens Drive individuels au fil du projet.

---

## 13. Feuille de route de réalisation proposée

### Phase 1 — MVP (fondations)

- Authentification (email/téléphone + Google/Facebook), gestion des rôles.
- Modèle de données articles/catégories + éditeur back-office rédacteur.
- Landing page avec sections principales (Image Catégorie A, Carrousel magazines, Fil d'info simplifié).
- Paywall progressif sur les articles.
- Page Kiosque + fiche produit + panier + intégration Moneroo (paiement carte + Mobile Money).
- 4 formules d'abonnement fonctionnelles avec facturation récurrente.
- Détection langue/devise automatique.

### Phase 2 — Enrichissement

- Programme d'affiliation complet (liens, tracking, tableau de bord, retraits).
- Notifications push, feuilletage numérique, lecture audio des articles.
- Pop-up promotionnel avec compte à rebours.
- Espace client complet (téléchargements, factures, favoris).
- Calcul automatique des frais DHL pour les magazines papier.

### Phase 3 — Écosystème et optimisation

- Interconnexion SSO avec les autres sous-domaines de l'écosystème (Jobs, Marketplace, Crowdfunding, Africa Awards, World Africa Business).
- Régie publicitaire / contenus sponsorisés.
- Recherche avancée, recommandations personnalisées.
- Optimisations de performance et SEO internationalisées.

---

## 14. Glossaire (pour développeur / agent IA)

| Terme | Définition |
|---|---|
| EAM | Envol Africa Magazine, nom du site/produit objet de ce document. |
| Kiosque | Boutique en ligne des numéros de magazine (papier, numérique, audio). |
| Paywall progressif | Mécanisme limitant la lecture d'un article aux 12 premières lignes pour les non-abonnés, avec dégradation visuelle des lignes suivantes. |
| Accès IP | Option de l'abonnement Chef d'entreprise permettant un accès élargi (plusieurs postes/utilisateurs) associé à une entreprise. |
| Affilié | Utilisateur disposant d'un lien de recommandation rémunéré en commission sur les ventes générées. |
| WAB | World Africa Business, l'une des briques de l'écosystème ENVOL AFRICA. |
| Feuilletage | Consultation d'un magazine en ligne via une visionneuse simulant le tournage de pages (flipbook). |

---

## 16. Proposition de contenu pour le méga-menu (header desktop)

Le document initial mentionne un « méga-menu » en ligne 2 de l'entête (§7.1) sans en détailler le contenu. Voici une proposition structurée, pensée pour un site de presse économique panafricain, à organiser en colonnes déroulantes sous forme de mosaïque (texte + une image de mise en avant à droite) :

| Colonne | Contenu |
|---|---|
| **Rubriques éditoriales** | Éditorial, Chronique, Opinion, Politique, Économie, Entrepreneuriat, Management, Marketing, Financement, Intelligence artificielle, Développement, Agriculture. |
| **Par zone géographique** | Afrique de l'Ouest, Afrique Centrale, Afrique de l'Est, Afrique Australe, Afrique du Nord, International. |
| **Formats & séries** | Grande Interview, Manager du mois, Dossier du mois, Champions de l'innovation / Start-ups à suivre, Vidéos, Podcasts (si prévu). |
| **Écosystème ENVOL AFRICA** | Kiosque, Jobs, Marketplace, Crowdfunding, Africa Awards, World Africa Business, Salons — chacun avec une micro-icône. |
| **Bloc mis en avant (à droite)** | Visuel de l'article ou du dossier phare du moment, avec titre, catégorie et lien — remplit visuellement le méga-menu et incite au clic (technique courante sur les sites de presse premium). |

Fonctionnellement, ce méga-menu doit être **piloté depuis le back-office** (l'Administrateur ou le Rédacteur en chef choisit quelles rubriques/quel article vedette y apparaissent) plutôt que codé en dur, pour rester cohérent avec la logique de paramétrage déjà demandée pour la landing page et le footer.

Sur mobile, ce méga-menu se transforme naturellement en accordéon dans le panneau latéral plein écran (voir §8.1).

---

## 17. Stratégie SEO — Google et moteurs IA (SEO + GEO/AEO)

Un site de presse ne vaut que par sa capacité à être trouvé. Deux volets sont à traiter en parallèle dès la Phase 1 : le référencement classique (Google, Bing) et le référencement dans les réponses des moteurs IA (ChatGPT, Perplexity, Google AI Overviews, Gemini) — ce qu'on appelle le GEO (Generative Engine Optimization) ou AEO (Answer Engine Optimization).

### 17.1 SEO technique (fondations, Phase 1)

- **Core Web Vitals** : cible LCP < 2,5s, CLS < 0,1 — cohérent avec l'exigence de performance du §11.
- **URLs propres et stables** : `/articles/<slug>`, `/kiosque/<numero>`, pas de paramètres techniques dans les URLs indexables.
- **Données structurées (schema.org)** : `NewsArticle`/`Article` sur chaque article (avec `author`, `datePublished`, `isAccessibleForFree: false` pour signaler le paywall à Google sans être pénalisé), `Product` + `Offer` sur les fiches magazines, `Organization` sur le site, `BreadcrumbList`, `FAQPage` là où pertinent.
- **Balisage paywall Google** : utiliser le balisage structuré dédié aux contenus payants (`isAccessibleForFree`, `hasPart` avec `isAccessibleForFree: false` sur la partie verrouillée) pour que Google indexe l'article complet sans que l'utilisateur puisse le lire gratuitement — évite d'être pénalisé comme « cloaking ».
- **Multilingue** : balises `hreflang` correctes entre les versions FR/EN/ES d'un même contenu, sitemaps XML séparés par langue.
- **Sitemaps** : sitemap articles (mis à jour en continu), sitemap Kiosque, sitemap images, ping automatique à Google Search Console à chaque publication.
- **Vitesse d'indexation** : soumettre chaque nouvel article via l'API d'indexation Google (Indexing API) plutôt que d'attendre le crawl naturel — important pour un site d'actualité.

### 17.2 SEO éditorial (contenu, continu)

- Construire des **pages piliers** par rubrique (ex. « Financement en Afrique », « Intelligence artificielle en Afrique ») qui agrègent et maillent en interne tous les articles liés — bon pour le SEO et pour la navigation.
- Maillage interne systématique entre articles, dossiers et fiches magazine.
- Contenus « evergreen » (guides, lexiques économiques) en plus des articles d'actualité, qui captent du trafic dans la durée.
- Un article = une intention de recherche claire, réponse dès les premières lignes (utile aussi pour le GEO, voir ci-dessous), puis développement.

### 17.3 SEO IA / GEO / AEO — être cité par ChatGPT, Perplexity, Google AI Overviews

Les moteurs génératifs ne classent pas des liens, ils **citent ou reformulent** des passages de contenu qu'ils jugent fiables, structurés et récents. Recommandations spécifiques :

- **Répondre dès le début de l'article** : structurer le chapô/les 12 premières lignes visibles (justement celles non verrouillées par le paywall, voir §5.1) comme une réponse autonome et citable — c'est la partie que les IA pourront le plus facilement reprendre, donc elle doit être écrite avec soin.
- **E-E-A-T renforcé** : pages auteur détaillées (bio, expertise, réseaux), mentions de sources, dates de mise à jour visibles — les moteurs IA privilégient les contenus dont la fiabilité est vérifiable.
- **Données propriétaires et classements exclusifs** (ex. le classement « Champions de l'innovation tech africaine » déjà prévu en landing page) : ce type de contenu original et chiffré est ce que les IA aiment le plus citer, car il n'existe nulle part ailleurs.
- **Fichier `llms.txt`** à la racine du site (norme émergente) décrivant la nature du site, les pages clés et les conditions de citation — un signal de plus en plus pris en compte par les moteurs IA.
- **Gestion des robots IA** (`robots.txt`) : décision stratégique à trancher avec Quentin — autoriser `GPTBot`, `Google-Extended`, `PerplexityBot`, `ClaudeBot` à crawler les métadonnées et le contenu gratuit (bon pour la visibilité et la notoriété de marque dans les réponses IA), mais **bloquer l'accès au contenu payant complet** pour ne pas dévaluer le paywall. C'est le même arbitrage que pour Google, à étendre aux robots IA.
- **Cohérence multi-plateforme** : s'assurer que le nom « Envol Africa Magazine », les auteurs et l'organisation soient identifiables de façon cohérente sur le site, LinkedIn, Wikipédia (si applicable) et les annuaires professionnels — les moteurs IA croisent ces signaux pour évaluer la fiabilité d'une source avant de la citer.
- **Fraîcheur du contenu** : les moteurs IA favorisent les sources mises à jour régulièrement ; publier un flux régulier d'articles (et non uniquement au rythme mensuel du magazine papier) aide autant le SEO classique que le GEO.

### 17.4 Suivi et outillage

- Google Search Console + Bing Webmaster Tools dès la mise en ligne.
- Outil de suivi de position (ex. Ahrefs, Semrush) sur les mots-clés « affaires Afrique », « économie Afrique », « entrepreneuriat Afrique », etc.
- Suivi des citations dans les moteurs IA (outils émergents de type Profound, Otterly, ou veille manuelle par requêtes tests sur ChatGPT/Perplexity) pour mesurer la présence de la marque dans les réponses IA au fil du temps.

---

## 18. Annexes — Ressources fournies par Quentin

- Logo Envol Africa Mag en couleur, version blanche, et miniature favicon/mobile (liens Google Drive fournis par Quentin).
- Premier numéro EAM N°0001 (Édition Normale, Papier, Français) — fichier PDF à utiliser comme numéro de lancement du Kiosque.
- Plan de configuration des blocs de la landing page (fichier PDF avec mesures en pixels) — référence pour le paramétrage du back-office administrateur.
- Ancien site de référence envolafrica.net, dont la structure de header/footer/écosystème a été reprise et modernisée dans ce document.
