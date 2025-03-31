import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { hash, compare } from 'bcryptjs';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        securitySettings: true,
        loginHistory: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      twoFactorEnabled: user.securitySettings?.twoFactorEnabled || false,
      twoFactorMethod: user.securitySettings?.twoFactorMethod || null,
      privacySettings: user.securitySettings?.privacySettings || {
        profileVisibility: 'public',
        showEmail: true,
        showPhone: false,
        showLocation: true,
      },
      lastPasswordChange: user.securitySettings?.lastPasswordChange || null,
      loginHistory: user.loginHistory.map(log => ({
        date: log.createdAt,
        device: log.deviceInfo,
        location: log.location,
        status: log.status,
      })),
    });
  } catch (error) {
    console.error('Error fetching security settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch security settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    const updatedSettings = await prisma.securitySettings.upsert({
      where: { userId: session.user.id },
      update: {
        twoFactorEnabled: data.twoFactorEnabled,
        twoFactorMethod: data.twoFactorMethod,
        privacySettings: data.privacySettings,
      },
      create: {
        userId: session.user.id,
        twoFactorEnabled: data.twoFactorEnabled,
        twoFactorMethod: data.twoFactorMethod,
        privacySettings: data.privacySettings,
      },
    });

    return NextResponse.json({
      message: 'Security settings updated successfully',
      settings: updatedSettings,
    });
  } catch (error) {
    console.error('Error updating security settings:', error);
    return NextResponse.json(
      { error: 'Failed to update security settings' },
      { status: 500 }
    );
  }
} 