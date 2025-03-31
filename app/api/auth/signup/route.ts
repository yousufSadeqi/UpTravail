import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { hash } from 'bcryptjs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      fullName,
      userType,
      // Client specific fields
      companyName,
      industry,
      position,
      // Freelancer specific fields
      skills,
      hourlyRate,
      experienceLevel,
      portfolioUrl
    } = body;

    // Validate required fields
    if (!email || !password || !fullName || !userType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Start a Supabase transaction
    const { data: { user }, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError || !user) {
      throw new Error(authError?.message || 'Failed to create user');
    }

    // Create user record
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email,
        full_name: fullName,
        user_type: userType,
        role: userType // Set role same as user type
      })
      .select()
      .single();

    if (userError || !userData) {
      // Rollback auth user creation
      await supabase.auth.admin.deleteUser(user.id);
      throw new Error(userError?.message || 'Failed to create user record');
    }

    // Create specific user type record
    if (userType === 'client') {
      const { error: clientError } = await supabase
        .from('clients')
        .insert({
          user_id: user.id,
          company_name: companyName,
          industry,
          position
        });

      if (clientError) {
        throw new Error(clientError.message);
      }
    } else if (userType === 'freelancer') {
      const { error: freelancerError } = await supabase
        .from('freelancers')
        .insert({
          user_id: user.id,
          skills: skills || [],
          hourly_rate: hourlyRate,
          experience_level: experienceLevel,
          portfolio_url: portfolioUrl
        });

      if (freelancerError) {
        throw new Error(freelancerError.message);
      }
    }

    return NextResponse.json({
      message: 'User created successfully',
      user: userData
    });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}