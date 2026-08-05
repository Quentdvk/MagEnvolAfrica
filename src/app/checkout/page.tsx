import Link from 'next/link';
import PayButton from '@/components/payment/PayButton';
import { getSubscriptionPlanById } from '@/lib/data/plans';

export const dynamic = 'force-dynamic';

function formatXof(amount: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(amount);
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan: planId } = await searchParams;
  const plan = planId ? await getSubscriptionPlanById(planId) : null;

  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Abonnement introuvable</h1>
          <p className="text-gray-600 mb-8">
            Le plan demandé n&apos;existe pas ou n&apos;est plus disponible.
          </p>
          <Link
            href="/s-abonner"
            className="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
          >
            Voir les abonnements
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Finaliser votre abonnement</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Plan {plan.label}</h2>
          <p className="text-gray-600 mb-4">
            Facturation {plan.billingInterval === 'annuel' ? 'annuelle' : 'mensuelle'}
          </p>

          <ul className="space-y-2 mb-6">
            {plan.features.map((feature) => (
              <li key={feature} className="text-sm text-gray-700">
                • {feature}
              </li>
            ))}
          </ul>

          <div className="border-t border-gray-200 pt-4 space-y-1">
            <div className="flex justify-between text-lg font-bold text-gray-900">
              <span>À payer maintenant</span>
              <span>{formatXof(plan.priceFirstPeriodXof)}</span>
            </div>
            <p className="text-sm text-gray-600">
              Puis {formatXof(plan.priceRecurringXof)} par période
            </p>
          </div>
        </div>

        <PayButton itemType="abonnement" planId={plan.id} label="Payer avec Moneroo" />

        <p className="mt-4 text-sm text-gray-500">
          Paiement sécurisé par Moneroo (Mobile Money et carte bancaire). Vous devez être connecté
          pour finaliser le paiement.
        </p>
      </div>
    </div>
  );
}
