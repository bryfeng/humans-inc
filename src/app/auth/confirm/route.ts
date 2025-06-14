// src/app/auth/confirm/route.ts
import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server'; // Using our server client
import { redirect } from 'next/navigation'; // Import from next/navigation for App Router

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/'; // Default redirect to homepage

  if (token_hash && type) {
    const supabase = await createClient(); // Use our server client

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      // User's email is verified, and they are logged in.
      // The middleware will handle session refresh.
      return redirect(next);
    }
    // Log the error for server-side debugging
    console.error('Auth confirmation error:', error.message);
    // Redirect to an error page or login with an error message
    return redirect(
      `/login?error=Email%20confirmation%20failed:%20${encodeURIComponent(error.message)}`
    );
  }

  // If token_hash or type is missing, redirect to an error page or login
  console.error('Auth confirmation error: Missing token_hash or type');
  return redirect('/login?error=Invalid%20confirmation%20link.');
}
