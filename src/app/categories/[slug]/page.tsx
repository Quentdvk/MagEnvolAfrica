import { notFound } from 'next/navigation';
import ArticleCard from '@/components/editorial/ArticleCard';
import { createClient } from '@/lib/supabase/server';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  imageUrl?: string;
  category: string;
  author: string;
  publishedAt: string;
  readTime?: number;
  freeLines?: number;
  isPremium: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export const dynamic = 'force-dynamic';

async function getCategory(slug: string): Promise<Category | null> {
  const supabase = await createClient();

  if (!supabase) {
    // Return mock data for development without Supabase
    return {
      id: '1',
      name: 'Économie',
      slug,
      description: 'Actualités économiques et financières',
    };
  }

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Category;
}

async function getArticlesByCategory(categoryId: string): Promise<Article[]> {
  const supabase = await createClient();

  if (!supabase) {
    // Return mock data for development without Supabase
    return [
      {
        id: '1',
        title: 'Article Économie 1',
        excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        category: 'Économie',
        author: 'Jean Dupont',
        publishedAt: new Date().toISOString(),
        readTime: 5,
        freeLines: 12,
        isPremium: true,
      },
      {
        id: '2',
        title: 'Article Économie 2',
        excerpt: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        category: 'Économie',
        author: 'Marie Curie',
        publishedAt: new Date().toISOString(),
        readTime: 8,
        freeLines: 12,
        isPremium: false,
      },
    ];
  }

  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('categoryId', categoryId)
    .eq('status', 'published')
    .order('publishedAt', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as Article[];
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await getCategory(params.slug);

  if (!category) {
    notFound();
  }

  const articles = await getArticlesByCategory(category.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Header */}
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-xl text-gray-600">{category.description}</p>
          )}
        </header>

        {/* Articles Grid */}
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                id={article.id}
                title={article.title}
                excerpt={article.excerpt}
                imageUrl={article.imageUrl}
                category={article.category}
                author={article.author}
                publishedAt={article.publishedAt}
                readTime={article.readTime}
                freeLines={article.freeLines}
                isPremium={article.isPremium}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              Aucun article disponible dans cette catégorie pour le moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
