import { notFound } from 'next/navigation';
import Link from 'next/link';
import PayButton from '@/components/payment/PayButton';
import { getMagazineById, getMagazineVariants } from '@/lib/data/magazines';
import { MAGAZINE_VERSION_LABELS, type MagazineSummary } from '@/lib/data/types';

export const dynamic = 'force-dynamic';

const EDITION_LABELS: Record<MagazineSummary['editionType'], string> = {
  normale: 'Édition normale',
  speciale: 'Édition spéciale',
  hors_serie: 'Hors-série',
};

function formatPrice(price: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(price);
}

export default async function MagazineDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const magazine = await getMagazineById(id);

  if (!magazine) {
    notFound();
  }

  const variants = await getMagazineVariants(magazine.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link
          href="/kiosque"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-8"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Retour au kiosque
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Cover Image */}
          <div>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {magazine.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={magazine.coverImageUrl}
                  alt={`Envol Africa Magazine N°${magazine.numero}`}
                  className="w-full h-auto"
                />
              ) : (
                <div className="aspect-[3/4] bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">Couverture non disponible</span>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div>
            <header className="mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <span className="bg-indigo-600 text-white text-sm font-bold px-3 py-1 rounded">
                  N°{magazine.numero}
                </span>
                <span className="bg-gray-200 text-gray-700 text-sm font-medium px-3 py-1 rounded">
                  {magazine.year ?? new Date(magazine.publishedAt).getFullYear()}
                </span>
                <span className="bg-gray-200 text-gray-700 text-sm font-medium px-3 py-1 rounded">
                  {EDITION_LABELS[magazine.editionType]}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Envol Africa Magazine N°{magazine.numero}
              </h1>

              <p className="text-lg text-gray-600">{magazine.summary}</p>
            </header>

            {/* Variants */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Choisissez votre format</h2>

              {variants.length > 0 ? (
                <div className="space-y-4">
                  {variants.map((variant) => (
                    <div
                      key={variant.id}
                      className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-indigo-500 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {MAGAZINE_VERSION_LABELS[variant.version]}
                          </h3>
                          {variant.availableLanguages.length > 0 && (
                            <p className="text-sm text-gray-600">
                              Langues : {variant.availableLanguages.join(', ').toUpperCase()}
                            </p>
                          )}
                        </div>

                        <p className="text-2xl font-bold text-indigo-600">
                          {formatPrice(variant.priceXof)}
                        </p>
                      </div>

                      <div className="mt-4">
                        <PayButton
                          itemType="magazine"
                          magazineVariantId={variant.id}
                          language={variant.availableLanguages[0]}
                          label="Payer avec Moneroo"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">Aucun format disponible pour ce magazine.</p>
              )}
            </section>

            {/* Info Section */}
            <section className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Information sur l&apos;achat</h3>
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
