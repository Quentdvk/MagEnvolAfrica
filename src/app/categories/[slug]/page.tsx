import { notFound } from 'next/navigation';
import ArticleCard from '@/components/editorial/ArticleCard';
import { getArticlesByCategorySlug } from '@/lib/data/articles';
import { getCategoryBySlug } from '@/lib/data/categories';

export const dynamic = 'force-dynamic';

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const articles = await getArticlesByCategorySlug(slug);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Header */}
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{category.label}</h1>
        </header>

        {/* Articles Grid */}
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                id={article.id}
                title={article.title}
                excerpt={article.chapo}
                category={article.category}
                author={article.author}
                publishedAt={article.publishedAt}
                readTime={article.readTimeMinutes ?? undefined}
                freeLines={article.previewLines}
                isPremium={!article.isFree}
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
