'use client';

import { useState, useEffect } from 'react';
import { 
  Info, 
  ArrowDownToLine,
  PlusCircle,
  TrendingUp 
} from 'lucide-react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import styles from './BalanceDisplay.module.css';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

interface BalanceDisplayProps {
  availableBalance: number;
  totalEarnings: number;
  totalExpenses: number;
  goal: number;
  onTransfer: () => void;
  onAddFunds: () => void;
}

export default function BalanceDisplay({
  availableBalance,
  totalEarnings,
  totalExpenses,
  goal,
  onTransfer,
  onAddFunds
}: BalanceDisplayProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [animatedBalance, setAnimatedBalance] = useState(0);
  const [isChartReady, setIsChartReady] = useState(false);
  
  // Animate the balance number counting up
  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = availableBalance / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(increment * step, availableBalance);
      setAnimatedBalance(current);

      if (step >= steps) {
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [availableBalance]);

  // Show chart after initial render for animation
  useEffect(() => {
    setIsChartReady(true);
  }, []);

  // Calculate percentages
  const progressPercentage = Math.min((availableBalance / goal) * 100, 100);
  
  // Chart data
  const chartData = {
    labels: ['Available', 'Expenses', 'Withdrawn'],
    datasets: [{
      data: [availableBalance, totalExpenses, totalEarnings - availableBalance - totalExpenses],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',  // green
        'rgba(239, 68, 68, 0.8)',  // red
        'rgba(59, 130, 246, 0.8)', // blue
      ],
      borderColor: [
        'rgba(34, 197, 94, 1)',
        'rgba(239, 68, 68, 1)',
        'rgba(59, 130, 246, 1)',
      ],
      borderWidth: 1,
      hoverOffset: 10
    }]
  };

  const chartOptions = {
    cutout: '70%',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            return ` $${value.toLocaleString()}`;
          }
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8
      }
    },
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 2000,
      easing: 'easeOutQuart'
    },
    responsive: true,
    maintainAspectRatio: false
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 ${styles.container}`}>
      <div className="flex items-start justify-between mb-6">
        <div className="relative">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-semibold text-gray-900">Available Balance</h2>
            <button
              className={styles.infoButton}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <Info className="h-5 w-5" />
            </button>
          </div>
          
          {showTooltip && (
            <div className={styles.tooltip}>
              Your available balance is the total earnings minus any withdrawals and expenses.
              Current goal: ${goal.toLocaleString()}
            </div>
          )}
        </div>
        
        <div className={styles.goalProgress}>
          <TrendingUp className="h-4 w-4" />
          <span>Goal Progress: {progressPercentage.toFixed(0)}%</span>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <div className={`relative w-64 h-64 ${styles.chartContainer}`}>
          {isChartReady && (
            <>
              <Doughnut data={chartData} options={chartOptions} />
              <div className={styles.centerContent}>
                <span className={styles.balanceAmount}>
                  ${animatedBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
                <span className={styles.balanceLabel}>Available Balance</span>
              </div>
            </>
          )}
        </div>

        <div className={`flex space-x-3 w-full max-w-md mt-6 ${styles.actions}`}>
          <button
            onClick={onTransfer}
            className={styles.transferButton}
          >
            <ArrowDownToLine className="h-4 w-4" />
            <span>Transfer to Bank</span>
          </button>
          <button
            onClick={onAddFunds}
            className={styles.addFundsButton}
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Funds</span>
          </button>
        </div>

        <div className={`grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100 w-full ${styles.legend}`}>
          {[
            { label: 'Available', color: 'bg-green-500', value: availableBalance },
            { label: 'Expenses', color: 'bg-red-500', value: totalExpenses },
            { label: 'Withdrawn', color: 'bg-blue-500', value: totalEarnings - availableBalance - totalExpenses }
          ].map((item, index) => (
            <div key={item.label} className={`text-center ${styles.legendItem}`}>
              <div className="flex items-center justify-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                <span className="text-sm text-gray-600">{item.label}</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                ${item.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 