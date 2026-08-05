import Link from 'next/link';

export const dynamic = 'force-dynamic';

const MESSAGES: Record<string, { title: string; body: string }> = {
  success: {
    title: 'Paiement réussi',
    body: "Merci ! Votre paiement a été accepté. Votre accès est activé dès la confirmation définitive envoyée par Moneroo.",
  },
  failed: {
    title: 'Paiement échoué',
    body: "Votre paiement n'a pas abouti. Aucun montant n'a été débité, vous pouvez réessayer.",
  },
  cancelled: {
    title: 'Paiement annulé',
    body: 'Vous avez annulé le paiement. Vous pouvez reprendre la commande à tout moment.',
  },
};

export default async function PaymentReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ paymentId?: string; paymentStatus?: string }>;
}) {
  const { paymentId, paymentStatus } = await searchParams;
  const message = MESSAGES[paymentStatus ?? ''] ?? {
    title: 'Paiement en cours de traitement',
    body: 'Nous attendons la confirmation de Moneroo. Cette page peut être fermée, vous serez notifié.',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{message.title}</h1>
        <p className="text-gray-600 mb-2">{message.body}</p>

        {paymentId && (
          <p className="text-sm text-gray-500 mb-8">Référence de transaction : {paymentId}</p>
        )}

        <Link
          href="/"
          className="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
