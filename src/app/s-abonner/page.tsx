import Link from 'next/link';
import { getSubscriptionPlans } from '@/lib/data/plans';

export const dynamic = 'force-dynamic';

function formatPrice(price: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(price);
}

function getBillingPeriodLabel(interval: string) {
  return interval === 'annuel' ? '/ an' : '/ mois';
}

export default async function SubscriptionPage() {
  const plans = await getSubscriptionPlans();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choisissez votre abonnement
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Accédez à tout le contenu premium d&apos;Envol Africa Magazine et profitez d&apos;avantages exclusifs
          </p>
        </header>

        {/* Plans Grid */}
        {plans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white rounded-lg shadow-lg overflow-hidden ${
                  plan.code === 'annuel' ? 'ring-2 ring-indigo-600 transform scale-105' : ''
                }`}
              >
                {plan.code === 'annuel' && (
                  <div className="bg-indigo-600 text-white text-center py-2 font-semibold">
                    Le plus populaire
                  </div>
                )}

                <div className="p-6">
                  {/* Plan Name */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.label}</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Facturation {plan.billingInterval === 'annuel' ? 'annuelle' : 'mensuelle'}
                  </p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-gray-900">
                        {formatPrice(plan.priceRecurringXof)}
                      </span>
                      <span className="text-gray-600 ml-2">
                        {getBillingPeriodLabel(plan.billingInterval)}
                      </span>
                    </div>
                    {plan.priceFirstPeriodXof < plan.priceRecurringXof && (
                      <p className="text-green-600 text-sm font-medium mt-1">
                        {formatPrice(plan.priceFirstPeriodXof)} la première période
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <svg
                          className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Link
                    href={`/checkout?plan=${plan.id}`}
                    className={`block w-full text-center py-3 px-4 rounded-lg font-semibold transition-colors ${
                      plan.code === 'annuel'
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    S&apos;abonner
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              Aucun plan d&apos;abonnement disponible pour le moment.
            </p>
          </div>
        )}

        {/* FAQ Section */}
        <section className="mt-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Questions fréquentes
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-lg p-6 shadow">
              <h3 className="font-semibold text-gray-900 mb-2">
                Puis-je annuler mon abonnement à tout moment ?
              </h3>
              <p className="text-gray-600">
                Oui, vous pouvez annuler votre abonnement à tout moment depuis votre espace personnel. L&apos;accès au contenu reste actif jusqu&apos;à la fin de la période facturée.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow">
              <h3 className="font-semibold text-gray-900 mb-2">
                Comment fonctionne la réduction du premier mois ?
              </h3>
              <p className="text-gray-600">
                La réduction de 50% s&apos;applique automatiquement sur votre premier mois d&apos;abonnement. Le prix normal sera facturé à partir du deuxième mois.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow">
              <h3 className="font-semibold text-gray-900 mb-2">
                Quels modes de paiement sont acceptés ?
              </h3>
              <p className="text-gray-600">
                Nous acceptons les paiements via Mobile Money (Orange Money, MTN Mobile Money, Wave), cartes bancaires Visa/Mastercard, et transferts bancaires.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow">
              <h3 className="font-semibold text-gray-900 mb-2">
                L&apos;abonnement inclut-il les magazines du kiosque ?
              </h3>
              <p className="text-gray-600">
                Seuls les plans Premium et Entreprise incluent un accès gratuit au kiosque digital. Les autres plans nécessitent un achat séparé pour les magazines.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-20 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-lg p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Besoin d&apos;un plan sur mesure ?
          </h2>
          <p className="text-white text-lg mb-8 max-w-2xl mx-auto">
            Contactez-nous pour discuter d&apos;une solution adaptée aux besoins de votre entreprise.
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-4 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Nous contacter
          </Link>
        </section>
      </div>
    </div>
  );
}
