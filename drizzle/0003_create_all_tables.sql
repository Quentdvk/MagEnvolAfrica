-- Création de toutes les tables pour Envol Africa Magazine
-- À exécuter dans le SQL Editor du dashboard Supabase

-- Extension pour les types UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Table profiles (liée à auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'inscrit' CHECK (role IN ('inscrit', 'redacteur', 'redacteur_en_chef', 'gerant', 'administrateur')),
  preferred_language TEXT, -- ISO 639-1
  preferred_currency TEXT, -- ISO 4217
  mfa_enabled BOOLEAN NOT NULL DEFAULT false,
  company_name TEXT,
  is_affiliate BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 2. Table user_devices
CREATE TABLE IF NOT EXISTS user_devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  device_fingerprint TEXT NOT NULL,
  ip_address INET,
  country TEXT,
  last_seen_at TIMESTAMP NOT NULL DEFAULT NOW(),
  is_revoked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 3. Table subscription_plans
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE CHECK (code IN ('mensuel', 'annuel', 'chef_entreprise', 'soutien')),
  price_first_period_xof NUMERIC NOT NULL,
  price_recurring_xof NUMERIC NOT NULL,
  billing_interval TEXT NOT NULL CHECK (billing_interval IN ('mensuel', 'annuel')),
  features JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 4. Table subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id),
  status TEXT NOT NULL CHECK (status IN ('active', 'en_attente_paiement', 'expiree', 'annulee')),
  is_first_period BOOLEAN NOT NULL DEFAULT true,
  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  moneroo_subscription_ref TEXT,
  cancelled_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 5. Table soutien_pack_entitlements
CREATE TABLE IF NOT EXISTS soutien_pack_entitlements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  entitlement_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'en_attente_validation',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 6. Table categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  color_hex TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 7. Table articles
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  chapo TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_preview_lines INTEGER NOT NULL DEFAULT 12,
  author_id UUID REFERENCES profiles(id),
  status TEXT NOT NULL CHECK (status IN ('brouillon', 'en_validation', 'publie', 'depublie')),
  published_at TIMESTAMP,
  read_time_minutes INTEGER,
  audio_url TEXT,
  is_free BOOLEAN NOT NULL DEFAULT false,
  views_count INTEGER NOT NULL DEFAULT 0,
  shares_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 8. Table article_categories
CREATE TABLE IF NOT EXISTS article_categories (
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (article_id, category_id)
);

-- 9. Table comments
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('visible', 'masque_moderation')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 10. Table likes
CREATE TABLE IF NOT EXISTS likes (
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, profile_id)
);

-- 11. Table article_ranking_scores
CREATE TABLE IF NOT EXISTS article_ranking_scores (
  article_id UUID PRIMARY KEY REFERENCES articles(id) ON DELETE CASCADE,
  score NUMERIC NOT NULL,
  computed_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 12. Table magazines
CREATE TABLE IF NOT EXISTS magazines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero TEXT NOT NULL UNIQUE,
  edition_type TEXT NOT NULL CHECK (edition_type IN ('normale', 'speciale', 'hors_serie')),
  cover_image_url TEXT NOT NULL,
  summary TEXT NOT NULL,
  published_at TIMESTAMP NOT NULL,
  year INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 13. Table magazine_variants
CREATE TABLE IF NOT EXISTS magazine_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  magazine_id UUID REFERENCES magazines(id) ON DELETE CASCADE,
  version TEXT NOT NULL CHECK (version IN ('cd_audio', 'numerique', 'papier', 'audio_pdf', 'audio_papier')),
  price_xof NUMERIC NOT NULL,
  available_languages TEXT[] NOT NULL,
  file_url TEXT
);

-- 14. Table orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('panier', 'en_attente_paiement', 'payee', 'annulee', 'remboursee')),
  currency TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  affiliate_link_id UUID,
  dhl_shipping_fee NUMERIC,
  moneroo_payment_ref TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 15. Table order_items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('magazine', 'abonnement', 'don')),
  magazine_variant_id UUID REFERENCES magazine_variants(id),
  language TEXT,
  unit_price NUMERIC NOT NULL
);

-- 16. Table downloads
CREATE TABLE IF NOT EXISTS downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  magazine_variant_id UUID REFERENCES magazine_variants(id),
  signed_url_issued_at TIMESTAMP NOT NULL DEFAULT NOW(),
  signed_url_expires_at TIMESTAMP NOT NULL,
  watermark_applied BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 17. Table payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id),
  donation_id UUID,
  provider TEXT NOT NULL DEFAULT 'moneroo',
  provider_ref TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('initie', 'confirme', 'echoue', 'rembourse')),
  webhook_signature_verified BOOLEAN NOT NULL DEFAULT false,
  raw_webhook_payload JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 18. Table donations
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('mobile_money', 'carte', 'autre')),
  phone_number TEXT,
  payment_reference TEXT,
  comment TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 19. Table dhl_shipping_rates
