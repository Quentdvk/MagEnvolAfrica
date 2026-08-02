import { pgTable, uuid, text, boolean, timestamp, integer, numeric, jsonb, inet } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const userRoleEnum = ["inscrit", "redacteur", "redacteur_en_chef", "gerant", "administrateur"] as const;
export const planCodeEnum = ["mensuel", "annuel", "chef_entreprise", "soutien"] as const;
export const billingIntervalEnum = ["mensuel", "annuel"] as const;
export const subscriptionStatusEnum = ["active", "en_attente_paiement", "expiree", "annulee"] as const;
export const articleStatusEnum = ["brouillon", "en_validation", "publie", "depublie"] as const;
export const commentStatusEnum = ["visible", "masque_moderation"] as const;
export const editionTypeEnum = ["normale", "speciale", "hors_serie"] as const;
export const magazineVersionEnum = ["cd_audio", "numerique", "papier", "audio_pdf", "audio_papier"] as const;
export const orderStatusEnum = ["panier", "en_attente_paiement", "payee", "annulee", "remboursee"] as const;
export const orderItemTypeEnum = ["magazine", "abonnement", "don"] as const;
export const paymentStatusEnum = ["initie", "confirme", "echoue", "rembourse"] as const;
export const donationPaymentMethodEnum = ["mobile_money", "carte", "autre"] as const;
export const affiliateTargetTypeEnum = ["general", "magazine_numero"] as const;
export const commissionStatusEnum = ["en_attente", "validee", "payee"] as const;
export const payoutMethodEnum = ["mobile_money", "virement", "carte"] as const;
export const payoutStatusEnum = ["demande", "en_traitement", "payee", "rejetee"] as const;

// 1. Identité & rôles
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().references(() => authUsers.id, { onDelete: "cascade" }),
  fullName: text("full_name"),
  phone: text("phone"),
  avatarUrl: text("avatar_url"),
  role: text("role", { enum: userRoleEnum }).notNull().default("inscrit"),
  preferredLanguage: text("preferred_language"), // ISO 639-1
  preferredCurrency: text("preferred_currency"), // ISO 4217
  mfaEnabled: boolean("mfa_enabled").notNull().default(false),
  companyName: text("company_name"),
  isAffiliate: boolean("is_affiliate").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const authUsers = pgTable("auth.users", {
  id: uuid("id").primaryKey(),
});

export const userDevices = pgTable("user_devices", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "cascade" }),
  deviceFingerprint: text("device_fingerprint").notNull(),
  ipAddress: inet("ip_address"),
  country: text("country"),
  lastSeenAt: timestamp("last_seen_at").notNull().defaultNow(),
  isRevoked: boolean("is_revoked").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// 2. Abonnements & facturation
