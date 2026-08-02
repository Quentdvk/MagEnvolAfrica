import Link from 'next/link';
import Image from 'next/image';

interface MagazineCardProps {
  id: string;
  title: string;
  issueNumber: number;
  year: number;
  coverImageUrl?: string;
  description?: string;
  price: number;
  currency: string;
  isAvailable: boolean;
}

export default function MagazineCard({
  id,
  title,
  issueNumber,
  year,
  coverImageUrl,
  description,
  price,
  currency,
  isAvailable,
}: MagazineCardProps) {
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  return (
    <Link href={`/kiosque/${id}`}>
      <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
        {/* Cover Image */}
        <div className="relative h-80 w-full bg-gray-100">
          {coverImageUrl ? (
            <Image
              src={coverImageUrl}
              alt={`${title} - N°${issueNumber}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-gray-400 text-sm">Couverture non disponible</span>
            </div>
          )}

          {/* Availability Badge */}
          {!isAvailable && (
            <div className="absolute top-2 right-2">
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                Épuisé
              </span>
            </div>
          )}

          {/* Issue Number Badge */}
          <div className="absolute bottom-2 left-2">
            <span className="bg-indigo-600 text-white text-sm font-bold px-3 py-1 rounded">
              N°{issueNumber}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {title}
          </h3>

          {description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {year}
            </span>
            <span className="text-lg font-bold text-indigo-600">
              {formatPrice(price, currency)}
            </span>
          </div>

          {!isAvailable && (
            <p className="text-xs text-red-600 mt-2">
              Ce numéro n'est plus disponible
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}
