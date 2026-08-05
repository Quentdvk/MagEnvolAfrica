'use client';

import { useState } from 'react';

type PayButtonProps = {
  label: string;
  className?: string;
} & (
  | { itemType: 'abonnement'; planId: string }
  | { itemType: 'magazine'; magazineVariantId: string; language?: string }
);

export default function PayButton(props: PayButtonProps) {
  const { label, className } = props;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);

    const body =
      props.itemType === 'abonnement'
        ? { itemType: 'abonnement', planId: props.planId }
        : {
            itemType: 'magazine',
            magazineVariantId: props.magazineVariantId,
            ...(props.language ? { language: props.language } : {}),
          };

    try {
      const response = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const payload = (await response.json()) as { checkoutUrl?: string; error?: string };

      if (!response.ok || !payload.checkoutUrl) {
        setError(payload.error ?? 'Le paiement n\'a pas pu être initialisé.');
        setLoading(false);
        return;
      }

      window.location.href = payload.checkoutUrl;
    } catch {
      setError('Le paiement n\'a pas pu être initialisé.');
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={
          className ??
          'w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50'
        }
      >
        {loading ? 'Redirection vers Moneroo...' : label}
      </button>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
