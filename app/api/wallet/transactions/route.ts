import { NextResponse } from 'next/server';
import { walletService } from '@/services/walletService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const wallet = await walletService.getWallet(session.user.id);
    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    const transactions = await walletService.getTransactionHistory(wallet.id, {
      limit: Number(searchParams.get('limit')) || 10,
      offset: Number(searchParams.get('offset')) || 0,
      type: searchParams.get('type') as any,
      status: searchParams.get('status') as any,
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
} 