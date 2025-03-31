export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
  stripe_customer_id?: string;
  created_at: string;
  updated_at: string;
}

export type TransactionType = 'deposit' | 'payment' | 'withdrawal' | 'refund';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  description?: string;
  metadata?: Record<string, any>;
  stripe_payment_id?: string;
  created_at: string;
  updated_at: string;
} 