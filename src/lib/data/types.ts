export interface ArticleSummary {
  id: string;
  slug: string;
  title: string;
  chapo: string;
  category: string;
  categorySlug: string | null;
  author: string;
  publishedAt: string;
  readTimeMinutes: number | null;
  previewLines: number;
  isFree: boolean;
}

export interface ArticleDetail extends ArticleSummary {
  bodyHtml: string;
  audioUrl: string | null;
}

export interface Category {
  id: string;
  slug: string;
  label: string;
  colorHex: string | null;
}

export interface MagazineSummary {
  id: string;
  numero: string;
  editionType: 'normale' | 'speciale' | 'hors_serie';
  coverImageUrl: string | null;
  summary: string;
  publishedAt: string;
  year: number | null;
  priceFromXof: number | null;
}

export interface MagazineVariant {
  id: string;
  magazineId: string;
  version: 'cd_audio' | 'numerique' | 'papier' | 'audio_pdf' | 'audio_papier';
  priceXof: number;
  availableLanguages: string[];
  hasFile: boolean;
}

export interface SubscriptionPlan {
  id: string;
  code: 'mensuel' | 'annuel' | 'chef_entreprise' | 'soutien';
  label: string;
  priceFirstPeriodXof: number;
  priceRecurringXof: number;
  billingInterval: 'mensuel' | 'annuel';
  features: string[];
}

export const PLAN_LABELS: Record<SubscriptionPlan['code'], string> = {
  mensuel: 'Mensuel',
  annuel: 'Annuel',
  chef_entreprise: "Chef d'entreprise",
  soutien: 'Soutien',
};

export const MAGAZINE_VERSION_LABELS: Record<MagazineVariant['version'], string> = {
  cd_audio: 'CD audio',
  numerique: 'Numérique (PDF)',
  papier: 'Papier',
  audio_pdf: 'Audio + PDF',
  audio_papier: 'Audio + papier',
};
