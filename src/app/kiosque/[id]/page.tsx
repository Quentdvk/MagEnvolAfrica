import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

interface Magazine {
  id: string;
  title: string;
  issueNumber: number;
  year: number;
  coverImageUrl?: string;
  description?: string;
  isAvailable: boolean;
}

interface MagazineVariant {
  id: string;
  magazineId: string;
  format: 'pdf' | 'epub' | 'paper';
  price: number;
  currency: string;
  isAvailable: boolean;
  downloadUrl?: string;
  stock?: number;
}

export const dynamic = 'force-dynamic';

async function getMagazine(id: string): Promise<Magazine | null> {
  const supabase = await createClient();

  if (!supabase) {
    // Return mock data for development without Supabase
    return {
      id,
      title: 'Envol Africa Magazine - Janvier 2026',
      issueNumber: 1,
      year: 2026,
      coverImageUrl: undefined,
      description: 'Le premier numéro de notre magazine économique panafricain. Découvrez les tendances économiques, les opportunités d\'investissement et les success stories africaines.',
      isAvailable: true,
    };
  }

  const { data, error } = await supabase
    .from('magazines')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Magazine;
}

async function getMagazineVariants(magazineId: string): Promise<MagazineVariant[]> {
  const supabase = await createClient();

  if (!supabase) {
    // Return mock data for development without Supabase
    return [
      {
        id: '1',
        magazineId,
        format: 'pdf',
        price: 5000,
        currency: 'XOF',
        isAvailable: true,
      },
      {
        id: '2',
        magazineId,
        format: 'epub',
        price: 5000,
        currency: 'XOF',
        isAvailable: true,
      },
      {
        id: '3',
        magazineId,
        format: 'paper',
        price: 10000,
        currency: 'XOF',
        isAvailable: true,
        stock: 50,
      },
    ];
  }

  const { data, error } = await supabase
    .from('magazine_variants')
    .select('*')
    .eq('magazineId', magazineId);

  if (error || !data) {
    return [];
  }

  return data as MagazineVariant[];
}

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
  }).format(price);
}

function getFormatLabel(format: string) {
  switch (format) {
    case 'pdf':
      return 'PDF (Numérique)';
    case 'epub':
      return 'ePub (Numérique)';
    case 'paper':
      return 'Papier (Physique)';
    default:
      return format;
  }
}

function getFormatIcon(format: string) {
  switch (format) {
    case 'pdf':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    case 'epub':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      );
    case 'paper':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      );
    default:
      return null;
  }
}

export default async function MagazineDetailPage({ params }: { params: { id: string } }) {
  const magazine = await getMagazine(params.id);

  if (!magazine) {
    notFound();
  }

  const variants = await getMagazineVariants(params.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link
          href="/kiosque"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-8"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour au kiosque
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Cover Image */}
          <div>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {magazine.coverImageUrl ? (
                <img
                  src={magazine.coverImageUrl}
                  alt={magazine.title}
                  className="w-full h-auto"
                />
              ) : (
                <div className="aspect-[3/4] bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">Couverture non disponible</span>
                </div>
              )}
            </div>

            {!magazine.isAvailable && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-medium">
                  Ce numéro n'est plus disponible
                </p>
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <header className="mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <span className="bg-indigo-600 text-white text-sm font-bold px-3 py-1 rounded">
                  N°{magazine.issueNumber}
                </span>
                <span className="bg-gray-200 text-gray-700 text-sm font-medium px-3 py-1 rounded">
                  {magazine.year}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {magazine.title}
              </h1>

              {magazine.description && (
                <p className="text-lg text-gray-600">{magazine.description}</p>
              )}
            </header>

            {/* Variants */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Choisissez votre format
              </h2>

              {variants.length > 0 ? (
                <div className="space-y-4">
                  {variants.map((variant) => (
                    <div
                      key={variant.id}
                      className={`bg-white border-2 rounded-lg p-6 ${
                        !variant.isAvailable
                          ? 'border-gray-200 opacity-50'
                          : 'border-gray-200 hover:border-indigo-500 cursor-pointer transition-colors'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-indigo-600">
                            {getFormatIcon(variant.format)}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {getFormatLabel(variant.format)}
                            </h3>
                            {variant.format === 'paper' && variant.stock !== undefined && (
                              <p className="text-sm text-gray-600">
                                Stock: {variant.stock} exemplaires
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-2xl font-bold text-indigo-600">
                            {formatPrice(variant.price, variant.currency)}
                          </p>
                          {!variant.isAvailable && (
                            <p className="text-sm text-red-600">Indisponible</p>
                          )}
                        </div>
                      </div>

                      {variant.isAvailable && (
                        <button className="mt-4 w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition-colors">
                          Ajouter au panier
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">
                  Aucun format disponible pour ce magazine.
                </p>
              )}
            </section>

            {/* Info Section */}
            <section className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Information sur l'achat
              </h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Téléchargement immédiat pour les formats numériques</li>
                <li>• Livraison sous 7 jours pour le format papier</li>
                <li>• Paiement sécurisé via Moneroo</li>
                <li>• Support client disponible 7j/7</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
