import { createClient, createServiceRoleClient } from '@/lib/supabase/server';

export const BACK_OFFICE_ROLES = ['administrateur', 'gerant'] as const;

export type BackOfficeRole = (typeof BACK_OFFICE_ROLES)[number];

export interface AdminKpis {
  totalUsers: number;
  totalSubscribers: number;
  totalArticles: number;
  totalMagazines: number;
  totalRevenueXof: number;
}

export interface AdminArticleRow {
  id: string;
  title: string;
  chapo: string;
  status: 'brouillon' | 'en_validation' | 'publie' | 'depublie';
  publishedAt: string | null;
  createdAt: string;
  category: string;
}

export interface AdminMagazineRow {
  id: string;
  numero: string;
  editionType: string;
  year: number | null;
  publishedAt: string;
  variantsCount: number;
}

export interface AdminUserRow {
  id: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  createdAt: string;
}

export async function hasBackOfficeAccess(): Promise<boolean> {
  const supabase = await createClient();

  if (!supabase) {
    return false;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  const role = (profile as { role?: string } | null)?.role;

  return BACK_OFFICE_ROLES.includes(role as BackOfficeRole);
}

export async function getAdminKpis(): Promise<AdminKpis> {
  const supabase = await createClient();

  if (!supabase) {
    return {
      totalUsers: 0,
      totalSubscribers: 0,
      totalArticles: 0,
      totalMagazines: 0,
      totalRevenueXof: 0,
    };
  }

  const [users, subscribers, articles, magazines, payments] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase
      .from('subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active'),
    supabase.from('articles').select('id', { count: 'exact', head: true }),
    supabase.from('magazines').select('id', { count: 'exact', head: true }),
    supabase.from('payments').select('amount').eq('status', 'confirme'),
  ]);

  const paymentRows = (payments.data ?? []) as { amount: string | number }[];
  const totalRevenueXof = paymentRows.reduce((sum, payment) => sum + Number(payment.amount), 0);

  return {
    totalUsers: users.count ?? 0,
    totalSubscribers: subscribers.count ?? 0,
    totalArticles: articles.count ?? 0,
    totalMagazines: magazines.count ?? 0,
    totalRevenueXof,
  };
}

export async function getAdminArticles(): Promise<AdminArticleRow[]> {
  const supabase = await createClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('articles')
    .select(
      'id, title, chapo, status, published_at, created_at, article_categories(is_primary, categories(label))'
    )
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  interface Row {
    id: string;
    title: string;
    chapo: string;
    status: AdminArticleRow['status'];
    published_at: string | null;
    created_at: string;
    article_categories: { is_primary: boolean; categories: { label: string } | null }[] | null;
  }

  return (data as unknown as Row[]).map((row) => {
    const links = row.article_categories ?? [];
    const primary = links.find((link) => link.is_primary) ?? links[0];

    return {
      id: row.id,
      title: row.title,
      chapo: row.chapo,
      status: row.status,
      publishedAt: row.published_at,
      createdAt: row.created_at,
      category: primary?.categories?.label ?? 'Non catégorisé',
    };
  });
}

export async function getAdminMagazines(): Promise<AdminMagazineRow[]> {
  const supabase = await createClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('magazines')
    .select('id, numero, edition_type, year, published_at, magazine_variants(id)')
    .order('published_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  interface Row {
    id: string;
    numero: string;
    edition_type: string;
    year: number | null;
    published_at: string;
    magazine_variants: { id: string }[] | null;
  }

  return (data as unknown as Row[]).map((row) => ({
    id: row.id,
    numero: row.numero,
    editionType: row.edition_type,
    year: row.year,
    publishedAt: row.published_at,
    variantsCount: (row.magazine_variants ?? []).length,
  }));
}

export async function getAdminUsers(): Promise<AdminUserRow[]> {
  const supabase = await createClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, phone, role, created_at')
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  interface Row {
    id: string;
    full_name: string | null;
    phone: string | null;
    role: string;
    created_at: string;
  }

  const emailsById = await getAuthEmails();

  return (data as unknown as Row[]).map((row) => ({
    id: row.id,
    fullName: row.full_name,
    email: emailsById.get(row.id) ?? null,
    phone: row.phone,
    role: row.role,
    createdAt: row.created_at,
  }));
}

// Emails live in auth.users, which is only readable with the service role key.
async function getAuthEmails(): Promise<Map<string, string>> {
  const serviceClient = createServiceRoleClient();

  if (!serviceClient) {
    return new Map();
  }

  const { data, error } = await serviceClient.auth.admin.listUsers({ page: 1, perPage: 1000 });

  if (error || !data) {
    return new Map();
  }

  return new Map(
    data.users
      .filter((user): user is typeof user & { email: string } => !!user.email)
      .map((user) => [user.id, user.email])
  );
}
