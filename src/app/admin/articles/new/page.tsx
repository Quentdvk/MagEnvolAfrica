import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

async function checkAdminRole() {
  const supabase = await createClient();
  
  if (!supabase) {
    return false;
  }

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return false;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return profile?.role === 'administrator';
}

async function getCategories() {
  const supabase = await createClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) {
    return [];
  }

  return data;
}

async function createArticle(formData: FormData) {
  'use server';
  
  const supabase = await createClient();
  
  if (!supabase) {
    throw new Error('Configuration Supabase manquante');
  }

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Non authentifié');
  }

  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const excerpt = formData.get('excerpt') as string;
  const categoryId = formData.get('categoryId') as string;
  const isPublished = formData.get('isPublished') === 'true';
  const isPremium = formData.get('isPremium') === 'true';

  const { error } = await supabase
    .from('articles')
    .insert({
      title,
      content,
      excerpt,
      categoryId,
      authorId: user.id,
      isPublished,
      isPremium,
      publishedAt: isPublished ? new Date().toISOString() : null,
    });

  if (error) {
    throw new Error(error.message);
  }

  redirect('/admin/articles');
}

export default async function NewArticle() {
  const isAdmin = await checkAdminRole();

  if (!isAdmin) {
    redirect('/login');
  }

  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <a href="/admin/articles" className="text-indigo-600 hover:text-indigo-700 mb-4 inline-block">
            ← Retour aux articles
          </a>
          <h1 className="text-3xl font-bold text-gray-900">Créer un nouvel article</h1>
        </div>

        <form action={createArticle} className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Titre *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Titre de l'article"
            />
          </div>

          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
              Extrait *
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Courte description de l'article"
            />
          </div>

          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie *
            </label>
            <select
              id="categoryId"
              name="categoryId"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map((category: any) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Contenu *
            </label>
            <textarea
              id="content"
              name="content"
              required
              rows={20}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
              placeholder="Contenu de l'article en Markdown"
            />
          </div>

          <div className="flex items-center space-x-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isPublished"
                value="true"
                className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Publier immédiatement</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="isPremium"
                value="true"
                className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Article premium (paywall)</span>
            </label>
          </div>

          <div className="flex justify-end space-x-4">
            <a
              href="/admin/articles"
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
            >
              Annuler
            </a>
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
            >
              Créer l'article
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
