import { createClient } from '@/lib/supabase/server';
import { DEMO_MAGAZINES, DEMO_MAGAZINE_VARIANTS } from './demo';
import type { MagazineSummary, MagazineVariant } from './types';

interface MagazineRow {
  id: string;
  numero: string;
  edition_type: MagazineSummary['editionType'];
  cover_image_url: string | null;
  summary: string;
  published_at: string;
  year: number | null;
  magazine_variants: { price_xof: string | number }[] | null;
}

interface MagazineVariantRow {
  id: string;
  magazine_id: string;
  version: MagazineVariant['version'];
  price_xof: string | number;
  available_languages: string[] | null;
  file_url: string | null;
}

const MAGAZINE_SELECT = `
  id,
  numero,
  edition_type,
  cover_image_url,
  summary,
  published_at,
  year,
  magazine_variants(price_xof)
`;

export function mapMagazine(row: MagazineRow): MagazineSummary {
  const prices = (row.magazine_variants ?? []).map((variant) => Number(variant.price_xof));

  return {
    id: row.id,
    numero: row.numero,
    editionType: row.edition_type,
    coverImageUrl: row.cover_image_url,
    summary: row.summary,
    publishedAt: row.published_at,
    year: row.year,
    priceFromXof: prices.length > 0 ? Math.min(...prices) : null,
  };
}

export function mapMagazineVariant(row: MagazineVariantRow): MagazineVariant {
  return {
    id: row.id,
    magazineId: row.magazine_id,
    version: row.version,
    priceXof: Number(row.price_xof),
    availableLanguages: row.available_languages ?? [],
    hasFile: !!row.file_url,
  };
}

export async function getMagazines(): Promise<MagazineSummary[]> {
  const supabase = await createClient();

  if (!supabase) {
    return DEMO_MAGAZINES;
  }

  const { data, error } = await supabase
    .from('magazines')
    .select(MAGAZINE_SELECT)
    .order('published_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as unknown as MagazineRow[]).map(mapMagazine);
}

export async function getMagazineById(id: string): Promise<MagazineSummary | null> {
  const supabase = await createClient();

  if (!supabase) {
    return DEMO_MAGAZINES.find((magazine) => magazine.id === id) ?? DEMO_MAGAZINES[0];
  }

  const { data, error } = await supabase
    .from('magazines')
    .select(MAGAZINE_SELECT)
    .eq('id', id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapMagazine(data as unknown as MagazineRow);
}

export async function getMagazineVariants(magazineId: string): Promise<MagazineVariant[]> {
  const supabase = await createClient();

  if (!supabase) {
    return DEMO_MAGAZINE_VARIANTS.map((variant) => ({ ...variant, magazineId }));
  }

  const { data, error } = await supabase
    .from('magazine_variants')
    .select('id, magazine_id, version, price_xof, available_languages, file_url')
    .eq('magazine_id', magazineId)
    .order('price_xof', { ascending: true });

  if (error || !data) {
    return [];
  }

  return (data as unknown as MagazineVariantRow[]).map(mapMagazineVariant);
}