export const subscriptionPlans = pgTable("subscription_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code", { enum: planCodeEnum }).notNull().unique(),
  priceFirstPeriodXof: numeric("price_first_period_xof").notNull(),
  priceRecurringXof: numeric("price_recurring_xof").notNull(),
  billingInterval: text("billing_interval", { enum: billingIntervalEnum }).notNull(),
  features: jsonb("features").notNull().$type<string[]>(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "cascade" }),
  planId: uuid("plan_id").references(() => subscriptionPlans.id),
  status: text("status", { enum: subscriptionStatusEnum }).notNull(),
  isFirstPeriod: boolean("is_first_period").notNull().default(true),
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  monerooSubscriptionRef: text("moneroo_subscription_ref"),
  cancelledAt: timestamp("cancelled_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const soutienPackEntitlements = pgTable("soutien_pack_entitlements", {
  id: uuid("id").primaryKey().defaultRandom(),
  subscriptionId: uuid("subscription_id").references(() => subscriptions.id, { onDelete: "cascade" }),
  entitlementCode: text("entitlement_code").notNull(),
  status: text("status").notNull().default("en_attente_validation"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// 3. Éditorial (articles, catégories, paywall)
export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  label: text("label").notNull(),
  colorHex: text("color_hex"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const articles = pgTable("articles", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  chapo: text("chapo").notNull(),
  bodyHtml: text("body_html").notNull(),
  bodyPreviewLines: integer("body_preview_lines").notNull().default(12),
  authorId: uuid("author_id").references(() => profiles.id),
  status: text("status", { enum: articleStatusEnum }).notNull(),
  publishedAt: timestamp("published_at"),
  readTimeMinutes: integer("read_time_minutes"),
  audioUrl: text("audio_url"),
  isFree: boolean("is_free").notNull().default(false),
  viewsCount: integer("views_count").notNull().default(0),
  sharesCount: integer("shares_count").notNull().default(0),
  commentsCount: integer("comments_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const articleCategories = pgTable("article_categories", {
  articleId: uuid("article_id").references(() => articles.id, { onDelete: "cascade" }),
  categoryId: uuid("category_id").references(() => categories.id, { onDelete: "cascade" }),
  isPrimary: boolean("is_primary").notNull().default(false),
});

export const comments = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  articleId: uuid("article_id").references(() => articles.id, { onDelete: "cascade" }),
  profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  status: text("status", { enum: commentStatusEnum }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const likes = pgTable("likes", {
  articleId: uuid("article_id").references(() => articles.id, { onDelete: "cascade" }),
  profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "cascade" }),
});

export const articleRankingScores = pgTable("article_ranking_scores", {
  articleId: uuid("article_id").references(() => articles.id, { onDelete: "cascade" }).primaryKey(),
  score: numeric("score").notNull(),
  computedAt: timestamp("computed_at").notNull().defaultNow(),
});

// 4. Kiosque (magazines)
export const magazines = pgTable("magazines", {
  id: uuid("id").primaryKey().defaultRandom(),
  numero: text("numero").notNull().unique(),
  editionType: text("edition_type", { enum: editionTypeEnum }).notNull(),
  coverImageUrl: text("cover_image_url").notNull(),
  summary: text("summary").notNull(),
  publishedAt: timestamp("published_at").notNull(),
  year: integer("year"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const magazineVariants = pgTable("magazine_variants", {
  id: uuid("id").primaryKey().defaultRandom(),
  magazineId: uuid("magazine_id").references(() => magazines.id, { onDelete: "cascade" }),
  version: text("version", { enum: magazineVersionEnum }).notNull(),
  priceXof: numeric("price_xof").notNull(),
  availableLanguages: text("available_languages").array().notNull(),
  fileUrl: text("file_url"),
});

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "set null" }),
  status: text("status", { enum: orderStatusEnum }).notNull(),
  currency: text("currency").notNull(),
  totalAmount: numeric("total_amount").notNull(),
  affiliateLinkId: uuid("affiliate_link_id"),
  dhlShippingFee: numeric("dhl_shipping_fee"),
  monerooPaymentRef: text("moneroo_payment_ref"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").references(() => orders.id, { onDelete: "cascade" }),
  itemType: text("item_type", { enum: orderItemTypeEnum }).notNull(),
  magazineVariantId: uuid("magazine_variant_id").references(() => magazineVariants.id),
  language: text("language"),
  unitPrice: numeric("unit_price").notNull(),
});

export const downloads = pgTable("downloads", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "cascade" }),
  magazineVariantId: uuid("magazine_variant_id").references(() => magazineVariants.id),
  signedUrlIssuedAt: timestamp("signed_url_issued_at").notNull().defaultNow(),
  signedUrlExpiresAt: timestamp("signed_url_expires_at").notNull(),
  watermarkApplied: boolean("watermark_applied").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// 5. Paiement, dons, livraison
export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").references(() => orders.id),
  donationId: uuid("donation_id"),
  provider: text("provider").notNull().default("moneroo"),
  providerRef: text("provider_ref").notNull(),
  amount: numeric("amount").notNull(),
  currency: text("currency").notNull(),
  status: text("status", { enum: paymentStatusEnum }).notNull(),
  webhookSignatureVerified: boolean("webhook_signature_verified").notNull().default(false),
  rawWebhookPayload: jsonb("raw_webhook_payload"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const donations = pgTable("donations", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "set null" }),
  fullName: text("full_name").notNull(),
  amount: numeric("amount").notNull(),
  paymentMethod: text("payment_method", { enum: donationPaymentMethodEnum }).notNull(),
  phoneNumber: text("phone_number"),
  paymentReference: text("payment_reference"),
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const dhlShippingRates = pgTable("dhl_shipping_rates", {
  countryCode: text("country_code").primaryKey(),
  rate: numeric("rate").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const localShippingRates = pgTable("local_shipping_rates", {
  zone: text("zone").primaryKey(),
  rate: numeric("rate").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const exchangeRates = pgTable("exchange_rates", {
  currencyCode: text("currency_code").primaryKey(),
  rateToXof: numeric("rate_to_xof").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// 6. Paramétrage back-office
export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const footerLinks = pgTable("footer_links", {
  id: uuid("id").primaryKey().defaultRandom(),
  columnName: text("column_name").notNull(),
  label: text("label").notNull(),
  url: text("url").notNull(),
  order: integer("order").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const megaMenuItems = pgTable("mega_menu_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  columnName: text("column_name").notNull(),
  label: text("label").notNull(),
  url: text("url").notNull(),
  icon: text("icon"),
  order: integer("order").notNull(),
  featuredArticleId: uuid("featured_article_id").references(() => articles.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const landingBlocks = pgTable("landing_blocks", {
  id: uuid("id").primaryKey().defaultRandom(),
  blockKey: text("block_key").notNull().unique(),
  articleId: uuid("article_id").references(() => articles.id),
  magazineId: uuid("magazine_id").references(() => magazines.id),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const popupCampaigns = pgTable("popup_campaigns", {
  id: uuid("id").primaryKey().defaultRandom(),
  discountPercent: numeric("discount_percent").notNull().default("50"),
  countdownHours: integer("countdown_hours").notNull().default(48),
  reappearAfterDays: integer("reappear_after_days").notNull().default(30),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const userPopupDismissals = pgTable("user_popup_dismissals", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "cascade" }),
  sessionId: text("session_id"),
  campaignId: uuid("campaign_id").references(() => popupCampaigns.id),
  dismissedAt: timestamp("dismissed_at").notNull().defaultNow(),
});

// 7. Affiliation
export const affiliateLinks = pgTable("affiliate_links", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "cascade" }),
  targetType: text("target_type", { enum: affiliateTargetTypeEnum }).notNull(),
  magazineId: uuid("magazine_id").references(() => magazines.id),
  shortCode: text("short_code").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const affiliateClicks = pgTable("affiliate_clicks", {
  id: uuid("id").primaryKey().defaultRandom(),
  linkId: uuid("link_id").references(() => affiliateLinks.id, { onDelete: "cascade" }),
  clickedAt: timestamp("clicked_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  converted: boolean("converted").notNull().default(false),
});

export const affiliateConversions = pgTable("affiliate_conversions", {
  id: uuid("id").primaryKey().defaultRandom(),
  linkId: uuid("link_id").references(() => affiliateLinks.id, { onDelete: "cascade" }),
  orderId: uuid("order_id").references(() => orders.id),
  subscriptionId: uuid("subscription_id").references(() => subscriptions.id),
  commissionRate: numeric("commission_rate").notNull(),
  commissionRateReason: text("commission_rate_reason").notNull(),
  commissionAmount: numeric("commission_amount").notNull(),
  status: text("status", { enum: commissionStatusEnum }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const affiliatePayouts = pgTable("affiliate_payouts", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "cascade" }),
  amount: numeric("amount").notNull(),
  method: text("method", { enum: payoutMethodEnum }).notNull(),
  status: text("status", { enum: payoutStatusEnum }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// 8. Notifications & favoris
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  link: text("link"),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "cascade" }),
  endpoint: text("endpoint").notNull(),
  keys: jsonb("keys").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const favorites = pgTable("favorites", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "cascade" }),
  articleId: uuid("article_id").references(() => articles.id, { onDelete: "cascade" }),
  magazineId: uuid("magazine_id").references(() => magazines.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// 9. Autres services & audit
export const serviceRequests = pgTable("service_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  serviceType: text("service_type").notNull(),
  description: text("description").notNull(),
  budgetIndicative: text("budget_indicatif"),
  companyName: text("company_name"),
  contactName: text("contact_name").notNull(),
  contactPhone: text("contact_phone").notNull(),
  status: text("status").notNull().default("en_attente"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const auditLog = pgTable("audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorId: uuid("actor_id").references(() => profiles.id),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: uuid("entity_id"),
  previousValue: jsonb("previous_value"),
  newValue: jsonb("new_value"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
export const profilesRelations = relations(profiles, ({ many }) => ({
  userDevices: many(userDevices),
  subscriptions: many(subscriptions),
  articles: many(articles),
  comments: many(comments),
  likes: many(likes),
  orders: many(orders),
  downloads: many(downloads),
  donations: many(donations),
  affiliateLinks: many(affiliateLinks),
  affiliatePayouts: many(affiliatePayouts),
  notifications: many(notifications),
  pushSubscriptions: many(pushSubscriptions),
  favorites: many(favorites),
  serviceRequests: many(serviceRequests),
  auditLogs: many(auditLog),
}));

export const articlesRelations = relations(articles, ({ many, one }) => ({
  author: one(profiles, {
    fields: [articles.authorId],
    references: [profiles.id],
  }),
  categories: many(articleCategories),
  comments: many(comments),
  likes: many(likes),
  landingBlocks: many(landingBlocks),
  favorites: many(favorites),
}));

export const magazinesRelations = relations(magazines, ({ many }) => ({
  variants: many(magazineVariants),
  landingBlocks: many(landingBlocks),
  affiliateLinks: many(affiliateLinks),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [subscriptions.profileId],
    references: [profiles.id],
  }),
  plan: one(subscriptionPlans, {
    fields: [subscriptions.planId],
    references: [subscriptionPlans.id],
  }),
  soutienEntitlements: many(soutienPackEntitlements),
  affiliateConversions: many(affiliateConversions),
}));
