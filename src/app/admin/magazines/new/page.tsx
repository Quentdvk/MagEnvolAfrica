import { redirect } from 'next/navigation';
import { hasBackOfficeAccess } from '@/lib/data/admin';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

async function createMagazine(formData: FormData) {
  'use server';

  const supabase = await createClient();

  if (!supabase) {
    throw new Error('Configuration Supabase manquante');
  }

  if (!(await hasBackOfficeAccess())) {
    redirect('/login');
  }

  const numero = formData.get('numero') as string;
  const summary = formData.get('summary') as string;
  const editionType = (formData.get('editionType') as string) || 'normale';
  const coverImageUrl = (formData.get('coverImageUrl') as string) ?? '';
  const year = Number.parseInt(formData.get('year') as string, 10);

  const { data, error } = await supabase
    .from('magazines')
    .insert({
      numero,
      summary,
      cover_image_url: coverImageUrl,
      edition_type: editionType,
      year: Number.isNaN(year) ? null : year,
      published_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const magazineId = (data as { id: string }).id;
  const variants = [
    { version: 'numerique', price_xof: 5000 },
    { version: 'cd_audio', price_xof: 5000 },
    { version: 'papier', price_xof: 10000 },
  ];

  const { error: variantsError } = await supabase.from('magazine_variants').insert(
    variants.map((variant) => ({
      magazine_id: magazineId,
      available_languages: ['fr'],
      ...variant,
    }))
  );

  if (variantsError) {
    throw new Error(variantsError.message);
  }

  redirect('/admin/magazines');
}

export default async function NewMagazine() {
  if (!(await hasBackOfficeAccess())) {
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
            <label htmlFor="numero" className="block text-sm font-medium text-gray-700 mb-2">
              Numéro *
            </label>
            <input
              type="text"
              id="numero"
              name="numero"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="001"
            />
          </div>

          <div>
            <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">
              Sommaire *
            </label>
            <textarea
              id="summary"
              name="summary"
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Sommaire du magazine"
            />
          </div>

          <div>
            <label htmlFor="coverImageUrl" className="block text-sm font-medium text-gray-700 mb-2">
              URL de la couverture
            </label>
            <input
              type="url"
              id="coverImageUrl"
              name="coverImageUrl"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="editionType" className="block text-sm font-medium text-gray-700 mb-2">
                Type d&apos;édition *
              </label>
              <select
                id="editionType"
                name="editionType"
                required
                defaultValue="normale"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="normale">Édition normale</option>
                <option value="speciale">Édition spéciale</option>
                <option value="hors_serie">Hors-série</option>
              </select>
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

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Variantes automatiques</h3>
            <p className="text-sm text-gray-600">
              Les variantes suivantes seront créées automatiquement :
            </p>
            <ul className="text-sm text-gray-600 mt-2 space-y-1">
              <li>• Numérique (PDF) : 5 000 XOF</li>
              <li>• CD audio : 5 000 XOF</li>
              <li>• Papier : 10 000 XOF</li>
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
