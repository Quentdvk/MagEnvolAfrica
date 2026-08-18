'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const ecosystemLinks = [
    { name: 'S\'abonner', href: '/s-abonner' },
    { name: 'Kiosque', href: '/kiosque' },
    { name: 'Jobs', href: 'https://jobs.envolafrica.net' },
    { name: 'Marketplace', href: 'https://marketplace.envolafrica.net' },
    { name: 'Crowdfunding', href: 'https://crowdfunding.envolafrica.net' },
    { name: 'Africa Awards', href: 'https://africaawards.envolafrica.net' },
    { name: 'Salons', href: 'https://worldafricabusiness.envolafrica.net/live' },
    { name: 'World Africa Business', href: 'https://worldafricabusiness.envolafrica.net' },
  ];

  const mainMenuItems = [
    { name: 'Envol Africa Magazine', href: '/' },
    { name: 'Kiosque', href: '/kiosque' },
    { name: 'Jobs', href: 'https://jobs.envolafrica.net' },
    { name: 'Marketplace', href: 'https://marketplace.envolafrica.net' },
    { name: 'Crowdfunding', href: 'https://crowdfunding.envolafrica.net' },
    { name: 'Africa Awards', href: 'https://africaawards.envolafrica.net' },
    { name: 'Salons', href: 'https://worldafricabusiness.envolafrica.net/live' },
    { name: 'World Africa Business', href: 'https://worldafricabusiness.envolafrica.net' },
  ];

  const sidePanelLinks = [
    { name: 'Montage de plan d\'affaires', href: '#' },
    { name: 'Conseils et externalisation', href: '#' },
    { name: 'Recrutement', href: '#' },
    { name: 'Formation et recyclage', href: '#' },
    { name: 'Levée de fonds', href: '#' },
    { name: 'Services digitaux', href: '#' },
    { name: 'Marketing et stratégie de vente', href: '#' },
    { name: 'Audit de gestion', href: '#' },
    { name: 'Gestion de projet', href: '#' },
    { name: 'Courtage', href: '#' },
  ];

  return (
    <>
      {/* Ligne 1 - Barre supérieure (visible seulement en haut de page) */}
      <div className={`bg-gray-100 border-b border-gray-200 transition-all duration-300 ${isScrolled ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-10">
            {/* Liens écosystème à gauche */}
            <div className="flex items-center space-x-4 text-sm">
              {ecosystemLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-gray-700 hover:text-indigo-600 flex items-center"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Sélecteurs langue/devise à droite */}
            <div className="flex items-center space-x-4">
              <select aria-label="Sélectionner une rubrique" onChange={(e) => router.push(e.target.value)} className="text-sm border-none bg-transparent cursor-pointer hover:text-indigo-600">
                <option value="fr">FR</option>
                <option value="en">EN</option>
                <option value="es">ES</option>
              </select>
              <select aria-label="Sélectionner une rubrique" onChange={(e) => router.push(e.target.value)} className="text-sm border-none bg-transparent cursor-pointer hover:text-indigo-600">
                <option value="XOF">XOF</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Ligne 2 - Barre principale (sticky) */}
      <div className={`relative z-40 bg-white border-b border-gray-200 transition-all duration-300 ${isScrolled ? 'fixed top-0 left-0 right-0 z-50 shadow-md' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <span className="text-2xl font-bold text-indigo-600">ENVOL AFRICA</span>
            </Link>

            {/* Menu déroulant principal */}
            <div className="hidden md:flex items-center space-x-6">
              <select aria-label="Navigation principale" onChange={(e) => router.push(e.target.value)} className="text-sm border border-gray-300 rounded-md px-3 py-1">
                {mainMenuItems.map((item) => (
                  <option key={item.name} value={item.href}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Icônes et boutons desktop */}
            <div className="hidden md:flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-indigo-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </button>
              <button className="p-2 text-gray-600 hover:text-indigo-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <button className="p-2 text-gray-600 hover:text-indigo-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>
              <button className="p-2 text-gray-600 hover:text-indigo-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              <button className="p-2 text-gray-600 hover:text-indigo-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              <Link href="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600">
                Se connecter
              </Link>
              <Link href="/s-abonner" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                S'abonner
              </Link>
              <Link href="/faire-un-don" className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">
                Faire un don
              </Link>

              {/* Bouton menu réduit desktop */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 text-gray-600 hover:text-indigo-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* Bouton menu mobile */}
            <div className="md:hidden flex items-center space-x-2">
              <Link href="/login" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600">
                Connexion
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 text-gray-600 hover:text-indigo-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bandeau "À la Une" (visible seulement en haut de page) */}
      <div className={`bg-gray-100 border-b border-gray-200 transition-all duration-300 ${isScrolled ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-10">
            <button className="bg-red-600 text-white px-4 py-1 text-sm font-medium rounded mr-4">
              À la Une
            </button>
            <div className="flex-1 overflow-hidden">
              <div className="whitespace-nowrap animate-marquee">
                <span className="text-gray-900">Article 1 à la une • Article 2 à la une • Article 3 à la une • Article 4 à la une</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Panneau latéral droit */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-gray-500 bg-opacity-75" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute inset-y-0 right-0 max-w-xs w-full bg-white shadow-xl">
            <div className="flex flex-col h-full">
              <div className="p-6">
                <span className="text-2xl font-bold text-indigo-600">ENVOL AFRICA MAGAZINE</span>
                <p className="mt-4 text-sm text-gray-600">
                  Une chaîne regroupant toutes les valeurs pour votre succès en entreprises. Plus qu'un magazine, c'est le seul outil qui vous apporte tout pour réussir en affaires et prospérer à tout égard.
                </p>
                <Link href="/soutenir" className="mt-6 block w-full text-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">
                  Soutenir Envol Africa
                </Link>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Nos Services</h3>
                <ul className="space-y-2">
                  {sidePanelLinks.map((link) => (
                    <li key={link.name}>
                      <Link href={link.href} className="text-sm text-gray-600 hover:text-indigo-600">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-6 bg-gray-50">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Osez la réussite !</h3>
                <p className="text-sm text-gray-600 mb-4">Lisez Envol Africa Magazine</p>
                <Link href="/s-abonner" className="block w-full text-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                  S'abonner
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
