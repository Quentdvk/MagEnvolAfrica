import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Envol Africa Magazine
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Site de presse panafricain premium, kiosque digital et plateforme d'abonnement
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/s-abonner" className="px-8 py-4 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
                S'abonner
              </Link>
              <Link href="/kiosque" className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-indigo-600 transition-colors">
                Visiter le Kiosque
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section Image Catégorie A - Placeholder */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">À la Une</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Placeholder pour les blocs Sentinelles, Essor, Ombre douce */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">Article {i}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Carrousel Magazines - Placeholder */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Derniers Numéros</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-100 h-80 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">Magazine {i}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Formations - Placeholder */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Formations Certifiées</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-md">
                <div className="bg-gray-200 h-40 rounded-lg mb-4"></div>
                <h3 className="text-lg font-semibold mb-2">Formation {i}</h3>
                <p className="text-gray-600">Description de la formation...</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Osez la réussite !</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers d'entrepreneurs africains qui s'informent et se forment avec Envol Africa Magazine
          </p>
          <Link href="/s-abonner" className="inline-block px-8 py-4 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
            S'abonner maintenant
          </Link>
        </div>
      </section>
    </div>
  );
}
