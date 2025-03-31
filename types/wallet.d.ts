export interface Wallet {
  id: string;
  balance: number;
  dailyLimit: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WalletTransaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'payment';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  description?: string;
  reference?: string;
  walletId: string;
  userId: string;
  created_at: string;
  updated_at: string;
}

export interface WalletStats {
  balance: number;
  monthlyChange: number;
  limit: number;
} 