CREATE TABLE IF NOT EXISTS dhl_shipping_rates (
  country_code TEXT PRIMARY KEY,
  rate NUMERIC NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 20. Table local_shipping_rates
CREATE TABLE IF NOT EXISTS local_shipping_rates (
  zone TEXT PRIMARY KEY,
  rate NUMERIC NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 21. Table exchange_rates
CREATE TABLE IF NOT EXISTS exchange_rates (
  currency_code TEXT PRIMARY KEY,
  rate_to_xof NUMERIC NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 22. Table site_settings
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 23. Table footer_links
CREATE TABLE IF NOT EXISTS footer_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  column_name TEXT NOT NULL,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 24. Table mega_menu_items
CREATE TABLE IF NOT EXISTS mega_menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  column_name TEXT NOT NULL,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT,
  "order" INTEGER NOT NULL,
  featured_article_id UUID REFERENCES articles(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 25. Table landing_blocks
CREATE TABLE IF NOT EXISTS landing_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  block_key TEXT NOT NULL UNIQUE,
  article_id UUID REFERENCES articles(id),
  magazine_id UUID REFERENCES magazines(id),
  "order" INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 26. Table popup_campaigns
CREATE TABLE IF NOT EXISTS popup_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  discount_percent NUMERIC NOT NULL DEFAULT 50,
  countdown_hours INTEGER NOT NULL DEFAULT 48,
  reappear_after_days INTEGER NOT NULL DEFAULT 30,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 27. Table user_popup_dismissals
CREATE TABLE IF NOT EXISTS user_popup_dismissals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_id TEXT,
  campaign_id UUID REFERENCES popup_campaigns(id),
  dismissed_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 28. Table affiliate_links
CREATE TABLE IF NOT EXISTS affiliate_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('general', 'magazine_numero')),
  magazine_id UUID REFERENCES magazines(id),
  short_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 29. Table affiliate_clicks
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  link_id UUID REFERENCES affiliate_links(id) ON DELETE CASCADE,
  clicked_at TIMESTAMP NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  converted BOOLEAN NOT NULL DEFAULT false
);

-- 30. Table affiliate_conversions
CREATE TABLE IF NOT EXISTS affiliate_conversions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  link_id UUID REFERENCES affiliate_links(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id),
  subscription_id UUID REFERENCES subscriptions(id),
  commission_rate NUMERIC NOT NULL,
  commission_rate_reason TEXT NOT NULL,
  commission_amount NUMERIC NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('en_attente', 'validee', 'payee')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 31. Table affiliate_payouts
CREATE TABLE IF NOT EXISTS affiliate_payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('mobile_money', 'virement', 'carte')),
  status TEXT NOT NULL CHECK (status IN ('demande', 'en_traitement', 'payee', 'rejetee')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 32. Table notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  link TEXT,
  read_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 33. Table push_subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  keys JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 34. Table favorites
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  magazine_id UUID REFERENCES magazines(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 35. Table service_requests
CREATE TABLE IF NOT EXISTS service_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_type TEXT NOT NULL,
  description TEXT NOT NULL,
  budget_indicative TEXT,
  company_name TEXT,
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'en_attente',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 36. Table audit_log
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  previous_value JSONB,
  new_value JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Trigger pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    'inscrit'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insertion des données initiales (categories et plans d'abonnement)
INSERT INTO categories (slug, label, color_hex) VALUES
  ('economie', 'Économie', '#3B82F6'),
  ('politique', 'Politique', '#EF4444'),
  ('technologie', 'Technologie', '#10B981'),
  ('culture', 'Culture', '#F59E0B'),
  ('sport', 'Sport', '#8B5CF6')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO subscription_plans (code, price_first_period_xof, price_recurring_xof, billing_interval, features) VALUES
  ('mensuel', 2500, 5000, 'mensuel', '["Accès illimité aux articles", "Newsletter quotidienne", "Support email"]'::jsonb),
  ('annuel', 25000, 50000, 'annuel', '["Tout du plan mensuel", "1 magazine gratuit par mois", "Support prioritaire"]'::jsonb),
  ('chef_entreprise', 100000, 100000, 'mensuel', '["Tout du plan annuel", "5 comptes utilisateurs", "Accès API", "Manager de compte dédié"]'::jsonb),
  ('soutien', 1000, 1000, 'mensuel', '["Support du projet", "Nom sur page donateurs", "Newsletter exclusive"]'::jsonb)
ON CONFLICT (code) DO NOTHING;
