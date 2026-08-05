import Link from 'next/link';
import Image from 'next/image';
import type { MagazineSummary } from '@/lib/data/types';

const EDITION_LABELS: Record<MagazineSummary['editionType'], string> = {
  normale: 'Édition normale',
  speciale: 'Édition spéciale',
  hors_serie: 'Hors-série',
};

export default function MagazineCard({ magazine }: { magazine: MagazineSummary }) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(price);

  const isAvailable = magazine.priceFromXof !== null;

  return (
    <Link href={`/kiosque/${magazine.id}`}>
      <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
        {/* Cover Image */}
        <div className="relative h-80 w-full bg-gray-100">
          {magazine.coverImageUrl ? (
            <Image
              src={magazine.coverImageUrl}
              alt={`Envol Africa Magazine N°${magazine.numero}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-gray-400 text-sm">Couverture non disponible</span>
            </div>
          )}

          {!isAvailable && (
            <div className="absolute top-2 right-2">
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                Bientôt disponible
              </span>
            </div>
          )}

          <div className="absolute bottom-2 left-2">
            <span className="bg-indigo-600 text-white text-sm font-bold px-3 py-1 rounded">
              N°{magazine.numero}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {EDITION_LABELS[magazine.editionType]} N°{magazine.numero}
          </h3>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{magazine.summary}</p>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {magazine.year ?? new Date(magazine.publishedAt).getFullYear()}
            </span>
            {magazine.priceFromXof !== null ? (
              <span className="text-lg font-bold text-indigo-600">
                dès {formatPrice(magazine.priceFromXof)}
              </span>
            ) : (
              <span className="text-sm text-gray-500">Prix à venir</span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
