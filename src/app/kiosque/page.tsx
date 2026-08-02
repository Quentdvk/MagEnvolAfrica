import MagazineCard from '@/components/kiosk/MagazineCard';
import { createClient } from '@/lib/supabase/server';

interface Magazine {
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

export const dynamic = 'force-dynamic';

async function getMagazines(): Promise<Magazine[]> {
  const supabase = await createClient();

  if (!supabase) {
    // Return mock data for development without Supabase
    return [
      {
        id: '1',
        title: 'Envol Africa Magazine - Janvier 2026',
        issueNumber: 1,
        year: 2026,
        coverImageUrl: undefined,
        description: 'Le premier numéro de notre magazine économique panafricain.',
        price: 5000,
        currency: 'XOF',
        isAvailable: true,
      },
      {
        id: '2',
        title: 'Envol Africa Magazine - Février 2026',
        issueNumber: 2,
        year: 2026,
        coverImageUrl: undefined,
        description: 'Spécial entrepreneuriat et innovation en Afrique.',
        price: 5000,
        currency: 'XOF',
        isAvailable: true,
      },
      {
        id: '3',
        title: 'Envol Africa Magazine - Mars 2026',
        issueNumber: 3,
        year: 2026,
        coverImageUrl: undefined,
        description: 'Les opportunités d\'investissement dans le secteur agricole.',
        price: 5000,
        currency: 'XOF',
        isAvailable: true,
      },
      {
        id: '4',
        title: 'Envol Africa Magazine - Avril 2026',
        issueNumber: 4,
        year: 2026,
        coverImageUrl: undefined,
        description: 'Numéro spécial sur la fintech africaine.',
        price: 5000,
        currency: 'XOF',
        isAvailable: false,
      },
    ];
  }

  const { data, error } = await supabase
    .from('magazines')
    .select('*')
    .order('year', { ascending: false })
    .order('issueNumber', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as Magazine[];
}

export default async function KioskPage() {
  const magazines = await getMagazines();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Kiosque Digital
          </h1>
          <p className="text-xl text-gray-600">
            Achetez les numéros passés d'Envol Africa Magazine en format numérique
          </p>
        </header>

        {/* Magazines Grid */}
        {magazines.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {magazines.map((magazine) => (
              <MagazineCard
                key={magazine.id}
                id={magazine.id}
                title={magazine.title}
                issueNumber={magazine.issueNumber}
                year={magazine.year}
                coverImageUrl={magazine.coverImageUrl}
                description={magazine.description}
                price={magazine.price}
                currency={magazine.currency}
                isAvailable={magazine.isAvailable}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              Aucun magazine disponible dans le kiosque pour le moment.
            </p>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-16 bg-indigo-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Comment ça marche ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                  1
                </span>
                <h3 className="font-semibold text-gray-900">Choisissez votre numéro</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Parcourez notre catalogue et sélectionnez le numéro qui vous intéresse.
              </p>
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                  2
                </span>
                <h3 className="font-semibold text-gray-900">Sélectionnez le format</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Choisissez entre PDF, ePub ou format papier (si disponible).
              </p>
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                  3
                </span>
                <h3 className="font-semibold text-gray-900">Téléchargez instantanément</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Après paiement, recevez un lien de téléchargement sécurisé.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
