import { createClient } from '@/lib/supabase/server';
import { DEMO_ARTICLES, DEMO_ARTICLE_DETAIL } from './demo';
import type { ArticleDetail, ArticleSummary } from './types';

interface ArticleCategoryRow {
  is_primary: boolean;
  categories: { label: string; slug: string } | null;
}

interface ArticleRow {
  id: string;
  slug: string;
  title: string;
  chapo: string;
  body_preview_lines: number;
  published_at: string | null;
  created_at: string;
  read_time_minutes: number | null;
  is_free: boolean;
  author: { full_name: string | null } | null;
  article_categories: ArticleCategoryRow[] | null;
}

interface ArticleDetailRow extends ArticleRow {
  body_html: string;
  audio_url: string | null;
}

const ARTICLE_SUMMARY_SELECT = `
  id,
  slug,
  title,
  chapo,
  body_preview_lines,
  published_at,
  created_at,
  read_time_minutes,
  is_free,
  author:profiles(full_name),
  article_categories(is_primary, categories(label, slug))
`;

const ARTICLE_DETAIL_SELECT = `${ARTICLE_SUMMARY_SELECT}, body_html, audio_url`;

// `!inner` is required so the category slug can be used as a filter on the join.
const ARTICLE_BY_CATEGORY_SELECT = `
  id,
  slug,
  title,
  chapo,
  body_preview_lines,
  published_at,
  created_at,
  read_time_minutes,
  is_free,
  author:profiles(full_name),
  article_categories!inner(is_primary, categories!inner(label, slug))
`;

function primaryCategory(row: ArticleRow): ArticleCategoryRow['categories'] {
  const links = row.article_categories ?? [];
  const primary = links.find((link) => link.is_primary) ?? links[0];
  return primary?.categories ?? null;
}

export function mapArticleSummary(row: ArticleRow): ArticleSummary {
  const category = primaryCategory(row);

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    chapo: row.chapo,
    category: category?.label ?? 'Non catégorisé',
    categorySlug: category?.slug ?? null,
    author: row.author?.full_name ?? 'Rédaction Envol Africa',
    publishedAt: row.published_at ?? row.created_at,
    readTimeMinutes: row.read_time_minutes,
    previewLines: row.body_preview_lines,
    isFree: row.is_free,
  };
}

export function mapArticleDetail(row: ArticleDetailRow): ArticleDetail {
  return {
    ...mapArticleSummary(row),
    bodyHtml: row.body_html,
    audioUrl: row.audio_url,
  };
}

export async function getPublishedArticles(limit = 8): Promise<ArticleSummary[]> {
  const supabase = await createClient();

  if (!supabase) {
    return DEMO_ARTICLES.slice(0, limit);
  }

  const { data, error } = await supabase
    .from('articles')
    .select(ARTICLE_SUMMARY_SELECT)
    .eq('status', 'publie')
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return (data as unknown as ArticleRow[]).map(mapArticleSummary);
}

export async function getArticlesByCategorySlug(slug: string): Promise<ArticleSummary[]> {
  const supabase = await createClient();

  if (!supabase) {
    return DEMO_ARTICLES.filter((article) => article.categorySlug === slug);
  }

  const { data, error } = await supabase
    .from('articles')
    .select(ARTICLE_BY_CATEGORY_SELECT)
    .eq('status', 'publie')
    .eq('article_categories.categories.slug', slug)
    .order('published_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as unknown as ArticleRow[]).map(mapArticleSummary);
}

export async function getArticleById(id: string): Promise<ArticleDetail | null> {
  const supabase = await createClient();

  if (!supabase) {
    return { ...DEMO_ARTICLE_DETAIL, id };
  }

  const { data, error } = await supabase
    .from('articles')
    .select(ARTICLE_DETAIL_SELECT)
    .eq('id', id)
    .eq('status', 'publie')
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapArticleDetail(data as unknown as ArticleDetailRow);
}
