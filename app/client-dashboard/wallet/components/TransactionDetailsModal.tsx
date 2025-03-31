'use client';

import { useEffect, useRef, useState } from 'react';
import { 
  X, 
  Copy, 
  Download, 
  ArrowUpRight, 
  ArrowDownLeft,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { WalletTransaction } from '@/types/wallet';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import styles from './TransactionDetailsModal.module.css';

interface TransactionDetailsModalProps {
  transaction: WalletTransaction;
  isOpen: boolean;
  onClose: () => void;
}

export default function TransactionDetailsModal({
  transaction,
  isOpen,
  onClose
}: TransactionDetailsModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(field);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getStatusIcon = () => {
    switch (transaction.status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const handleDownloadReceipt = async () => {
    try {
      const response = await fetch(`/api/wallet/transactions/${transaction.id}/receipt`);
      if (!response.ok) throw new Error('Failed to download receipt');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${transaction.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading receipt:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-30 ${styles.overlay} ${
        isVisible ? styles.overlayVisible : ''
      }`}
    >
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          ref={modalRef}
          className={`w-full max-w-md rounded-2xl bg-white shadow-xl ${styles.modal} ${
            isVisible ? styles.modalVisible : ''
          }`}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">
              Transaction Details
            </h2>
            <button
              onClick={onClose}
              className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 space-y-6">
            {/* Transaction Summary */}
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-full ${
                  transaction.type === 'deposit' ? 'bg-green-100' :
                  transaction.type === 'withdrawal' ? 'bg-red-100' : 'bg-blue-100'
                }`}>
                  {transaction.type === 'deposit' ? (
                    <ArrowDownLeft className="h-6 w-6 text-green-600" />
                  ) : (
                    <ArrowUpRight className="h-6 w-6 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">
                    {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                  transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                  transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                } ${styles.statusBadge}`}>
                  {getStatusIcon()}
                  <span>{transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}</span>
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  {formatTime(transaction.created_at)}
                </span>
              </div>
            </div>

            {/* Transaction Details */}
            <div className="space-y-1">
              <div className={`flex justify-between items-center p-3 rounded-lg ${styles.detailRow}`}>
                <span className="text-sm text-gray-500">Transaction ID</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">
                    {transaction.id.slice(0, 8)}...{transaction.id.slice(-8)}
                  </span>
                  <button
                    onClick={() => copyToClipboard(transaction.id, 'id')}
                    className={`text-gray-400 hover:text-gray-600 ${styles.copyButton}`}
                  >
                    <Copy className="h-4 w-4" />
                    {copySuccess === 'id' && (
                      <span className={`${styles.copyTooltip} ${styles.copyTooltipVisible}`}>
                        Copied!
                      </span>
                    )}
                  </button>
                </div>
              </div>

              <div className={`flex justify-between items-center p-3 rounded-lg ${styles.detailRow}`}>
                <span className="text-sm text-gray-500">Date & Time</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatDate(transaction.created_at)}
                </span>
              </div>

              {transaction.description && (
                <div className={`flex justify-between items-center p-3 rounded-lg ${styles.detailRow}`}>
                  <span className="text-sm text-gray-500">Description</span>
                  <span className="text-sm font-medium text-gray-900">
                    {transaction.description}
                  </span>
                </div>
              )}

              {transaction.reference && (
                <div className={`flex justify-between items-center p-3 rounded-lg ${styles.detailRow}`}>
                  <span className="text-sm text-gray-500">Reference</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">
                      {transaction.reference}
                    </span>
                    <button
                      onClick={() => copyToClipboard(transaction.reference, 'reference')}
                      className={`text-gray-400 hover:text-gray-600 ${styles.copyButton}`}
                    >
                      <Copy className="h-4 w-4" />
                      {copySuccess === 'reference' && (
                        <span className={`${styles.copyTooltip} ${styles.copyTooltipVisible}`}>
                          Copied!
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <button
                onClick={handleDownloadReceipt}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Download Receipt</span>
              </button>
              
              {transaction.receipt_url && (
                <button
                  onClick={() => window.open(transaction.receipt_url, '_blank')}
                  className="flex items-center justify-center px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 