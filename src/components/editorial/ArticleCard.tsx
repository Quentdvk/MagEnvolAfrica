import Link from 'next/link';
import Image from 'next/image';

interface ArticleCardProps {
  id: string;
  title: string;
  excerpt: string;
  imageUrl?: string;
  category: string;
  author: string;
  publishedAt: string;
  readTime?: number;
  isPremium?: boolean;
  displayType?: 'sentinelle' | 'essor' | 'ombre-douce' | 'standard';
}

export default function ArticleCard({
  id,
  title,
  excerpt,
  imageUrl,
  category,
  author,
  publishedAt,
  readTime,
  freeLines,
  isPremium = false,
  displayType = 'standard',
}: ArticleCardProps & { freeLines?: number }) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getDisplayStyles = () => {
    switch (displayType) {
      case 'sentinelle':
        return {
          container: 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200',
          badge: 'bg-red-600 text-white',
        };
      case 'essor':
        return {
          container: 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200',
          badge: 'bg-green-600 text-white',
        };
      case 'ombre-douce':
        return {
          container: 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200',
          badge: 'bg-gray-600 text-white',
        };
      default:
        return {
          container: 'bg-white border-gray-200',
          badge: 'bg-indigo-600 text-white',
        };
    }
  };

  const styles = getDisplayStyles();

  return (
    <article className={`${styles.container} border rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300`}>
      <Link href={`/articles/${id}`}>
        {imageUrl && (
          <div className="relative h-48 w-full">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {isPremium && (
              <div className="absolute top-2 right-2">
                <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
                  Premium
                </span>
              </div>
            )}
            <div className="absolute top-2 left-2">
              <span className={`${styles.badge} text-xs font-bold px-2 py-1 rounded`}>
                {category}
              </span>
            </div>
          </div>
        )}

        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-indigo-600 transition-colors">
            {title}
          </h3>

          {displayType !== 'sentinelle' && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-3">
              {excerpt}
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-2">
              <span className="font-medium">{author}</span>
              <span>•</span>
              <span>{formatDate(publishedAt)}</span>
              {readTime && (
                <>
                  <span>•</span>
                  <span>{readTime} min de lecture</span>
                </>
              )}
            </div>

            {freeLines !== undefined && freeLines > 0 && (
              <span className="text-green-600 font-medium">
                {freeLines} lignes gratuites
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
