'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Wallet } from '@/types/wallet';
import { formatCurrency } from '@/lib/utils';
import { 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History,
  Loader2,
  LogOut
} from 'lucide-react';
import AddFundsModal from './components/AddFundsModal';
import WithdrawModal from './components/WithdrawModal';
import TransactionHistory from './components/TransactionHistory';
import BalanceCard from './components/BalanceCard';
import BalanceDisplay from './components/BalanceDisplay';

interface WalletStats {
  balance: number;
  monthlyChange: number;
  limit: number;
}

export default function WalletPage() {
  const { user } = useAuth();
  const [walletData, setWalletData] = useState<{
    balance: number;
    income: number;
    expenses: number;
  }>({
    balance: 100000000,
    income: 0,
    expenses: 100000000
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [stats, setStats] = useState<WalletStats>({
    balance: 10000000,
    monthlyChange: 0,
    limit: 10000, // Default daily limit
  });
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);

  useEffect(() => {
    fetchWalletData();
    fetchWalletStats();
  }, []); // Remove user dependency as it's handled by AuthProvider

  const fetchWalletData = async () => {
    try {
      // Fetch balance
      const balanceRes = await fetch('/api/wallet/balance');
      const balanceData = await balanceRes.json();

      // Fetch stats
      const statsRes = await fetch('/api/wallet/stats');
      const statsData = await statsRes.json();

      setWalletData({
        balance: balanceData.balance || 0,
        income: statsData.income || 0,
        expenses: statsData.expenses || 0
      });
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWalletStats = async () => {
    try {
      const response = await fetch('/api/wallet/stats');
      if (!response.ok) throw new Error('Failed to fetch wallet stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching wallet stats:', error);
    }
  };

  const handleTransfer = () => {
    setShowTransferModal(true);
  };

  const handleAddFunds = () => {
    setShowAddFundsModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BalanceCard
          balance={stats.balance}
          monthlyChange={stats.monthlyChange}
          limit={stats.limit}
        />
        <BalanceDisplay
          availableBalance={walletData.balance}
          totalEarnings={walletData.income}
          totalExpenses={walletData.expenses}
          goal={10000}
          onTransfer={handleTransfer}
          onAddFunds={handleAddFunds}
        />
      </div>
      <TransactionHistory />

      {/* Modals */}
      <AddFundsModal
        open={showAddFunds}
        onClose={() => setShowAddFunds(false)}
        onSuccess={() => {
          fetchWalletData();
          setShowAddFunds(false);
        }}
      />
      <WithdrawModal
        open={showWithdraw}
        onClose={() => setShowWithdraw(false)}
        onSuccess={() => {
          fetchWalletData();
          setShowWithdraw(false);
        }}
        maxAmount={walletData.balance}
      />
    </div>
  );
} 