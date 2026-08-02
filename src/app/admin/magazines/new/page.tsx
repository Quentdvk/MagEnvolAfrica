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

async function createMagazine(formData: FormData) {
  'use server';
  
  const supabase = await createClient();
  
  if (!supabase) {
    return { error: 'Configuration Supabase manquante' };
  }

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: 'Non authentifié' };
  }

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const issueNumber = parseInt(formData.get('issueNumber') as string);
  const year = parseInt(formData.get('year') as string);
  const isAvailable = formData.get('isAvailable') === 'true';

  const { data, error } = await supabase
    .from('magazines')
    .insert({
      title,
      description,
      issueNumber,
      year,
      isAvailable,
      publishedAt: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Create variants (PDF, ePub, Paper)
  const variants = [
    { format: 'pdf', price: 5000, currency: 'XOF', isAvailable: true },
    { format: 'epub', price: 5000, currency: 'XOF', isAvailable: true },
    { format: 'paper', price: 10000, currency: 'XOF', isAvailable: true, stock: 50 },
  ];

  for (const variant of variants) {
    await supabase.from('magazine_variants').insert({
      magazineId: data.id,
      ...variant,
    });
  }

  return { success: true, magazineId: data.id };
}

export default async function NewMagazine() {
  const isAdmin = await checkAdminRole();

  if (!isAdmin) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <a href="/admin/magazines" className="text-indigo-600 hover:text-indigo-700 mb-4 inline-block">
            ← Retour aux magazines
          </a>
          <h1 className="text-3xl font-bold text-gray-900">Créer un nouveau magazine</h1>
        </div>

        <form action={createMagazine} className="bg-white rounded-lg shadow p-6 space-y-6">
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
              placeholder="Titre du magazine"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Description du magazine"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="issueNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Numéro *
              </label>
              <input
                type="number"
                id="issueNumber"
                name="issueNumber"
                required
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="1"
              />
            </div>

            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                Année *
              </label>
              <input
                type="number"
                id="year"
                name="year"
                required
                min="2024"
                max="2030"
                defaultValue={new Date().getFullYear()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isAvailable"
                value="true"
                defaultChecked
                className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Disponible à la vente</span>
            </label>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Variantes automatiques</h3>
            <p className="text-sm text-gray-600">
              Les variantes suivantes seront créées automatiquement :
            </p>
            <ul className="text-sm text-gray-600 mt-2 space-y-1">
              <li>• PDF : 5 000 XOF</li>
              <li>• ePub : 5 000 XOF</li>
              <li>• Papier : 10 000 XOF (stock: 50)</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-4">
            <a
              href="/admin/magazines"
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
            >
              Annuler
            </a>
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
            >
              Créer le magazine
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
