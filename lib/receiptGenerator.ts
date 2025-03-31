import PDFDocument from 'pdfkit';
import { WalletTransaction } from '@/types/wallet';
import { formatCurrency, formatDate } from '@/lib/utils';

export async function generateReceipt(transaction: WalletTransaction): Promise<Buffer> {
  return new Promise((resolve) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    // Add company logo
    // doc.image('public/logo.png', 50, 50, { width: 100 });

    // Header
    doc.fontSize(20)
       .text('Transaction Receipt', { align: 'center' })
       .moveDown();

    // Transaction details
    doc.fontSize(12)
       .text('Transaction ID:', { continued: true })
       .fontSize(12)
       .text(` ${transaction.id}`, { align: 'right' })
       .moveDown(0.5);

    doc.fontSize(12)
       .text('Date:', { continued: true })
       .text(` ${formatDate(transaction.created_at)}`, { align: 'right' })
       .moveDown(0.5);

    doc.fontSize(12)
       .text('Type:', { continued: true })
       .text(` ${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}`, { align: 'right' })
       .moveDown(0.5);

    doc.fontSize(12)
       .text('Amount:', { continued: true })
       .text(` ${formatCurrency(transaction.amount)}`, { align: 'right' })
       .moveDown(0.5);

    doc.fontSize(12)
       .text('Status:', { continued: true })
       .text(` ${transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}`, { align: 'right' })
       .moveDown(2);

    if (transaction.description) {
      doc.fontSize(12)
         .text('Description:', { continued: true })
         .text(` ${transaction.description}`, { align: 'right' })
         .moveDown(0.5);
    }

    // Footer
    doc.fontSize(10)
       .text('This is an automatically generated receipt.', { align: 'center', color: 'gray' });

    doc.end();
  });
} 