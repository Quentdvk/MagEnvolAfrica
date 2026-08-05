-- Données de test (articles publiés, magazines et formats)
-- Idempotent : peut être rejoué sans dupliquer les enregistrements.
-- À exécuter dans le SQL Editor du dashboard Supabase après 0003.

-- Auteur : l'administrateur s'il existe, sinon aucun auteur (author_id NULL)
WITH admin AS (
  SELECT p.id
  FROM public.profiles p
  WHERE p.role = 'administrateur'
  ORDER BY p.created_at
  LIMIT 1
)
INSERT INTO public.articles (
  slug, title, chapo, body_html, body_preview_lines, author_id,
  status, published_at, read_time_minutes, is_free
)
SELECT v.slug, v.title, v.chapo, v.body_html, 12, (SELECT id FROM admin),
       'publie', NOW() - (v.days || ' days')::interval, v.read_time, v.is_free
FROM (VALUES
  (
    'zlecaf-moteur-commerce-intra-africain',
    'La ZLECAf, moteur du commerce intra-africain',
    'La zone de libre-échange continentale africaine change la donne pour les PME exportatrices du continent.',
    '<p>La ZLECAf est entrée dans sa phase opérationnelle et les premiers effets se mesurent déjà sur les corridors ouest-africains.</p><p>Les PME exportatrices bénéficient d''une réduction progressive des droits de douane sur plus de 90 % des lignes tarifaires.</p><p>Les défis restent nombreux : infrastructures logistiques, harmonisation des normes et accès au financement.</p><p>Pour les entrepreneurs béninois, le marché nigérian reste la première destination, suivi du Ghana et de la Côte d''Ivoire.</p><p>Les experts s''accordent sur un point : sans digitalisation des procédures douanières, les gains resteront théoriques.</p>',
    1, 6, true
  ),
  (
    'mobile-money-benin-paiements-numeriques',
    'Mobile money : le Bénin accélère sur les paiements numériques',
    'Les volumes de transactions mobile money progressent de 30 % par an, portés par les jeunes entrepreneurs.',
    '<p>Le paiement mobile est devenu le principal moyen de transaction pour les commerçants informels.</p><p>Les agrégateurs locaux comme Moneroo permettent désormais aux sites marchands d''accepter MTN et Moov en quelques lignes de code.</p><p>La bancarisation classique reste faible, ce qui accélère l''adoption des portefeuilles électroniques.</p><p>Les régulateurs de l''UEMOA travaillent sur l''interopérabilité entre opérateurs.</p><p>Reste la question des frais, encore jugés élevés par les petits commerçants.</p>',
    3, 4, false
  ),
  (
    'agro-industrie-filieres-investisseurs',
    'Agro-industrie : les filières qui attirent les investisseurs',
    'Anacarde, soja, ananas : tour d''horizon des filières les plus dynamiques d''Afrique de l''Ouest.',
    '<p>La transformation locale de l''anacarde double la valeur ajoutée par tonne exportée.</p><p>Le soja béninois séduit les acheteurs asiatiques, avec une production en hausse continue.</p><p>L''ananas pain de sucre conserve une prime qualité sur les marchés européens.</p><p>Les investisseurs réclament des garanties foncières et un accès fiable à l''énergie.</p><p>Les zones industrielles spécialisées apparaissent comme la réponse privilégiée des États.</p>',
    5, 8, false
  ),
  (
    'dirigeantes-management-africain',
    'Ces dirigeantes qui réinventent le management africain',
    'Portraits de quatre dirigeantes qui bousculent les codes de la gouvernance d''entreprise.',
    '<p>Elles dirigent des groupes industriels, des fintechs ou des médias.</p><p>Leur point commun : une gouvernance participative et une attention forte à la formation interne.</p><p>Les conseils d''administration se féminisent lentement mais sûrement.</p><p>Les réseaux d''entraide jouent un rôle décisif dans l''accès au financement.</p>',
    7, 5, true
  )
) AS v(slug, title, chapo, body_html, days, read_time, is_free)
ON CONFLICT (slug) DO NOTHING;

-- Rattachement des articles à leur catégorie principale
INSERT INTO public.article_categories (article_id, category_id, is_primary)
SELECT a.id, c.id, true
FROM (VALUES
  ('zlecaf-moteur-commerce-intra-africain', 'economie'),
  ('mobile-money-benin-paiements-numeriques', 'technologie'),
  ('agro-industrie-filieres-investisseurs', 'economie'),
  ('dirigeantes-management-africain', 'culture')
) AS v(article_slug, category_slug)
JOIN public.articles a ON a.slug = v.article_slug
JOIN public.categories c ON c.slug = v.category_slug
ON CONFLICT (article_id, category_id) DO NOTHING;

-- Magazines
INSERT INTO public.magazines (numero, edition_type, cover_image_url, summary, published_at, year)
VALUES
  ('001', 'normale', '', 'Le premier numéro du magazine économique panafricain : ZLECAf, fintech et agro-industrie.', NOW() - INTERVAL '60 days', EXTRACT(YEAR FROM NOW())::int),
  ('002', 'speciale', '', 'Spécial entrepreneuriat et innovation en Afrique de l''Ouest.', NOW() - INTERVAL '30 days', EXTRACT(YEAR FROM NOW())::int)
ON CONFLICT (numero) DO NOTHING;

-- Formats (variantes) des magazines
INSERT INTO public.magazine_variants (magazine_id, version, price_xof, available_languages)
SELECT m.id, v.version, v.price_xof, ARRAY['fr']
FROM (VALUES
  ('001', 'numerique', 5000),
  ('001', 'cd_audio', 5000),
  ('001', 'papier', 10000),
  ('002', 'numerique', 5000),
  ('002', 'papier', 10000)
) AS v(numero, version, price_xof)
JOIN public.magazines m ON m.numero = v.numero
WHERE NOT EXISTS (
  SELECT 1 FROM public.magazine_variants mv
  WHERE mv.magazine_id = m.id AND mv.version = v.version
);

-- Vérification
SELECT
  (SELECT COUNT(*) FROM public.articles WHERE status = 'publie') AS articles_publies,
  (SELECT COUNT(*) FROM public.magazines) AS magazines,
  (SELECT COUNT(*) FROM public.magazine_variants) AS formats,
  (SELECT COUNT(*) FROM public.subscription_plans WHERE is_active) AS plans_actifs;
