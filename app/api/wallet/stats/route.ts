import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
    });

    if (!wallet) {
      return new NextResponse('Wallet not found', { status: 404 });
    }

    return NextResponse.json({
      balance: wallet.balance,
      monthlyChange: 0, // You can calculate this based on transactions
      limit: 10000, // You can make this configurable
    });
  } catch (error) {
    console.error('Error fetching wallet stats:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 