import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { generateReceipt } from '@/lib/receiptGenerator';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const transaction = await prisma.walletTransaction.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    });

    if (!transaction) {
      return new NextResponse('Transaction not found', { status: 404 });
    }

    const receipt = await generateReceipt(transaction);

    return new NextResponse(receipt, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="receipt-${transaction.id}.pdf"`
      }
    });
  } catch (error) {
    console.error('Receipt generation error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 