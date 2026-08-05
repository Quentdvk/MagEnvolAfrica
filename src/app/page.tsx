import Link from 'next/link';
import ArticleCard from '@/components/editorial/ArticleCard';
import MagazineCard from '@/components/kiosk/MagazineCard';
import { getPublishedArticles } from '@/lib/data/articles';
import { getMagazines } from '@/lib/data/magazines';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [articles, magazines] = await Promise.all([getPublishedArticles(4), getMagazines()]);
  const latestMagazines = magazines.slice(0, 4);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Envol Africa Magazine
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Site de presse panafricain premium, kiosque digital et plateforme d&apos;abonnement
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/s-abonner" className="px-8 py-4 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
                S&apos;abonner
              </Link>
              <Link href="/kiosque" className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-indigo-600 transition-colors">
                Visiter le Kiosque
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section Image Catégorie A - Placeholder */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">À la Une</h2>
          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <p className="text-gray-600">Aucun article publié pour le moment.</p>
          )}
        </div>
      </section>

      {/* Section Carrousel Magazines - Placeholder */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Derniers Numéros</h2>
          {latestMagazines.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {latestMagazines.map((magazine) => (
                <MagazineCard key={magazine.id} magazine={magazine} />
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Aucun numéro disponible pour le moment.</p>
          )}
        </div>
      </section>

      {/* Section Formations - Placeholder */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Formations Certifiées</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-md">
                <div className="bg-gray-200 h-40 rounded-lg mb-4"></div>
                <h3 className="text-lg font-semibold mb-2">Formation {i}</h3>
                <p className="text-gray-600">Description de la formation...</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Osez la réussite !</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers d&apos;entrepreneurs africains qui s&apos;informent et se forment avec Envol Africa Magazine
          </p>
          <Link href="/s-abonner" className="inline-block px-8 py-4 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
            S&apos;abonner maintenant
          </Link>
        </div>
      </section>
    </div>
  );
}
