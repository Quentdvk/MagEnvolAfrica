import { redirect } from 'next/navigation';
import { getAdminArticles, hasBackOfficeAccess } from '@/lib/data/admin';
import { getCategories } from '@/lib/data/categories';

export const dynamic = 'force-dynamic';

const STATUS_LABELS: Record<string, string> = {
  brouillon: 'Brouillon',
  en_validation: 'En validation',
  publie: 'Publié',
  depublie: 'Dépublié',
};

export default async function AdminArticles() {
  if (!(await hasBackOfficeAccess())) {
    redirect('/login');
  }

  const [articles, categories] = await Promise.all([getAdminArticles(), getCategories()]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gérer les Articles</h1>
            <p className="text-gray-600 mt-2">Créer, modifier et supprimer des articles</p>
          </div>
          <a
            href="/admin/articles/new"
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
          >
            Nouvel Article
          </a>
        </div>

        {/* Articles List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Titre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {articles.length > 0 ? (
                articles.map((article) => (
                  <tr key={article.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{article.title}</div>
                      <div className="text-sm text-gray-500">{article.chapo.substring(0, 50)}...</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {article.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        article.status === 'publie'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {STATUS_LABELS[article.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(article.publishedAt ?? article.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a
                        href={`/admin/articles/${article.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Modifier
                      </a>
                      <button className="text-red-600 hover:text-red-900">
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Aucun article pour le moment
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Categories Quick View */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Catégories disponibles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div key={category.id} className="bg-white rounded-lg shadow p-4">
                <h3 className="font-semibold text-gray-900">{category.label}</h3>
                <p className="text-sm text-gray-600">/{category.slug}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
