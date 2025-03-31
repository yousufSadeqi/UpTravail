import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        client: true, // Include client information
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Format the response
    const response = {
      personal: {
        name: user.name || '',
        title: user.title || '',
        email: user.email,
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
        languages: user.languages || [],
      },
      company: {
        name: user.client?.company_name || '',
        address: user.client?.address || '',
        website: user.client?.website || '',
        industry: user.client?.industry || '',
        size: user.client?.company_size || '',
        taxId: user.client?.tax_id || '',
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching account data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch account data' },
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

    // Update user personal information
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.personal.name,
        title: data.personal.title,
        email: data.personal.email,
        phone: data.personal.phone,
        location: data.personal.location,
        bio: data.personal.bio,
        languages: data.personal.languages,
      },
    });

    // Update client company information
    const updatedClient = await prisma.client.update({
      where: { user_id: session.user.id },
      data: {
        company_name: data.company.name,
        address: data.company.address,
        website: data.company.website,
        industry: data.company.industry,
        company_size: data.company.size,
        tax_id: data.company.taxId,
      },
    });

    return NextResponse.json({
      message: 'Account updated successfully',
      user: updatedUser,
      client: updatedClient,
    });
  } catch (error) {
    console.error('Error updating account:', error);
    return NextResponse.json(
      { error: 'Failed to update account' },
      { status: 500 }
    );
  }
} 