import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing notifications
  await prisma.notification.deleteMany({});

  // Create test notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: '1', // Replace with actual user ID
        type: 'MESSAGE',
        message: 'New message from John Doe',
        link: '/messages/1',
        createdAt: new Date(),
      },
      {
        userId: '1',
        type: 'TRANSACTION',
        message: 'Payment received: $500.00',
        link: '/wallet',
        createdAt: new Date(Date.now() - 3600000),
      },
      {
        userId: '1',
        type: 'SYSTEM_ALERT',
        message: 'System maintenance scheduled',
        createdAt: new Date(Date.now() - 86400000),
      },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 