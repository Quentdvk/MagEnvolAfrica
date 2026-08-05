import type {
  ArticleDetail,
  ArticleSummary,
  MagazineSummary,
  MagazineVariant,
  SubscriptionPlan,
} from './types';

const NOW = '2026-01-15T09:00:00.000Z';

export const DEMO_ARTICLES: ArticleSummary[] = [
  {
    id: 'demo-article-1',
    slug: 'zone-de-libre-echange-continentale',
    title: 'La ZLECAf, moteur du commerce intra-africain',
    chapo:
      "La zone de libre-échange continentale africaine change la donne pour les PME exportatrices du continent.",
    category: 'Économie',
    categorySlug: 'economie',
    author: 'Rédaction Envol Africa',
    publishedAt: NOW,
    readTimeMinutes: 6,
    previewLines: 12,
    isFree: true,
  },
  {
    id: 'demo-article-2',
    slug: 'fintech-benin-mobile-money',
    title: 'Mobile money : le Bénin accélère sur les paiements numériques',
    chapo:
      "Les volumes de transactions mobile money progressent de 30 % par an, portés par les jeunes entrepreneurs.",
    category: 'Technologie',
    categorySlug: 'technologie',
    author: 'Rédaction Envol Africa',
    publishedAt: NOW,
    readTimeMinutes: 4,
    previewLines: 12,
    isFree: false,
  },
  {
    id: 'demo-article-3',
    slug: 'agro-industrie-opportunites',
    title: "Agro-industrie : les filières qui attirent les investisseurs",
    chapo: "Anacarde, soja, ananas : tour d'horizon des filières les plus dynamiques d'Afrique de l'Ouest.",
    category: 'Économie',
    categorySlug: 'economie',
    author: 'Rédaction Envol Africa',
    publishedAt: NOW,
    readTimeMinutes: 8,
    previewLines: 12,
    isFree: false,
  },
  {
    id: 'demo-article-4',
    slug: 'culture-entrepreneuriale',
    title: 'Ces dirigeantes qui réinventent le management africain',
    chapo: "Portraits de quatre dirigeantes qui bousculent les codes de la gouvernance d'entreprise.",
    category: 'Culture',
    categorySlug: 'culture',
    author: 'Rédaction Envol Africa',
    publishedAt: NOW,
    readTimeMinutes: 5,
    previewLines: 12,
    isFree: true,
  },
];

export const DEMO_ARTICLE_DETAIL: ArticleDetail = {
  ...DEMO_ARTICLES[0],
  bodyHtml:
    '<p>Contenu de démonstration affiché parce que Supabase n\'est pas configuré. Renseignez les variables NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY pour afficher les articles réels.</p>',
  audioUrl: null,
};

export const DEMO_MAGAZINES: MagazineSummary[] = [
  {
    id: 'demo-magazine-1',
    numero: '001',
    editionType: 'normale',
    coverImageUrl: null,
    summary: 'Le premier numéro du magazine économique panafricain.',
    publishedAt: NOW,
    year: 2026,
    priceFromXof: 5000,
  },
  {
    id: 'demo-magazine-2',
    numero: '002',
    editionType: 'speciale',
    coverImageUrl: null,
    summary: 'Spécial entrepreneuriat et innovation en Afrique.',
    publishedAt: NOW,
    year: 2026,
    priceFromXof: 5000,
  },
];

export const DEMO_MAGAZINE_VARIANTS: MagazineVariant[] = [
  {
    id: 'demo-variant-1',
    magazineId: 'demo-magazine-1',
    version: 'numerique',
    priceXof: 5000,
    availableLanguages: ['fr'],
    hasFile: true,
  },
  {
    id: 'demo-variant-2',
    magazineId: 'demo-magazine-1',
    version: 'papier',
    priceXof: 10000,
    availableLanguages: ['fr'],
    hasFile: false,
  },
];

export const DEMO_PLANS: SubscriptionPlan[] = [
  {
    id: 'demo-plan-mensuel',
    code: 'mensuel',
    label: 'Mensuel',
    priceFirstPeriodXof: 2500,
    priceRecurringXof: 5000,
    billingInterval: 'mensuel',
    features: ['Accès illimité aux articles', 'Newsletter quotidienne', 'Support email'],
  },
  {
    id: 'demo-plan-annuel',
    code: 'annuel',
    label: 'Annuel',
    priceFirstPeriodXof: 25000,
    priceRecurringXof: 50000,
    billingInterval: 'annuel',
    features: ['Tout du plan mensuel', '1 magazine gratuit par mois', 'Support prioritaire'],
  },
];
