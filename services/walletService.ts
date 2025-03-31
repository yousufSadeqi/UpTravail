import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import { Wallet, WalletTransaction, TransactionType, TransactionStatus } from '@/types/wallet';

export const walletService = {
  // Get user's wallet
  async getWallet(userId: string): Promise<Wallet | null> {
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  // Get wallet balance
  async getBalance(userId: string): Promise<number> {
    const wallet = await this.getWallet(userId);
    return wallet?.balance || 0;
  },

  // Create Stripe payment intent for adding funds
  async createAddFundsIntent(userId: string, amount: number): Promise<{
    clientSecret: string;
    intentId: string;
  }> {
    // Get or create Stripe customer
    const wallet = await this.getWallet(userId);
    if (!wallet) throw new Error('Wallet not found');

    let stripeCustomerId = wallet.stripe_customer_id;

    if (!stripeCustomerId) {
      const { data: user } = await supabase.auth.getUser();
      const customer = await stripe.customers.create({
        email: user.user?.email,
        metadata: {
          userId: userId,
          walletId: wallet.id,
        },
      });
      stripeCustomerId = customer.id;

      // Update wallet with Stripe customer ID
      await supabase
        .from('wallets')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', wallet.id);
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: wallet.currency.toLowerCase(),
      customer: stripeCustomerId,
      metadata: {
        walletId: wallet.id,
        userId: userId,
        type: 'deposit',
      },
    });

    // Create pending transaction
    await this.createTransaction({
      wallet_id: wallet.id,
      type: 'deposit',
      amount: amount,
      status: 'pending',
      stripe_payment_id: paymentIntent.id,
      description: 'Adding funds to wallet',
    });

    return {
      clientSecret: paymentIntent.client_secret!,
      intentId: paymentIntent.id,
    };
  },

  // Confirm funds added and update wallet
  async confirmAddFunds(paymentIntentId: string): Promise<void> {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      throw new Error('Payment not successful');
    }

    const { data: transaction } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('stripe_payment_id', paymentIntentId)
      .single();

    if (!transaction) throw new Error('Transaction not found');

    // Start a Supabase transaction
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('id', transaction.wallet_id)
      .single();

    if (walletError) throw walletError;

    // Update wallet balance and transaction status
    const newBalance = wallet.balance + transaction.amount;

    await supabase.from('wallets')
      .update({ balance: newBalance })
      .eq('id', wallet.id);

    await supabase.from('wallet_transactions')
      .update({ status: 'completed' })
      .eq('id', transaction.id);
  },

  // Create a new transaction
  async createTransaction(data: Partial<WalletTransaction>): Promise<WalletTransaction> {
    const { data: transaction, error } = await supabase
      .from('wallet_transactions')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return transaction;
  },

  // Get transaction history
  async getTransactionHistory(
    walletId: string,
    options: {
      limit?: number;
      offset?: number;
      type?: TransactionType;
      status?: TransactionStatus;
    } = {}
  ): Promise<{ transactions: WalletTransaction[]; total: number }> {
    const { limit = 10, offset = 0, type, status } = options;

    let query = supabase
      .from('wallet_transactions')
      .select('*', { count: 'exact' })
      .eq('wallet_id', walletId)
      .order('created_at', { ascending: false });

    if (type) query = query.eq('type', type);
    if (status) query = query.eq('status', status);

    const { data, error, count } = await query
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return {
      transactions: data || [],
      total: count || 0,
    };
  },
}; 