import { useState, useCallback } from 'react';

interface ToastOptions {
  title: string;
  description: string;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastOptions[]>([]);

  const toast = useCallback(({ duration = 5000, ...options }: ToastOptions) => {
    const id = Date.now();
    setToasts(prev => [...prev, { ...options, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration);
  }, []);

  return { toast, toasts };
} 