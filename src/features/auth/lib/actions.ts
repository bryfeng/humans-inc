// src/features/auth/lib/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server'; // Our server client

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    // Handle error: missing fields
    // For now, redirecting to login with an error query param
    return redirect('/login?error=Missing email or password');
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Login error:', error.message);
    return redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath('/', 'layout'); // Revalidate all data
  redirect('/'); // Redirect to homepage or dashboard after login
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return redirect('/signup?error=Missing email or password');
  }

  // Note: Supabase by default sends a confirmation email.
  // We'll handle the confirmation link in `app/auth/confirm/route.ts`.
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // emailRedirectTo is not strictly needed here if the email template
      // is correctly set up in Supabase dashboard to point to /auth/confirm
      // emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
    },
  });

  if (error) {
    console.error('Signup error:', error.message);
    return redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  if (data.user && data.user.identities && data.user.identities.length === 0) {
    // This case can happen if "Confirm email" is disabled in Supabase settings,
    // but it's generally not recommended.
    // Or if there's an issue with user creation but no immediate error.
    return redirect(
      '/signup?error=An issue occurred during signup. Please try again or contact support if this persists.'
    );
  }

  if (data.session) {
    // If "Confirm email" is disabled in Supabase settings, user is logged in directly.
    revalidatePath('/', 'layout');
    return redirect('/');
  }

  // If email confirmation is enabled (default), redirect to a page
  // informing the user to check their email.
  return redirect('/signup/confirm-email'); // We'll create this page next
}
