'use client';

import { useState } from 'react';
import { Info, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface BalanceCardProps {
  balance: number;
  monthlyChange: number;
  limit: number;
}

export default function BalanceCard({ balance, monthlyChange, limit }: BalanceCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Calculate percentage of balance against limit
  const balancePercentage = Math.min((balance / limit) * 100, 100);
  
  // Determine if balance trend is positive
  const isPositiveTrend = monthlyChange >= 0;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-medium text-gray-700">Available Balance</h2>
            <button
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <Info className="h-4 w-4" />
            </button>
          </div>
          {showTooltip && (
            <div className="absolute mt-2 p-3 bg-gray-800 text-white text-sm rounded-lg shadow-lg max-w-xs z-10">
              Available balance includes all earnings minus pending withdrawals and processing fees.
              Daily withdrawal limit: {formatCurrency(limit)}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-1 text-sm">
          {isPositiveTrend ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          <span className={isPositiveTrend ? "text-green-500" : "text-red-500"}>
            {isPositiveTrend ? '+' : ''}{formatCurrency(monthlyChange)} this month
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold text-gray-900">
            {formatCurrency(balance)}
          </span>
          <span className="text-sm text-gray-500">
            available
          </span>
        </div>

        {/* Progress Bar */}
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block text-gray-600">
                Daily Limit Usage
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-gray-600">
                {balancePercentage.toFixed(0)}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-100">
            <div
              style={{ width: `${balancePercentage}%` }}
              className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                balancePercentage > 80 ? 'bg-red-500' :
                balancePercentage > 60 ? 'bg-yellow-500' :
                'bg-green-500'
              } transition-all duration-300`}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex space-x-3 pt-4">
          <button className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
            Add Funds
          </button>
          <button className="flex-1 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            Withdraw
          </button>
        </div>
      </div>
    </div>
  );
} 