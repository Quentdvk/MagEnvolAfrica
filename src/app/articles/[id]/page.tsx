import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getArticleById } from '@/lib/data/articles';
import { getActiveSubscriptionForCurrentUser } from '@/lib/data/subscriptions';
import { splitHtmlForPaywall } from '@/lib/content/paywall';

export const dynamic = 'force-dynamic';

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await getArticleById(id);

  if (!article) {
    notFound();
  }

  const { freeHtml, blurredHtml, hasLocked } = splitHtmlForPaywall(
    article.bodyHtml,
    article.previewLines
  );

  const subscription = article.isFree ? null : await getActiveSubscriptionForCurrentUser();
  const hasAccess = article.isFree || !!subscription;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <span className="bg-indigo-600 text-white text-sm font-medium px-3 py-1 rounded">
              {article.category}
            </span>
            {!article.isFree && (
              <span className="bg-yellow-500 text-white text-sm font-medium px-3 py-1 rounded">
                Premium
              </span>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {article.title}
          </h1>

          <div className="flex items-center space-x-4 text-gray-600">
            <span className="font-medium">{article.author}</span>
            <span>•</span>
            <span>{formatDate(article.publishedAt)}</span>
            {article.readTimeMinutes && (
              <>
                <span>•</span>
                <span>{article.readTimeMinutes} min de lecture</span>
              </>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div
            className="text-gray-800 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: hasAccess ? article.bodyHtml : freeHtml }}
          />

          {hasLocked && !hasAccess && (
            <>
              {/* Degraded Lines */}
              <div
                className="text-gray-400 leading-relaxed blur-sm select-none"
                dangerouslySetInnerHTML={{ __html: blurredHtml }}
              />

              {/* Paywall */}
              <div className="my-12 p-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border-2 border-indigo-200">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Continuez votre lecture
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Cet article est réservé aux abonnés. Abonnez-vous pour accéder à tout le contenu premium.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      href="/s-abonner"
                      className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      S&apos;abonner
                    </Link>
                    <Link
                      href="/login"
                      className="px-8 py-3 bg-white text-indigo-600 font-semibold rounded-lg border-2 border-indigo-600 hover:bg-indigo-50 transition-colors"
                    >
                      Se connecter
                    </Link>
                  </div>
                </div>
              </div>

              {/* Locked Content Preview */}
              <div className="bg-gray-100 p-6 rounded-lg">
                <div className="flex items-center space-x-2 mb-4">
                  <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-gray-500 font-medium">Contenu verrouillé</span>
                </div>
                <div className="h-32 bg-gray-200 rounded" aria-hidden="true" />
              </div>
            </>
          )}

        </div>

        {/* Article Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>J&apos;aime</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>Commenter</span>
              </button>
            </div>
            <button className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span>Partager</span>
            </button>
          </div>
        </footer>
      </article>
    </div>
  );
}
