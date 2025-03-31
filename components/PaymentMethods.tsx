'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import AddCardForm from './AddCardForm';
import SafeImage from './SafeImage';

interface PaymentMethod {
  id: string;
  card: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  isDefault?: boolean;
}

export default function PaymentMethods() {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/wallet/payment-methods/${paymentMethodId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete payment method');

      setPaymentMethods(methods => 
        methods.filter(method => method.id !== paymentMethodId)
      );
    } catch (error) {
      console.error('Error deleting payment method:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefaultPaymentMethod = async (paymentMethodId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/wallet/payment-methods/default', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentMethodId }),
      });

      if (!response.ok) throw new Error('Failed to set default payment method');

      setPaymentMethods(methods =>
        methods.map(method => ({
          ...method,
          isDefault: method.id === paymentMethodId,
        }))
      );
    } catch (error) {
      console.error('Error setting default payment method:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Payment Methods</h2>
      
      {paymentMethods.map((method) => (
        <div
          key={method.id}
          className="p-4 border rounded-lg flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <SafeImage
              src={`/card-brands/${method.card.brand}.png`}
              alt={method.card.brand}
              width={40}
              height={30}
              className="object-contain"
            />
            <div>
              <p>•••• {method.card.last4}</p>
              <p className="text-sm text-gray-500">
                Expires {method.card.exp_month}/{method.card.exp_year}
              </p>
            </div>
            {method.isDefault && (
              <span className="text-sm text-green-600">Default</span>
            )}
          </div>
          
          <div className="flex space-x-2">
            {!method.isDefault && (
              <button
                onClick={() => handleSetDefaultPaymentMethod(method.id)}
                disabled={isLoading}
                className="text-blue-600 hover:text-blue-800"
              >
                Set Default
              </button>
            )}
            <button
              onClick={() => handleDeletePaymentMethod(method.id)}
              disabled={isLoading}
              className="text-red-600 hover:text-red-800"
            >
              Delete
            </button>
          </div>
        </div>
      ))}

      {isAddingCard ? (
        <AddCardForm
          onSuccess={(newMethod) => {
            setPaymentMethods(methods => [...methods, newMethod]);
            setIsAddingCard(false);
          }}
          onCancel={() => setIsAddingCard(false)}
        />
      ) : (
        <button
          onClick={() => setIsAddingCard(true)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add New Card
        </button>
      )}
    </div>
  );
} 