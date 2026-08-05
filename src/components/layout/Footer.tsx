import Link from 'next/link';

export default function Footer() {
  const footerLinks = {
    tousNosSites: [
      { name: 'Crowdfunding', href: 'https://crowdfunding.envolafrica.net' },
      { name: 'Kiosque', href: '/kiosque' },
      { name: 'World Africa Business', href: 'https://worldafricabusiness.envolafrica.net' },
      { name: 'Marketplace', href: 'https://marketplace.envolafrica.net' },
      { name: 'Jobs', href: 'https://jobs.envolafrica.net' },
      { name: 'Africa Awards', href: 'https://africaawards.envolafrica.net' },
    ],
    nosAccompagnements: [
      { name: 'Ingénierie digitale', href: '#' },
      { name: 'Newsletters', href: '#' },
      { name: 'Abonnement', href: '/s-abonner' },
      { name: 'Levée de fonds et accompagnement', href: '#' },
      { name: 'Programme d\'affiliation', href: '#' },
      { name: 'Externalisation / Applications', href: '#' },
      { name: 'Kit média', href: '#' },
      { name: 'Recherche de financement', href: '#' },
    ],
    applications: [
      { name: 'Sur Android', href: '#' },
      { name: 'Sur iPhone', href: '#' },
      { name: 'Sur Huawei', href: '#' },
    ],
    autres: [
      { name: 'Publicité', href: '#' },
      { name: 'Suivi complet', href: '#' },
    ],
  };

  return (
    <footer className="bg-white">
      {/* Niveau 1 - Logo et baseline (fond noir) */}
      <div className="bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <span className="text-2xl font-bold text-white">ENVOL AFRICA MAG</span>
            <p className="mt-4 text-sm text-white max-w-2xl mx-auto">
              Une chaîne regroupant toutes les valeurs pour votre succès en entreprises. Plus qu&apos;un magazine, c&apos;est le seul outil qui vous apporte tout pour réussir en affaires et prospérer à tout égard.
            </p>
          </div>
        </div>
      </div>

      {/* Niveau 2 - Liens (fond noir) */}
      <div className="bg-black border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Colonne 1 - Tous nos sites */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Tous nos sites
              </h3>
              <ul className="space-y-3">
                {footerLinks.tousNosSites.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-sm text-gray-300 hover:text-white">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Colonne 2 - Nos accompagnements */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Nos accompagnements
              </h3>
              <ul className="space-y-3">
                {footerLinks.nosAccompagnements.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-sm text-gray-300 hover:text-white">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Colonne 3 - Applications */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Applications
              </h3>
              <ul className="space-y-3">
                {footerLinks.applications.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-sm text-gray-300 hover:text-white">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Colonne 4 - Autres */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Autres
              </h3>
              <ul className="space-y-3">
                {footerLinks.autres.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-sm text-gray-300 hover:text-white">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Niveau 3 - Copyright et liens légaux (fond gris clair) */}
      <div className="bg-gray-100 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-600">
              © 2026 Envol Africa Groupe. Tous droits réservés.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/terms" className="text-sm text-gray-600 hover:text-gray-900">
                Terms
              </Link>
              <Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-900">
                Privacy
              </Link>
              <Link href="/cookies" className="text-sm text-gray-600 hover:text-gray-900">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
