import { createClient } from '@/lib/supabase/server';
import type { Category } from './types';

interface CategoryRow {
  id: string;
  slug: string;
  label: string;
  color_hex: string | null;
}

function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    slug: row.slug,
    label: row.label,
    colorHex: row.color_hex,
  };
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient();

  if (!supabase) {
    return { id: `demo-${slug}`, slug, label: slug, colorHex: null };
  }

  const { data, error } = await supabase
    .from('categories')
    .select('id, slug, label, color_hex')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapCategory(data as unknown as CategoryRow);
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('categories')
    .select('id, slug, label, color_hex')
    .eq('is_active', true)
    .order('label', { ascending: true });

  if (error || !data) {
    return [];
  }

  return (data as unknown as CategoryRow[]).map(mapCategory);
}
